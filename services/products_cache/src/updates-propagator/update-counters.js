const axios = require("axios");

const updateCounters = async (doc, { getConfig }) => {
  const endpoint = [
    getConfig("sot_counters.url"),
    "counters",
    doc.payload.id
  ].join("/");

  const { qt_available, qt_booked } = doc.payload;

  if (undefined !== "qt_available") {
    await axios.post(endpoint, {
      counter_id: "available",
      value: qt_available
    });
  }
  if (undefined !== "qt_booked") {
    await axios.post(endpoint, {
      counter_id: "booked",
      value: qt_booked
    });
  }
  return doc.complete();
};

module.exports = updateCounters;
