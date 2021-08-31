const upsertSQL = `
  INSERT INTO "cache_products" (
    "id",
    "title",
    "price",
    "created_at",
    "updated_at",
    "etag_sot",
    "is_updating",
    "is_deleting"
  ) VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    now(),
    false,
    false
  )
  ON CONFLICT ON CONSTRAINT "cache_products_pkey"
  DO UPDATE SET 
    "title" = EXCLUDED."title",
    "price" = EXCLUDED."price",
    "created_at" = EXCLUDED."created_at",
    "updated_at" = EXCLUDED."updated_at",
    "etag_sot" = EXCLUDED."etag_sot",
    "is_updating" = EXCLUDED."is_updating",
    "is_deleting" = EXCLUDED."is_deleting"
  RETURNING *;
`;

const onProductInsert = async (db, log) => {
  await db.query(upsertSQL, [
    log.new_data.id,
    log.new_data.title,
    log.new_data.price,
    log.new_data.created_at,
    log.new_data.updated_at
  ]);
};

module.exports = onProductInsert;