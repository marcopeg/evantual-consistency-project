const { runHookApp } = require("@forrestjs/hooks");
const serviceFastify = require("@forrestjs/service-fastify");
const serviceFetchq = require("@forrestjs/service-fetchq");

const featureCacheBuilder = require("./feature-cache-builder");
const featureCacheMonitor = require("./feature-cache-monitor");
const featureSotUpdate = require("./feature-sot-updater");
const createProduct = require("./create-product");

// Temporary feature to simulate an update in the products cache
// It also truncates the queues:
const featureSimulateCacheUpdate = () => ({
  hook: "$FINISH",
  handler: ({ getContext }) =>
    setTimeout(() => {
      console.log("--> Update cache!");
      getContext("fetchq").pool.query(
        `SELECT fetchq.queue_truncate('update_sot_counters')`
      );
      getContext("fetchq").pool.query(
        `SELECT fetchq.queue_truncate('update_sot_products')`
      );
      getContext("fetchq").pool.query(`
        UPDATE cache_products SET
          title = 'apple_${Date.now()}',
          price = 1,
          qt_available = 99,
          qt_booked = 88,
          etag_cache = now(),
          is_updating = true
        WHERE id = 1
      `);
    }, 250)
});

runHookApp({
  trace: "compact",
  settings: {
    sot_products: {
      url: process.env.SERVICE_SOT_PRODUCTS
    },
    sot_counters: {
      url: process.env.SERVICE_SOT_COUNTERS
    },
    changelog: {
      cursorId: process.env.CURSOR_ID
    }
  },
  services: [serviceFetchq, serviceFastify],
  features: [
    featureCacheBuilder,
    createProduct
    // featureCacheMonitor,
    // featureSotUpdate,
    // featureSimulateCacheUpdate,
  ]
}).catch((err) => {
  console.error("ERROR:", err.message);
});
