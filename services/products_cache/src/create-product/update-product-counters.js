const axios = require("axios");

const updateProductCounters = async (doc, { getConfig }) => {
  const endpoint = [
    getConfig("sot_counters.url"),
    "counters",
    doc.payload.productId
  ].join("/");

  await axios.post(endpoint, {
    counter_id: "available",
    value: doc.payload.qt_available
  });

  return doc.complete();
};

module.exports = updateProductCounters;
