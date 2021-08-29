// Upserts a new cursor starting from the beginning of the log.
// It sets it on the day before the first log entry.
const subscribeSQL = `
  INSERT INTO "public"."changelog_cursor"
  VALUES ($1, (
    SELECT "timestamp" - INTERVAL '1d' FROM "public".changelog
    ORDER BY "timestamp" ASC
    LIMIT 1
  ))
  ON CONFLICT ON CONSTRAINT "changelog_cursor_pkey"
  DO NOTHING
  RETURNING *;
`;

const resetSQL = `
  INSERT INTO "public"."changelog_cursor"
  VALUES ($1, $2)
  ON CONFLICT ON CONSTRAINT "changelog_cursor_pkey"
  DO UPDATE SET "timestamp" = EXCLUDED."timestamp"
  RETURNING *;
`;

// Will return data only if the cursor was previously upserted
// using the "subscribe" api
const readSQL = `
  SELECT * FROM "public"."changelog"
  WHERE "timestamp" > (
    SELECT "timestamp" FROM "public"."changelog_cursor" WHERE "cursor_id" = $1
  )
  ORDER BY "timestamp" ASC
  LIMIT $2
`;

// Updates the cursor in a thread-safe way.
// But even so, this system is not built for concurrent access to a log.
// One cursor_id should be rapresented by just one process.
const commitSQL = `
  UPDATE "public"."changelog_cursor"
  SET "timestamp" = (
    SELECT "timestamp" FROM "public"."changelog"
    WHERE "id" = $1
    LIMIT 1
  )
  WHERE "cursor_id" = (
    SELECT "cursor_id" FROM "public"."changelog_cursor"
    WHERE "cursor_id" = $2
    FOR UPDATE SKIP LOCKED 
  )
  RETURNING *;
`;

const subscribe = async (db, cursorId = "*") => {
  const res = await db.query(subscribeSQL, [cursorId]);
  return res.rows;
};

const reset = async (db, cursorId, timestamp = new Date()) => {
  const res = await db.query(resetSQL, [cursorId, timestamp]);
  return res.rows;
};

const read = async (db, cursorId = "*", batch = 10) => {
  const res = await db.query(readSQL, [cursorId, batch]);
  return res.rows;
};

const commit = async (db, cursorId, logId) => {
  const res = await db.query(commitSQL, [logId, cursorId]);
  return res.rows;
};

// Executes a function over a batch of jobs.
// It commits each successful job.
const batch = async (db, cursorId, fn, batch = 10) => {
  const items = await read(db, cursorId, batch);
  for (const item of items) {
    await fn(item);
    await commit(db, cursorId, item.id);
  }

  return items.length;
};

class Worker {
  constructor(
    db,
    cursorId,
    fn,
    {
      batch = 10,
      delay = 0,
      sleep = 1000,
      stopDelay = 100,
      stopAttempts = 300 // 30s
    } = {}
  ) {
    this.db = db;
    this.cursorId = cursorId;
    this.fn = fn;
    this.batch = batch;
    this.delay = delay;
    this.sleep = sleep;
    this.stopDelay = stopDelay;
    this.stopAttempts = stopAttempts;

    this._isRunning = false;
    this._isStopping = false;
    this._isLooping = false;
    this._timer = null;
  }

  start() {
    if (this._isRunning || this._isStopping) {
      return false;
    }

    this._isRunning = true;
    this.loop();
    return this;
  }

  stop() {
    if (!this._isRunning || this._isStopping) return false;

    // Set stopping and cancel any scheduled loop execution
    this._isStopping = true;
    clearTimeout(this._timer);

    return new Promise(async (resolve, reject) => {
      // Await for the current loop to finish
      let i = 0;
      for (i = 1; i < this.stopAttempts; i++) {
        if (!this._isLooping) break;
        await new Promise((r) => setTimeout(r, this.stopDelay));
      }

      // Detect the max attempts reached and throw the error
      if (i === this.stopAttempts) {
        return reject("Stop attempts reached");
      }

      // The batch is now stopped and we can exit the promise
      this._isRunning = false;
      this._isStopping = false;
      resolve(this);
    });
  }

  async loop() {
    if (!this._isRunning || this._isStopping) return false;

    // Exec the batch:
    this._isLooping = true;
    const count = await batch(this.db, this.cursorId, this.fn, this.batch);
    this._isLooping = false;

    // Calculate next execution:
    const delay = count < this.batch ? this.sleep : this.delay;
    this._timer = setTimeout(() => this.loop(), delay);
  }
}

const run = (db, cursorId, handler, config) => {
  const instance = new Worker(db, cursorId, handler, config);
  return instance.start();
};

module.exports = {
  subscribe,
  reset,
  read,
  commit,
  batch,
  run
};
