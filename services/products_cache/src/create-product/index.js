const createProduct = require("./route.handler");

module.exports = ({ registerAction }) => {
  registerAction({
    name: "createProduct",
    hook: "$FASTIFY_ROUTE",
    handler: createProduct
  });
};
