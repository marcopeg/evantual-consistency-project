const schema = require("./schema");

const createProductMutation = `
mutation updateProductMutation (
  $id: Int!
  $title: String!
  $price: Int!
) {
  update_sot_products_by_pk (
    pk_columns: {
      id: $id
    },
    _set: {
      price: $price
      title: $title
    }
  ) {
    created_at
    id
    price
    title
    updated_at
  }
}

`;

const handler = async (req, reply) => {
  const res = await req.makeGraphQLRequest(createProductMutation, {
    ...req.params,
    ...req.body
  });
  const data = res.data.data.update_sot_products_by_pk;

  // Throw error in case the product already exists:
  if (!data) {
    reply.status(400).send("Product does not exists!");
  }

  // Log the event:
  await req.logEvent("product-was-updated", data);

  // Return just the first row:
  reply.send(data);
};

const createProduct = () => ({
  method: "POST",
  url: "/products/:id",
  schema,
  handler
});

module.exports = ["$FASTIFY_ROUTE", createProduct, "createProduct"];
