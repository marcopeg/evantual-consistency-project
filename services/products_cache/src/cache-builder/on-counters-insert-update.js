const upsertSQL = `
  INSERT INTO "cache_products" (
    "id",
    "COUNTER_ID",
    "updated_at",
    "etag_sot_counters"
  ) VALUES (
    $1,
    $2,
    $3,
    now()
  )
  ON CONFLICT ON CONSTRAINT "cache_products_pkey"
  DO UPDATE SET 
    "COUNTER_ID" = EXCLUDED."COUNTER_ID",
    "updated_at" = EXCLUDED."updated_at",
    "etag_sot_counters" = EXCLUDED."etag_sot_counters"
  ;
`;

const getFieldName = (counterId) => {
  if (counterId === "available") return "qt_available";
  if (counterId === "booked") return "qt_booked";
  throw new Error(`Unknown counter: ${counterId}`);
};

const onCountersInsert = async (db, log) => {
  for (const item of log.new_data) {
    const execSQL = upsertSQL.replace(
      /COUNTER_ID/g,
      getFieldName(item.counter_id)
    );
    await db.query(execSQL, [item.product_id, item.value, item.updated_at]);
  }
};

module.exports = onCountersInsert;
