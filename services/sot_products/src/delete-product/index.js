const schema = require("./schema");

const deleteProductMutation = `
  mutation deleteProduct ($id: Int!) {
    delete_sot_products_by_pk(id: $id) {
      created_at
      id
      price
      title
      updated_at
    }
  }
`;

const handler = async (req, reply) => {
  const res = await req.makeGraphQLRequest(deleteProductMutation, req.params);
  const data = res.data.data.delete_sot_products_by_pk;

  if (data === null) {
    reply.status(400).send("Product does not exist!");
    return;
  }

  // Log the event & send output:
  await req.logEvent("product-was-deleted", data);
  reply.send(data);
};

const createProduct = () => ({
  method: "DELETE",
  url: "/products/:id",
  schema,
  handler
});

module.exports = ["$FASTIFY_ROUTE", createProduct, "createProduct"];
