const updateProduct = require("./route.handler");

module.exports = ({ registerAction }) => {
  registerAction({
    name: "updateProduct",
    hook: "$FASTIFY_ROUTE",
    handler: updateProduct
  });
};
