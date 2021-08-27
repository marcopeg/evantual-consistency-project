CREATE TABLE "public"."sot_listings" (
  "product_id" integer NOT NULL, 
  "customer_id" integer NOT NULL, 
  "price" integer NOT NULL, 
  "created_at" timestamptz NOT NULL DEFAULT now(), 
  "updated_at" timestamptz NOT NULL DEFAULT now(), 
  PRIMARY KEY ("product_id", "customer_id") , 
  FOREIGN KEY ("product_id") REFERENCES "public"."sot_products"("id") ON UPDATE no action ON DELETE no action);
CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_updated_at"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "set_public_sot_listings_updated_at"
BEFORE UPDATE ON "public"."sot_listings"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_sot_listings_updated_at" ON "public"."sot_listings" 
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
