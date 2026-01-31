import { createServer } from "node:http";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
const server = createServer(app);
server.listen(env.PORT, () => {
    console.log(`API listening on port ${env.PORT}`);
});
const shutdown = async () => {
    try {
        await prisma.$disconnect();
    }
    finally {
        server.close(() => process.exit(0));
    }
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
//# sourceMappingURL=server.js.map