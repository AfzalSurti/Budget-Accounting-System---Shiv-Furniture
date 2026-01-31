import { PrismaClient } from "../dist/generated/prisma/client.js";

const prisma = new PrismaClient();

const main = async () => {
  const company = await prisma.company.create({
    data: { name: "Shiv Furniture" },
  });

  const contact = await prisma.contact.create({
    data: {
      companyId: company.id,
      contactType: "customer",
      displayName: "Demo Customer",
      email: "customer@example.com",
    },
  });

  const analytic = await prisma.analyticAccount.create({
    data: {
      companyId: company.id,
      code: "CC-100",
      name: "Production",
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

  await prisma.user.create({
    data: {
      email: "admin@example.com",
      passwordHash:
        "$2a$10$CwTycUXWue0Thq9StjUM0uJ8uLxG3e1XrVbJAnCmvYzu3/n6PvJ0G",
      role: "ADMIN",
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
