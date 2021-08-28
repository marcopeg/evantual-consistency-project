const updateSQL = `
  UPDATE "public"."sot_counters"
     SET "value" = $1,
         "updated_at" = NOW()
  WHERE "product_id" = $2
    AND "counter_id" = $3
  RETURNING *
`;

const updateSotCounters = async (doc, { fetchq }) => {
  const { data } = doc.payload.event;
  console.log("[SOT Updater] Counters:", data.new);

  await fetchq.pool.query(updateSQL, [
    data.new.qt_booked,
    data.new.id,
    "booked"
  ]);

  await fetchq.pool.query(updateSQL, [
    data.new.qt_available,
    data.new.id,
    "available"
  ]);

  return doc.complete();
};

module.exports = updateSotCounters;
