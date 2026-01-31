import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "./generated/prisma/index.js";
const prisma = new PrismaClient();
async function main() {
    console.log("Seeding database...");
    try {
        // Create Company
        const company = await prisma.company.create({
            data: {
                name: "Shiv Furniture",
            },
        });
        console.log("✅ Created company:", company.name);
        // Create GL Accounts
        const glSales = await prisma.gLAccount.create({
            data: {
                companyId: company.id,
                code: "ACC001",
                name: "Sales Revenue",
                accountType: "income",
            },
        });
        const glCogs = await prisma.gLAccount.create({
            data: {
                companyId: company.id,
                code: "ACC002",
                name: "Cost of Goods",
                accountType: "expense",
            },
        });
        console.log("✅ Created GL Accounts");
        // Create Product Category
        const category = await prisma.productCategory.create({
            data: {
                companyId: company.id,
                name: "Wooden Furniture",
            },
        });
        const category2 = await prisma.productCategory.create({
            data: {
                companyId: company.id,
                name: "Metal Fixtures",
            },
        });
        console.log("✅ Created category:", category.name);
        // Create Product
        const product = await prisma.product.create({
            data: {
                companyId: company.id,
                categoryId: category.id,
                sku: "WF001",
                name: "Sheesham Wood Chair",
                costPrice: 2500,
                salePrice: 4500,
            },
        });
        const product2 = await prisma.product.create({
            data: {
                companyId: company.id,
                categoryId: category.id,
                sku: "WF002",
                name: "Oakwood Study Table",
                costPrice: 8200,
                salePrice: 12500,
            },
        });
        const product3 = await prisma.product.create({
            data: {
                companyId: company.id,
                categoryId: category2.id,
                sku: "MF001",
                name: "Steel Drawer Handle",
                costPrice: 120,
                salePrice: 250,
            },
        });
        console.log("✅ Created product:", product.name);
        // Create Contact (Vendor)
        const vendor = await prisma.contact.create({
            data: {
                companyId: company.id,
                contactType: "vendor",
                displayName: "Sharma Timber Suppliers",
                email: "vendor@sharmatimber.in",
            },
        });
        const vendor2 = await prisma.contact.create({
            data: {
                companyId: company.id,
                contactType: "vendor",
                displayName: "Modern Hardware Co.",
                email: "accounts@modernhardware.in",
            },
        });
        const vendor3 = await prisma.contact.create({
            data: {
                companyId: company.id,
                contactType: "vendor",
                displayName: "Urban Logistics",
                email: "billing@urbanlogistics.in",
            },
        });
        console.log("✅ Created vendor:", vendor.displayName);
        // Create Contact (Customer)
        const customer = await prisma.contact.create({
            data: {
                companyId: company.id,
                contactType: "customer",
                displayName: "Rahul Verma",
                email: "rahul.verma@example.in",
            },
        });
        const customer2 = await prisma.contact.create({
            data: {
                companyId: company.id,
                contactType: "customer",
                displayName: "Aarav Enterprises",
                email: "finance@aarav-enterprises.in",
            },
        });
        const customer3 = await prisma.contact.create({
            data: {
                companyId: company.id,
                contactType: "customer",
                displayName: "BlueLine Interiors",
                email: "payables@bluelineinteriors.in",
            },
        });
        console.log("✅ Created customer:", customer.displayName);
        // Create Analytic Account
        const analytic = await prisma.analyticAccount.create({
            data: {
                companyId: company.id,
                code: "AA001",
                name: "Department A",
            },
        });
        const analytic2 = await prisma.analyticAccount.create({
            data: {
                companyId: company.id,
                code: "AA002",
                name: "Retail Expansion",
            },
        });
        const analytic3 = await prisma.analyticAccount.create({
            data: {
                companyId: company.id,
                code: "AA003",
                name: "Logistics",
            },
        });
        console.log("✅ Created analytic account:", analytic.name);
        // Create Budget + Revision
        await prisma.budget.create({
            data: {
                companyId: company.id,
                name: "FY 2025-26 Budget",
                periodStart: new Date("2025-04-01"),
                periodEnd: new Date("2026-03-31"),
                status: "approved",
                totalBudgeted: 500000,
                totalActual: 265000,
                totalRemaining: 235000,
                totalForecast: 520000,
                utilizationPct: 53,
                revisions: {
                    create: {
                        revisionNo: 1,
                        revisionReason: "Initial annual allocation",
                        lines: {
                            create: [{ analyticAccountId: analytic.id, amount: 500000 }],
                        },
                    },
                },
            },
        });
        // Create Users
        const adminPassword = await bcrypt.hash("Admin@123", 10);
        const portalPassword = await bcrypt.hash("Portal@123", 10);
        await prisma.user.create({
            data: {
                email: "admin@example.com",
                loginId: "ADMIN1",
                passwordHash: adminPassword,
                role: "ADMIN",
                isActive: true,
            },
        });
        await prisma.user.create({
            data: {
                email: "rahul.verma@example.in",
                loginId: "PORT01",
                passwordHash: portalPassword,
                role: "PORTAL",
                contactId: customer.id,
                isActive: true,
            },
        });
        // Create Purchase Order
        const po = await prisma.purchaseOrder.create({
            data: {
                companyId: company.id,
                poNo: "PO-2026-001",
                vendorId: vendor.id,
                orderDate: new Date("2026-01-10"),
                deliveryDate: new Date("2026-02-05"),
                status: "confirmed",
                currency: "INR",
                notes: "Raw materials for Q1 production",
                lines: {
                    create: [
                        {
                            productId: product.id,
                            analyticAccountId: analytic.id,
                            description: "Sheesham Wood Chair material",
                            qty: 10,
                            unitPrice: 2400,
                            taxRate: 18,
                            lineTotal: 10 * 2400 * 1.18,
                        },
                    ],
                },
            },
        });
        // Create Vendor Bill
        const billTotal = 10 * 2400 * 1.18;
        const vendorBill = await prisma.vendorBill.create({
            data: {
                companyId: company.id,
                billNo: "VB-2026-001",
                vendorId: vendor.id,
                billDate: new Date("2026-01-15"),
                dueDate: new Date("2026-02-05"),
                status: "posted",
                currency: "INR",
                poId: po.id,
                totalAmount: billTotal,
                paidAmount: billTotal,
                paymentState: "Paid",
                lines: {
                    create: [
                        {
                            productId: product.id,
                            analyticAccountId: analytic.id,
                            glAccountId: glCogs.id,
                            description: "Raw material bill",
                            qty: 10,
                            unitPrice: 2400,
                            taxRate: 18,
                            lineTotal: billTotal,
                        },
                    ],
                },
            },
        });
        // Create Sales Order
        const so = await prisma.salesOrder.create({
            data: {
                companyId: company.id,
                soNo: "SO-2026-001",
                customerId: customer.id,
                orderDate: new Date("2026-01-20"),
                deliveryDate: new Date("2026-02-10"),
                status: "confirmed",
                currency: "INR",
                notes: "Bulk order for showroom",
                lines: {
                    create: [
                        {
                            productId: product2.id,
                            analyticAccountId: analytic.id,
                            description: "Oakwood Study Table",
                            qty: 5,
                            unitPrice: 12500,
                            taxRate: 18,
                            lineTotal: 5 * 12500 * 1.18,
                        },
                    ],
                },
            },
        });
        // Create Customer Invoice
        const invoiceTotal = 5 * 12500 * 1.18;
        const invoice = await prisma.customerInvoice.create({
            data: {
                companyId: company.id,
                invoiceNo: "INV-2026-0142",
                customerId: customer.id,
                invoiceDate: new Date("2026-01-22"),
                dueDate: new Date("2026-02-15"),
                status: "posted",
                currency: "INR",
                soId: so.id,
                totalAmount: invoiceTotal,
                paidAmount: invoiceTotal,
                paymentState: "Paid",
                lines: {
                    create: [
                        {
                            productId: product2.id,
                            analyticAccountId: analytic.id,
                            glAccountId: glSales.id,
                            description: "Study table invoice",
                            qty: 5,
                            unitPrice: 12500,
                            taxRate: 18,
                            lineTotal: invoiceTotal,
                        },
                    ],
                },
            },
        });
        // Create Payment
        const payment = await prisma.payment.create({
            data: {
                companyId: company.id,
                direction: "inbound",
                contactId: customer.id,
                paymentDate: new Date("2026-01-25"),
                method: "bank",
                reference: "INV-2026-0142 Payment",
                amount: invoiceTotal,
                status: "posted",
                allocations: {
                    create: [
                        {
                            targetType: "customer_invoice",
                            targetId: invoice.id,
                            amount: invoiceTotal,
                        },
                    ],
                },
            },
        });
        // Create Journal Entry (Transaction)
        await prisma.journalEntry.create({
            data: {
                companyId: company.id,
                entryDate: new Date("2026-01-25"),
                status: "posted",
                sourceType: "payment",
                sourceId: payment.id,
                memo: "Payment received for INV-2026-0142",
                postedAt: new Date("2026-01-25"),
                lines: {
                    create: [
                        {
                            glAccountId: glSales.id,
                            analyticAccountId: analytic.id,
                            contactId: customer.id,
                            description: "Revenue posted",
                            debit: 0,
                            credit: invoiceTotal,
                        },
                        {
                            glAccountId: glCogs.id,
                            analyticAccountId: analytic.id,
                            contactId: customer.id,
                            description: "Cash received",
                            debit: invoiceTotal,
                            credit: 0,
                        },
                    ],
                },
            },
        });
        await prisma.journalEntry.create({
            data: {
                companyId: company.id,
                entryDate: new Date("2026-01-28"),
                status: "posted",
                sourceType: "manual",
                memo: "Logistics expense allocation",
                postedAt: new Date("2026-01-28"),
                lines: {
                    create: [
                        {
                            glAccountId: glCogs.id,
                            analyticAccountId: analytic3.id,
                            contactId: vendor3.id,
                            description: "Freight charges",
                            debit: 18500,
                            credit: 0,
                        },
                        {
                            glAccountId: glSales.id,
                            analyticAccountId: analytic3.id,
                            contactId: vendor3.id,
                            description: "Cash outflow",
                            debit: 0,
                            credit: 18500,
                        },
                    ],
                },
            },
        });
        // Additional Vendor Bill for variety
        await prisma.vendorBill.create({
            data: {
                companyId: company.id,
                billNo: "VB-2026-002",
                vendorId: vendor2.id,
                billDate: new Date("2026-01-26"),
                dueDate: new Date("2026-02-20"),
                status: "draft",
                currency: "INR",
                totalAmount: 8500,
                paidAmount: 0,
                paymentState: "Not Paid",
                lines: {
                    create: [
                        {
                            productId: product3.id,
                            analyticAccountId: analytic2.id,
                            glAccountId: glCogs.id,
                            description: "Hardware accessories",
                            qty: 2,
                            unitPrice: 3600,
                            taxRate: 18,
                            lineTotal: 2 * 3600 * 1.18,
                        },
                    ],
                },
            },
        });
        // Extra customer invoice for variety
        await prisma.customerInvoice.create({
            data: {
                companyId: company.id,
                invoiceNo: "INV-2026-0143",
                customerId: customer3.id,
                invoiceDate: new Date("2026-01-29"),
                dueDate: new Date("2026-02-18"),
                status: "draft",
                currency: "INR",
                totalAmount: 15000,
                paidAmount: 0,
                paymentState: "Not Paid",
                lines: {
                    create: [
                        {
                            productId: product.id,
                            analyticAccountId: analytic2.id,
                            glAccountId: glSales.id,
                            description: "Prototype order",
                            qty: 3,
                            unitPrice: 4500,
                            taxRate: 12,
                            lineTotal: 3 * 4500 * 1.12,
                        },
                    ],
                },
            },
        });
        console.log("\n✅ All data seeded successfully!");
    }
    catch (e) {
        console.error("❌ Error:", e.message);
        throw e;
    }
}
main()
    .catch(console.error)
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map