import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  console.log("Updating all contacts to isPortalUser: true...");
  
  const result = await prisma.contact.updateMany({
    data: {
      isPortalUser: true,
    },
  });

  console.log(`Updated ${result.count} contacts`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Done!");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
