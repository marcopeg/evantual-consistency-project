module.exports = {
  params: {
    type: "object",
    properties: {
      product_id: { type: "number" }
    },
    required: ["product_id"]
  },
  body: {
    type: "object",
    properties: {
      counter_id: { type: "string" },
      value: { type: "number" }
    },
    required: ["counter_id", "value"]
  },
  response: {
    "2xx": {
      type: "object",
      properties: {
        product_id: { type: "number" },
        counter_id: { type: "string" },
        value: { type: "number" },
        created_at: { type: "string" },
        updated_at: { type: "string" }
      },
      required: [
        "product_id",
        "counter_id",
        "value",
        "created_at",
        "updated_at"
      ]
    },
    "4xx": {
      type: "string"
    }
  }
};
