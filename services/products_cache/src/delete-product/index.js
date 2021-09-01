const deleteProduct = require("./route.handler");

module.exports = ({ registerAction }) => {
  registerAction({
    name: "deleteProduct",
    hook: "$FASTIFY_ROUTE",
    handler: deleteProduct
  });
};
