const updateSotProducts = require("./update-sot-products");
const updateSotCounters = require("./update-sot-counters");

const featureSotUpdate = ({ registerAction }) => {
  registerAction({
    hook: "$FETCHQ_REGISTER_WORKER",
    handler: () => [
      {
        queue: "update_sot_products",
        handler: updateSotProducts
      },
      {
        queue: "update_sot_counters",
        handler: updateSotCounters
      }
    ]
  });
};

module.exports = featureSotUpdate;
