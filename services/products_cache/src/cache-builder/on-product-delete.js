const deleteSQL = `
  DELETE FROM "cache_products"
  WHERE "id" = $1
  RETURNING *
`;

const onProductDelete = async (db, log) => {
  await db.query(deleteSQL, [log.new_data.id]);
};

module.exports = onProductDelete;
