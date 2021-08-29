const axios = require("axios");

const addChangelog = `
mutation addChangelog (
  $event: String!
  $payload: json!
) {
  insert_changelog(
    objects: {
      operation: $event
      new_data: $payload
    }
  ) {
    affected_rows
  }
}

`;

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

      const logEvent = (event, payload = {}) =>
        makeGraphQLRequest(addChangelog, { event, payload });

      decorateRequest("makeGraphQLRequest", makeGraphQLRequest);
      decorateRequest("logEvent", logEvent);
    }
  });
};

module.exports = graphqlClient;
