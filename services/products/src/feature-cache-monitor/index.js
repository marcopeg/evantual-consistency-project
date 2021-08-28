const updateProducts = require("./update-products");
const updateCounters = require("./update-counters");

// Figure out which source of truth needs to be updated
const changeType = (prev, curr) => {
  const changes = {};
  if (prev.title !== curr.title) changes["sot_products"] = true;
  if (prev.price !== curr.price) changes["sot_products"] = true;
  if (prev.qt_available !== curr.qt_available) changes["sot_counters"] = true;
  if (prev.qt_booked !== curr.qt_booked) changes["sot_counters"] = true;
  return Object.keys(changes);
};

// Updater
const getUpdateFn = (sot) => {
  if (sot === "sot_products") return updateProducts;
  if (sot === "sot_counters") return updateCounters;

  return () => {
    console.log("Unhandled SOT:", sot);
  };
};

const featureCacheMonitor = () => ({
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

        for (const sot of changeType(data.old, data.new)) {
          getUpdateFn(sot)();
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

module.exports = featureCacheMonitor;
