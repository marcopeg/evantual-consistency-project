
WITH
  "raw_data"("document") AS (VALUES ('[
    {
      "title": "apple",
      "price": 5,
      "counters": [
        { "name": "available", "value": 10 },
        { "name": "booked", "value": 2 }
      ],
      "listings": [
        { "customer_id": 1, "price": 10 },
        { "customer_id": 2, "price": 4 }
      ]
    },
    {
      "title": "pear",
      "price": 10,
      "counters": [
        { "name": "available", "value": 7 }
      ],
      "listings": []
    },
    {
      "title": "banana",
      "price": 10,
      "counters": [],
      "listings": []
    }
  ]'::jsonb))


-- Convert JSON into tabular data:
, "tab_products" AS (
  SELECT
    "title",
    "price",
    "counters",
    "listings"
  FROM "raw_data", jsonb_to_recordset("document") AS "x"(
  	"title" TEXT,
    "price" INTEGER,
    "counters" JSONB,
    "listings" JSONB
  )
)
, "tab_counters" AS (
  SELECT 
    "t"."title" AS "title",
    "x"."name" AS "counter_id",
    "x"."value" AS "value"
  FROM 
    "tab_products" AS "t",
    jsonb_to_recordset("t"."counters") AS "x"("name" text, "value" integer)
)
, "tab_listings" AS (
  SELECT 
    "t"."title" AS "title",
    "x"."customer_id" AS "customer_id",
    "x"."price" AS "price"
  FROM 
    "tab_products" AS "t",
    jsonb_to_recordset("t"."listings") AS "x"("customer_id" integer, "price" integer)
)


-- Insert the related data into the source of truth tables:
, "ins_sot_products" AS (
  INSERT INTO "public"."sot_products" ("title", "price")
  SELECT "title", "price"
  FROM "tab_products"
  ON CONFLICT DO NOTHING
  RETURNING *
)
, "ins_sot_counters" AS (
  INSERT INTO "public"."sot_counters" ("product_id", "counter_id", "value")
  SELECT 
    "a"."id" as "product_id",
    "t"."counter_id",
    "t"."value"
  FROM "tab_counters" AS "t"
  JOIN "ins_sot_products" AS "a" USING ("title")
  RETURNING *
)
, "ins_sot_listings" AS (
  INSERT INTO "public"."sot_listings" ("product_id", "customer_id", "price")
  SELECT 
    "a"."id" as "product_id",
    "t"."customer_id",
    "t"."price"
  FROM "tab_listings" AS "t"
  JOIN "ins_sot_products" AS "a" USING ("title")
  RETURNING *
)
  
  
-- Generate a nice output in case we run this from a db client:  
SELECT
  *
, (
    SELECT COUNT(*)::int FROM "ins_sot_counters"
    WHERE "ins_sot_counters"."product_id" = "ins_sot_products"."id"
  ) AS "_counters"
, (
    SELECT COUNT(*)::int FROM "ins_sot_listings"
    WHERE "ins_sot_listings"."product_id" = "ins_sot_products"."id"
  ) AS "_listings"
FROM "ins_sot_products";
