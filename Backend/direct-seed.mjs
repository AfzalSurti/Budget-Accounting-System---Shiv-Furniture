import "dotenv/config.js";
import pkg from "pg";
const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const today = new Date();

function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDays(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function calcLineTotal(qty, unitPrice, taxRate) {
  const base = Number(qty) * Number(unitPrice);
  const tax = base * (Number(taxRate) / 100);
  return Number((base + tax).toFixed(2));
}

async function getCompanyId() {
  const name = "Shiv Furniture";
  const envCompanyId = process.env.DEFAULT_COMPANY_ID;
  if (envCompanyId) {
    await client.query(
      `INSERT INTO companies (id, name, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [envCompanyId, name]
    );
    return envCompanyId;
  }

  const existing = await client.query(
    `SELECT id FROM companies WHERE name = $1 LIMIT 1`,
    [name]
  );
  if (existing.rows.length) {
    return existing.rows[0].id;
  }

  const created = await client.query(
    `INSERT INTO companies (id, name, created_at)
     VALUES (gen_random_uuid(), $1, NOW())
     RETURNING id`,
    [name]
  );
  return created.rows[0].id;
}

async function upsertGlAccount(companyId, code, name, accountType) {
  const res = await client.query(
    `INSERT INTO gl_accounts (id, company_id, code, name, account_type, is_active)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, true)
     ON CONFLICT (company_id, code) DO UPDATE SET
       name = EXCLUDED.name,
       account_type = EXCLUDED.account_type,
       is_active = true
     RETURNING id`,
    [companyId, code, name, accountType]
  );
  return res.rows[0].id;
}

async function upsertCategory(companyId, name, parentId = null) {
  const res = await client.query(
    `INSERT INTO product_categories (id, company_id, name, parent_id)
     VALUES (gen_random_uuid(), $1, $2, $3)
     ON CONFLICT (company_id, name) DO UPDATE SET parent_id = EXCLUDED.parent_id
     RETURNING id`,
    [companyId, name, parentId]
  );
  return res.rows[0].id;
}

async function upsertProduct(companyId, sku, name, categoryId, costPrice, salePrice, uom = "unit") {
  const res = await client.query(
    `INSERT INTO products (id, company_id, category_id, sku, name, cost_price, sale_price, uom, is_active)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, true)
     ON CONFLICT (company_id, sku) DO UPDATE SET
       name = EXCLUDED.name,
       category_id = EXCLUDED.category_id,
       cost_price = EXCLUDED.cost_price,
       sale_price = EXCLUDED.sale_price,
       uom = EXCLUDED.uom,
       is_active = true
     RETURNING id`,
    [companyId, categoryId, sku, name, costPrice, salePrice, uom]
  );
  return res.rows[0].id;
}

async function upsertContact(companyId, contactType, displayName, email, phone = null) {
  const res = await client.query(
    `INSERT INTO contacts (id, company_id, contact_type, display_name, email, phone, is_active)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, true)
     ON CONFLICT (company_id, email) DO UPDATE SET
       contact_type = EXCLUDED.contact_type,
       display_name = EXCLUDED.display_name,
       phone = EXCLUDED.phone,
       is_active = true
     RETURNING id`,
    [companyId, contactType, displayName, email, phone]
  );
  return res.rows[0].id;
}

async function upsertAnalyticAccount(companyId, code, name, parentId = null) {
  const res = await client.query(
    `INSERT INTO analytic_accounts (id, company_id, code, name, parent_id, is_active, created_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, true, NOW())
     ON CONFLICT (company_id, name) DO UPDATE SET
       code = EXCLUDED.code,
       parent_id = EXCLUDED.parent_id,
       is_active = true
     RETURNING id`,
    [companyId, code, name, parentId]
  );
  return res.rows[0].id;
}

async function upsertContactTag(companyId, name) {
  const res = await client.query(
    `INSERT INTO contact_tags (id, company_id, name, created_at)
     VALUES (gen_random_uuid(), $1, $2, NOW())
     ON CONFLICT (company_id, name) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [companyId, name]
  );
  return res.rows[0].id;
}

