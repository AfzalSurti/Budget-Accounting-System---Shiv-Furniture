import { prisma } from "./src/lib/prisma.js";

async function main() {
  console.log("Updating all contacts to isPortalUser: true...");
  
  const result = await prisma.contact.updateMany({
    where: {}, // Update all contacts
    data: {
      isPortalUser: true,
    },
  });

  console.log(`✓ Updated ${result.count} contacts to be portal users`);
}

main()
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
