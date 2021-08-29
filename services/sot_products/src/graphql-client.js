const axios = require("axios");

const graphqlClient = ({ registerAction }) => {
  registerAction({
    hook: "$FASTIFY_PLUGIN?",
    name: "graphqlClient",
    trace: __filename,
    handler: ({ decorateRequest }, { getConfig }) => {
      const endpoint = getConfig("hasura.url");
      const token = getConfig("hasura.key");

      const makeGraphQLRequest = (query, variables = {}) =>
        axios.post(
          endpoint,
          {
            query,
            variables
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

      decorateRequest("makeGraphQLRequest", makeGraphQLRequest);
    }
  });
};

module.exports = graphqlClient;