async function ensureContactTagAssignment(contactId, tagId) {
  await client.query(
    `INSERT INTO contact_tag_assignments (id, contact_id, tag_id, created_at)
     VALUES (gen_random_uuid(), $1, $2, NOW())
     ON CONFLICT (contact_id, tag_id) DO NOTHING`,
    [contactId, tagId]
  );
}

async function upsertBudget(companyId, name, startDate, endDate, status = "approved") {
  const res = await client.query(
    `INSERT INTO budgets (id, company_id, name, period_start, period_end, status, created_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
     ON CONFLICT DO NOTHING
     RETURNING id`,
    [companyId, name, startDate, endDate, status]
  );
  if (res.rows.length) {
    return res.rows[0].id;
  }
  const existing = await client.query(
    `SELECT id FROM budgets WHERE company_id = $1 AND name = $2 AND period_start = $3 AND period_end = $4 LIMIT 1`,
    [companyId, name, startDate, endDate]
  );
  return existing.rows[0]?.id;
}

async function upsertBudgetRevision(budgetId, revisionNo, revisionReason = "Initial plan") {
  const res = await client.query(
    `INSERT INTO budget_revisions (id, budget_id, revision_no, revision_reason, created_at)
     VALUES (gen_random_uuid(), $1, $2, $3, NOW())
     ON CONFLICT (budget_id, revision_no) DO UPDATE SET revision_reason = EXCLUDED.revision_reason
     RETURNING id`,
    [budgetId, revisionNo, revisionReason]
  );
  return res.rows[0].id;
}

async function upsertBudgetLine(revisionId, analyticAccountId, amount) {
  await client.query(
    `INSERT INTO budget_lines (id, budget_revision_id, analytic_account_id, amount)
     VALUES (gen_random_uuid(), $1, $2, $3)
     ON CONFLICT (budget_revision_id, analytic_account_id, gl_account_id) DO UPDATE SET amount = EXCLUDED.amount`,
    [revisionId, analyticAccountId, amount]
  );
}

async function upsertSalesOrder(companyId, soNo, customerId, orderDate, status, notes = null) {
  const res = await client.query(
    `INSERT INTO sales_orders (id, company_id, so_no, customer_id, order_date, delivery_date, status, currency, notes, created_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'INR', $7, NOW())
     ON CONFLICT (company_id, so_no) DO UPDATE SET
       customer_id = EXCLUDED.customer_id,
       order_date = EXCLUDED.order_date,
       delivery_date = EXCLUDED.delivery_date,
       status = EXCLUDED.status,
       notes = EXCLUDED.notes
     RETURNING id`,
    [companyId, soNo, customerId, orderDate, orderDate, status, notes]
  );
  return res.rows[0].id;
}

async function upsertPurchaseOrder(companyId, poNo, vendorId, orderDate, status, notes = null) {
  const res = await client.query(
    `INSERT INTO purchase_orders (id, company_id, po_no, vendor_id, order_date, delivery_date, status, currency, notes, created_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'INR', $7, NOW())
     ON CONFLICT (company_id, po_no) DO UPDATE SET
       vendor_id = EXCLUDED.vendor_id,
       order_date = EXCLUDED.order_date,
       delivery_date = EXCLUDED.delivery_date,
       status = EXCLUDED.status,
       notes = EXCLUDED.notes
     RETURNING id`,
    [companyId, poNo, vendorId, orderDate, orderDate, status, notes]
  );
  return res.rows[0].id;
}

async function replaceSalesOrderLines(soId, lines) {
  await client.query(`DELETE FROM sales_order_lines WHERE sales_order_id = $1`, [soId]);
  for (const line of lines) {
    await client.query(
      `INSERT INTO sales_order_lines
       (id, sales_order_id, product_id, analytic_account_id, description, qty, unit_price, tax_rate, line_total)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        soId,
        line.productId,
        line.analyticAccountId,
        line.description,
        line.qty,
        line.unitPrice,
        line.taxRate,
        line.lineTotal,
      ]
    );
  }
}

async function replacePurchaseOrderLines(poId, lines) {
  await client.query(`DELETE FROM purchase_order_lines WHERE purchase_order_id = $1`, [poId]);
  for (const line of lines) {
    await client.query(
      `INSERT INTO purchase_order_lines
       (id, purchase_order_id, product_id, analytic_account_id, description, qty, unit_price, tax_rate, line_total)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        poId,
        line.productId,
        line.analyticAccountId,
        line.description,
        line.qty,
        line.unitPrice,
        line.taxRate,
        line.lineTotal,
      ]
    );
  }
}

