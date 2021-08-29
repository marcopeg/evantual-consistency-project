const { Client } = require("pg");
const changelog = require("./changelog");

const onProductWasCreated = require("./on-product-was-created");
const onProductWasDeleted = require("./on-product-was-deleted");

const handleChangelog = ({ registerAction, getConfig, getContext }) => {
  const connectionString = getConfig("changelog.connectionString");
  const cursorId = getConfig("changelog.cursorId");
  const db = new Client({ connectionString });

  registerAction({
    hook: "$START_FEATURE",
    handler: () => db.connect()
  });

  registerAction({
    hook: "$FINISH",
    handler: async () => {
      const logEvent = getContext("logEvent");

      // Upsert the cursor for this microservice:
      await changelog.subscribe(db, cursorId);
      // await changelog.reset(db, cursorId, "1900-1-1");
      console.log("--> consume changelog for:", cursorId);

      // Event Router
      const logHandler = async (log) => {
        console.log("[sot-cursors]", log.operation);
        switch (log.operation) {
          case "product-was-created":
            await onProductWasCreated(log, { db, logEvent });
            break;
          case "product-was-deleted":
            await onProductWasDeleted(log, { db, logEvent });
            break;
          default:
            console.log("[sot-cursors] Unhandled:", log.operation);
        }
      };

      // Start the changlog worker instance to handle incoming events
      changelog.run(db, cursorId, logHandler);
    }
  });
};

module.exports = handleChangelog;
