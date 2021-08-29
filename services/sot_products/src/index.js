const { runHookApp } = require("@forrestjs/hooks");
const serviceFastify = require("@forrestjs/service-fastify");

const graphqlClient = require("./graphql-client");
const createProduct = require("./create-product");
const updateProduct = require("./update-product");

runHookApp({
  trace: "compact",
  settings: {
    hasura: {
      url: process.env.HASURA_URL,
      key: process.env.HASURA_KEY
    }
  },
  services: [serviceFastify, graphqlClient],
  features: [createProduct, updateProduct]
}).catch((err) => {
  console.error("ERROR:", err.message);
});
