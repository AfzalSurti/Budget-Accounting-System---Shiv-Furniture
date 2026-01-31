"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { motion } from "framer-motion";
import { Plus, Search, Filter, ArrowUpRight, ArrowDownRight, FileText } from "lucide-react";
import { useState } from "react";

const transactionsData = [
  {
    id: "TXN001",
    description: "Office Equipment Purchase",
    amount: "₹5,250.00",
    type: "Expense",
    category: "Equipment",
    date: "2026-01-28",
    status: "completed" as const,
    costCenter: "Operations",
  },
  {
    id: "TXN002",
    description: "Client Invoice #INV-2026-0142",
    amount: "₹12,500.00",
    type: "Income",
    category: "Sales",
    date: "2026-01-27",
    status: "completed" as const,
    costCenter: "Sales",
  },
  {
    id: "TXN003",
    description: "Vendor Payment - ABC Supplies",
    amount: "₹3,750.00",
    type: "Expense",
    category: "Supplies",
    date: "2026-01-25",
    status: "completed" as const,
    costCenter: "Manufacturing",
  },
  {
    id: "TXN004",
    description: "Payroll Processing",
    amount: "₹45,000.00",
    type: "Expense",
    category: "Payroll",
    date: "2026-01-24",
    status: "completed" as const,
    costCenter: "Admin",
  },
  {
    id: "TXN005",
    description: "Bank Transfer - Vendor Invoice",
    amount: "₹8,200.00",
    type: "Expense",
    category: "Utilities",
    date: "2026-01-23",
    status: "pending" as const,
    costCenter: "Operations",
  },
];

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="mb-8 pb-6 border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-brand-dark dark:text-white mb-2">Transactions</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Track and manage all financial transactions across cost centers</p>
          </div>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary/90 transition-all duration-200 shadow-sm hover:shadow-md">
            <Plus className="w-4 h-4" />
            New Transaction
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by description, ID, or cost center..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all duration-200 text-sm"
            />
          </div>
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all duration-200 text-sm font-medium min-w-[140px]"
          >
            <option>All Types</option>
            <option>Income</option>
            <option>Expense</option>
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all duration-200 text-sm font-medium min-w-[140px]"
          >
            <option>All Status</option>
            <option>Completed</option>
            <option>Pending</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/70 dark:border-slate-700">
                <th className="px-6 py-4 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Date</span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Description</span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Type</span>
                </th>
                <th className="px-6 py-4 text-right">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Amount</span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Cost Center</span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Status</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-700">
              {transactionsData.map((txn, idx) => (
                <motion.tr
                  key={txn.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className={`group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all duration-200 ${
                    txn.status === "pending" ? "opacity-70" : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{txn.date}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {txn.category === "Sales" && (
                        <FileText className="w-4 h-4 text-slate-400" />
                      )}
                      <span className="text-sm font-medium text-brand-dark dark:text-white group-hover:text-brand-primary transition-colors">
                        {txn.description}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{txn.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {txn.type === "Income" ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-slate-600" />
                      )}
                      <span className={`text-sm font-medium ${
                        txn.type === "Income" 
                          ? "text-emerald-600" 
                          : "text-slate-700 dark:text-slate-300"
                      }`}>
                        {txn.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`text-sm font-semibold font-mono ${
                      txn.type === "Income" 
                        ? "text-emerald-600" 
                        : "text-slate-800 dark:text-slate-200"
                    }`}>
                      {txn.type === "Income" ? "+" : "−"}{txn.amount}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-700 dark:text-slate-300">{txn.costCenter}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      txn.status === "completed"
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30"
                        : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/30"
                    }`}>
                      {txn.status === "completed" ? "Completed" : "Pending"}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </AppLayout>
  );
}
