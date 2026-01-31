import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "./generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  try {
    // Create Company
    const company = await prisma.company.create({
      data: {
        name: "Shiv Furniture",
      },
    });

    console.log("✅ Created company:", company.name);

    // Create GL Accounts
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

    console.log("✅ Created GL Accounts");

    // Create Product Category
    const category = await prisma.productCategory.create({
      data: {
        companyId: company.id,
        name: "Wooden Furniture",
      },
    });

    const category2 = await prisma.productCategory.create({
      data: {
        companyId: company.id,
        name: "Metal Fixtures",
      },
    });

    console.log("✅ Created category:", category.name);

    // Create Product
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

    const product3 = await prisma.product.create({
      data: {
        companyId: company.id,
        categoryId: category2.id,
        sku: "MF001",
        name: "Steel Drawer Handle",
        costPrice: 120,
        salePrice: 250,
      },
    });

    console.log("✅ Created product:", product.name);

    // Create Contact (Vendor)
    const vendor = await prisma.contact.create({
      data: {
        companyId: company.id,
        contactType: "vendor",
        displayName: "Sharma Timber Suppliers",
        email: "vendor@sharmatimber.in",
      },
    });

    const vendor2 = await prisma.contact.create({
      data: {
        companyId: company.id,
        contactType: "vendor",
        displayName: "Modern Hardware Co.",
        email: "accounts@modernhardware.in",
      },
    });

    const vendor3 = await prisma.contact.create({
      data: {
        companyId: company.id,
        contactType: "vendor",
        displayName: "Urban Logistics",
        email: "billing@urbanlogistics.in",
      },
    });

    console.log("✅ Created vendor:", vendor.displayName);

    // Create Contact (Customer)
    const customer = await prisma.contact.create({
      data: {
        companyId: company.id,
        contactType: "customer",
        displayName: "Rahul Verma",
        email: "rahul.verma@example.in",
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

    const customer3 = await prisma.contact.create({
      data: {
        companyId: company.id,
        contactType: "customer",
        displayName: "BlueLine Interiors",
        email: "payables@bluelineinteriors.in",
      },
    });

    console.log("✅ Created customer:", customer.displayName);

    // Create Analytic Account
    const analytic = await prisma.analyticAccount.create({
      data: {
        companyId: company.id,
        code: "AA001",
        name: "Department A",
      },
    });

    const analytic2 = await prisma.analyticAccount.create({
      data: {
        companyId: company.id,
        code: "AA002",
        name: "Retail Expansion",
      },
    });

    const analytic3 = await prisma.analyticAccount.create({
      data: {
        companyId: company.id,
        code: "AA003",
        name: "Logistics",
      },
    });

    console.log("✅ Created analytic account:", analytic.name);

    // Create Budget + Revision
    await prisma.budget.create({
      data: {
        companyId: company.id,
        name: "FY 2025-26 Budget",
        periodStart: new Date("2025-04-01"),
        periodEnd: new Date("2026-03-31"),
        status: "approved",
        totalBudgeted: 500000,
        totalActual: 265000,
        totalRemaining: 235000,
        totalForecast: 520000,
        utilizationPct: 53,
        revisions: {
          create: {
            revisionNo: 1,
            revisionReason: "Initial annual allocation",
            lines: {
              create: [{ analyticAccountId: analytic.id, amount: 500000 }],
            },
          },
        },
      },
    });

    // Create Users
    const adminPassword = await bcrypt.hash("Admin@123", 10);
    const portalPassword = await bcrypt.hash("Portal@123", 10);

    await prisma.user.create({
      data: {
        email: "admin@example.com",
        loginId: "ADMIN1",
        passwordHash: adminPassword,
        role: "ADMIN",
        isActive: true,
      },
    });

    await prisma.user.create({
      data: {
        email: "rahul.verma@example.in",
        loginId: "PORT01",
        passwordHash: portalPassword,
        role: "PORTAL",
        contactId: customer.id,
        isActive: true,
      },
    });

    // Create Purchase Order
    const po = await prisma.purchaseOrder.create({
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

    // Create Vendor Bill
    const billTotal = 10 * 2400 * 1.18;
    const vendorBill = await prisma.vendorBill.create({
      data: {
        companyId: company.id,
        billNo: "VB-2026-001",
        vendorId: vendor.id,
        billDate: new Date("2026-01-15"),
        dueDate: new Date("2026-02-05"),
        status: "posted",
        currency: "INR",
        poId: po.id,
        totalAmount: billTotal,
        paidAmount: billTotal,
        paymentState: "Paid",
        lines: {
          create: [
            {
              productId: product.id,
              analyticAccountId: analytic.id,
              glAccountId: glCogs.id,
              description: "Raw material bill",
              qty: 10,
              unitPrice: 2400,
              taxRate: 18,
              lineTotal: billTotal,
            },
          ],
        },
      },
    });

    // Create Sales Order
    const so = await prisma.salesOrder.create({
      data: {
        companyId: company.id,
        soNo: "SO-2026-001",
        customerId: customer.id,
        orderDate: new Date("2026-01-20"),
        deliveryDate: new Date("2026-02-10"),
        status: "confirmed",
        currency: "INR",
        notes: "Bulk order for showroom",
        lines: {
          create: [
            {
              productId: product2.id,
              analyticAccountId: analytic.id,
              description: "Oakwood Study Table",
              qty: 5,
              unitPrice: 12500,
              taxRate: 18,
              lineTotal: 5 * 12500 * 1.18,
            },
          ],
        },
      },
    });

    // Create Customer Invoice
    const invoiceTotal = 5 * 12500 * 1.18;
    const invoice = await prisma.customerInvoice.create({
      data: {
        companyId: company.id,
        invoiceNo: "INV-2026-0142",
        customerId: customer.id,
        invoiceDate: new Date("2026-01-22"),
        dueDate: new Date("2026-02-15"),
        status: "posted",
        currency: "INR",
        soId: so.id,
        totalAmount: invoiceTotal,
        paidAmount: invoiceTotal,
        paymentState: "Paid",
        lines: {
          create: [
            {
              productId: product2.id,
              analyticAccountId: analytic.id,
              glAccountId: glSales.id,
              description: "Study table invoice",
              qty: 5,
              unitPrice: 12500,
              taxRate: 18,
              lineTotal: invoiceTotal,
            },
          ],
        },
      },
    });

    // Create Payment
    const payment = await prisma.payment.create({
      data: {
        companyId: company.id,
        direction: "inbound",
        contactId: customer.id,
        paymentDate: new Date("2026-01-25"),
        method: "bank",
        reference: "INV-2026-0142 Payment",
        amount: invoiceTotal,
        status: "posted",
        allocations: {
          create: [
            {
              targetType: "customer_invoice",
              targetId: invoice.id,
              amount: invoiceTotal,
            },
          ],
        },
      },
    });

    // Create Journal Entry (Transaction)
    await prisma.journalEntry.create({
      data: {
        companyId: company.id,
        entryDate: new Date("2026-01-25"),
        status: "posted",
        sourceType: "payment",
        sourceId: payment.id,
        memo: "Payment received for INV-2026-0142",
        postedAt: new Date("2026-01-25"),
        lines: {
          create: [
            {
              glAccountId: glSales.id,
              analyticAccountId: analytic.id,
              contactId: customer.id,
              description: "Revenue posted",
              debit: 0,
              credit: invoiceTotal,
            },
            {
              glAccountId: glCogs.id,
              analyticAccountId: analytic.id,
              contactId: customer.id,
              description: "Cash received",
              debit: invoiceTotal,
              credit: 0,
            },
          ],
        },
      },
    });

    await prisma.journalEntry.create({
      data: {
        companyId: company.id,
        entryDate: new Date("2026-01-28"),
        status: "posted",
        sourceType: "manual",
        memo: "Logistics expense allocation",
        postedAt: new Date("2026-01-28"),
        lines: {
          create: [
            {
              glAccountId: glCogs.id,
              analyticAccountId: analytic3.id,
              contactId: vendor3.id,
              description: "Freight charges",
              debit: 18500,
              credit: 0,
            },
            {
              glAccountId: glSales.id,
              analyticAccountId: analytic3.id,
              contactId: vendor3.id,
              description: "Cash outflow",
              debit: 0,
              credit: 18500,
            },
          ],
        },
      },
    });

    // Additional Vendor Bill for variety
    await prisma.vendorBill.create({
      data: {
        companyId: company.id,
        billNo: "VB-2026-002",
        vendorId: vendor2.id,
        billDate: new Date("2026-01-26"),
        dueDate: new Date("2026-02-20"),
        status: "draft",
        currency: "INR",
        totalAmount: 8500,
        paidAmount: 0,
        paymentState: "Not Paid",
        lines: {
          create: [
            {
              productId: product3.id,
              analyticAccountId: analytic2.id,
              glAccountId: glCogs.id,
              description: "Hardware accessories",
              qty: 2,
              unitPrice: 3600,
              taxRate: 18,
              lineTotal: 2 * 3600 * 1.18,
            },
          ],
        },
      },
    });

    // Extra customer invoice for variety
    await prisma.customerInvoice.create({
      data: {
        companyId: company.id,
        invoiceNo: "INV-2026-0143",
        customerId: customer3.id,
        invoiceDate: new Date("2026-01-29"),
        dueDate: new Date("2026-02-18"),
        status: "draft",
        currency: "INR",
        totalAmount: 15000,
        paidAmount: 0,
        paymentState: "Not Paid",
        lines: {
          create: [
            {
              productId: product.id,
              analyticAccountId: analytic2.id,
              glAccountId: glSales.id,
              description: "Prototype order",
              qty: 3,
              unitPrice: 4500,
              taxRate: 12,
              lineTotal: 3 * 4500 * 1.12,
            },
          ],
        },
      },
    });
    
  // 1. Create Categories and capture their IDs
  const woodenCategory = await prisma.productCategory.create({
    data: { companyId: company.id, name: 'Wooden Furniture' }
  });
  const woodenCatId = woodenCategory.id;

  const officeCategory = await prisma.productCategory.create({
    data: { companyId: company.id, name: 'Office Furniture' }
  });
  const officeCatId = officeCategory.id;

  // 2. Create Products and capture IDs
  const chairProduct = await prisma.product.create({
    data: {
      companyId: company.id,
      categoryId: woodenCatId,
      name: 'Sheesham Wood Chair',
      sku: 'WF001'
    }
  });
  const chairProdId = chairProduct.id;

  // 3. Create Contacts and Tags
  const expoContact = await prisma.contact.create({
    data: { companyId: company.id, displayName: 'Furniture Expo 2027', contactType: 'vendor' }
  });
  const expoContactId = expoContact.id;

  const socialTag = await prisma.contactTag.create({
    data: { companyId: company.id, name: 'Social Media Lead' }
  });
  const socialTagId = socialTag.id;

  // 4. Create all Analytic Accounts using your specific UUIDs
  const accountsData = [
    { id: 'c304b575-8044-4c82-8462-0fea93570c00', name: 'Manufacturing', code: 'CC-100' },
    { id: 'b16e2e58-7fc1-4aad-99aa-2e3dda3cb836', name: 'Sales', code: 'CC-200' },
    { id: 'a9845e81-b97d-4ee4-8df2-966c7d535aeb', name: 'Admin', code: 'CC-300' },
    { id: '8b9113dc-7356-43af-bed9-ce2b752e70f4', name: 'Operations', code: 'CC-400' },
    { id: '17c320fa-ac50-4d5a-91a5-e80d07aa20c2', name: 'Capital', code: 'CC-500' },
    { id: '48de9859-a745-40cb-b8c3-6623a90bb322', name: 'Furniture Expo 2027', code: 'CSR-231' },
    { id: '1b1b9207-b95f-47c0-8045-3154ef9224e4', name: 'Marketing', code: 'CR-231' },
    { id: '7867a3d1-8496-48c5-9f0d-15762aa93505', name: 'Social Media', code: 'CS123' },
    { id: 'd980f93d-9ff2-41dd-91b8-08e7c22f9726', name: 'Summer Sale', code: '001' },
  ];

  for (const acc of accountsData) {
    await prisma.analyticAccount.upsert({
      where: { companyId_name: { companyId: company.id, name: acc.name } },
      update: {},
      create: { ...acc, companyId: company.id },
    });
  }

  // 5. Create the Analytical Model and Rules
  await prisma.autoAnalyticModel.create({
    data: {
      companyId: company.id,
      name: 'Main Business Logic',
      isActive: true,
      rules: {
        create: [
          // Mapping rules using the variables defined above
          { docType: 'vendor_bill', matchCategoryId: woodenCatId, assignAnalyticAccountId: 'c304b575-8044-4c82-8462-0fea93570c00', rulePriority: 1 },
          { docType: 'vendor_bill', matchCategoryId: officeCatId, assignAnalyticAccountId: 'a9845e81-b97d-4ee4-8df2-966c7d535aeb', rulePriority: 2 },
          { docType: 'customer_invoice', matchProductId: chairProdId, assignAnalyticAccountId: 'b16e2e58-7fc1-4aad-99aa-2e3dda3cb836', rulePriority: 1 },
          { docType: 'customer_invoice', matchContactId: expoContactId, assignAnalyticAccountId: '48de9859-a745-40cb-b8c3-6623a90bb322', rulePriority: 2 },
          { docType: 'customer_invoice', matchContactTagId: socialTagId, assignAnalyticAccountId: '7867a3d1-8496-48c5-9f0d-15762aa93505', rulePriority: 3 },
        ]
      }
    }
  });

    console.log("\n✅ All data seeded successfully!");
  } catch (e) {
    console.error("❌ Error:", (e as Error).message);
    throw e;
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });