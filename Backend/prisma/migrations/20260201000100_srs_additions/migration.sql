-- Create contact tags
CREATE TABLE "contact_tags" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_tags_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "contact_tag_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contact_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_tag_assignments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "contact_tags_company_id_name_key" ON "contact_tags"("company_id", "name");
CREATE INDEX "contact_tags_company_id_idx" ON "contact_tags"("company_id");
CREATE UNIQUE INDEX "contact_tag_assignments_contact_id_tag_id_key" ON "contact_tag_assignments"("contact_id", "tag_id");
CREATE INDEX "contact_tag_assignments_tag_id_idx" ON "contact_tag_assignments"("tag_id");

ALTER TABLE "contact_tags"
  ADD CONSTRAINT "contact_tags_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "contact_tag_assignments"
  ADD CONSTRAINT "contact_tag_assignments_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "contact_tag_assignments_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "contact_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Auto-analytic rule enhancements
ALTER TABLE "auto_analytic_rules" ADD COLUMN "match_contact_tag_id" UUID;
ALTER TABLE "auto_analytic_rules"
  ADD CONSTRAINT "auto_analytic_rules_match_contact_tag_id_fkey" FOREIGN KEY ("match_contact_tag_id") REFERENCES "contact_tags"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Line-level audit fields for auto-analytic matching
ALTER TABLE "purchase_order_lines"
  ADD COLUMN "auto_analytic_model_id" UUID,
  ADD COLUMN "auto_analytic_rule_id" UUID,
  ADD COLUMN "matched_fields_count" INTEGER;

ALTER TABLE "sales_order_lines"
  ADD COLUMN "auto_analytic_model_id" UUID,
  ADD COLUMN "auto_analytic_rule_id" UUID,
  ADD COLUMN "matched_fields_count" INTEGER;

ALTER TABLE "vendor_bill_lines"
  ADD COLUMN "auto_analytic_model_id" UUID,
  ADD COLUMN "auto_analytic_rule_id" UUID,
  ADD COLUMN "matched_fields_count" INTEGER;

ALTER TABLE "customer_invoice_lines"
  ADD COLUMN "auto_analytic_model_id" UUID,
  ADD COLUMN "auto_analytic_rule_id" UUID,
  ADD COLUMN "matched_fields_count" INTEGER;

ALTER TABLE "purchase_order_lines"
  ADD CONSTRAINT "purchase_order_lines_auto_analytic_model_id_fkey" FOREIGN KEY ("auto_analytic_model_id") REFERENCES "auto_analytic_models"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "purchase_order_lines_auto_analytic_rule_id_fkey" FOREIGN KEY ("auto_analytic_rule_id") REFERENCES "auto_analytic_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "sales_order_lines"
  ADD CONSTRAINT "sales_order_lines_auto_analytic_model_id_fkey" FOREIGN KEY ("auto_analytic_model_id") REFERENCES "auto_analytic_models"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "sales_order_lines_auto_analytic_rule_id_fkey" FOREIGN KEY ("auto_analytic_rule_id") REFERENCES "auto_analytic_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "vendor_bill_lines"
  ADD CONSTRAINT "vendor_bill_lines_auto_analytic_model_id_fkey" FOREIGN KEY ("auto_analytic_model_id") REFERENCES "auto_analytic_models"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "vendor_bill_lines_auto_analytic_rule_id_fkey" FOREIGN KEY ("auto_analytic_rule_id") REFERENCES "auto_analytic_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "customer_invoice_lines"
  ADD CONSTRAINT "customer_invoice_lines_auto_analytic_model_id_fkey" FOREIGN KEY ("auto_analytic_model_id") REFERENCES "auto_analytic_models"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "customer_invoice_lines_auto_analytic_rule_id_fkey" FOREIGN KEY ("auto_analytic_rule_id") REFERENCES "auto_analytic_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Payment linking tables
CREATE TABLE "customer_invoice_payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invoice_id" UUID NOT NULL,
    "payment_id" UUID NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_invoice_payments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "vendor_bill_payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "bill_id" UUID NOT NULL,
    "payment_id" UUID NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_bill_payments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "customer_invoice_payments_invoice_id_payment_id_key" ON "customer_invoice_payments"("invoice_id", "payment_id");
CREATE INDEX "customer_invoice_payments_payment_id_idx" ON "customer_invoice_payments"("payment_id");

CREATE UNIQUE INDEX "vendor_bill_payments_bill_id_payment_id_key" ON "vendor_bill_payments"("bill_id", "payment_id");
CREATE INDEX "vendor_bill_payments_payment_id_idx" ON "vendor_bill_payments"("payment_id");

ALTER TABLE "customer_invoice_payments"
  ADD CONSTRAINT "customer_invoice_payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "customer_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "customer_invoice_payments_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "vendor_bill_payments"
  ADD CONSTRAINT "vendor_bill_payments_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "vendor_bills"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "vendor_bill_payments_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
