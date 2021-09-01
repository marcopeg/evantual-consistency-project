const axios = require("axios");
const schema = require("./route.schema");

const readCache = `
  SELECT * FROM "public"."cache_products"
  WHERE "id" = $1
  LIMIT 1
`;

const deleteCache = `
  DELETE FROM "public"."cache_products"
  WHERE "id" = $1
  RETURNING *
`;

const handler = async (req, reply) => {
  const { id: productId } = req.body.input;

  // 1. Read cached details
  let cachedData = null;
  try {
    const res = await req
      .getContext("fetchq")
      .pool.query(readCache, [productId]);

    if (!res.rowCount) {
      throw new Error("Product not found");
    }
    cachedData = res.rows[0];
  } catch (err) {
    return reply.code(400).send({
      message: err.message
    });
  }

  // 2. Initiate delete from SOT
  try {
    const endpoint = [
      req.getConfig("sot_products.url"),
      "products",
      productId
    ].join("/");
    await axios.delete(endpoint);
  } catch (err) {
    return reply.code(400).send({
      message: "It was not possible to remove the product"
    });
  }

  // 3. Delete cache (if still exists)
  try {
    await req.getContext("fetchq").pool.query(deleteCache, [productId]);
  } catch (err) {
    console.log("It was not possible to remove the cache");
  }

  // 4. Return product details
  reply.send(cachedData);
};

const createProduct = () => ({
  method: "POST",
  url: "/products/delete",
  schema,
  handler
});

module.exports = createProduct;
