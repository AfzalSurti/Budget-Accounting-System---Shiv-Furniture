import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../dist/generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const COMPANY_ID = process.env.SEED_COMPANY_ID || "00000000-0000-0000-0000-000000000001";

const main = async () => {
  const company = await prisma.company.upsert({
    where: { id: COMPANY_ID },
    update: { name: "Shiv Furniture" },
    create: { id: COMPANY_ID, name: "Shiv Furniture" },
  });

  await prisma.paymentAllocation.deleteMany({ where: { payment: { companyId: company.id } } });
  await prisma.customerInvoicePayment.deleteMany({ where: { payment: { companyId: company.id } } });
  await prisma.vendorBillPayment.deleteMany({ where: { payment: { companyId: company.id } } });
  await prisma.payment.deleteMany({ where: { companyId: company.id } });

  await prisma.customerInvoiceLine.deleteMany({ where: { invoice: { companyId: company.id } } });
  await prisma.customerInvoice.deleteMany({ where: { companyId: company.id } });

  await prisma.vendorBillLine.deleteMany({ where: { bill: { companyId: company.id } } });
  await prisma.vendorBill.deleteMany({ where: { companyId: company.id } });

  await prisma.salesOrderLine.deleteMany({ where: { salesOrder: { companyId: company.id } } });
  await prisma.salesOrder.deleteMany({ where: { companyId: company.id } });

  await prisma.purchaseOrderLine.deleteMany({ where: { purchaseOrder: { companyId: company.id } } });
  await prisma.purchaseOrder.deleteMany({ where: { companyId: company.id } });

  await prisma.budgetLine.deleteMany({ where: { revision: { budget: { companyId: company.id } } } });
  await prisma.budgetRevision.deleteMany({ where: { budget: { companyId: company.id } } });
  await prisma.budget.deleteMany({ where: { companyId: company.id } });

  await prisma.journalLine.deleteMany({ where: { entry: { companyId: company.id } } });
  await prisma.journalEntry.deleteMany({ where: { companyId: company.id } });

  await prisma.autoAnalyticRule.deleteMany({ where: { model: { companyId: company.id } } });
  await prisma.autoAnalyticModel.deleteMany({ where: { companyId: company.id } });

  await prisma.product.deleteMany({ where: { companyId: company.id } });
  await prisma.productCategory.deleteMany({ where: { companyId: company.id } });

  await prisma.contactTagAssignment.deleteMany({ where: { contact: { companyId: company.id } } });
  await prisma.contactTag.deleteMany({ where: { companyId: company.id } });

  await prisma.contact.deleteMany({ where: { companyId: company.id } });
  await prisma.analyticAccount.deleteMany({ where: { companyId: company.id } });
  await prisma.gLAccount.deleteMany({ where: { companyId: company.id } });

  await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { in: ["admin@shivfurniture.in", "portal@shivfurniture.in"] } },
        { loginId: { in: ["ADMIN1", "PORT01"] } },
      ],
    },
  });

  const glSales = await prisma.gLAccount.create({
    data: {
      companyId: company.id,
      code: "ACC001",
      name: "Sales Revenue",
      accountType: "income",
    },
  });

  const glCogs = await prisma.gLAccount.create({
    data: {
      companyId: company.id,
      code: "ACC002",
      name: "Cost of Goods Sold",
      accountType: "expense",
    },
  });

  const glBank = await prisma.gLAccount.create({
    data: {
      companyId: company.id,
      code: "ACC003",
      name: "Bank",
      accountType: "asset",
    },
  });

  const ccManufacturing = await prisma.analyticAccount.create({
    data: { companyId: company.id, code: "CC-100", name: "Manufacturing" },
  });
  const ccSales = await prisma.analyticAccount.create({
    data: { companyId: company.id, code: "CC-200", name: "Sales" },
  });
  const ccAdmin = await prisma.analyticAccount.create({
    data: { companyId: company.id, code: "CC-300", name: "Admin" },
  });
  const ccOperations = await prisma.analyticAccount.create({
    data: { companyId: company.id, code: "CC-400", name: "Operations", parentId: ccManufacturing.id },
  });
  const ccCapital = await prisma.analyticAccount.create({
    data: { companyId: company.id, code: "CC-500", name: "Capital" },
  });

  const tagRetail = await prisma.contactTag.create({
    data: { companyId: company.id, name: "Retail" },
  });
  const tagWholesale = await prisma.contactTag.create({
    data: { companyId: company.id, name: "Wholesale" },
  });
  const tagTimber = await prisma.contactTag.create({
    data: { companyId: company.id, name: "Timber" },
  });

  const vendor = await prisma.contact.create({
    data: {
      companyId: company.id,
      contactType: "vendor",
      displayName: "Sharma Timber Suppliers",
      email: "vendor@sharmatimber.in",
      phone: "+91 98980 12345",
    },
  });

  const customer = await prisma.contact.create({
    data: {
      companyId: company.id,
      contactType: "customer",
      displayName: "Aarav Furnishings",
      email: "accounts@aaravfurnishings.in",
      phone: "+91 98765 43210",
    },
  });

  const customer2 = await prisma.contact.create({
    data: {
      companyId: company.id,
      contactType: "customer",
      displayName: "Meera Home Decor",
      email: "finance@meerahomedecor.in",
      phone: "+91 98111 22334",
    },
  });

  await prisma.contactTagAssignment.createMany({
    data: [
      { contactId: vendor.id, tagId: tagTimber.id },
      { contactId: customer.id, tagId: tagRetail.id },
      { contactId: customer2.id, tagId: tagWholesale.id },
    ],
  });

  const categoryLiving = await prisma.productCategory.create({
    data: { companyId: company.id, name: "Living" },
  });
  const categoryOffice = await prisma.productCategory.create({
    data: { companyId: company.id, name: "Office" },
  });

  const sofa = await prisma.product.create({
    data: {
      companyId: company.id,
      categoryId: categoryLiving.id,
      sku: "SF-LIV-001",
      name: "Sheesham 3-Seater Sofa",
      costPrice: 18500,
      salePrice: 28999,
    },
  });

  const table = await prisma.product.create({
    data: {
      companyId: company.id,
      categoryId: categoryOffice.id,
      sku: "SF-OFF-010",
      name: "Teak Executive Desk",
      costPrice: 12500,
      salePrice: 19999,
    },
  });

  const chair = await prisma.product.create({
    data: {
      companyId: company.id,
      categoryId: categoryOffice.id,
      sku: "SF-OFF-022",
      name: "Ergo Study Chair",
      costPrice: 3200,
      salePrice: 5400,
    },
  });

  const model = await prisma.autoAnalyticModel.create({
    data: {
      companyId: company.id,
      name: "Shiv Furniture Default Rules",
      priority: 10,
      rules: {
        create: [
          {
            docType: "purchase_order",
            matchContactTagId: tagTimber.id,
            assignAnalyticAccountId: ccManufacturing.id,
            rulePriority: 10,
          },
          {
            docType: "sales_order",
            matchContactTagId: tagRetail.id,
            assignAnalyticAccountId: ccSales.id,
            rulePriority: 10,
          },
          {
            docType: "customer_invoice",
            matchCategoryId: categoryLiving.id,
            assignAnalyticAccountId: ccSales.id,
            rulePriority: 20,
          },
          {
            docType: "vendor_bill",
            matchCategoryId: categoryOffice.id,
            assignAnalyticAccountId: ccOperations.id,
            rulePriority: 20,
          },
        ],
      },
    },
    include: { rules: true },
  });

  await prisma.budget.create({
    data: {
      companyId: company.id,
      name: "FY 2025-26 Budget",
      periodStart: new Date("2025-04-01"),
      periodEnd: new Date("2026-03-31"),
      status: "approved",
      revisions: {
        create: {
          revisionNo: 1,
          revisionReason: "Initial annual budget",
          lines: {
            create: [
              { analyticAccountId: ccManufacturing.id, amount: 250000 },
              { analyticAccountId: ccSales.id, amount: 175000 },
              { analyticAccountId: ccAdmin.id, amount: 80000 },
              { analyticAccountId: ccOperations.id, amount: 120000 },
              { analyticAccountId: ccCapital.id, amount: 300000 },
            ],
          },
        },
      },
    },
  });

  const passwordHash = await bcrypt.hash("Admin@123", 10);
  await prisma.user.upsert({
    where: { email: "admin@shivfurniture.in" },
    update: { passwordHash, role: "ADMIN", isActive: true, loginId: "ADMIN1" },
    create: {
      email: "admin@shivfurniture.in",
      loginId: "ADMIN1",
      passwordHash,
      role: "ADMIN",
    },
  });

  await prisma.user.create({
    data: {
      email: "portal@shivfurniture.in",
      loginId: "PORT01",
      passwordHash: await bcrypt.hash("Portal@123", 10),
      role: "PORTAL",
      contactId: customer.id,
      isActive: true,
    },
  });

  const purchaseOrder = await prisma.purchaseOrder.create({
    data: {
      companyId: company.id,
      poNo: "PO-2026-001",
      vendorId: vendor.id,
      orderDate: new Date("2026-01-10"),
      deliveryDate: new Date("2026-01-28"),
      status: "confirmed",
      currency: "INR",
      notes: "Sheesham wood raw material",
      lines: {
        create: [
          {
            productId: chair.id,
            analyticAccountId: null,
            description: "Office chair timber",
            qty: 50,
            unitPrice: 2800,
            taxRate: 18,
            lineTotal: 50 * 2800 * 1.18,
          },
        ],
      },
    },
    include: { lines: true },
  });

  const vendorBill = await prisma.vendorBill.create({
    data: {
      companyId: company.id,
      billNo: "BILL-2026-020",
      vendorId: vendor.id,
      billDate: new Date("2026-01-20"),
      dueDate: new Date("2026-02-10"),
      status: "posted",
      currency: "INR",
      poId: purchaseOrder.id,
      lines: {
        create: [
          {
            productId: chair.id,
            analyticAccountId: ccOperations.id,
            glAccountId: glCogs.id,
            description: "Wood supply for office chairs",
            qty: 50,
            unitPrice: 2800,
            taxRate: 18,
            lineTotal: 50 * 2800 * 1.18,
          },
        ],
      },
    },
    include: { lines: true },
  });

  const invoice = await prisma.customerInvoice.create({
    data: {
      companyId: company.id,
      invoiceNo: "INV-2026-0142",
      customerId: customer.id,
      invoiceDate: new Date("2026-01-22"),
      dueDate: new Date("2026-02-15"),
      status: "posted",
      currency: "INR",
      lines: {
        create: [
          {
            productId: sofa.id,
            analyticAccountId: ccSales.id,
            glAccountId: glSales.id,
            description: "Living room sofa set",
            qty: 5,
            unitPrice: 28999,
            taxRate: 18,
            lineTotal: 5 * 28999 * 1.18,
          },
        ],
      },
    },
    include: { lines: true },
  });

  const invoiceTotal = invoice.lines.reduce((sum, line) => sum + Number(line.lineTotal), 0);
  await prisma.customerInvoice.update({
    where: { id: invoice.id },
    data: { totalAmount: invoiceTotal, paymentState: "not_paid", paidAmount: 0 },
  });

  const billTotal = vendorBill.lines.reduce((sum, line) => sum + Number(line.lineTotal), 0);
  await prisma.vendorBill.update({
    where: { id: vendorBill.id },
    data: { totalAmount: billTotal, paymentState: "not_paid", paidAmount: 0 },
  });

  const inboundPayment = await prisma.payment.create({
    data: {
      companyId: company.id,
      direction: "inbound",
      contactId: customer.id,
      paymentDate: new Date("2026-01-25"),
      method: "bank",
      reference: "NEFT-INV-142",
      amount: invoiceTotal / 2,
      status: "posted",
    },
  });

  await prisma.paymentAllocation.create({
    data: {
      paymentId: inboundPayment.id,
      targetType: "customer_invoice",
      targetId: invoice.id,
      amount: invoiceTotal / 2,
    },
  });

  await prisma.customerInvoicePayment.create({
    data: {
      invoiceId: invoice.id,
      paymentId: inboundPayment.id,
      amount: invoiceTotal / 2,
    },
  });

  await prisma.customerInvoice.update({
    where: { id: invoice.id },
    data: { paidAmount: invoiceTotal / 2, paymentState: "partially_paid" },
  });

  const outboundPayment = await prisma.payment.create({
    data: {
      companyId: company.id,
      direction: "outbound",
      contactId: vendor.id,
      paymentDate: new Date("2026-01-26"),
      method: "bank",
      reference: "NEFT-BILL-020",
      amount: billTotal,
      status: "posted",
    },
  });

  await prisma.paymentAllocation.create({
    data: {
      paymentId: outboundPayment.id,
      targetType: "vendor_bill",
      targetId: vendorBill.id,
      amount: billTotal,
    },
  });

  await prisma.vendorBillPayment.create({
    data: {
      billId: vendorBill.id,
      paymentId: outboundPayment.id,
      amount: billTotal,
    },
  });

  await prisma.vendorBill.update({
    where: { id: vendorBill.id },
    data: { paidAmount: billTotal, paymentState: "paid" },
  });

  await prisma.journalEntry.create({
    data: {
      companyId: company.id,
      entryDate: new Date("2026-01-28"),
      status: "posted",
      sourceType: "manual",
      memo: "Seeded transaction entry",
      postedAt: new Date("2026-01-28"),
      lines: {
        create: [
          {
            glAccountId: glSales.id,
            analyticAccountId: ccSales.id,
            contactId: customer2.id,
            description: "Revenue recognized",
            debit: 0,
            credit: 125000,
          },
          {
            glAccountId: glBank.id,
            analyticAccountId: ccSales.id,
            contactId: customer2.id,
            description: "Bank receipt",
            debit: 125000,
            credit: 0,
          },
        ],
      },
    },
  });

  console.log("Seed complete", { companyId: company.id });
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
