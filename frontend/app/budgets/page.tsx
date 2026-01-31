"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Plus, AlertCircle, Pencil, X } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

const budgetsData = [
  {
    id: "BUD001",
    name: "Manufacturing Operations",
    allocated: "₹1,25,000",
    spent: "₹1,08,500",
    remaining: "₹16,500",
    utilization: "86.8%",
    status: "active" as const,
    costCenter: "Manufacturing",
  },
  {
    id: "BUD002",
    name: "Sales & Marketing",
    allocated: "₹85,000",
    spent: "₹72,300",
    remaining: "₹12,700",
    utilization: "85.1%",
    status: "active" as const,
    costCenter: "Sales",
  },
  {
    id: "BUD003",
    name: "Administrative",
    allocated: "₹45,000",
    spent: "₹38,200",
    remaining: "₹6,800",
    utilization: "84.9%",
    status: "active" as const,
    costCenter: "Admin",
  },
  {
    id: "BUD004",
    name: "Operations Support",
    allocated: "₹75,000",
    spent: "₹65,400",
    remaining: "₹9,600",
    utilization: "87.2%",
    status: "warning" as const,
    costCenter: "Operations",
  },
  {
    id: "BUD005",
    name: "Capital Expenditure",
    allocated: "₹2,50,000",
    spent: "₹1,80,000",
    remaining: "₹70,000",
    utilization: "72.0%",
    status: "active" as const,
    costCenter: "Capital",
  },
];

const budgetTrendData = [
  { month: "Jan", allocated: 375000, spent: 320000, forecast: 340000 },
  { month: "Feb", allocated: 375000, spent: 325000, forecast: 355000 },
  { month: "Mar", allocated: 385000, spent: 330000, forecast: 360000 },
  { month: "Apr", allocated: 395000, spent: 335000, forecast: 365000 },
  { month: "May", allocated: 405000, spent: 340000, forecast: 370000 },
  { month: "Jun", allocated: 415000, spent: 345000, forecast: 375000 },
];

function parseINR(str: string): number {
  const digits = str.replace(/[^0-9.-]/g, "");
  const n = Number(digits);
  return Number.isFinite(n) ? n : 0;
}

