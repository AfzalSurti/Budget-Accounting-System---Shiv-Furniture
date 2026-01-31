import { prisma } from "../config/prisma.js";
export async function createTransaction(userId, payload) {
    try {
        // Validate that company exists
        const company = await prisma.company.findUnique({
            where: { id: payload.companyId },
        });
        if (!company) {
            throw new Error(`Company with ID ${payload.companyId} not found`);
        }
        // Validate that all GL accounts exist
        for (const line of payload.lines) {
            if (line.glAccountId) {
                const glAccount = await prisma.gLAccount.findUnique({
                    where: { id: line.glAccountId },
                });
                if (!glAccount) {
                    throw new Error(`GL Account with ID ${line.glAccountId} not found`);
                }
            }
        }
        const entry = await prisma.journalEntry.create({
            data: {
                companyId: payload.companyId,
                entryDate: new Date(payload.entryDate),
                status: "draft",
                sourceType: "manual",
                memo: payload.memo || null,
                lines: {
                    create: payload.lines.map((line) => ({
                        glAccountId: line.glAccountId,
                        analyticAccountId: line.analyticAccountId || null,
                        contactId: line.contactId || null,
                        productId: line.productId || null,
                        description: line.description || null,
                        debit: line.debit || 0,
                        credit: line.credit || 0,
                    })),
                },
            },
            include: {
                lines: {
                    include: {
                        gl: {
                            select: { id: true, name: true },
                        },
                    },
                },
            },
        });
        return formatTransactionResponse(entry);
    }
    catch (error) {
        console.error("Error creating transaction:", error);
        throw error;
    }
}
export async function getTransactions(companyId, limit = 50, offset = 0) {
    const [entries, total] = await Promise.all([
        prisma.journalEntry.findMany({
            where: { companyId },
            include: {
                lines: {
                    include: {
                        gl: {
                            select: { id: true, name: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: offset,
        }),
        prisma.journalEntry.count({ where: { companyId } }),
    ]);
    return {
        transactions: entries.map(formatTransactionResponse),
        total,
    };
}
export async function getTransactionById(id, companyId) {
    const entry = await prisma.journalEntry.findFirst({
        where: { id, companyId },
        include: {
            lines: {
                include: {
                    gl: {
                        select: { id: true, name: true },
                    },
                },
            },
        },
    });
    return entry ? formatTransactionResponse(entry) : null;
}
function formatTransactionResponse(entry) {
    return {
        id: entry.id,
        entryDate: entry.entryDate.toISOString().split("T")[0],
        status: entry.status,
        memo: entry.memo,
        createdAt: entry.createdAt.toISOString(),
        lines: entry.lines.map((line) => ({
            id: line.id,
            description: line.description,
            debit: Number(line.debit),
            credit: Number(line.credit),
            glAccount: {
                id: line.gl.id,
                name: line.gl.name,
            },
        })),
    };
}
//# sourceMappingURL=transactionController.js.map