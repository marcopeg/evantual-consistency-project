const onProductWasDeleted = async (log, { db, logEvent }) => {
  // Remove the local references to the counters
  const res = await db.query(
    `
    DELETE FROM "public"."sot_counters"
    WHERE "product_id" = $1
    RETURNING *
  `,
    [log.new_data.id]
  );

  // Notify the creation of the counters
  await logEvent("counters-was-deleted", res.rows);
};

module.exports = onProductWasDeleted;