async function upsertCustomerInvoice(companyId, invoiceNo, customerId, invoiceDate, dueDate, status, soId = null) {
  const res = await client.query(
    `INSERT INTO customer_invoices
     (id, company_id, invoice_no, customer_id, invoice_date, due_date, status, currency, so_id, total_amount, paid_amount, payment_status, portal_visible, created_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'INR', $7, 0, 0, 'not_paid', true, NOW())
     ON CONFLICT (company_id, invoice_no) DO UPDATE SET
       customer_id = EXCLUDED.customer_id,
       invoice_date = EXCLUDED.invoice_date,
       due_date = EXCLUDED.due_date,
       status = EXCLUDED.status,
       so_id = EXCLUDED.so_id
     RETURNING id`,
    [companyId, invoiceNo, customerId, invoiceDate, dueDate, status, soId]
  );
  return res.rows[0].id;
}

async function replaceCustomerInvoiceLines(invoiceId, lines) {
  await client.query(`DELETE FROM customer_invoice_lines WHERE customer_invoice_id = $1`, [invoiceId]);
  for (const line of lines) {
    await client.query(
      `INSERT INTO customer_invoice_lines
       (id, customer_invoice_id, product_id, analytic_account_id, gl_account_id, description, qty, unit_price, tax_rate, line_total)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        invoiceId,
        line.productId,
        line.analyticAccountId,
        line.glAccountId,
        line.description,
        line.qty,
        line.unitPrice,
        line.taxRate,
        line.lineTotal,
      ]
    );
  }
}

async function upsertVendorBill(companyId, billNo, vendorId, billDate, dueDate, status, poId = null) {
  const res = await client.query(
    `INSERT INTO vendor_bills
     (id, company_id, bill_no, vendor_id, bill_date, due_date, status, currency, po_id, total_amount, paid_amount, payment_status, created_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'INR', $7, 0, 0, 'not_paid', NOW())
     ON CONFLICT (company_id, bill_no) DO UPDATE SET
       vendor_id = EXCLUDED.vendor_id,
       bill_date = EXCLUDED.bill_date,
       due_date = EXCLUDED.due_date,
       status = EXCLUDED.status,
       po_id = EXCLUDED.po_id
     RETURNING id`,
    [companyId, billNo, vendorId, billDate, dueDate, status, poId]
  );
  return res.rows[0].id;
}

async function replaceVendorBillLines(billId, lines) {
  await client.query(`DELETE FROM vendor_bill_lines WHERE vendor_bill_id = $1`, [billId]);
  for (const line of lines) {
    await client.query(
      `INSERT INTO vendor_bill_lines
       (id, vendor_bill_id, product_id, analytic_account_id, gl_account_id, description, qty, unit_price, tax_rate, line_total)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        billId,
        line.productId,
        line.analyticAccountId,
        line.glAccountId,
        line.description,
        line.qty,
        line.unitPrice,
        line.taxRate,
        line.lineTotal,
      ]
    );
  }
}

async function updateInvoiceTotals(invoiceId) {
  const totals = await client.query(
    `SELECT COALESCE(SUM(line_total),0) AS total FROM customer_invoice_lines WHERE customer_invoice_id = $1`,
    [invoiceId]
  );
  await client.query(
    `UPDATE customer_invoices SET total_amount = $2 WHERE id = $1`,
    [invoiceId, totals.rows[0].total]
  );
  return Number(totals.rows[0].total || 0);
}

async function updateBillTotals(billId) {
  const totals = await client.query(
    `SELECT COALESCE(SUM(line_total),0) AS total FROM vendor_bill_lines WHERE vendor_bill_id = $1`,
    [billId]
  );
  await client.query(
    `UPDATE vendor_bills SET total_amount = $2 WHERE id = $1`,
    [billId, totals.rows[0].total]
  );
  return Number(totals.rows[0].total || 0);
}

