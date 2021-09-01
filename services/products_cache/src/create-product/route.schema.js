module.exports = {
  body: {
    type: "object",
    properties: {
      input: {
        type: "object",
        properties: {
          price: { type: "number" },
          title: { type: "string" }
        },
        required: ["price", "title"]
      }
    },
    required: ["input"]
  },
  response: {
    "2xx": {
      type: "object",
      properties: {
        id: { type: "number" },
        title: { type: "string" },
        price: { type: "number" },
        qt_available: { type: "number" },
        qt_booked: { type: "number" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
        etag_cache: { type: "string" },
        etag_sot_products: { type: "string" },
        etag_sot_counters: { type: "string" }
      },
      required: [
        "id",
        "title",
        "price",
        "qt_available",
        "qt_booked",
        "created_at",
        "updated_at",
        "etag_cache",
        "etag_sot_products",
        "etag_sot_counters"
      ],
      additionalProperties: false
    },
    "4xx": {
      type: "object",
      properties: {
        message: { type: "string" },
        code: { type: "string" }
      },
      required: ["message"]
    }
  }
};
