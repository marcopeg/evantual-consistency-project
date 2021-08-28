const updateSQL = `
  UPDATE "public"."sot_products"
     SET "title" = $1,
         "price" = $2
  WHERE "id" = $3
  RETURNING *
`;

const updateSotProducts = async (doc, { fetchq }) => {
  const { data } = doc.payload.event;
  console.log("[SOT Updater] Products:", data.new.id);

  await fetchq.pool.query(updateSQL, [
    data.new.title,
    data.new.price,
    data.new.id
  ]);

  return doc.complete();
};

module.exports = updateSotProducts;
