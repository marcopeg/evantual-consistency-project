const changelog = require("./changelog");
const onProductInsert = require("./on-product-insert-update");
const onProductDelete = require("./on-product-delete");
const onCountersInsert = require("./on-counters-insert-update");

const cacheBuilder = ({ getContext, getConfig }) => ({
  hook: "$FINISH",
  handler: async () => {
    // Get a reference to the Postgre's pool from Fetchq
    const db = getContext("fetchq").pool;

    // Upsert the cursor for this microservice:
    const cursorId = getConfig("changelog.cursorId");
    await changelog.subscribe(db, cursorId);
    // await changelog.reset(db, cursorId, "1900-1-1");
    console.log("--> consume changelog for:", cursorId);

    // Event Router
    const logHandler = async (log) => {
      const { operation } = log;
      console.log("[Cache Builder]", operation);

      switch (operation) {
        case "product-was-created":
        case "product-was-updated":
          await onProductInsert(db, log);
          break;
        case "product-was-deleted":
          await onProductDelete(db, log);
          break;
        case "counters-was-updated":
          await onCountersInsert(db, log);
          break;
        default:
          console.log("[Cache Builder] Unhandled:", operation);
      }
    };

    // Start the changlog worker instance to handle incoming events
    changelog.run(db, cursorId, logHandler);
  }
});

module.exports = cacheBuilder;
