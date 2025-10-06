-- Backfill WhatsApp from old phone column, keeping only digits
UPDATE "Restaurant"
SET "whatsapp" = regexp_replace("phone", '\\D', '', 'g')
WHERE "phone" IS NOT NULL
  AND ("whatsapp" IS NULL OR "whatsapp" = '');