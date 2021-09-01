const axios = require("axios");

const updateProducts = async (doc, { getConfig }) => {
  const endpoint = [
    getConfig("sot_products.url"),
    "products",
    doc.payload.id
  ].join("/");

  const { title, price } = doc.payload;
  await axios.post(endpoint, {
    title,
    price
  });

  return doc.complete();
};

module.exports = updateProducts;
