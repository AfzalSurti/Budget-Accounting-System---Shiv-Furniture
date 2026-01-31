import { prisma } from "./lib/prisma.js";
async function main() {
    await prisma.$connect();
    console.log("Prisma connected.");
    await prisma.$disconnect();
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
//# sourceMappingURL=index.js.map