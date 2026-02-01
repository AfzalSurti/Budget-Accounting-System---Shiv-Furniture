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

    console.log("✅ Created company:", company.name); // Create GL Accounts

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

    console.log("✅ Created GL Accounts"); // Create Product Category

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

    console.log("✅ Created category:", category.name); // Create Product

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

    console.log("✅ Created product:", product.name); // Create Contact (Vendor)

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

    console.log("✅ Created vendor:", vendor.displayName); // Create Contact (Customer)

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

    console.log("✅ Created customer:", customer.displayName); // Create Analytic Account

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

    console.log("✅ Created analytic account:", analytic.name); // Create Budget + Revision

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
    }); // Create Users

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
    }); // Create Purchase Order

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
    }); // Create Vendor Bill

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
    }); // Create Sales Order

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
    }); // Create Customer Invoice

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
    }); // Create Payment

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
    }); // Create Journal Entry (Transaction)

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
    }); // Additional Vendor Bill for variety

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
    }); // Extra customer invoice for variety

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

    // ==================== AUTO-ANALYTIC RULES SEED ====================
    console.log("\n" + "=".repeat(60));
    console.log("🔄 SEEDING AUTO-ANALYTIC CONFIGURATION");
    console.log("=".repeat(60));

    // 1. Create Diverse Product Categories
    console.log("\n📦 Creating Product Categories...");
    const furnitureCategory = await prisma.productCategory.create({
      data: { companyId: company.id, name: "Living Room Furniture" },
    });
    console.log(`   ✓ Living Room Furniture (ID: ${furnitureCategory.id})`);

    const officeCategory = await prisma.productCategory.create({
      data: { companyId: company.id, name: "Office Furniture" },
    });
    console.log(`   ✓ Office Furniture (ID: ${officeCategory.id})`);

    const outdoorCategory = await prisma.productCategory.create({
      data: { companyId: company.id, name: "Outdoor & Garden" },
    });
    console.log(`   ✓ Outdoor & Garden (ID: ${outdoorCategory.id})`);

    const accessoriesCategory = await prisma.productCategory.create({
      data: { companyId: company.id, name: "Accessories & Hardware" },
    });
    console.log(`   ✓ Accessories & Hardware (ID: ${accessoriesCategory.id})`);
    console.log("✅ Created 4 product categories");

    // 2. Create Contact Tags
    console.log("\n🏷️  Creating Contact Tags...");
    const premiumTag = await prisma.contactTag.create({
      data: { companyId: company.id, name: "Premium Client" },
    });
    console.log(`   ✓ Premium Client (ID: ${premiumTag.id})`);

    const corporateTag = await prisma.contactTag.create({
      data: { companyId: company.id, name: "Corporate" },
    });
    console.log(`   ✓ Corporate (ID: ${corporateTag.id})`);

    const wholesaleTag = await prisma.contactTag.create({
      data: { companyId: company.id, name: "Wholesale" },
    });
    console.log(`   ✓ Wholesale (ID: ${wholesaleTag.id})`);

    const eventTag = await prisma.contactTag.create({
      data: { companyId: company.id, name: "Event Sponsor" },
    });
    console.log(`   ✓ Event Sponsor (ID: ${eventTag.id})`);
    console.log("✅ Created 4 contact tags");

    // 3. Create Special Contacts
    console.log("\n👥 Creating Special Contacts with Tags...");
    const premiumVendor = await prisma.contact.create({
      data: {
        companyId: company.id,
        displayName: "Premium Wood Importers",
        contactType: "vendor",
        email: "orders@premiumwood.com",
        contactTags: {
          create: [{ tagId: premiumTag.id }],
        },
      },
    });
    console.log(
      `   ✓ Premium Wood Importers [VENDOR] → Tagged: Premium Client`,
    );

    const corporateCustomer = await prisma.contact.create({
      data: {
        companyId: company.id,
        displayName: "TechCorp Solutions",
        contactType: "customer",
        email: "procurement@techcorp.com",
        contactTags: {
          create: [{ tagId: corporateTag.id }],
        },
      },
    });
    console.log(`   ✓ TechCorp Solutions [CUSTOMER] → Tagged: Corporate`);

    const wholesaleCustomer = await prisma.contact.create({
      data: {
        companyId: company.id,
        displayName: "Wholesale Furniture Hub",
        contactType: "customer",
        email: "orders@wholesalehub.com",
        contactTags: {
          create: [{ tagId: wholesaleTag.id }],
        },
      },
    });
    console.log(`   ✓ Wholesale Furniture Hub [CUSTOMER] → Tagged: Wholesale`);

    const eventVendor = await prisma.contact.create({
      data: {
        companyId: company.id,
        displayName: "Grand Exhibition Co.",
        contactType: "vendor",
        email: "info@grandexhibition.com",
        contactTags: {
          create: [{ tagId: eventTag.id }],
        },
      },
    });
    console.log(`   ✓ Grand Exhibition Co. [VENDOR] → Tagged: Event Sponsor`);
    console.log("✅ Created 4 special contacts with tags");

    // 4. Create Diverse Products
    console.log("\n📦 Creating Products...");
    const sofaProduct = await prisma.product.create({
      data: {
        companyId: company.id,
        categoryId: furnitureCategory.id,
        name: "Sheesham 3-Seater Sofa",
        sku: "LRF-001",
        costPrice: 15000,
        salePrice: 28000,
      },
    });
    console.log(
      `   ✓ Sheesham 3-Seater Sofa [LRF-001] → Living Room Furniture | Cost: ₹15,000 | Sale: ₹28,000`,
    );

    const deskProduct = await prisma.product.create({
      data: {
        companyId: company.id,
        categoryId: officeCategory.id,
        name: "Teak Executive Desk",
        sku: "OFF-001",
        costPrice: 12000,
        salePrice: 22000,
      },
    });
    console.log(
      `   ✓ Teak Executive Desk [OFF-001] → Office Furniture | Cost: ₹12,000 | Sale: ₹22,000`,
    );

    const chairOfficeProduct = await prisma.product.create({
      data: {
        companyId: company.id,
        categoryId: officeCategory.id,
        name: "Ergo Study Chair",
        sku: "OFF-002",
        costPrice: 3500,
        salePrice: 6500,
      },
    });
    console.log(
      `   ✓ Ergo Study Chair [OFF-002] → Office Furniture | Cost: ₹3,500 | Sale: ₹6,500`,
    );

    const benchProduct = await prisma.product.create({
      data: {
        companyId: company.id,
        categoryId: outdoorCategory.id,
        name: "Garden Teak Bench",
        sku: "OUT-001",
        costPrice: 5000,
        salePrice: 9500,
      },
    });
    console.log(
      `   ✓ Garden Teak Bench [OUT-001] → Outdoor & Garden | Cost: ₹5,000 | Sale: ₹9,500`,
    );

    const hingeProduct = await prisma.product.create({
      data: {
        companyId: company.id,
        categoryId: accessoriesCategory.id,
        name: "Brass Cabinet Hinge",
        sku: "ACC-001",
        costPrice: 150,
        salePrice: 300,
      },
    });
    console.log(
      `   ✓ Brass Cabinet Hinge [ACC-001] → Accessories & Hardware | Cost: ₹150 | Sale: ₹300`,
    );

    const tableProduct = await prisma.product.create({
      data: {
        companyId: company.id,
        categoryId: furnitureCategory.id,
        name: "Marble Coffee Table",
        sku: "LRF-002",
        costPrice: 8000,
        salePrice: 15000,
      },
    });
    console.log(
      `   ✓ Marble Coffee Table [LRF-002] → Living Room Furniture | Cost: ₹8,000 | Sale: ₹15,000`,
    );
    console.log("✅ Created 6 products");

    // 5. Create Analytic Accounts (Cost Centers)
    console.log("\n💼 Creating Analytic Accounts (Cost Centers)...");
    const manufacturingCC = await prisma.analyticAccount.create({
      data: {
        companyId: company.id,
        code: "CC-100",
        name: "Manufacturing",
      },
    });
    console.log(`   ✓ [CC-100] Manufacturing (ID: ${manufacturingCC.id})`);

    const salesCC = await prisma.analyticAccount.create({
      data: {
        companyId: company.id,
        code: "CC-200",
        name: "Sales & Marketing",
      },
    });
    console.log(`   ✓ [CC-200] Sales & Marketing (ID: ${salesCC.id})`);

    const adminCC = await prisma.analyticAccount.create({
      data: {
        companyId: company.id,
        code: "CC-300",
        name: "Administration",
      },
    });
    console.log(`   ✓ [CC-300] Administration (ID: ${adminCC.id})`);

    const operationsCC = await prisma.analyticAccount.create({
      data: {
        companyId: company.id,
        code: "CC-400",
        name: "Operations",
      },
    });
    console.log(`   ✓ [CC-400] Operations (ID: ${operationsCC.id})`);

    const corporateSalesCC = await prisma.analyticAccount.create({
      data: {
        companyId: company.id,
        code: "CC-210",
        name: "Corporate Sales",
      },
    });
    console.log(`   ✓ [CC-210] Corporate Sales (ID: ${corporateSalesCC.id})`);

    const retailSalesCC = await prisma.analyticAccount.create({
      data: {
        companyId: company.id,
        code: "CC-220",
        name: "Retail Sales",
      },
    });
    console.log(`   ✓ [CC-220] Retail Sales (ID: ${retailSalesCC.id})`);

    const eventsCC = await prisma.analyticAccount.create({
      data: {
        companyId: company.id,
        code: "CC-600",
        name: "Events & Sponsorships",
      },
    });
    console.log(`   ✓ [CC-600] Events & Sponsorships (ID: ${eventsCC.id})`);

    const rndCC = await prisma.analyticAccount.create({
      data: {
        companyId: company.id,
        code: "CC-500",
        name: "R&D",
      },
    });
    console.log(`   ✓ [CC-500] R&D (ID: ${rndCC.id})`);
    console.log("✅ Created 8 analytic accounts (cost centers)");

    // 6. Create Auto-Analytic Model with Comprehensive Rules
    await prisma.autoAnalyticModel.create({
      data: {
        companyId: company.id,
        name: "Comprehensive Business Rules",
        isActive: true,
        rules: {
          create: [
            // ========== VENDOR BILL / PURCHASE ORDER RULES ==========
            // Rule 1: Living Room furniture → Manufacturing
            {
              docType: "vendor_bill",
              matchCategoryId: furnitureCategory.id,
              assignAnalyticAccountId: manufacturingCC.id,
              rulePriority: 10,
            },
            {
              docType: "purchase_order",
              matchCategoryId: furnitureCategory.id,
              assignAnalyticAccountId: manufacturingCC.id,
              rulePriority: 10,
            },

            // Rule 2: Office furniture → Administration
            {
              docType: "vendor_bill",
              matchCategoryId: officeCategory.id,
              assignAnalyticAccountId: adminCC.id,
              rulePriority: 20,
            },
            {
              docType: "purchase_order",
              matchCategoryId: officeCategory.id,
              assignAnalyticAccountId: adminCC.id,
              rulePriority: 20,
            },

            // Rule 3: Outdoor furniture → Operations
            {
              docType: "vendor_bill",
              matchCategoryId: outdoorCategory.id,
              assignAnalyticAccountId: operationsCC.id,
              rulePriority: 30,
            },
            {
              docType: "purchase_order",
              matchCategoryId: outdoorCategory.id,
              assignAnalyticAccountId: operationsCC.id,
              rulePriority: 30,
            },

            // Rule 4: Accessories → Operations
            {
              docType: "vendor_bill",
              matchCategoryId: accessoriesCategory.id,
              assignAnalyticAccountId: operationsCC.id,
              rulePriority: 40,
            },
            {
              docType: "purchase_order",
              matchCategoryId: accessoriesCategory.id,
              assignAnalyticAccountId: operationsCC.id,
              rulePriority: 40,
            },

            // Rule 5: Premium vendors → R&D (highest priority for specific vendor)
            {
              docType: "vendor_bill",
              matchContactId: premiumVendor.id,
              assignAnalyticAccountId: rndCC.id,
              rulePriority: 5,
            },
            {
              docType: "purchase_order",
              matchContactId: premiumVendor.id,
              assignAnalyticAccountId: rndCC.id,
              rulePriority: 5,
            },

            // Rule 6: Event vendors → Events & Sponsorships
            {
              docType: "vendor_bill",
              matchContactId: eventVendor.id,
              assignAnalyticAccountId: eventsCC.id,
              rulePriority: 15,
            },
            {
              docType: "purchase_order",
              matchContactId: eventVendor.id,
              assignAnalyticAccountId: eventsCC.id,
              rulePriority: 15,
            },

            // ========== CUSTOMER INVOICE / SALES ORDER RULES ==========
            // Rule 7: Specific sofa product → Sales & Marketing
            {
              docType: "customer_invoice",
              matchProductId: sofaProduct.id,
              assignAnalyticAccountId: salesCC.id,
              rulePriority: 10,
            },
            {
              docType: "sales_order",
              matchProductId: sofaProduct.id,
              assignAnalyticAccountId: salesCC.id,
              rulePriority: 10,
            },

            // Rule 8: Office desk → Corporate Sales
            {
              docType: "customer_invoice",
              matchProductId: deskProduct.id,
              assignAnalyticAccountId: corporateSalesCC.id,
              rulePriority: 20,
            },
            {
              docType: "sales_order",
              matchProductId: deskProduct.id,
              assignAnalyticAccountId: corporateSalesCC.id,
              rulePriority: 20,
            },

            // Rule 9: Corporate customers → Corporate Sales (higher priority)
            {
              docType: "customer_invoice",
              matchContactId: corporateCustomer.id,
              assignAnalyticAccountId: corporateSalesCC.id,
              rulePriority: 5,
            },
            {
              docType: "sales_order",
              matchContactId: corporateCustomer.id,
              assignAnalyticAccountId: corporateSalesCC.id,
              rulePriority: 5,
            },

            // Rule 10: Wholesale customers → Retail Sales
            {
              docType: "customer_invoice",
              matchContactId: wholesaleCustomer.id,
              assignAnalyticAccountId: retailSalesCC.id,
              rulePriority: 15,
            },
            {
              docType: "sales_order",
              matchContactId: wholesaleCustomer.id,
              assignAnalyticAccountId: retailSalesCC.id,
              rulePriority: 15,
            },

            // Rule 11: Corporate tag → Corporate Sales
            {
              docType: "customer_invoice",
              matchContactTagId: corporateTag.id,
              assignAnalyticAccountId: corporateSalesCC.id,
              rulePriority: 25,
            },
            {
              docType: "sales_order",
              matchContactTagId: corporateTag.id,
              assignAnalyticAccountId: corporateSalesCC.id,
              rulePriority: 25,
            },

            // Rule 12: Wholesale tag → Retail Sales
            {
              docType: "customer_invoice",
              matchContactTagId: wholesaleTag.id,
              assignAnalyticAccountId: retailSalesCC.id,
              rulePriority: 30,
            },
            {
              docType: "sales_order",
              matchContactTagId: wholesaleTag.id,
              assignAnalyticAccountId: retailSalesCC.id,
              rulePriority: 30,
            },

            // Rule 13: Premium tag → Sales & Marketing
            {
              docType: "customer_invoice",
              matchContactTagId: premiumTag.id,
              assignAnalyticAccountId: salesCC.id,
              rulePriority: 35,
            },
            {
              docType: "sales_order",
              matchContactTagId: premiumTag.id,
              assignAnalyticAccountId: salesCC.id,
              rulePriority: 35,
            },

            // Rule 14: Outdoor category sales → Operations
            {
              docType: "customer_invoice",
              matchCategoryId: outdoorCategory.id,
              assignAnalyticAccountId: operationsCC.id,
              rulePriority: 40,
            },
            {
              docType: "sales_order",
              matchCategoryId: outdoorCategory.id,
              assignAnalyticAccountId: operationsCC.id,
              rulePriority: 40,
            },
          ],
        },
      },
    });

    console.log(
      "\n🎯 Creating Auto-Analytic Model with Comprehensive Rules...",
    );
    console.log("   ✓ Model: 'Comprehensive Business Rules' (Active)");
    console.log("   ✓ Created 28 rules covering:");
    console.log("      • 12 Vendor Bill / Purchase Order rules");
    console.log("      • 16 Customer Invoice / Sales Order rules");
    console.log("\n📊 Rule Summary by Match Type:");
    console.log("   • Category-based: 8 rules");
    console.log("   • Product-specific: 4 rules");
    console.log("   • Contact-specific: 8 rules");
    console.log("   • Tag-based: 8 rules");
    console.log("\n🎚️  Priority Distribution:");
    console.log(
      "   • Priority 5 (Highest): Specific contacts → R&D, Corporate Sales",
    );
    console.log(
      "   • Priority 10-20: Products & categories → Various cost centers",
    );
    console.log("   • Priority 25-35: Tags → Corporate, Retail, Sales");
    console.log("   • Priority 40 (Lowest): Fallback categories → Operations");
    console.log("✅ Auto-Analytic model created successfully!");

    console.log("\n" + "=".repeat(60));
    console.log("🎉 SEED COMPLETE - SUMMARY");
    console.log("=".repeat(60));
    console.log("📦 Product Categories: 4");
    console.log("🏷️  Contact Tags: 4");
    console.log("👥 Special Contacts: 4 (with tags)");
    console.log("📦 Products: 6 (across all categories)");
    console.log("💼 Cost Centers: 8 (analytic accounts)");
    console.log("🎯 Auto-Analytic Rules: 28 (comprehensive coverage)");
    console.log("=".repeat(60));
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
