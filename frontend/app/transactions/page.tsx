"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { motion } from "framer-motion";
import { Plus, Search, Filter, ArrowUpRight, ArrowDownRight, FileText, X, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { API_V1, getStoredToken } from "@/config";
import { exportTableToPDF } from "@/lib/pdf-utils";

// Default company ID for now (should be fetched from auth context or config)
const DEFAULT_COMPANY_ID = "00000000-0000-0000-0000-000000000001";

interface TransactionLine {
  id: string;
  description?: string;
  debit: number;
  credit: number;
  glAccount: {
    id: string;
    name: string;
  };
}

interface Transaction {
  id: string;
  entryDate: string;
  status: string;
  memo?: string;
  createdAt: string;
  lines: TransactionLine[];
}

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false);
  const [newTransactionData, setNewTransactionData] = useState({
    entryDate: new Date().toISOString().split("T")[0],
    memo: "",
    lines: [
      {
        glAccountId: "",
        description: "",
        debit: 0,
        credit: 0,
      },
    ],
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = getStoredToken();
      const res = await fetch(`${API_V1}/transactions?companyId=${DEFAULT_COMPANY_ID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data.transactions || []);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async () => {
    try {
      const token = getStoredToken();
      const res = await fetch(`${API_V1}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newTransactionData, companyId: DEFAULT_COMPANY_ID }),
      });

      const data = await res.json();
      if (data.success) {
        setTransactions([data.data, ...transactions]);
        setShowNewTransactionModal(false);
        setNewTransactionData({
          entryDate: new Date().toISOString().split("T")[0],
          memo: "",
          lines: [
            {
              glAccountId: "",
              description: "",
              debit: 0,
              credit: 0,
            },
          ],
        });
      }
    } catch (error) {
      console.error("Failed to create transaction:", error);
    }
  };

  const totalAmount = transactions.reduce((sum, txn) => {
    const txnTotal = txn.lines.reduce((lineSum, line) => lineSum + (line.debit - line.credit), 0);
    return sum + txnTotal;
  }, 0);

  const handleExportPDF = () => {
    const formattedData = transactions.flatMap((txn) => 
      txn.lines.map((line) => ({
        date: txn.entryDate,
        transactionNumber: txn.id,
        type: line.debit > 0 ? "Debit" : "Credit",
        description: line.description || txn.memo || "—",
        amount: line.debit > 0 ? `₹${line.debit.toFixed(2)}` : `₹${line.credit.toFixed(2)}`,
        status: txn.status,
        statusLabel: txn.status,
      }))
    );

    const columns = [
      { header: "Date", key: "date" },
      { header: "Transaction #", key: "transactionNumber" },
      { header: "Type", key: "type" },
      { header: "Description", key: "description" },
      { header: "Amount", key: "amount" },
      { header: "Status", key: "status" },
    ];

    const processedData = formattedData.map((row) => ({
      ...row,
      status: row.statusLabel || row.status,
    }));

    exportTableToPDF("Transactions Report", columns, processedData, "Transactions_Report.pdf");
  };

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="mb-8 pb-6 border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-brand-dark dark:text-white mb-2">Transactions</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Track and manage all financial transactions across cost centers</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-brand-dark dark:text-white rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button 
              onClick={() => setShowNewTransactionModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              New Transaction
            </button>
          </div>
        </div>
      </div>

      {/* New Transaction Modal */}
      {showNewTransactionModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowNewTransactionModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-brand-dark dark:text-white">New Transaction</h2>
              <button
                onClick={() => setShowNewTransactionModal(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Entry Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Entry Date</label>
                <input
                  type="date"
                  value={newTransactionData.entryDate}
                  onChange={(e) =>
                    setNewTransactionData({ ...newTransactionData, entryDate: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                />
              </div>

              {/* Memo */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Memo</label>
                <textarea
                  value={newTransactionData.memo}
                  onChange={(e) =>
                    setNewTransactionData({ ...newTransactionData, memo: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                  rows={3}
                  placeholder="Enter transaction memo"
                />
              </div>

              {/* Transaction Lines */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Transaction Lines</label>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {newTransactionData.lines.map((line, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="GL Account ID"
                        value={line.glAccountId}
                        onChange={(e) => {
                          const updatedLines = [...newTransactionData.lines];
                          updatedLines[idx].glAccountId = e.target.value;
                          setNewTransactionData({ ...newTransactionData, lines: updatedLines });
                        }}
                        className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                      />
                      <input
                        type="number"
                        placeholder="Debit"
                        value={line.debit || ""}
                        onChange={(e) => {
                          const updatedLines = [...newTransactionData.lines];
                          updatedLines[idx].debit = parseFloat(e.target.value) || 0;
                          setNewTransactionData({ ...newTransactionData, lines: updatedLines });
                        }}
                        className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                      />
                      <input
                        type="number"
                        placeholder="Credit"
                        value={line.credit || ""}
                        onChange={(e) => {
                          const updatedLines = [...newTransactionData.lines];
                          updatedLines[idx].credit = parseFloat(e.target.value) || 0;
                          setNewTransactionData({ ...newTransactionData, lines: updatedLines });
                        }}
                        className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateTransaction}
                  className="flex-1 px-4 py-2.5 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary/90 transition-all"
                >
                  Create Transaction
                </button>
                <button
                  onClick={() => setShowNewTransactionModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

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
            <option>draft</option>
            <option>posted</option>
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
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No transactions found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/70 dark:border-slate-700">
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Date</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Memo</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">GL Account</span>
                  </th>
                  <th className="px-6 py-4 text-right">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Debit</span>
                  </th>
                  <th className="px-6 py-4 text-right">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Credit</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Status</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-slate-700">
                {transactions.map((txn, txnIdx) =>
                  txn.lines.map((line, lineIdx) => (
                    <motion.tr
                      key={`${txn.id}-${lineIdx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: txnIdx * 0.05 }}
                      className="group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{txn.entryDate}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-brand-dark dark:text-white group-hover:text-brand-primary transition-colors">
                          {txn.memo || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{line.glAccount.name}</span>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{line.description || "—"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-semibold font-mono text-emerald-600">
                          {line.debit > 0 ? `₹${line.debit.toFixed(2)}` : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-semibold font-mono text-red-600">
                          {line.credit > 0 ? `₹${line.credit.toFixed(2)}` : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          txn.status === "posted"
                            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30"
                            : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/30"
                        }`}>
                          {txn.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}

