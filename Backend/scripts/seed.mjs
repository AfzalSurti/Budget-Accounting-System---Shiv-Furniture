import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../dist/generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const COMPANY_ID = process.env.SEED_COMPANY_ID || "00000000-0000-0000-0000-000000000001";

const main = async () => {
  console.log("\n" + "=".repeat(70));
  console.log("🚀 STARTING SEED PROCESS - Shiv Furniture Budget & Accounting System");
  console.log("=".repeat(70));

  console.log("\n🏢 Setting up Company...");
  const company = await prisma.company.upsert({
    where: { id: COMPANY_ID },
    update: { name: "Shiv Furniture" },
    create: { id: COMPANY_ID, name: "Shiv Furniture" },
  });
  console.log(`✓ Company: ${company.name} (ID: ${company.id})`);

  console.log(`✓ Company: ${company.name} (ID: ${company.id})`);

  console.log("\n🗑️  Cleaning existing data...");
  console.log("   • Deleting payment allocations...");
  await prisma.paymentAllocation.deleteMany({ where: { payment: { companyId: company.id } } });
  await prisma.customerInvoicePayment.deleteMany({ where: { payment: { companyId: company.id } } });
  await prisma.vendorBillPayment.deleteMany({ where: { payment: { companyId: company.id } } });
  await prisma.payment.deleteMany({ where: { companyId: company.id } });
  console.log("   ✓ Payments cleared");

  console.log("   • Deleting invoices and bills...");
  await prisma.customerInvoiceLine.deleteMany({ where: { invoice: { companyId: company.id } } });
  await prisma.customerInvoice.deleteMany({ where: { companyId: company.id } });

  await prisma.vendorBillLine.deleteMany({ where: { bill: { companyId: company.id } } });
  await prisma.vendorBill.deleteMany({ where: { companyId: company.id } });
  console.log("   ✓ Invoices and bills cleared");

  console.log("   • Deleting orders...");
  await prisma.salesOrderLine.deleteMany({ where: { salesOrder: { companyId: company.id } } });
  await prisma.salesOrder.deleteMany({ where: { companyId: company.id } });

  await prisma.purchaseOrderLine.deleteMany({ where: { purchaseOrder: { companyId: company.id } } });
  await prisma.purchaseOrder.deleteMany({ where: { companyId: company.id } });
  console.log("   ✓ Orders cleared");

  console.log("   • Deleting budgets and journal entries...");
  await prisma.budgetLine.deleteMany({ where: { revision: { budget: { companyId: company.id } } } });
  await prisma.budgetRevision.deleteMany({ where: { budget: { companyId: company.id } } });
  await prisma.budget.deleteMany({ where: { companyId: company.id } });

  await prisma.journalLine.deleteMany({ where: { entry: { companyId: company.id } } });
  await prisma.journalEntry.deleteMany({ where: { companyId: company.id } });
  console.log("   ✓ Budgets and journals cleared");

  console.log("   • Deleting auto-analytic rules...");
  await prisma.autoAnalyticRule.deleteMany({ where: { model: { companyId: company.id } } });
  await prisma.autoAnalyticModel.deleteMany({ where: { companyId: company.id } });
  console.log("   ✓ Auto-analytic rules cleared");

  console.log("   • Deleting products, categories, and contacts...");
  await prisma.product.deleteMany({ where: { companyId: company.id } });
  await prisma.productCategory.deleteMany({ where: { companyId: company.id } });

  await prisma.contactTagAssignment.deleteMany({ where: { contact: { companyId: company.id } } });
  await prisma.contactTag.deleteMany({ where: { companyId: company.id } });

  await prisma.contact.deleteMany({ where: { companyId: company.id } });
  await prisma.analyticAccount.deleteMany({ where: { companyId: company.id } });
  await prisma.gLAccount.deleteMany({ where: { companyId: company.id } });
  console.log("   ✓ Products, categories, and contacts cleared");

  console.log("   • Deleting users...");
  await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { in: ["admin@shivfurniture.in", "portal@shivfurniture.in"] } },
        { loginId: { in: ["ADMIN1", "PORT01"] } },
      ],
    },
  });
  console.log("   ✓ Users cleared");
  console.log("✅ Database cleaned successfully\n");

  console.log("💼 Creating GL Accounts...");
  const glSales = await prisma.gLAccount.create({
    data: {
      companyId: company.id,
      code: "ACC001",
      name: "Sales Revenue",
      accountType: "income",
    },
  });
  console.log(`   ✓ [ACC001] Sales Revenue (Income) - ID: ${glSales.id}`);

  const glCogs = await prisma.gLAccount.create({
    data: {
      companyId: company.id,
      code: "ACC002",
      name: "Cost of Goods Sold",
      accountType: "expense",
    },
  });
  console.log(`   ✓ [ACC002] Cost of Goods Sold (Expense) - ID: ${glCogs.id}`);

  const glBank = await prisma.gLAccount.create({
    data: {
      companyId: company.id,
      code: "ACC003",
      name: "Bank",
      accountType: "asset",
    },
  });
  console.log(`   ✓ [ACC003] Bank (Asset) - ID: ${glBank.id}`);
  console.log("✅ Created 3 GL accounts\n");

  console.log("🎯 Creating Cost Centers (Analytic Accounts)...");
  const ccManufacturing = await prisma.analyticAccount.create({
    data: { companyId: company.id, code: "CC-100", name: "Manufacturing" },
  });
  console.log(`   ✓ [CC-100] Manufacturing - ID: ${ccManufacturing.id}`);
  const ccSales = await prisma.analyticAccount.create({
    data: { companyId: company.id, code: "CC-200", name: "Sales" },
  });
  console.log(`   ✓ [CC-200] Sales - ID: ${ccSales.id}`);
  const ccAdmin = await prisma.analyticAccount.create({
    data: { companyId: company.id, code: "CC-300", name: "Admin" },
  });
  console.log(`   ✓ [CC-300] Admin - ID: ${ccAdmin.id}`);
  const ccOperations = await prisma.analyticAccount.create({
    data: { companyId: company.id, code: "CC-400", name: "Operations", parentId: ccManufacturing.id },
  });
  console.log(`   ✓ [CC-400] Operations (under Manufacturing) - ID: ${ccOperations.id}`);
  const ccCapital = await prisma.analyticAccount.create({
    data: { companyId: company.id, code: "CC-500", name: "Capital" },
  });
  console.log(`   ✓ [CC-500] Capital - ID: ${ccCapital.id}`);
  console.log("✅ Created 5 cost centers\n");

  console.log("🏷️  Creating Contact Tags...");
  const tagRetail = await prisma.contactTag.create({
    data: { companyId: company.id, name: "Retail" },
  });
  console.log(`   ✓ Retail - ID: ${tagRetail.id}`);
  const tagWholesale = await prisma.contactTag.create({
    data: { companyId: company.id, name: "Wholesale" },
  });
  console.log(`   ✓ Wholesale - ID: ${tagWholesale.id}`);
  const tagTimber = await prisma.contactTag.create({
    data: { companyId: company.id, name: "Timber" },
  });
  console.log(`   ✓ Timber - ID: ${tagTimber.id}`);
  const tagMetal = await prisma.contactTag.create({
    data: { companyId: company.id, name: "Metal Hardware" },
  });
  console.log(`   ✓ Metal Hardware - ID: ${tagMetal.id}`);
  const tagPremium = await prisma.contactTag.create({
    data: { companyId: company.id, name: "Premium" },
  });
  console.log(`   ✓ Premium - ID: ${tagPremium.id}`);
  const tagCorporate = await prisma.contactTag.create({
    data: { companyId: company.id, name: "Corporate" },
  });
  console.log(`   ✓ Corporate - ID: ${tagCorporate.id}`);
  console.log("✅ Created 6 tags\n");

  console.log("👥 Creating Contacts...");
  const vendor = await prisma.contact.create({
    data: {
      companyId: company.id,
      contactType: "vendor",
      displayName: "Sharma Timber Suppliers",
      email: "vendor@sharmatimber.in",
      phone: "+91 98980 12345",
    },
  });
  console.log(`   ✓ [VENDOR] Sharma Timber Suppliers - ID: ${vendor.id}`);

  const vendor2 = await prisma.contact.create({
    data: {
      companyId: company.id,
      contactType: "vendor",
      displayName: "Modern Hardware Co.",
      email: "sales@modernhardware.in",
      phone: "+91 98765 11111",
    },
  });
  console.log(`   ✓ [VENDOR] Modern Hardware Co. - ID: ${vendor2.id}`);

  const vendor3 = await prisma.contact.create({
    data: {
      companyId: company.id,
      contactType: "vendor",
      displayName: "Elite Fabrics Ltd.",
      email: "orders@elitefabrics.in",
      phone: "+91 98765 22222",
    },
  });
  console.log(`   ✓ [VENDOR] Elite Fabrics Ltd. - ID: ${vendor3.id}`);

  const vendor4 = await prisma.contact.create({
    data: {
      companyId: company.id,
      contactType: "vendor",
      displayName: "Premium Wood Imports",
      email: "info@premiumwood.in",
      phone: "+91 98765 33333",
    },
  });
  console.log(`   ✓ [VENDOR] Premium Wood Imports - ID: ${vendor4.id}`);

  const customer = await prisma.contact.create({
    data: {
      companyId: company.id,
      contactType: "customer",
      displayName: "Aarav Furnishings",
      email: "accounts@aaravfurnishings.in",
      phone: "+91 98765 43210",
    },
  });
  console.log(`   ✓ [CUSTOMER] Aarav Furnishings - ID: ${customer.id}`);

  const customer2 = await prisma.contact.create({
    data: {
      companyId: company.id,
      contactType: "customer",
      displayName: "Meera Home Decor",
      email: "finance@meerahomedecor.in",
      phone: "+91 98111 22334",
    },
  });
  console.log(`   ✓ [CUSTOMER] Meera Home Decor - ID: ${customer2.id}`);

  const customer3 = await prisma.contact.create({
    data: {
      companyId: company.id,
      contactType: "customer",
      displayName: "TechCorp Solutions",
      email: "procurement@techcorp.in",
      phone: "+91 98111 33445",
    },
  });
  console.log(`   ✓ [CUSTOMER] TechCorp Solutions - ID: ${customer3.id}`);

  const customer4 = await prisma.contact.create({
    data: {
      companyId: company.id,
      contactType: "customer",
      displayName: "Luxury Interiors Pvt Ltd",
      email: "sales@luxuryinteriors.in",
      phone: "+91 98111 44556",
    },
  });
  console.log(`   ✓ [CUSTOMER] Luxury Interiors Pvt Ltd - ID: ${customer4.id}`);

  console.log("\n🔗 Assigning tags to contacts...");
  await prisma.contactTagAssignment.createMany({
    data: [
      { contactId: vendor.id, tagId: tagTimber.id },
      { contactId: vendor2.id, tagId: tagMetal.id },
      { contactId: vendor4.id, tagId: tagPremium.id },
      { contactId: customer.id, tagId: tagRetail.id },
      { contactId: customer2.id, tagId: tagWholesale.id },
      { contactId: customer3.id, tagId: tagCorporate.id },
      { contactId: customer4.id, tagId: tagPremium.id },
    ],
  });
  console.log(`   ✓ ${vendor.displayName} → Timber`);
  console.log(`   ✓ ${vendor2.displayName} → Metal Hardware`);
  console.log(`   ✓ ${vendor4.displayName} → Premium`);
  console.log(`   ✓ ${customer.displayName} → Retail`);
  console.log(`   ✓ ${customer2.displayName} → Wholesale`);
  console.log(`   ✓ ${customer3.displayName} → Corporate`);
  console.log(`   ✓ ${customer4.displayName} → Premium`);
  console.log("✅ Created 8 contacts with tags\n");

  console.log("📦 Creating Product Categories...");
  const categoryLiving = await prisma.productCategory.create({
    data: { companyId: company.id, name: "Living" },
  });
  console.log(`   ✓ Living - ID: ${categoryLiving.id}`);
  const categoryOffice = await prisma.productCategory.create({
    data: { companyId: company.id, name: "Office" },
  });
  console.log(`   ✓ Office - ID: ${categoryOffice.id}`);
  const categoryOutdoor = await prisma.productCategory.create({
    data: { companyId: company.id, name: "Outdoor" },
  });
  console.log(`   ✓ Outdoor - ID: ${categoryOutdoor.id}`);
  const categoryAccessories = await prisma.productCategory.create({
    data: { companyId: company.id, name: "Accessories" },
  });
  console.log(`   ✓ Accessories - ID: ${categoryAccessories.id}`);
  const categoryBedroom = await prisma.productCategory.create({
    data: { companyId: company.id, name: "Bedroom" },
  });
  console.log(`   ✓ Bedroom - ID: ${categoryBedroom.id}`);
  console.log("✅ Created 5 categories\n");

  console.log("🛋️  Creating Products...");
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
  console.log(`   ✓ [SF-LIV-001] Sheesham 3-Seater Sofa | Category: Living | Cost: ₹18,500 | Sale: ₹28,999`);

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
  console.log(`   ✓ [SF-OFF-010] Teak Executive Desk | Category: Office | Cost: ₹12,500 | Sale: ₹19,999`);

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
  console.log(`   ✓ [SF-OFF-022] Ergo Study Chair | Category: Office | Cost: ₹3,200 | Sale: ₹5,400`);

  const coffeeTable = await prisma.product.create({
    data: {
      companyId: company.id,
      categoryId: categoryLiving.id,
      sku: "SF-LIV-015",
      name: "Marble Coffee Table",
      costPrice: 8500,
      salePrice: 15999,
    },
  });
  console.log(`   ✓ [SF-LIV-015] Marble Coffee Table | Category: Living | Cost: ₹8,500 | Sale: ₹15,999`);

  const bookshelf = await prisma.product.create({
    data: {
      companyId: company.id,
      categoryId: categoryOffice.id,
      sku: "SF-OFF-030",
      name: "Walnut Bookshelf",
      costPrice: 9800,
      salePrice: 17500,
    },
  });
  console.log(`   ✓ [SF-OFF-030] Walnut Bookshelf | Category: Office | Cost: ₹9,800 | Sale: ₹17,500`);

  const bench = await prisma.product.create({
    data: {
      companyId: company.id,
      categoryId: categoryOutdoor.id,
      sku: "SF-OUT-005",
      name: "Garden Teak Bench",
      costPrice: 5500,
      salePrice: 9999,
    },
  });
  console.log(`   ✓ [SF-OUT-005] Garden Teak Bench | Category: Outdoor | Cost: ₹5,500 | Sale: ₹9,999`);

  const hinge = await prisma.product.create({
    data: {
      companyId: company.id,
      categoryId: categoryAccessories.id,
      sku: "SF-ACC-101",
      name: "Brass Cabinet Hinge",
      costPrice: 150,
      salePrice: 350,
    },
  });
  console.log(`   ✓ [SF-ACC-101] Brass Cabinet Hinge | Category: Accessories | Cost: ₹150 | Sale: ₹350`);

  const handle = await prisma.product.create({
    data: {
      companyId: company.id,
      categoryId: categoryAccessories.id,
      sku: "SF-ACC-102",
      name: "Steel Drawer Handle",
      costPrice: 120,
      salePrice: 280,
    },
  });
  console.log(`   ✓ [SF-ACC-102] Steel Drawer Handle | Category: Accessories | Cost: ₹120 | Sale: ₹280`);

  const bed = await prisma.product.create({
    data: {
      companyId: company.id,
      categoryId: categoryBedroom.id,
      sku: "SF-BED-020",
      name: "King Size Platform Bed",
      costPrice: 22000,
      salePrice: 38999,
    },
  });
  console.log(`   ✓ [SF-BED-020] King Size Platform Bed | Category: Bedroom | Cost: ₹22,000 | Sale: ₹38,999`);

  const wardrobe = await prisma.product.create({
    data: {
      companyId: company.id,
      categoryId: categoryBedroom.id,
      sku: "SF-BED-025",
      name: "Sliding Door Wardrobe",
      costPrice: 28000,
      salePrice: 45999,
    },
  });
  console.log(`   ✓ [SF-BED-025] Sliding Door Wardrobe | Category: Bedroom | Cost: ₹28,000 | Sale: ₹45,999`);

  console.log("✅ Created 10 products\n");

  console.log("🎯 Creating Auto-Analytic Model & Rules...");
  const model = await prisma.autoAnalyticModel.create({
    data: {
      companyId: company.id,
      name: "Shiv Furniture Default Rules",
      priority: 10,
      rules: {
        create: [
          // ========== PURCHASE ORDER RULES ==========
          // Rule 1: Premium vendor (highest priority) → Capital
          {
            docType: "purchase_order",
            matchContactTagId: tagPremium.id,
            assignAnalyticAccountId: ccCapital.id,
            rulePriority: 3,
          },
          // Rule 2: Timber tag → Manufacturing
          {
            docType: "purchase_order",
            matchContactTagId: tagTimber.id,
            assignAnalyticAccountId: ccManufacturing.id,
            rulePriority: 5,
          },
          // Rule 3: Metal hardware tag → Operations
          {
            docType: "purchase_order",
            matchContactTagId: tagMetal.id,
            assignAnalyticAccountId: ccOperations.id,
            rulePriority: 6,
          },
          // Rule 4: Living category → Manufacturing
          {
            docType: "purchase_order",
            matchCategoryId: categoryLiving.id,
            assignAnalyticAccountId: ccManufacturing.id,
            rulePriority: 10,
          },
          // Rule 5: Office category → Admin
          {
            docType: "purchase_order",
            matchCategoryId: categoryOffice.id,
            assignAnalyticAccountId: ccAdmin.id,
            rulePriority: 15,
          },
          // Rule 6: Outdoor category → Operations
          {
            docType: "purchase_order",
            matchCategoryId: categoryOutdoor.id,
            assignAnalyticAccountId: ccOperations.id,
            rulePriority: 18,
          },
          // Rule 7: Bedroom category → Manufacturing
          {
            docType: "purchase_order",
            matchCategoryId: categoryBedroom.id,
            assignAnalyticAccountId: ccManufacturing.id,
            rulePriority: 12,
          },
          // Rule 8: Accessories category → Operations
          {
            docType: "purchase_order",
            matchCategoryId: categoryAccessories.id,
            assignAnalyticAccountId: ccOperations.id,
            rulePriority: 20,
          },
          // Rule 9: Specific desk product → Operations
          {
            docType: "purchase_order",
            matchProductId: table.id,
            assignAnalyticAccountId: ccOperations.id,
            rulePriority: 8,
          },
          
          // ========== VENDOR BILL RULES ==========
          // Rule 10: Premium tag → Capital
          {
            docType: "vendor_bill",
            matchContactTagId: tagPremium.id,
            assignAnalyticAccountId: ccCapital.id,
            rulePriority: 3,
          },
          // Rule 11: Timber tag → Manufacturing
          {
            docType: "vendor_bill",
            matchContactTagId: tagTimber.id,
            assignAnalyticAccountId: ccManufacturing.id,
            rulePriority: 5,
          },
          // Rule 12: Metal tag → Operations
          {
            docType: "vendor_bill",
            matchContactTagId: tagMetal.id,
            assignAnalyticAccountId: ccOperations.id,
            rulePriority: 6,
          },
          // Rule 13: Living category → Manufacturing
          {
            docType: "vendor_bill",
            matchCategoryId: categoryLiving.id,
            assignAnalyticAccountId: ccManufacturing.id,
            rulePriority: 10,
          },
          // Rule 14: Office category → Operations
          {
            docType: "vendor_bill",
            matchCategoryId: categoryOffice.id,
            assignAnalyticAccountId: ccOperations.id,
            rulePriority: 20,
          },
          // Rule 15: Bedroom category → Manufacturing
          {
            docType: "vendor_bill",
            matchCategoryId: categoryBedroom.id,
            assignAnalyticAccountId: ccManufacturing.id,
            rulePriority: 12,
          },
          // Rule 16: Outdoor category → Operations
          {
            docType: "vendor_bill",
            matchCategoryId: categoryOutdoor.id,
            assignAnalyticAccountId: ccOperations.id,
            rulePriority: 18,
          },
          
          // ========== SALES ORDER RULES ==========
          // Rule 17: Corporate tag (highest) → Admin
          {
            docType: "sales_order",
            matchContactTagId: tagCorporate.id,
            assignAnalyticAccountId: ccAdmin.id,
            rulePriority: 7,
          },
          // Rule 18: Premium tag → Capital
          {
            docType: "sales_order",
            matchContactTagId: tagPremium.id,
            assignAnalyticAccountId: ccCapital.id,
            rulePriority: 8,
          },
          // Rule 19: Retail tag → Sales
          {
            docType: "sales_order",
            matchContactTagId: tagRetail.id,
            assignAnalyticAccountId: ccSales.id,
            rulePriority: 10,
          },
          // Rule 20: Wholesale tag → Capital
          {
            docType: "sales_order",
            matchContactTagId: tagWholesale.id,
            assignAnalyticAccountId: ccCapital.id,
            rulePriority: 12,
          },
          // Rule 21: Living category → Sales
          {
            docType: "sales_order",
            matchCategoryId: categoryLiving.id,
            assignAnalyticAccountId: ccSales.id,
            rulePriority: 20,
          },
          // Rule 22: Office category → Admin
          {
            docType: "sales_order",
            matchCategoryId: categoryOffice.id,
            assignAnalyticAccountId: ccAdmin.id,
            rulePriority: 25,
          },
          // Rule 23: Bedroom category → Sales
          {
            docType: "sales_order",
            matchCategoryId: categoryBedroom.id,
            assignAnalyticAccountId: ccSales.id,
            rulePriority: 22,
          },
          
          // ========== CUSTOMER INVOICE RULES ==========
          // Rule 24: Corporate tag → Admin
          {
            docType: "customer_invoice",
            matchContactTagId: tagCorporate.id,
            assignAnalyticAccountId: ccAdmin.id,
            rulePriority: 7,
          },
          // Rule 25: Premium tag → Capital
          {
            docType: "customer_invoice",
            matchContactTagId: tagPremium.id,
            assignAnalyticAccountId: ccCapital.id,
            rulePriority: 8,
          },
          // Rule 26: Retail tag → Sales
          {
            docType: "customer_invoice",
            matchContactTagId: tagRetail.id,
            assignAnalyticAccountId: ccSales.id,
            rulePriority: 10,
          },
          // Rule 27: Wholesale tag → Capital
          {
            docType: "customer_invoice",
            matchContactTagId: tagWholesale.id,
            assignAnalyticAccountId: ccCapital.id,
            rulePriority: 12,
          },
          // Rule 28: Specific sofa product → Sales (high priority)
          {
            docType: "customer_invoice",
            matchProductId: sofa.id,
            assignAnalyticAccountId: ccSales.id,
            rulePriority: 8,
          },
          // Rule 29: Living category → Sales
          {
            docType: "customer_invoice",
            matchCategoryId: categoryLiving.id,
            assignAnalyticAccountId: ccSales.id,
            rulePriority: 20,
          },
          // Rule 30: Office category → Admin
          {
            docType: "customer_invoice",
            matchCategoryId: categoryOffice.id,
            assignAnalyticAccountId: ccAdmin.id,
            rulePriority: 25,
          },
          // Rule 31: Bedroom category → Sales
          {
            docType: "customer_invoice",
            matchCategoryId: categoryBedroom.id,
            assignAnalyticAccountId: ccSales.id,
            rulePriority: 22,
          },
        ],
      },
    },
    include: { rules: true },
  });
  console.log(`   ✓ Model: "${model.name}" (Priority: ${model.priority}) - Active: ${model.isActive}`);
  console.log(`   ✓ Created ${model.rules.length} auto-analytic rules:\n`);
  
  // Group rules by docType for better readability
  const rulesByDocType = model.rules.reduce((acc, rule) => {
    if (!acc[rule.docType]) acc[rule.docType] = [];
    acc[rule.docType].push(rule);
    return acc;
  }, {});
  
  Object.entries(rulesByDocType).forEach(([docType, rules]) => {
    console.log(`      📋 ${docType.toUpperCase().replace(/_/g, ' ')} (${rules.length} rules):`);
    rules.forEach((rule) => {
      let matchDesc = '';
      let ccName = '';
      
      if (rule.matchContactTagId) {
        const tag = [tagTimber, tagRetail, tagWholesale, tagMetal, tagPremium, tagCorporate].find(t => t.id === rule.matchContactTagId);
        matchDesc = `Tag: ${tag?.name || 'Unknown'}`;
      } else if (rule.matchCategoryId) {
        const cat = [categoryLiving, categoryOffice, categoryOutdoor, categoryAccessories, categoryBedroom].find(c => c.id === rule.matchCategoryId);
        matchDesc = `Category: ${cat?.name || 'Unknown'}`;
      } else if (rule.matchProductId) {
        const prod = [sofa, table, chair, coffeeTable, bookshelf, bench, hinge, handle, bed, wardrobe].find(p => p.id === rule.matchProductId);
        matchDesc = `Product: ${prod?.name || 'Unknown'}`;
      }
      
      const cc = [ccManufacturing, ccSales, ccAdmin, ccOperations, ccCapital].find(c => c.id === rule.assignAnalyticAccountId);
      ccName = cc?.name || 'Unknown';
      
      console.log(`         • ${matchDesc} → ${ccName} (Priority: ${rule.rulePriority})`);
    });
  });
  
  console.log("\n✅ Auto-analytic model configured\n");

  console.log("💰 Creating Budget...");
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
  console.log("   ✓ Budget: FY 2025-26 (Apr 2025 - Mar 2026)");
  console.log("   ✓ Total Budget: ₹925,000 across 5 cost centers");
  console.log("   ✓ Status: Approved");
  console.log("✅ Budget created\n");

  console.log("👤 Creating Users...");
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
  console.log("   ✓ Admin User: ADMIN1 (admin@shivfurniture.in) | Password: Admin@123");

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
  console.log("   ✓ Portal User: PORT01 (portal@shivfurniture.in) | Password: Portal@123");
  console.log("✅ Created 2 users\n");

  console.log("📄 Creating Sample Purchase Order...");
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
  console.log(`   ✓ PO-2026-001 → Vendor: ${vendor.displayName}`);
  console.log(`   ✓ 50 units × ₹2,800 + 18% GST = ₹${purchaseOrder.lines[0].lineTotal.toLocaleString()}`);
  console.log(`   ✓ Status: ${purchaseOrder.status}`);
  console.log("✅ Purchase order created\n");

  console.log("📋 Creating Vendor Bill...");
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
  console.log(`   ✓ BILL-2026-020 → Vendor: ${vendor.displayName}`);
  console.log(`   ✓ Linked to: PO-2026-001`);
  console.log(`   ✓ Cost Center: ${ccOperations.name}`);
  console.log(`   ✓ Total: ₹${vendorBill.lines[0].lineTotal.toLocaleString()}`);
  console.log(`   ✓ Status: ${vendorBill.status}`);
  console.log("✅ Vendor bill created\n");

  console.log("🧾 Creating Customer Invoice...");
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
  console.log(`   ✓ INV-2026-0142 → Customer: ${customer.displayName}`);
  console.log(`   ✓ Product: ${sofa.name}`);
  console.log(`   ✓ 5 units × ₹28,999 + 18% GST = ₹${invoiceTotal.toLocaleString()}`);
  console.log(`   ✓ Cost Center: ${ccSales.name}`);
  console.log(`   ✓ Payment State: not_paid`);
  console.log("✅ Customer invoice created\n");

  const billTotal = vendorBill.lines.reduce((sum, line) => sum + Number(line.lineTotal), 0);
  await prisma.vendorBill.update({
    where: { id: vendorBill.id },
    data: { totalAmount: billTotal, paymentState: "not_paid", paidAmount: 0 },
  });

  console.log("💳 Creating Payments...");
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
  console.log(`   ✓ Inbound Payment: ₹${(invoiceTotal / 2).toLocaleString()} from ${customer.displayName}`);
  console.log(`   ✓ Reference: NEFT-INV-142 | Method: bank`);

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
  console.log(`   ✓ Invoice INV-2026-0142 → Status: partially_paid (50%)`);

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
  console.log(`   ✓ Outbound Payment: ₹${billTotal.toLocaleString()} to ${vendor.displayName}`);
  console.log(`   ✓ Reference: NEFT-BILL-020 | Method: bank`);

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
  console.log(`   ✓ Bill BILL-2026-020 → Status: paid (100%)`);
  console.log("✅ Payments processed\n");

  console.log("📖 Creating Journal Entry...");
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
  console.log("   ✓ Manual journal entry created");
  console.log(`   ✓ Revenue recognized: ₹125,000 | Contact: ${customer2.displayName}`);
  console.log(`   ✓ Cost Center: ${ccSales.name}`);
  console.log("✅ Journal entry posted\n");

  console.log("=".repeat(70));
  console.log("🎉 SEED COMPLETED SUCCESSFULLY!");
  console.log("=".repeat(70));
  console.log("\n📊 Summary:");
  console.log("   • Company: Shiv Furniture");
  console.log("   • GL Accounts: 3");
  console.log("   • Cost Centers: 5");
  console.log("   • Contact Tags: 3");
  console.log("   • Contacts: 3 (1 vendor, 2 customers)");
  console.log("   • Product Categories: 2");
  console.log("   • Products: 3");
  console.log("   • Auto-Analytic Rules: 4");
  console.log("   • Budget: 1 (FY 2025-26, ₹925,000)");
  console.log("   • Users: 2 (1 admin, 1 portal)");
  console.log("   • Purchase Orders: 1");
  console.log("   • Vendor Bills: 1");
  console.log("   • Customer Invoices: 1");
  console.log("   • Payments: 2");
  console.log("   • Journal Entries: 1");
  console.log("\n🔑 Login Credentials:");
  console.log("   Admin: ADMIN1 / Admin@123");
  console.log("   Portal: PORT01 / Portal@123");
  console.log("\n" + "=".repeat(70) + "\n");

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
