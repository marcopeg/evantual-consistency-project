const schema = require("./schema");

const createProductMutation = `
  mutation createProductMutation($title: String!, $price: Int!) {
    insert_sot_products(
      objects: { title: $title, price: $price }
      on_conflict: { constraint: sot_products_title_key }
    ) {
      affected_rows
      returning {
        created_at
        id
        price
        title
        updated_at
      }
    }
  }
`;

const handler = async (req, reply) => {
  const res = await req.makeGraphQLRequest(createProductMutation, req.body);
  const data = res.data.data.insert_sot_products;

  // Throw error in case the product already exists
  if (data.affected_rows === 0) {
    reply.status(400).send("Product already exists!");
  }

  // Return just the first row
  reply.send(data.returning[0]);
};

const createProduct = () => ({
  method: "POST",
  url: "/products",
  schema,
  handler
});

module.exports = ["$FASTIFY_ROUTE", createProduct, "createProduct"];
