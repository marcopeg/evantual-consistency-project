const { Pool } = require("pg");
const changelog = require("./changelog");
const onProductInsert = require("./on-product-insert");
const onCounterInsert = require("./on-counter-insert");

// Create the Postgre's client instance
const connectionString = process.env.PGSTRING;
const db = new Pool({ connectionString });

// Initiate the connection:
db.connect()
  .then(async () => {
    // Upsert the cursor for this microservice:
    const cursorId = process.env.CURSOR_ID;
    await changelog.subscribe(db, cursorId);
    await changelog.reset(db, cursorId, "1900-1-1");
    console.log("consume changelog for:", cursorId);

    const logHandler = async (log) => {
      const event = `${log.operation.toLowerCase()}@${log.table}`;
      console.log("Handle:", event);

      switch (event) {
        case "insert@sot_products":
          await onProductInsert(db, log);
          break;
        case "insert@sot_counters":
          await onCounterInsert(db, log);
          break;
        default:
          console.log("Unhandled:", event);
      }
    };

    const wk1 = changelog.run(db, cursorId, logHandler);
  })
  .catch((err) => {
    console.error("ERROR:", err.message);
  });
