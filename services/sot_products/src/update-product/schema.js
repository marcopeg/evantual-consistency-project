module.exports = {
  params: {
    type: "object",
    properties: {
      id: { type: "number" }
    },
    required: ["id"]
  },
  body: {
    type: "object",
    properties: {
      title: { type: "string" },
      price: { type: "number" }
    },
    required: ["title", "price"]
  },
  response: {
    "2xx": {
      type: "object",
      properties: {
        id: { type: "number" },
        title: { type: "string" },
        price: { type: "number" },
        created_at: { type: "string" },
        updated_at: { type: "string" }
      },
      required: ["id", "title", "price", "created_at", "updated_at"]
    },
    "4xx": {
      type: "string"
    }
  }
};