async function findOrCreatePayment(companyId, direction, contactId, paymentDate, method, reference, amount, status = "posted") {
  const existing = await client.query(
    `SELECT id FROM payments WHERE company_id = $1 AND reference = $2 AND amount = $3 LIMIT 1`,
    [companyId, reference, amount]
  );
  if (existing.rows.length) {
    return existing.rows[0].id;
  }

  const res = await client.query(
    `INSERT INTO payments (id, company_id, direction, contact_id, payment_date, method, reference, amount, status, created_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW())
     RETURNING id`,
    [companyId, direction, contactId, paymentDate, method, reference, amount, status]
  );
  return res.rows[0].id;
}

async function ensureInvoicePayment(invoiceId, paymentId, amount) {
  await client.query(
    `INSERT INTO customer_invoice_payments (id, invoice_id, payment_id, amount, created_at)
     VALUES (gen_random_uuid(), $1, $2, $3, NOW())
     ON CONFLICT (invoice_id, payment_id) DO UPDATE SET amount = EXCLUDED.amount`,
    [invoiceId, paymentId, amount]
  );
}

async function ensureBillPayment(billId, paymentId, amount) {
  await client.query(
    `INSERT INTO vendor_bill_payments (id, bill_id, payment_id, amount, created_at)
     VALUES (gen_random_uuid(), $1, $2, $3, NOW())
     ON CONFLICT (bill_id, payment_id) DO UPDATE SET amount = EXCLUDED.amount`,
    [billId, paymentId, amount]
  );
}

async function ensurePaymentAllocation(paymentId, targetType, targetId, amount) {
  await client.query(
    `INSERT INTO payment_allocations (id, payment_id, target_type, target_id, amount)
     VALUES (gen_random_uuid(), $1, $2, $3, $4)
     ON CONFLICT (payment_id, target_type, target_id) DO UPDATE SET amount = EXCLUDED.amount`,
    [paymentId, targetType, targetId, amount]
  );
}

async function refreshInvoicePaymentState(invoiceId) {
  const paid = await client.query(
    `SELECT COALESCE(SUM(amount),0) AS paid FROM customer_invoice_payments WHERE invoice_id = $1`,
    [invoiceId]
  );
  const total = await client.query(
    `SELECT total_amount FROM customer_invoices WHERE id = $1`,
    [invoiceId]
  );
  const paidAmount = Number(paid.rows[0].paid || 0);
  const totalAmount = Number(total.rows[0].total_amount || 0);
  let state = "not_paid";
  if (paidAmount >= totalAmount && totalAmount > 0) state = "paid";
  else if (paidAmount > 0) state = "partially_paid";
  await client.query(
    `UPDATE customer_invoices SET paid_amount = $2, payment_status = $3 WHERE id = $1`,
    [invoiceId, paidAmount, state]
  );
}

async function refreshBillPaymentState(billId) {
  const paid = await client.query(
    `SELECT COALESCE(SUM(amount),0) AS paid FROM vendor_bill_payments WHERE bill_id = $1`,
    [billId]
  );
  const total = await client.query(
    `SELECT total_amount FROM vendor_bills WHERE id = $1`,
    [billId]
  );
  const paidAmount = Number(paid.rows[0].paid || 0);
  const totalAmount = Number(total.rows[0].total_amount || 0);
  let state = "not_paid";
  if (paidAmount >= totalAmount && totalAmount > 0) state = "paid";
  else if (paidAmount > 0) state = "partially_paid";
  await client.query(
    `UPDATE vendor_bills SET paid_amount = $2, payment_status = $3 WHERE id = $1`,
    [billId, paidAmount, state]
  );
}

async function clearJournalForSource(companyId, sourceType, sourceId) {
  const existing = await client.query(
    `SELECT id FROM journal_entries WHERE company_id = $1 AND source_type = $2 AND source_id = $3`,
    [companyId, sourceType, sourceId]
  );
  for (const row of existing.rows) {
    await client.query(`DELETE FROM journal_lines WHERE journal_entry_id = $1`, [row.id]);
  }
  await client.query(
    `DELETE FROM journal_entries WHERE company_id = $1 AND source_type = $2 AND source_id = $3`,
    [companyId, sourceType, sourceId]
  );
}

