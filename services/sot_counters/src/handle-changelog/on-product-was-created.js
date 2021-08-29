const upsertQuery = `
INSERT INTO "public"."sot_counters" ("product_id", "counter_id", "value")
VALUES
  ($1, 'available', 0), 
  ($1, 'booked', 0)
ON CONFLICT ON CONSTRAINT "sot_counters_pkey"
DO UPDATE SET 
  "value" = EXCLUDED."value", 
  "updated_at" = EXCLUDED."updated_at"
RETURNING *
`;

const onProductWasCreated = async (log, { db, logEvent }) => {
  // console.log("@onProductWasCreated", log.new_data);
  const res = await db.query(upsertQuery, [log.new_data.id]);

  // Notify the creation of the counters
  await logEvent("counters-was-created", res.rows);
};

module.exports = onProductWasCreated;
