CREATE TABLE "public"."cache_products" (
  "id" INTEGER PRIMARY KEY, 
  "etag_sot_products" TIMESTAMPTZ DEFAULT NOW(), 
  "etag_sot_counters" TIMESTAMPTZ DEFAULT NOW(), 
  "etag_cache" TIMESTAMPTZ DEFAULT NOW(),
  "created_at" TIMESTAMPTZ DEFAULT NOW(), 
  "updated_at" TIMESTAMPTZ DEFAULT NOW(), 
  "title" TEXT DEFAULT '', 
  "price" INTEGER DEFAULT 0, 
  "qt_available" INTEGER DEFAULT 0, 
  "qt_booked" INTEGER DEFAULT 0
);