async function createJournalEntry(companyId, sourceType, sourceId, entryDate, memo) {
  const res = await client.query(
    `INSERT INTO journal_entries
     (id, company_id, entry_date, status, source_type, source_id, memo, created_at, posted_at)
     VALUES (gen_random_uuid(), $1, $2, 'posted', $3, $4, $5, NOW(), NOW())
     RETURNING id`,
    [companyId, entryDate, sourceType, sourceId, memo]
  );
  return res.rows[0].id;
}

async function createJournalLine(entryId, glAccountId, debit, credit, analyticAccountId = null, contactId = null, description = null) {
  await client.query(
    `INSERT INTO journal_lines
     (id, journal_entry_id, gl_account_id, analytic_account_id, contact_id, description, debit, credit)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7)`,
    [entryId, glAccountId, analyticAccountId, contactId, description, debit, credit]
  );
}

async function getEnumValues(enumName) {
  const res = await client.query(
    `SELECT unnest(enum_range(NULL::"${enumName}")) AS value`
  );
  return res.rows.map((row) => row.value);
}

async function main() {
  await client.connect();
  console.log("Connected to database");

  try {
    const companyId = await getCompanyId();
    console.log(`Using companyId: ${companyId}`);

    // GL Accounts
    const glCash = await upsertGlAccount(companyId, "1100", "Cash / Bank", "asset");
    const glAr = await upsertGlAccount(companyId, "1200", "Accounts Receivable", "asset");
    const glAp = await upsertGlAccount(companyId, "2000", "Accounts Payable", "liability");
    const glRevenue = await upsertGlAccount(companyId, "4000", "Sales Revenue", "income");
    const glExpense = await upsertGlAccount(companyId, "5000", "Cost of Goods", "expense");

    // Product Categories
    const catWood = await upsertCategory(companyId, "Wooden Furniture");
    const catUpholstery = await upsertCategory(companyId, "Upholstery");
    const catOffice = await upsertCategory(companyId, "Office Furniture");

    // Products
    const prodChair = await upsertProduct(companyId, "WF001", "Sheesham Wood Chair", catWood, 2500, 4500);
    const prodTable = await upsertProduct(companyId, "WF002", "Teak Dining Table", catWood, 12000, 21000);
    const prodSofa = await upsertProduct(companyId, "UF001", "3-Seater Fabric Sofa", catUpholstery, 18000, 32000);
    const prodDesk = await upsertProduct(companyId, "OF001", "Office Study Desk", catOffice, 6500, 12000);

    // Contacts
    const vendorTimber = await upsertContact(
      companyId,
      "vendor",
      "Sharma Timber Suppliers",
      "vendor@sharmatimber.in",
      "+91-98100-11223"
    );
    const vendorHardware = await upsertContact(
      companyId,
      "vendor",
      "Singh Hardware & Fittings",
      "sales@singhhardware.in",
      "+91-98220-33445"
    );
    const customerRahul = await upsertContact(
      companyId,
      "customer",
      "Rahul Verma",
      "rahul.verma@example.in",
      "+91-98990-55667"
    );
    const customerAsha = await upsertContact(
      companyId,
      "customer",
      "Asha Kapoor",
      "asha.kapoor@example.in",
      "+91-98111-77889"
    );

    // Contact tags
    const tagRetail = await upsertContactTag(companyId, "Retail");
    const tagWholesale = await upsertContactTag(companyId, "Wholesale");
    await ensureContactTagAssignment(customerRahul, tagRetail);
    await ensureContactTagAssignment(customerAsha, tagWholesale);

    // Analytic Accounts (Cost Centers)
    const ccManufacturing = await upsertAnalyticAccount(companyId, "CC001", "Manufacturing");
    const ccSales = await upsertAnalyticAccount(companyId, "CC002", "Sales");
    const ccAdmin = await upsertAnalyticAccount(companyId, "CC003", "Admin");
    const ccOperations = await upsertAnalyticAccount(companyId, "CC004", "Operations");
    const ccCapital = await upsertAnalyticAccount(companyId, "CC005", "Capital");

    // Budget + Revision + Lines
    const budgetId = await upsertBudget(
      companyId,
      "FY25-26 Operating Budget",
      "2025-04-01",
      "2026-03-31",
      "approved"
    );
    if (budgetId) {
      const revisionId = await upsertBudgetRevision(budgetId, 1, "Initial FY plan");
      await upsertBudgetLine(revisionId, ccManufacturing, 1500000);
      await upsertBudgetLine(revisionId, ccSales, 600000);
      await upsertBudgetLine(revisionId, ccAdmin, 350000);
      await upsertBudgetLine(revisionId, ccOperations, 400000);
      await upsertBudgetLine(revisionId, ccCapital, 250000);
    }

    // Sales Order + Lines
    const soDate = formatDate(addDays(today, -30));
    const soId = await upsertSalesOrder(companyId, "SO-1001", customerRahul, soDate, "done", "Sheesham dining set order");
    await replaceSalesOrderLines(soId, [
      {
        productId: prodTable,
        analyticAccountId: ccSales,
        description: "Teak Dining Table",
        qty: 1,
        unitPrice: 21000,
        taxRate: 12,
        lineTotal: calcLineTotal(1, 21000, 12),
      },
      {
        productId: prodChair,
        analyticAccountId: ccSales,
        description: "Sheesham Wood Chair",
        qty: 4,
        unitPrice: 4500,
        taxRate: 12,
        lineTotal: calcLineTotal(4, 4500, 12),
      },
    ]);

    // Purchase Order + Lines
    const poDate = formatDate(addDays(today, -25));
    const poId = await upsertPurchaseOrder(companyId, "PO-2001", vendorTimber, poDate, "done", "Raw timber procurement");
    await replacePurchaseOrderLines(poId, [
      {
        productId: prodChair,
        analyticAccountId: ccManufacturing,
        description: "Sheesham Wood (raw)",
        qty: 20,
        unitPrice: 1800,
        taxRate: 5,
        lineTotal: calcLineTotal(20, 1800, 5),
      },
    ]);

    // Customer Invoice + Lines
    const invDate = formatDate(addDays(today, -20));
    const invDue = formatDate(addDays(today, -5));
    const invoiceId = await upsertCustomerInvoice(companyId, "INV-3001", customerRahul, invDate, invDue, "posted", soId);
    await replaceCustomerInvoiceLines(invoiceId, [
      {
        productId: prodTable,
        analyticAccountId: ccSales,
        glAccountId: glRevenue,
        description: "Teak Dining Table",
        qty: 1,
        unitPrice: 21000,
        taxRate: 12,
        lineTotal: calcLineTotal(1, 21000, 12),
      },
      {
        productId: prodChair,
        analyticAccountId: ccSales,
        glAccountId: glRevenue,
        description: "Sheesham Wood Chair",
        qty: 4,
        unitPrice: 4500,
        taxRate: 12,
        lineTotal: calcLineTotal(4, 4500, 12),
      },
    ]);
    const invoiceTotal = await updateInvoiceTotals(invoiceId);

    // Vendor Bill + Lines
    const billDate = formatDate(addDays(today, -18));
    const billDue = formatDate(addDays(today, 7));
    const billId = await upsertVendorBill(companyId, "BILL-4001", vendorTimber, billDate, billDue, "posted", poId);
    await replaceVendorBillLines(billId, [
      {
        productId: prodChair,
        analyticAccountId: ccManufacturing,
        glAccountId: glExpense,
        description: "Sheesham Wood (raw)",
        qty: 20,
        unitPrice: 1800,
        taxRate: 5,
        lineTotal: calcLineTotal(20, 1800, 5),
      },
    ]);
    const billTotal = await updateBillTotals(billId);

    // Payments (partial invoice, partial bill)
    const pay1 = await findOrCreatePayment(
      companyId,
      "inbound",
      customerRahul,
      formatDate(addDays(today, -10)),
      "upi",
      "PAY-INV-3001",
      Math.min(15000, invoiceTotal),
      "posted"
    );
    await ensureInvoicePayment(invoiceId, pay1, Math.min(15000, invoiceTotal));
    await ensurePaymentAllocation(pay1, "customer_invoice", invoiceId, Math.min(15000, invoiceTotal));
    await refreshInvoicePaymentState(invoiceId);

    const pay2 = await findOrCreatePayment(
      companyId,
      "outbound",
      vendorTimber,
      formatDate(addDays(today, -8)),
      "bank",
      "PAY-BILL-4001",
      Math.min(12000, billTotal),
      "posted"
    );
    await ensureBillPayment(billId, pay2, Math.min(12000, billTotal));
    await ensurePaymentAllocation(pay2, "vendor_bill", billId, Math.min(12000, billTotal));
    await refreshBillPaymentState(billId);

    // Journals for SO/PO, Invoice, Bill, Payments
    const journalSourceTypes = await getEnumValues("JournalSourceType");
    const supportsSalesOrder = journalSourceTypes.includes("sales_order");
    const supportsPurchaseOrder = journalSourceTypes.includes("purchase_order");

    if (supportsSalesOrder) {
      await clearJournalForSource(companyId, "sales_order", soId);
      const jeSo = await createJournalEntry(companyId, "sales_order", soId, soDate, "SO-1001 confirmation");
      await createJournalLine(jeSo, glAr, invoiceTotal, 0, ccSales, customerRahul, "AR for SO-1001");
      await createJournalLine(jeSo, glRevenue, 0, invoiceTotal, ccSales, customerRahul, "Revenue for SO-1001");
    } else {
      console.warn("JournalSourceType missing sales_order; skipping SO journal seed.");
    }

    if (supportsPurchaseOrder) {
      await clearJournalForSource(companyId, "purchase_order", poId);
      const jePo = await createJournalEntry(companyId, "purchase_order", poId, poDate, "PO-2001 confirmation");
      await createJournalLine(jePo, glExpense, billTotal, 0, ccManufacturing, vendorTimber, "Expense for PO-2001");
      await createJournalLine(jePo, glAp, 0, billTotal, ccManufacturing, vendorTimber, "AP for PO-2001");
    } else {
      console.warn("JournalSourceType missing purchase_order; skipping PO journal seed.");
    }

    await clearJournalForSource(companyId, "customer_invoice", invoiceId);
    const jeInv = await createJournalEntry(companyId, "customer_invoice", invoiceId, invDate, "Invoice INV-3001 posted");
    await createJournalLine(jeInv, glAr, invoiceTotal, 0, ccSales, customerRahul, "AR for INV-3001");
    await createJournalLine(jeInv, glRevenue, 0, invoiceTotal, ccSales, customerRahul, "Revenue for INV-3001");

    await clearJournalForSource(companyId, "vendor_bill", billId);
    const jeBill = await createJournalEntry(companyId, "vendor_bill", billId, billDate, "Bill BILL-4001 posted");
    await createJournalLine(jeBill, glExpense, billTotal, 0, ccManufacturing, vendorTimber, "Expense for BILL-4001");
    await createJournalLine(jeBill, glAp, 0, billTotal, ccManufacturing, vendorTimber, "AP for BILL-4001");

    await clearJournalForSource(companyId, "payment", pay1);
    const jePay1 = await createJournalEntry(companyId, "payment", pay1, formatDate(addDays(today, -10)), "Payment PAY-INV-3001");
    await createJournalLine(jePay1, glCash, Math.min(15000, invoiceTotal), 0, ccSales, customerRahul, "Cash received");
    await createJournalLine(jePay1, glAr, 0, Math.min(15000, invoiceTotal), ccSales, customerRahul, "AR cleared");

    await clearJournalForSource(companyId, "payment", pay2);
    const jePay2 = await createJournalEntry(companyId, "payment", pay2, formatDate(addDays(today, -8)), "Payment PAY-BILL-4001");
    await createJournalLine(jePay2, glExpense, 0, 0, ccManufacturing, vendorTimber, null);
    await createJournalLine(jePay2, glAp, billTotal > 0 ? Math.min(12000, billTotal) : 0, 0, ccManufacturing, vendorTimber, "AP cleared");
    await createJournalLine(jePay2, glCash, 0, billTotal > 0 ? Math.min(12000, billTotal) : 0, ccManufacturing, vendorTimber, "Cash paid");

    console.log("Seed complete (including SO/PO, invoices, bills, payments, journals)." );
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  } finally {
    await client.end();
  }
}

main();
