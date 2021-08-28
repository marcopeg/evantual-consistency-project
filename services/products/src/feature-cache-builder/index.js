const changelog = require("./changelog");
const onProductInsert = require("./on-product-insert-update");
const onCounterInsert = require("./on-counter-insert-update");

const featureCacheBuilder = ({ getContext }) => ({
  hook: "$FINISH",
  handler: async () => {
    // Get a reference to the Postgre's pool from Fetchq
    const db = getContext("fetchq").pool;

    // Upsert the cursor for this microservice:
    const cursorId = process.env.CURSOR_ID;
    await changelog.subscribe(db, cursorId);
    await changelog.reset(db, cursorId, "1900-1-1");
    console.log("--> consume changelog for:", cursorId);

    // Event Router
    const logHandler = async (log) => {
      const event = `${log.operation.toLowerCase()}@${log.table}`;
      console.log("[Cache Builder]", event);

      switch (event) {
        case "insert@sot_products":
        case "update@sot_products":
          await onProductInsert(db, log);
          break;
        case "insert@sot_counters":
        case "update@sot_counters":
          await onCounterInsert(db, log);
          break;
        default:
          console.log("[Cache Builder] Unhandled:", event);
      }
    };

    // Start the changlog worker instance to handle incoming events
    changelog.run(db, cursorId, logHandler);
  }
});

module.exports = featureCacheBuilder;
