const updateCounters = require("./update-counters");
const updateProducts = require("./update-products");

module.exports = ({ registerAction }) => {
  registerAction({
    name: "updatePropagator",
    hook: "$FETCHQ_REGISTER_QUEUE",
    handler: [{ name: "update_counters" }, { name: "update_products" }]
  });

  registerAction({
    name: "updatePropagator",
    hook: "$FETCHQ_REGISTER_WORKER",
    handler: [
      {
        queue: "update_counters",
        handler: updateCounters
      },
      {
        queue: "update_products",
        handler: updateProducts
      }
    ]
  });
};
