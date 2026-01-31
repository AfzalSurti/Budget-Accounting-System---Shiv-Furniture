import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Company
  const company = await prisma.company.create({
    data: {
      name: 'Shiv Furniture',
      currency: 'INR',
    },
  });

  console.log('Created company:', company);

  // Create GL Accounts
  const glAccount1 = await prisma.gLAccount.create({
    data: {
      companyId: company.id,
      code: 'ACC001',
      name: 'Sales Revenue',
      accountType: 'income',
    },
  });

  const glAccount2 = await prisma.gLAccount.create({
    data: {
      companyId: company.id,
      code: 'ACC002',
      name: 'Cost of Goods',
      accountType: 'expense',
    },
  });

  console.log('Created GL Accounts');

  // Create Product Category
  const category = await prisma.productCategory.create({
    data: {
      companyId: company.id,
      name: 'Wooden Furniture',
    },
  });

  console.log('Created category:', category);

  // Create Product
  const product = await prisma.product.create({
    data: {
      companyId: company.id,
      categoryId: category.id,
      sku: 'WF001',
      name: 'Sheesham Wood Chair',
      description: 'Premium sheesham wood chair',
      costPrice: 2500,
      sellingPrice: 4500,
    },
  });

  console.log('Created product:', product);

  // Create Contact (Vendor)
  const vendor = await prisma.contact.create({
    data: {
      companyId: company.id,
      type: 'vendor',
      name: 'Sharma Timber Suppliers',
      email: 'vendor@sharmatimber.in',
    },
  });

  console.log('Created vendor:', vendor);

  // Create Contact (Customer)
  const customer = await prisma.contact.create({
    data: {
      companyId: company.id,
      type: 'customer',
      name: 'Rahul Verma',
      email: 'rahul.verma@example.in',
    },
  });

  console.log('Created customer:', customer);

  // Create Analytic Account
  const analytic = await prisma.analyticAccount.create({
    data: {
      companyId: company.id,
      code: 'AA001',
      name: 'Department A',
    },
  });

  console.log('Created analytic account:', analytic);

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
