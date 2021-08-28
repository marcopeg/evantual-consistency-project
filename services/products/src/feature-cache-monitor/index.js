// Figure out which source of truth needs to be updated
const getQueueName = (prev, curr) => {
  const changes = {};
  if (prev.title !== curr.title) changes["update_sot_products"] = true;
  if (prev.price !== curr.price) changes["update_sot_products"] = true;
  if (prev.qt_available !== curr.qt_available)
    changes["update_sot_counters"] = true;
  if (prev.qt_booked !== curr.qt_booked) changes["update_sot_counters"] = true;
  return Object.keys(changes);
};

const featureCacheMonitor = ({ registerAction }) => {
  registerAction({
    hook: "$FASTIFY_POST",
    handler: {
      url: "/on-cache-products-update",
      handler: async (req) => {
        const { op, data } = req.body.event;

        if (op === "UPDATE") {
          // Skip updates from SOT
          if (data.new.etag_sot !== data.old.etag_sot) {
            return "skipped";
          }

          // Forward the event to each relevant queue for updating the
          // related source of truth service:
          for (const queue of getQueueName(data.old, data.new)) {
            console.log("Queue update into:", queue);
            await req.fetchq.doc.append(queue, req.body);
          }
          return "udated";
        }

        // @TODO
        if (op === "DELETE") {
          console.log("ON CACHE DELETE");
          return "deleted";
        }

        return "unhandled";
      }
    }
  });

  // Upsert the queues
  registerAction({
    hook: "$FETCHQ_REGISTER_QUEUE",
    handler: () => [
      { name: "update_sot_products" },
      { name: "update_sot_counters" }
    ]
  });
};

module.exports = featureCacheMonitor;
