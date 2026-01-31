import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../dist/generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const main = async () => {
  const company = await prisma.company.create({
    data: { name: "Shiv Furniture" },
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
      name: "Cost of Goods",
      accountType: "expense",
    },
  });

  const category = await prisma.productCategory.create({
    data: {
      companyId: company.id,
      name: "Wooden Furniture",
    },
  });

  const product = await prisma.product.create({
    data: {
      companyId: company.id,
      categoryId: category.id,
      sku: "WF001",
      name: "Sheesham Wood Chair",
      costPrice: 2500,
      salePrice: 4500,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      companyId: company.id,
      categoryId: category.id,
      sku: "WF002",
      name: "Oakwood Study Table",
      costPrice: 8200,
      salePrice: 12500,
    },
  });

  const contact = await prisma.contact.create({
    data: {
      companyId: company.id,
      contactType: "customer",
      displayName: "Rahul Verma",
      email: "rahul.verma@example.in",
    },
  });

  const vendor = await prisma.contact.create({
    data: {
      companyId: company.id,
      contactType: "vendor",
      displayName: "Sharma Timber Suppliers",
      email: "vendor@sharmatimber.in",
    },
  });

  const customer2 = await prisma.contact.create({
    data: {
      companyId: company.id,
      contactType: "customer",
      displayName: "Aarav Enterprises",
      email: "finance@aarav-enterprises.in",
    },
  });

  const analytic = await prisma.analyticAccount.create({
    data: {
      companyId: company.id,
      code: "CC-100",
      name: "Production",
    },
  });

  const analytic2 = await prisma.analyticAccount.create({
    data: {
      companyId: company.id,
      code: "CC-200",
      name: "Retail Expansion",
    },
  });

  await prisma.budget.create({
    data: {
      companyId: company.id,
      name: "FY Budget",
      periodStart: new Date("2025-04-01"),
      periodEnd: new Date("2026-03-31"),
      status: "approved",
      revisions: {
        create: {
          revisionNo: 1,
          lines: {
            create: [{ analyticAccountId: analytic.id, amount: 100000 }],
          },
        },
      },
    },
  });

  const passwordHash = await bcrypt.hash("Admin@123", 10);
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { passwordHash, role: "ADMIN", isActive: true, loginId: "ADMIN1" },
    create: {
      email: "admin@example.com",
      loginId: "ADMIN1",
      passwordHash,
      role: "ADMIN",
    },
  });

  await prisma.user.create({
    data: {
      email: "rahul.verma@example.in",
      loginId: "PORT01",
      passwordHash: await bcrypt.hash("Portal@123", 10),
      role: "PORTAL",
      contactId: contact.id,
      isActive: true,
    },
  });

  await prisma.purchaseOrder.create({
    data: {
      companyId: company.id,
      poNo: "PO-2026-001",
      vendorId: vendor.id,
      orderDate: new Date("2026-01-10"),
      deliveryDate: new Date("2026-02-05"),
      status: "confirmed",
      currency: "INR",
      notes: "Raw materials for Q1 production",
      lines: {
        create: [
          {
            productId: product.id,
            analyticAccountId: analytic.id,
            description: "Sheesham Wood Chair material",
            qty: 10,
            unitPrice: 2400,
            taxRate: 18,
            lineTotal: 10 * 2400 * 1.18,
          },
        ],
      },
    },
  });

  await prisma.customerInvoice.create({
    data: {
      companyId: company.id,
      invoiceNo: "INV-2026-0142",
      customerId: contact.id,
      invoiceDate: new Date("2026-01-22"),
      dueDate: new Date("2026-02-15"),
      status: "posted",
      currency: "INR",
      totalAmount: 5 * 12500 * 1.18,
      paidAmount: 0,
      paymentState: "Not Paid",
      lines: {
        create: [
          {
            productId: product2.id,
            analyticAccountId: analytic2.id,
            glAccountId: glSales.id,
            description: "Study table invoice",
            qty: 5,
            unitPrice: 12500,
            taxRate: 18,
            lineTotal: 5 * 12500 * 1.18,
          },
        ],
      },
    },
  });

  await prisma.journalEntry.create({
    data: {
      companyId: company.id,
      entryDate: new Date("2026-01-25"),
      status: "posted",
      sourceType: "manual",
      memo: "Seeded transaction entry",
      postedAt: new Date("2026-01-25"),
      lines: {
        create: [
          {
            glAccountId: glSales.id,
            analyticAccountId: analytic.id,
            contactId: customer2.id,
            description: "Revenue recognized",
            debit: 0,
            credit: 125000,
          },
          {
            glAccountId: glCogs.id,
            analyticAccountId: analytic.id,
            contactId: customer2.id,
            description: "Cash received",
            debit: 125000,
            credit: 0,
          },
        ],
      },
    },
  });

  console.log("Seed complete", { companyId: company.id, contactId: contact.id });
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
