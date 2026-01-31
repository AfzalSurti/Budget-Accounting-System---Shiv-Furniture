"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus, Search } from "lucide-react";

const transactionsData = [
  {
    id: "TXN001",
    description: "Office Equipment Purchase",
    amount: "$5,250.00",
    type: "Expense",
    category: "Equipment",
    date: "2026-01-28",
    status: "completed" as const,
    costCenter: "Operations",
  },
  {
    id: "TXN002",
    description: "Client Invoice #INV-2026-0142",
    amount: "$12,500.00",
    type: "Income",
    category: "Sales",
    date: "2026-01-27",
    status: "completed" as const,
    costCenter: "Sales",
  },
  {
    id: "TXN003",
    description: "Vendor Payment - ABC Supplies",
    amount: "$3,750.00",
    type: "Expense",
    category: "Supplies",
    date: "2026-01-25",
    status: "completed" as const,
    costCenter: "Manufacturing",
  },
  {
    id: "TXN004",
    description: "Payroll Processing",
    amount: "$45,000.00",
    type: "Expense",
    category: "Payroll",
    date: "2026-01-24",
    status: "completed" as const,
    costCenter: "Admin",
  },
  {
    id: "TXN005",
    description: "Bank Transfer - Vendor Invoice",
    amount: "$8,200.00",
    type: "Expense",
    category: "Utilities",
    date: "2026-01-23",
    status: "pending" as const,
    costCenter: "Operations",
  },
];

export default function TransactionsPage() {
  const columns = [
    {
      key: "date" as const,
      label: "Date",
      sortable: true,
    },
    {
      key: "description" as const,
      label: "Description",
      sortable: true,
    },
    {
      key: "type" as const,
      label: "Type",
      render: (value: string) => (
        <span className={`font-medium ${value === "Income" ? "text-success" : "text-slate-700 dark:text-slate-300"}`}>
          {value}
        </span>
      ),
    },
    {
      key: "amount" as const,
      label: "Amount",
      render: (value: string, row: typeof transactionsData[0]) => (
        <span className={`font-mono font-bold ${row.type === "Income" ? "text-success" : "text-slate-700 dark:text-slate-300"}`}>
          {row.type === "Income" ? "+" : "-"}{value}
        </span>
      ),
    },
    {
      key: "costCenter" as const,
      label: "Cost Center",
    },
    {
      key: "status" as const,
      label: "Status",
      render: (value: string) => <StatusBadge status={value as any} label={value} />,
    },
  ];

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="section-heading mb-2">Transactions</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage all financial transactions and account activities</p>
        </div>
        <button className="btn-primary inline-flex items-center gap-2 mt-4 md:mt-0">
          <Plus className="w-5 h-5" />
          New Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all duration-200"
            />
          </div>
        </div>
        <select className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary">
          <option>All Types</option>
          <option>Income</option>
          <option>Expense</option>
        </select>
        <select className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary">
          <option>All Status</option>
          <option>Completed</option>
          <option>Pending</option>
        </select>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={transactionsData} />
    </AppLayout>
  );
}
