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

interface GlAccountOption {
  id: string;
  code: string;
  name: string;
  accountType: string;
}

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [glAccounts, setGlAccounts] = useState<GlAccountOption[]>([]);
  const [createError, setCreateError] = useState<string | null>(null);
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
    fetchGlAccounts();
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

  const fetchGlAccounts = async () => {
    try {
      const token = getStoredToken();
      const res = await fetch(`${API_V1}/gl-accounts?companyId=${DEFAULT_COMPANY_ID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setGlAccounts(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch GL accounts:", error);
    }
  };

  const handleCreateTransaction = async () => {
    try {
      setCreateError(null);
      const hasInvalidLine = newTransactionData.lines.some(
        (line) => !line.glAccountId || (!line.debit && !line.credit),
      );
      if (hasInvalidLine) {
        setCreateError("Select a GL account and enter a debit or credit amount.");
        return;
      }
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
        setCreateError(null);
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
      } else {
        setCreateError(data?.message || "Failed to create transaction.");
      }
    } catch (error) {
      console.error("Failed to create transaction:", error);
      setCreateError("Failed to create transaction.");
    }
  };

  const filteredRows = transactions
    .flatMap((txn) => {
      const memo = txn.memo ?? "";
      const isSalesOrder = memo.startsWith("Sales Order");
      const isPurchaseOrder = memo.startsWith("Purchase Order");

      if (isSalesOrder || isPurchaseOrder) {
        const totalCredit = txn.lines.reduce((sum, line) => sum + Number(line.credit || 0), 0);
        const totalDebit = txn.lines.reduce((sum, line) => sum + Number(line.debit || 0), 0);
        const amount = isSalesOrder ? totalCredit : totalDebit;
        const type = isSalesOrder ? "Income" : "Expense";
        const glAccountName = isSalesOrder
          ? txn.lines.find((line) => Number(line.credit || 0) > 0)?.glAccount?.name ?? "Sales Revenue"
          : txn.lines.find((line) => Number(line.debit || 0) > 0)?.glAccount?.name ?? "Operating Expense";

        return [
          {
            txn,
            line: {
              id: `${txn.id}-summary`,
              description: isSalesOrder ? "Sales Order" : "Purchase Order",
              debit: isSalesOrder ? 0 : amount,
              credit: isSalesOrder ? amount : 0,
              glAccount: { id: "summary", name: glAccountName },
            },
            amount: isSalesOrder ? amount : -amount,
            type,
            isSummary: true,
          },
        ];
      }

      return txn.lines.map((line) => {
        const amount = Number(line.credit || 0) - Number(line.debit || 0);
        const type = amount >= 0 ? "Income" : "Expense";
        return { txn, line, amount, type, isSummary: false };
      });
    })
    .filter(({ txn, line, type }) => {
      const search = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !search
        || txn.id.toLowerCase().includes(search)
        || (txn.memo ?? "").toLowerCase().includes(search)
        || (line.description ?? "").toLowerCase().includes(search)
        || (line.glAccount?.name ?? "").toLowerCase().includes(search);

      const matchesStatus = statusFilter === "All Status" || txn.status === statusFilter;
      const matchesType =
        typeFilter === "All Types"
          || (typeFilter === "Income" && type === "Income")
          || (typeFilter === "Expense" && type === "Expense");

      return matchesSearch && matchesStatus && matchesType;
    });

  const handleExportPDF = () => {
    const formattedData = filteredRows.map(({ txn, line, amount, type }) => ({
      date: txn.entryDate,
      transactionNumber: txn.id,
      type,
      description: line.description || txn.memo || "—",
      amount: `₹${Math.abs(amount).toFixed(2)}`,
      status: txn.status,
      statusLabel: txn.status,
    }));

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
                      <select
                        value={line.glAccountId}
                        onChange={(e) => {
                          const updatedLines = [...newTransactionData.lines];
                          updatedLines[idx].glAccountId = e.target.value;
                          setNewTransactionData({ ...newTransactionData, lines: updatedLines });
                        }}
                        className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                      >
                        <option value="">Select GL Account</option>
                        {glAccounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.code} - {account.name}
                          </option>
                        ))}
                      </select>
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

              {createError && (
                <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200/60 dark:border-red-800/40 rounded-lg px-3 py-2">
                  {createError}
                </div>
              )}

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
        ) : filteredRows.length === 0 ? (
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
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Type</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">GL Account</span>
                  </th>
                  <th className="px-6 py-4 text-right">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Amount</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Status</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-slate-700">
                {filteredRows.map(({ txn, line, amount, type }, rowIdx) => (
                  <motion.tr
                    key={`${txn.id}-${line.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: rowIdx * 0.02 }}
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
                      <span className={`text-sm font-semibold ${type === "Income" ? "text-emerald-600" : "text-red-600"}`}>{type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{line.glAccount.name}</span>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{line.description || "—"}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`text-sm font-semibold font-mono ${amount >= 0 ? "text-emerald-600" : "text-red-600"}`}>{`₹${Math.abs(amount).toFixed(2)}`}</span>
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}




