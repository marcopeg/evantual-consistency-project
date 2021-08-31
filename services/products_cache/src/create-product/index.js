const createProduct = require("./route.handler");
const updateProductCounters = require("./update-product-counters");

module.exports = ({ registerAction }) => {
  registerAction({
    name: "createProduct",
    hook: "$FASTIFY_ROUTE",
    handler: createProduct
  });

  registerAction({
    name: "createProduct",
    hook: "$FETCHQ_REGISTER_QUEUE",
    handler: { name: "update_product_counters" }
  });

  registerAction({
    hook: "$FETCHQ_REGISTER_WORKER",
    handler: {
      queue: "update_product_counters",
      handler: updateProductCounters
    }
  });
};
