-- Drop "phone" column from the "Restaurant" table after backfilling whatsapp
ALTER TABLE "Restaurant" DROP COLUMN IF EXISTS "phone";