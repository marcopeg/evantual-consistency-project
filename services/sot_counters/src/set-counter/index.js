const schema = require("./schema");

const setCounterMutation = `
mutation setCounterMutation (
  $product_id: Int!
  $counter_id: String!
  $value: Int!
) {
  update_sot_counters_by_pk (
    pk_columns: {
      counter_id: $counter_id
      product_id: $product_id
    }, 
    _set: {
      value: $value
    }
  ) {
    product_id
    counter_id
    value
    created_at
    updated_at
  }
}

`;

const handler = async (req, reply) => {
  const res = await req.makeGraphQLRequest(setCounterMutation, {
    ...req.params,
    ...req.body
  });
  const data = res.data.data.update_sot_counters_by_pk;

  // Throw error in case the product already exists:
  if (!data) {
    reply.status(404).send("Counter not found!");
    return;
  }

  // Log the event & send output:
  await req.logEvent("counters-was-updated", [data]);
  reply.send(data);
};

const setCounter = () => ({
  method: "POST",
  url: "/counters/:product_id",
  schema,
  handler
});

module.exports = ["$FASTIFY_ROUTE", setCounter, "setCounter"];
