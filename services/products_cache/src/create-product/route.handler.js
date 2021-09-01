const axios = require("axios");
const schema = require("./route.schema");

const upsertCache = `
  INSERT INTO "public"."cache_products"
  ("id", "created_at", "updated_at", "title", "price", "qt_available")
  VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING *
`;

const handler = async (req, reply) => {
  // - Create SOT_PRODUCT - so to get Product ID
  let productData = null;
  try {
    const { price, title } = req.body.input;
    const endpoint = [req.getConfig("sot_products.url"), "products"].join("/");
    const res = await axios.post(endpoint, { price, title });
    productData = res.data;
  } catch (err) {
    return reply.code(400).send({
      message: "Could not create product, the product likely exists already"
    });
  }

  // - Queue the change of the product's quantities
  const { qt_available } = req.body.input;
  try {
    await req.getContext("fetchq").doc.append("update_counters", productData);
  } catch (err) {
    // In a real app this should just be a broadcasted notification message.
    return reply.code(400).send({
      message:
        "The product was created, but it was not possible to setup the availability. You need to edit the product."
    });
  }

  // - Upsert chache table with correct id and temporary data
  let productCache = null;
  try {
    const res = await req
      .getContext("fetchq")
      .pool.query(upsertCache, [
        productData.id,
        productData.created_at,
        productData.updated_at,
        productData.title,
        productData.price,
        qt_available
      ]);
    productCache = res.rows[0];
  } catch (err) {
    return reply.code(400).send({
      message: "could not upsert the cache, but the product was created"
    });
  }

  console.log(productCache);
  reply.send(productCache);
};

const createProduct = () => ({
  method: "POST",
  url: "/products/create",
  schema,
  handler
});

module.exports = createProduct;
