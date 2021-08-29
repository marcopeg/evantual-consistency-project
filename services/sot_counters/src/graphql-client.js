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
  // Make the utilities available to the ForrestJS APP
  registerAction({
    hook: "$INIT_SERVICE",
    handler: ({ getConfig, setContext }) => {
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

      setContext("makeGraphQLRequest", makeGraphQLRequest);
      setContext("logEvent", logEvent);
    }
  });

  // Make it available to the Fastify App
  registerAction({
    hook: "$FASTIFY_PLUGIN?",
    name: "graphqlClient",
    trace: __filename,
    handler: ({ decorateRequest }, { getContext }) => {
      decorateRequest("makeGraphQLRequest", getContext("makeGraphQLRequest"));
      decorateRequest("logEvent", getContext("logEvent"));
    }
  });
};

module.exports = graphqlClient;
