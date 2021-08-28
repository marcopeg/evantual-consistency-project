const upsertSQL = `
  INSERT INTO "cache_products" (
    "id",
    "COUNTER_ID",
    "updated_at",
    "etag_sot",
    "is_updating",
    "is_deleting"
  ) VALUES (
    $1,
    $2,
    $3,
    now(),
    false,
    false
  )
  ON CONFLICT ON CONSTRAINT "cache_products_pkey"
  DO UPDATE SET 
    "COUNTER_ID" = EXCLUDED."COUNTER_ID",
    "updated_at" = EXCLUDED."updated_at",
    "etag_sot" = EXCLUDED."etag_sot",
    "is_updating" = EXCLUDED."is_updating",
    "is_deleting" = EXCLUDED."is_deleting"
  ;
`;

const getFieldName = (counterId) => {
  if (counterId === "available") return "qt_available";
  if (counterId === "booked") return "qt_booked";
  throw new Error(`Unknown counter: ${counterId}`);
};

const onCounterInsert = async (db, log) => {
  const execSQL = upsertSQL.replace(
    /COUNTER_ID/g,
    getFieldName(log.new_data.counter_id)
  );

  await db.query(execSQL, [
    log.new_data.product_id,
    log.new_data.value,
    log.new_data.updated_at
  ]);
};

module.exports = onCounterInsert;
