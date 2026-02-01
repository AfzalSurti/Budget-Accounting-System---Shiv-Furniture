-- Migration to set all contacts as portal users
UPDATE "contacts" SET "is_portal_user" = true WHERE "is_portal_user" = false;
