const { runHookApp } = require("@forrestjs/hooks");
const serviceFastify = require("@forrestjs/service-fastify");
const serviceFastifyHealthz = require("@forrestjs/service-fastify-healthz");

const graphqlClient = require("./graphql-client");
const createProduct = require("./create-product");
const updateProduct = require("./update-product");
const deleteProduct = require("./delete-product");

runHookApp({
  trace: "compact",
  settings: {
    hasura: {
      url: process.env.HASURA_URL,
      key: process.env.HASURA_KEY
    }
  },
  services: [serviceFastify, serviceFastifyHealthz, graphqlClient],
  features: [createProduct, updateProduct, deleteProduct]
}).catch((err) => {
  console.error("ERROR:", err.message);
});
