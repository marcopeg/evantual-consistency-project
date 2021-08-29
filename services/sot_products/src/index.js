const { runHookApp } = require("@forrestjs/hooks");
const serviceFastify = require("@forrestjs/service-fastify");
// const serviceFetchq = require("@forrestjs/service-fetchq");

const graphqlClient = require("./graphql-client");
const createProduct = require("./create-product");
// const featureCacheMonitor = require("./feature-cache-monitor");
// const featureSotUpdate = require("./feature-sot-updater");

runHookApp({
  trace: "compact",
  settings: {
    hasura: {
      url: process.env.HASURA_URL,
      key: process.env.HASURA_KEY
    }
  },
  services: [serviceFastify, graphqlClient],
  features: [
    createProduct
    // featureCacheMonitor,
    // featureSotUpdate,
    // featureSimulateCacheUpdate
  ]
}).catch((err) => {
  console.error("ERROR:", err.message);
});
