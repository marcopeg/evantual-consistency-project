const { runHookApp } = require("@forrestjs/hooks");
const serviceFastify = require("@forrestjs/service-fastify");
const serviceFetchq = require("@forrestjs/service-fetchq");

const cacheBuilder = require("./cache-builder");
const createProduct = require("./create-product");

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
  features: [cacheBuilder, createProduct]
}).catch((err) => {
  console.error("ERROR:", err.message);
});
