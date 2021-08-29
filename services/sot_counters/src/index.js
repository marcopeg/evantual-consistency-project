const { runHookApp } = require("@forrestjs/hooks");
const serviceFastify = require("@forrestjs/service-fastify");

const graphqlClient = require("./graphql-client");
const handleChangelog = require("./handle-changelog");
const setCounter = require("./set-counter");

runHookApp({
  trace: "compact",
  settings: {
    changelog: {
      connectionString: process.env.PGSTRING,
      cursorId: "sot-counters"
    },
    hasura: {
      url: process.env.HASURA_URL,
      key: process.env.HASURA_KEY
    }
  },
  services: [graphqlClient, serviceFastify],
  features: [setCounter, handleChangelog]
}).catch((err) => {
  console.error("ERROR:", err.message);
});