function formatINR(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState(budgetsData);
  const [reviseOf, setReviseOf] = useState<typeof budgetsData[number] | null>(null);
  
  const totals = useMemo(() => {
    return budgets.reduce(
      (acc, b) => {
        acc.allocated += parseINR(b.allocated);
        acc.spent += parseINR(b.spent);
        return acc;
      },
      { allocated: 0, spent: 0 }
    );
  }, [budgets]);

  return (
    <AppLayout>
      {/* Page Header - Executive Level */}
      <div className="mb-8 pb-6 border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-brand-dark dark:text-white mb-2">Budget Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Plan, monitor, and control budgets across cost centers with real-time insights</p>
          </div>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary/90 hover:shadow-md transition-all duration-200 shadow-sm active:scale-[0.98]">
            <Plus className="w-4 h-4" />
            Create Budget
          </button>
        </div>
      </div>

      {/* Budget vs Actual Trend - Primary Insight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card p-8 mb-8"
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-brand-dark dark:text-white mb-1.5">Budget vs Actual Trend</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Allocated vs Spent vs Forecast over time</p>
        </div>
        
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={budgetTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
            <XAxis 
              dataKey="month" 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.98)",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                padding: "12px 16px",
              }}
              cursor={{ fill: "rgba(0, 119, 182, 0.05)" }}
              formatter={(value: number, name: string) => {
                const variance = name === "spent" && budgetTrendData ? 
                  ((value / budgetTrendData[0].allocated) * 100 - 100).toFixed(1) : null;
                return [
                  <span className="font-semibold font-mono">₹{value.toLocaleString('en-IN')}</span>,
                  <span className="text-xs text-slate-600 ml-2">
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </span>
                ];
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
            />
            <Bar 
              dataKey="allocated" 
              fill="#94a3b8" 
              name="Allocated"
              radius={[6, 6, 0, 0]}
              maxBarSize={60}
            />
            <Bar 
              dataKey="spent" 
              fill="#0077B6" 
              name="Spent"
              radius={[6, 6, 0, 0]}
              maxBarSize={60}
            />
            <Bar 
              dataKey="forecast" 
              fill="#90E0EF" 
              name="Forecast"
              radius={[6, 6, 0, 0]}
              maxBarSize={60}
              opacity={0.7}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Budget Summary Table - Control Center */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="card overflow-hidden"
      >
        <div className="px-8 py-6 border-b border-slate-200/60 dark:border-slate-700/60">
          <h3 className="text-lg font-semibold text-brand-dark dark:text-white">Budget Summary</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Monitor allocation, spending, and utilization across budgets</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/70 dark:border-slate-700">
                <th className="px-8 py-4 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Budget Name</span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Cost Center</span>
                </th>
                <th className="px-6 py-4 text-right">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Allocated</span>
                </th>
                <th className="px-6 py-4 text-right">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Spent</span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Utilization</span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Status</span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-700">
              {budgets.map((budget, idx) => {
                const utilization = parseFloat(budget.utilization);
                const isHighUtilization = utilization > 85;
                const isMediumUtilization = utilization >= 70 && utilization <= 85;
                const isLowUtilization = utilization < 70;
                
                return (
                  <motion.tr
                    key={budget.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all duration-200"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-brand-dark dark:text-white group-hover:text-brand-primary transition-colors">
                          {budget.name}
                        </span>
                        {isHighUtilization && (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{budget.id}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm text-slate-700 dark:text-slate-300">{budget.costCenter}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-sm font-mono text-slate-600 dark:text-slate-400">{budget.allocated}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-sm font-mono font-semibold text-brand-dark dark:text-white">{budget.spent}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: budget.utilization }}
                            transition={{ duration: 0.8, delay: idx * 0.1, ease: "easeOut" }}
                            className={`h-full rounded-full transition-colors ${
                              isHighUtilization 
                                ? "bg-gradient-to-r from-amber-400 to-amber-500"
                                : isMediumUtilization
                                ? "bg-gradient-to-r from-blue-400 to-brand-primary"
                                : "bg-gradient-to-r from-emerald-400 to-emerald-500"
                            }`}
                          ></motion.div>
                        </div>
                        <span className={`text-sm font-semibold font-mono min-w-[48px] text-right ${
                          isHighUtilization 
                            ? "text-amber-600 dark:text-amber-500"
                            : isMediumUtilization
                            ? "text-brand-primary"
                            : "text-emerald-600 dark:text-emerald-500"
                        }`}>
                          {budget.utilization}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        budget.status === "active"
                          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30"
                          : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/30"
                      }`}>
                        {budget.status === "active" ? "Active" : "Warning"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <button
                        onClick={() => setReviseOf(budget)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Revise
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {reviseOf && (
        <ReviseDialog
          budget={reviseOf}
          onClose={() => setReviseOf(null)}
          onSubmit={(nextAllocated: number, reason: string) => {
            setBudgets((prev) =>
              prev.map((b) => {
                if (b.id !== reviseOf.id) return b;
                const spent = parseINR(b.spent);
                const utilizationPct = nextAllocated === 0 ? 0 : (spent / nextAllocated) * 100;
                return {
                  ...b,
                  allocated: formatINR(nextAllocated),
                  remaining: formatINR(Math.max(nextAllocated - spent, 0)),
                  utilization: `${utilizationPct.toFixed(1)}%`,
                };
              })
            );
            setReviseOf(null);
          }}
        />
      )}
    </AppLayout>
  );
}

function ReviseDialog({
  budget,
  onClose,
  onSubmit,
}: {
  budget: typeof budgetsData[number];
  onClose: () => void;
  onSubmit: (nextAllocated: number, reason: string) => void;
}) {
  const [amount, setAmount] = useState<number>(parseINR(budget.allocated));
  const [reason, setReason] = useState<string>("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[24px] border border-slate-300 bg-white p-6 text-slate-900 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
          <h2 className="text-lg font-semibold">Revise Budget — {budget.name}</h2>
          <button onClick={onClose} className="rounded-full border border-slate-300 p-2 dark:border-slate-700" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-4 space-y-4">
          <label className="block text-sm font-medium">New Allocated Amount</label>
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 font-mono dark:border-slate-700 dark:bg-slate-800"
          />
          <label className="block text-sm font-medium">Revision Reason (optional)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
            rows={3}
            placeholder="E.g. Price fluctuations, scope change"
          />
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => onSubmit(amount, reason)}
            className="flex-1 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90"
          >
            Apply Revision
          </button>
          <button onClick={onClose} className="flex-1 rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-700">
            Cancel
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">This updates allocated and recalculates utilization for this budget.</p>
      </div>
    </div>
  );
}
