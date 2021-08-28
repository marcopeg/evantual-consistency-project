const { Pool } = require("pg");
const changelog = require("./changelog");

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
      console.log(log.id, log.timestamp);
      await new Promise((r) => setTimeout(r, 500));
    };

    const wk1 = changelog.run(db, cursorId, logHandler, {
      batch: 4
    });

    setTimeout(
      () =>
        wk1
          .stop()
          .then(() => console.log("STOPPED"))
          .catch(console.error),
      3000
    );
  })
  .catch((err) => {
    console.error("ERROR:", err.message);
  });
