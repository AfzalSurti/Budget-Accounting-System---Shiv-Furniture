import 'dotenv/config';
// @ts-ignore
import pkg from '@prisma/client';
const { PrismaClient } = pkg;


const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  try {
    // Create Company
    const company = await prisma.company.create({
      data: {
        name: 'Shiv Furniture',
      },
    });

    console.log('✅ Created company:', company.name);

    // Create GL Accounts
    await prisma.gLAccount.create({
      data: {
        companyId: company.id,
        code: 'ACC001',
        name: 'Sales Revenue',
        accountType: 'income',
      },
    });

    await prisma.gLAccount.create({
      data: {
        companyId: company.id,
        code: 'ACC002',
        name: 'Cost of Goods',
        accountType: 'expense',
      },
    });

    console.log('✅ Created GL Accounts');

    // Create Product Category
    const category = await prisma.productCategory.create({
      data: {
        companyId: company.id,
        name: 'Wooden Furniture',
      },
    });

    console.log('✅ Created category:', category.name);

    // Create Product
    const product = await prisma.product.create({
      data: {
        companyId: company.id,
        categoryId: category.id,
        sku: 'WF001',
        name: 'Wooden Chair',
        costPrice: 500,
        salePrice: 1000,
      },
    });

    console.log('✅ Created product:', product.name);

    // Create Contact (Vendor)
    const vendor = await prisma.contact.create({
      data: {
        companyId: company.id,
        contactType: 'vendor',
        displayName: 'Wood Supplier Ltd',
        email: 'vendor@example.com',
      },
    });

    console.log('✅ Created vendor:', vendor.displayName);

    // Create Contact (Customer)
    const customer = await prisma.contact.create({
      data: {
        companyId: company.id,
        contactType: 'customer',
        displayName: 'John Doe',
        email: 'customer@example.com',
      },
    });

    console.log('✅ Created customer:', customer.displayName);

    // Create Analytic Account
    const analytic = await prisma.analyticAccount.create({
      data: {
        companyId: company.id,
        code: 'AA001',
        name: 'Department A',
      },
    });

    console.log('✅ Created analytic account:', analytic.name);

    console.log('\n✅ All data seeded successfully!');
  } catch (e) {
    console.error('❌ Error:', (e as Error).message);
    throw e;
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
