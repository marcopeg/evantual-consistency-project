const schema = require("./route.schema");

const getProductCache = `
  SELECT * FROM "public"."cache_products"
  WHERE "id" = $1
`;

const updateCache = `
  UPDATE "public"."cache_products" SET
    "title" = $1,
    "price" = $2,
    "qt_available" = $3,
    "qt_booked" = $4,
    "etag_cache" = NOW()
  WHERE "id" = (
    SELECT "id" FROM "public"."cache_products"
    WHERE "id" = $5
    FOR UPDATE SKIP LOCKED
  )
  RETURNING *
`;

const handler = async (req, reply) => {
  // 1. Find cached product
  let productCache = null;
  try {
    const res = await req
      .getContext("fetchq")
      .pool.query(getProductCache, [req.body.input.id]);

    if (!res.rowCount) {
      throw new Error("Product not found");
    }

    productCache = res.rows[0];
  } catch (err) {
    return reply.code(404).send({ message: err.message });
  }

  // 2. Validate updateable state
  //    (not under updating or deleting)
  try {
    const etag_cache = new Date(productCache.etag_cache);
    const etag_sot_products = new Date(productCache.etag_sot_products);
    const etag_sot_counters = new Date(productCache.etag_sot_counters);

    if (etag_sot_products < etag_cache) {
      throw new Error("SOT Product change pending");
    }

    if (etag_sot_counters < etag_cache) {
      throw new Error("SOT Counters change pending");
    }
  } catch (err) {
    return reply.code(400).send({ message: err.message });
  }

  // 3. Compute the upstream services that need updates
  const nextData = {
    ...productCache,
    ...req.body.input
  };

  // 4. Propagate changes upstream
  await req.getContext("fetchq").doc.append("update_products", nextData);
  await req.getContext("fetchq").doc.append("update_counters", nextData);

  // 5. Update the cache with the new data and return
  //    (and send out the )
  try {
    const res = await req
      .getContext("fetchq")
      .pool.query(updateCache, [
        nextData.title,
        nextData.price,
        nextData.qt_available,
        nextData.qt_booked,
        nextData.id
      ]);

    // Could be that we hit a deadlock on the specific cache row
    // (as we have a thread safe updat implemented)
    if (!res.rowCount) {
      throw new Error("No rows were returned");
    }

    // Send out the happy case data result:
    reply.send(res.rows[0]);
  } catch (err) {
    return reply.code(400).send({
      message:
        "The product cache was not updated right away, but all the informations are stored and will be applied soon."
    });
  }
};

const updateProduct = () => ({
  method: "POST",
  url: "/products/update",
  schema,
  handler
});

module.exports = updateProduct;
