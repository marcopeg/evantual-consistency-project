-- SELECT observe_table('public', 'sot_products', false);
-- SELECT observe_table('public', 'sot_counters', false);
-- SELECT observe_table('public', 'sot_listings', false);

DROP FUNCTION observe_table;
DROP FUNCTION observe_table_trigger_handler;

DROP TABLE IF EXISTS "public"."changelog";
DROP TABLE IF EXISTS "public"."changelog_cursor";