const updateSotProducts = require("./update-sot-products");

const featureSotUpdate = ({ registerAction }) => {
  registerAction({
    hook: "$FETCHQ_REGISTER_WORKER",
    handler: () => [
      {
        queue: "update_sot_products",
        handler: updateSotProducts
      }
    ]
  });
};

module.exports = featureSotUpdate;
