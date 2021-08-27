// Create client to the db:
const { Pool } = require("pg");
const db = new Pool({
  connectionString: process.env.PGSTRING
});

const getLogs = (db, lastCursorId = null) => {
  /*
SELECT * FROM "changelog"
WHERE "timestamp" > COALESCE(
	(SELECT "timestamp" FROM "changelog_cursor" WHERE "cursor_id" = 'foo'),
	NOW() - INTERVAL '100y'
)
ORDER BY "timestamp" ASC
LIMIT 4
;
*/
};

// Initiate the connection:
db.connect()
  .then(() => {
    const cursorId = process.env.CURSOR_ID;
    console.log("consume changelog for:", cursorId);
  })
  .catch(() => {
    console.log("Could not connect to pg");
  });
