import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting unified seed process...");

  try {
    // 1. Create or Get Company (Preserves existing data)
    const company = await prisma.company.upsert({
      where: { id: "c304b575-8044-4c82-8462-0fea93570c00" }, // Standard ID for your environment
      update: { name: "Shiv Furniture" },
      create: {
        id: "c304b575-8044-4c82-8462-0fea93570c00",
        name: "Shiv Furniture",
      },
    });

    // 2. GL Accounts, Categories, and Products (Using upsert to prevent duplicates)
    const glSales = await prisma.gLAccount.upsert({
      where: { companyId_code: { companyId: company.id, code: "ACC001" } },
      update: {},
      create: {
        companyId: company.id,
        code: "ACC001",
        name: "Sales Revenue",
        accountType: "income",
      },
    });

    const catWooden = await prisma.productCategory.upsert({
      where: {
        companyId_name: { companyId: company.id, name: "Wooden Furniture" },
      },
      update: {},
      create: { companyId: company.id, name: "Wooden Furniture" },
    });

    const prodChair = await prisma.product.upsert({
      where: { companyId_sku: { companyId: company.id, sku: "WF001" } },
      update: { categoryId: catWooden.id, name: "Chair" },
      create: {
        companyId: company.id,
        categoryId: catWooden.id,
        sku: "WF001",
        name: "Chair",
        costPrice: 2500,
        salePrice: 4500,
      },
    });

    // 3. Seed All 9 Specific Analytic Accounts (Cost Centers) using exact UUIDs
    const manufacturingAccount = await prisma.analyticAccount.upsert({
      where: { id: "c304b575-8044-4c82-8462-0fea93570c00" },
      update: { name: "Manufacturing", code: "CC-100" },
      create: {
        id: "c304b575-8044-4c82-8462-0fea93570c00",
        name: "Manufacturing",
        code: "CC-100",
        companyId: company.id,
      },
    });

    const salesAccount = await prisma.analyticAccount.upsert({
      where: { id: "b16e2e58-7fc1-4aad-99aa-2e3dda3cb836" },
      update: { name: "Sales", code: "CC-200" },
      create: {
        id: "b16e2e58-7fc1-4aad-99aa-2e3dda3cb836",
        name: "Sales",
        code: "CC-200",
        companyId: company.id,
      },
    });

    await prisma.analyticAccount.upsert({
      where: { id: "a9845e81-b97d-4ee4-8df2-966c7d535aeb" },
      update: { name: "Admin", code: "CC-300" },
      create: {
        id: "a9845e81-b97d-4ee4-8df2-966c7d535aeb",
        name: "Admin",
        code: "CC-300",
        companyId: company.id,
      },
    });

    await prisma.analyticAccount.upsert({
      where: { id: "8b9113dc-7356-43af-bed9-ce2b752e70f4" },
      update: { name: "Operations", code: "CC-400" },
      create: {
        id: "8b9113dc-7356-43af-bed9-ce2b752e70f4",
        name: "Operations",
        code: "CC-400",
        companyId: company.id,
      },
    });

    await prisma.analyticAccount.upsert({
      where: { id: "17c320fa-ac50-4d5a-91a5-e80d07aa20c2" },
      update: { name: "Capital", code: "CC-500" },
      create: {
        id: "17c320fa-ac50-4d5a-91a5-e80d07aa20c2",
        name: "Capital",
        code: "CC-500",
        companyId: company.id,
      },
    });

    await prisma.analyticAccount.upsert({
      where: { id: "48de9859-a745-40cb-b8c3-6623a90bb322" },
      update: { name: "Furniture Expo 2027", code: "CSR-231" },
      create: {
        id: "48de9859-a745-40cb-b8c3-6623a90bb322",
        name: "Furniture Expo 2027",
        code: "CSR-231",
        companyId: company.id,
      },
    });

    await prisma.analyticAccount.upsert({
      where: { id: "1b1b9207-b95f-47c0-8045-3154ef9224e4" },
      update: { name: "Marketing", code: "CR-231" },
      create: {
        id: "1b1b9207-b95f-47c0-8045-3154ef9224e4",
        name: "Marketing",
        code: "CR-231",
        companyId: company.id,
      },
    });

    await prisma.analyticAccount.upsert({
      where: { id: "7867a3d1-8496-48c5-9f0d-15762aa93505" },
      update: { name: "Social Media", code: "CS123" },
      create: {
        id: "7867a3d1-8496-48c5-9f0d-15762aa93505",
        name: "Social Media",
        code: "CS123",
        companyId: company.id,
      },
    });

    await prisma.analyticAccount.upsert({
      where: { id: "d980f93d-9ff2-41dd-91b8-08e7c22f9726" },
      update: { name: "Summer Sale", code: "001" },
      create: {
        id: "d980f93d-9ff2-41dd-91b8-08e7c22f9726",
        name: "Summer Sale",
        code: "001",
        companyId: company.id,
      },
    });

    // 4. Create Auto-Analytic Model & Mapping Rules
    // Check if the model exists by finding any record for this company with this name
    let analyticModel = await prisma.autoAnalyticModel.findFirst({
      where: { companyId: company.id, name: "Standard Business Logic" },
    });

    if (!analyticModel) {
      analyticModel = await prisma.autoAnalyticModel.create({
        data: {
          companyId: company.id,
          name: "Standard Business Logic",
          isActive: true,
        },
      });
    } else if (!analyticModel.isActive) {
      analyticModel = await prisma.autoAnalyticModel.update({
        where: { id: analyticModel.id },
        data: { isActive: true },
      });
    }

    const vendorBillRule = await prisma.autoAnalyticRule.findFirst({
      where: {
        modelId: analyticModel.id,
        docType: "vendor_bill",
        matchCategoryId: catWooden.id,
        assignAnalyticAccountId: manufacturingAccount.id,
      },
    });

    if (!vendorBillRule) {
      await prisma.autoAnalyticRule.create({
        data: {
          modelId: analyticModel.id,
          docType: "vendor_bill",
          matchCategoryId: catWooden.id,
          assignAnalyticAccountId: manufacturingAccount.id,
        },
      });
    }

    const customerInvoiceRule = await prisma.autoAnalyticRule.findFirst({
      where: {
        modelId: analyticModel.id,
        docType: "customer_invoice",
        matchProductId: prodChair.id,
        assignAnalyticAccountId: salesAccount.id,
      },
    });

    if (!customerInvoiceRule) {
      await prisma.autoAnalyticRule.create({
        data: {
          modelId: analyticModel.id,
          docType: "customer_invoice",
          matchProductId: prodChair.id,
          assignAnalyticAccountId: salesAccount.id,
        },
      });
    }

    console.log(
      "\n✅ All data preserved and Analytical Model added successfully!",
    );
  } catch (e) {
    console.error("❌ Seed Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
