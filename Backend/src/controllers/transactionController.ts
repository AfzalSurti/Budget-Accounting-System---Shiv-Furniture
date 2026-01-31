import { prisma } from "../config/prisma.js";

export interface CreateTransactionPayload {
  entryDate: string;
  memo?: string;
  lines: Array<{
    glAccountId: string;
    analyticAccountId?: string;
    contactId?: string;
    productId?: string;
    description?: string;
    debit?: number;
    credit?: number;
  }>;
}

export interface TransactionResponse {
  id: string;
  entryDate: string;
  status: string;
  memo?: string;
  createdAt: string;
  lines: Array<{
    id: string;
    description?: string;
    debit: number;
    credit: number;
    glAccount: {
      id: string;
      name: string;
    };
  }>;
}

export async function createTransaction(
  userId: string,
  payload: CreateTransactionPayload & { companyId: string }
): Promise<TransactionResponse> {
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
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
}

export async function getTransactions(
  companyId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ transactions: TransactionResponse[]; total: number }> {
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

export async function getTransactionById(
  id: string,
  companyId: string
): Promise<TransactionResponse | null> {
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

function formatTransactionResponse(entry: any): TransactionResponse {
  return {
    id: entry.id,
    entryDate: entry.entryDate.toISOString().split("T")[0],
    status: entry.status,
    memo: entry.memo,
    createdAt: entry.createdAt.toISOString(),
    lines: entry.lines.map((line: any) => ({
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
