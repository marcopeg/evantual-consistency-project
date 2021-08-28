const { runHookApp } = require("@forrestjs/hooks");
const serviceFastify = require("@forrestjs/service-fastify");
const serviceFetchq = require("@forrestjs/service-fetchq");

const featureCacheBuilder = require("./feature-cache-builder");
const featureCacheMonitor = require("./feature-cache-monitor");

// Temporary feature to simulate an update in the products cache
const featureSimulateCacheUpdate = () => ({
  hook: "$FINISH",
  handler: ({ getContext }) =>
    setTimeout(() => {
      console.log("--> Update cache!");
      getContext("fetchq").pool.query(`
        UPDATE cache_products SET
          title = 'apple1',
          price = 1,
          qt_available = 99 ,
          etag_cache = now()
        WHERE id = 1
      `);
    }, 250)
});

runHookApp({
  trace: "compact",
  services: [serviceFetchq, serviceFastify],
  features: [
    featureCacheBuilder,
    featureCacheMonitor,
    featureSimulateCacheUpdate
  ]
}).catch((err) => {
  console.error("ERROR:", err.message);
});
