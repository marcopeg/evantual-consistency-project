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
        created_at: { type: "string" },
        updated_at: { type: "string" }
      },
      required: ["id", "title", "price", "created_at", "updated_at"],
      additionalProperties: true
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
