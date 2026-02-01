"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { DEFAULT_COMPANY_ID } from "@/config";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { exportTableToPDF } from "@/lib/pdf-utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Plus, AlertCircle, Pencil, X, Download } from "lucide-react";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

type BudgetStatus = "draft" | "approved" | "archived";

type ViewStatus = "active" | "warning" | "archived";

interface BackendBudgetLine {
  analyticAccountId: string;
  amount: number;
}

interface BackendBudgetRevision {
  id: string;
  revisionNo: number;
  revisionReason: string | null;
  lines: BackendBudgetLine[];
}

interface BackendBudget {
  id: string;
  name: string;
  status: BudgetStatus;
  periodStart: string;
  periodEnd: string;
  revisions: BackendBudgetRevision[];
}

interface BackendCostCenter {
  id: string;
  name: string;
  code: string | null;
  isActive: boolean;
}

interface BudgetLineView {
  analyticAccountId: string;
  costCenterName: string;
  amount: number;
}

interface BudgetView {
  id: string;
  name: string;
  status: BudgetStatus;
  periodStart: string;
  periodEnd: string;
  allocated: number;
  spent: number;
  remaining: number;
  utilization: number;
  viewStatus: ViewStatus;
  costCenterLabel: string;
  lines: BudgetLineView[];
}

interface BudgetDraftLine {
  analyticAccountId: string;
  amount: number;
}

interface BudgetDraft {
  name: string;
  periodStart: string;
  periodEnd: string;
  lines: BudgetDraftLine[];
  status: BudgetStatus;
}

interface ReportRow {
  analyticAccountId: string | null;
  actualAmount: number;
}

const formatINR = (value: number) => `Rs ${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const formatPeriodLabel = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.valueOf()) || Number.isNaN(e.valueOf())) return "";
  return `${s.toLocaleDateString()} - ${e.toLocaleDateString()}`;
};

const getLatestRevision = (budget: BackendBudget) => {
  if (!budget.revisions || budget.revisions.length === 0) return null;
  return budget.revisions.reduce((latest, current) =>
    current.revisionNo > latest.revisionNo ? current : latest
  );
};

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<BudgetView[]>([]);
  const [costCenters, setCostCenters] = useState<BackendCostCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reviseOf, setReviseOf] = useState<BudgetView | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | BudgetStatus>("all");
  const [costCenterFilter, setCostCenterFilter] = useState<string>("all");

  const loadCostCenters = useCallback(async () => {
    const data = await apiGet<BackendCostCenter[]>(
      `/analytical-accounts?companyId=${DEFAULT_COMPANY_ID}`,
    );
    return data ?? [];
  }, []);

  const loadSpentForBudget = useCallback(async (budget: BackendBudget) => {
    const latest = getLatestRevision(budget);
    if (!latest || latest.lines.length === 0) return 0;
    const start = new Date(budget.periodStart).toISOString();
    const end = new Date(budget.periodEnd).toISOString();
    const rows = await apiGet<ReportRow[]>(
      `/reports/budget-vs-actual?companyId=${DEFAULT_COMPANY_ID}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
    );
    const ids = new Set(latest.lines.map((line) => line.analyticAccountId));
    return (rows ?? []).reduce((acc, row) => {
      if (row.analyticAccountId && ids.has(row.analyticAccountId)) {
        return acc + Number(row.actualAmount || 0);
      }
      return acc;
    }, 0);
  }, []);

  const loadBudgets = useCallback(async (centers: BackendCostCenter[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiGet<BackendBudget[]>(
        `/budgets?companyId=${DEFAULT_COMPANY_ID}`,
      );
      const budgetsData = data ?? [];
      const spentEntries = await Promise.all(
        budgetsData.map(async (budget) => ({
          id: budget.id,
          spent: await loadSpentForBudget(budget),
        }))
      );
      const spentMap = new Map(spentEntries.map((entry) => [entry.id, entry.spent]));

      const centersMap = new Map(centers.map((center) => [center.id, center]));
      const mapped = budgetsData.map((budget) => {
        const latest = getLatestRevision(budget);
        const lines = (latest?.lines ?? []).map((line) => {
          const center = centersMap.get(line.analyticAccountId);
          return {
            analyticAccountId: line.analyticAccountId,
            costCenterName: center?.name ?? "Unknown",
            amount: Number(line.amount),
          };
        });
        const allocated = lines.reduce((acc, line) => acc + Number(line.amount), 0);
        const spent = spentMap.get(budget.id) ?? 0;
        const remaining = Math.max(allocated - spent, 0);
        const utilization = allocated === 0 ? 0 : (spent / allocated) * 100;
        const status: ViewStatus =
          budget.status === "archived"
            ? "archived"
            : utilization > 85
            ? "warning"
            : "active";
        const costCenterLabel =
          lines.length === 0
            ? "Unassigned"
            : lines.length === 1
            ? lines[0].costCenterName
            : "Multiple";

        return {
          id: budget.id,
          name: budget.name,
          status: budget.status,
          periodStart: budget.periodStart,
          periodEnd: budget.periodEnd,
          allocated,
          spent,
          remaining,
          utilization,
          viewStatus: status,
          costCenterLabel,
          lines,
        };
      });

      setBudgets(mapped);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Failed to load budgets";
      console.error("Failed to load budgets:", loadError);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [loadSpentForBudget]);

  const loadAll = useCallback(async () => {
    const centers = await loadCostCenters();
    setCostCenters(centers);
    await loadBudgets(centers);
  }, [loadCostCenters, loadBudgets]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleCreateBudget = async (draft: BudgetDraft) => {
    setIsSaving(true);
    setError(null);
    try {
      await apiPost("/budgets", {
        companyId: DEFAULT_COMPANY_ID,
        name: draft.name.trim(),
        periodStart: draft.periodStart,
        periodEnd: draft.periodEnd,
        status: draft.status,
        lines: draft.lines.filter((line) => line.amount > 0),
      });
      await loadBudgets(costCenters);
      setDialogOpen(false);
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : "Failed to create budget";
      console.error("Failed to create budget:", createError);
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReviseBudget = async (budgetId: string, lines: BudgetDraftLine[], reason: string) => {
    setIsSaving(true);
    setError(null);
    try {
      await apiPut(`/budgets/${budgetId}`, {
        revisionReason: reason || null,
        lines: lines.filter((line) => line.amount > 0),
      });
      await loadBudgets(costCenters);
      setReviseOf(null);
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : "Failed to revise budget";
      console.error("Failed to revise budget:", updateError);
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredBudgets = useMemo(() => {
    return budgets.filter((budget) => {
      const statusOk = statusFilter === "all" || budget.status === statusFilter;
      const costCenterOk =
        costCenterFilter === "all"
          ? true
          : budget.lines.some((line) => line.analyticAccountId === costCenterFilter);
      return statusOk && costCenterOk;
    });
  }, [budgets, statusFilter, costCenterFilter]);

  const chartData = useMemo(
    () =>
      filteredBudgets.map((budget) => ({
        name: budget.name,
        allocated: budget.allocated,
        spent: budget.spent,
        remaining: budget.remaining,
      })),
    [filteredBudgets]
  );

  const handleExportPDF = () => {
    const columns = [
      { header: "Budget ID", key: "id" },
      { header: "Budget Name", key: "name" },
      { header: "Cost Center", key: "costCenter" },
      { header: "Allocated", key: "allocated" },
      { header: "Spent", key: "spent" },
      { header: "Remaining", key: "remaining" },
      { header: "Utilization", key: "utilization" },
      { header: "Status", key: "status" },
      { header: "Period", key: "period" },
    ];

    const pdfData = filteredBudgets.map((budget) => ({
      id: budget.id,
      name: budget.name,
      costCenter: budget.costCenterLabel,
      allocated: formatINR(budget.allocated),
      spent: formatINR(budget.spent),
      remaining: formatINR(budget.remaining),
      utilization: `${budget.utilization.toFixed(1)}%`,
      status: budget.status,
      period: formatPeriodLabel(budget.periodStart, budget.periodEnd),
    }));

    exportTableToPDF("Budget Summary Report", columns, pdfData, "budget_summary.pdf");
  };

  return (
    <AppLayout>
      <div className="mb-8 pb-6 border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-brand-dark dark:text-white mb-2">Budget Management</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Plan, monitor, and control budgets across cost centers with real-time insights</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-brand-primary border border-brand-primary rounded-lg font-medium hover:bg-brand-primary/10 hover:shadow-md transition-all duration-200 shadow-sm active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button
              onClick={() => setDialogOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary/90 hover:shadow-md transition-all duration-200 shadow-sm active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Create Budget
            </button>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card p-8 mb-8"
      >
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-brand-dark dark:text-white mb-1.5">Budget Overview</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Allocated vs Spent per budget (actual data)</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | BudgetStatus)}
                className="px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
              >
                <option value="all">All</option>
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Cost Center</label>
              <select
                value={costCenterFilter}
                onChange={(e) => setCostCenterFilter(e.target.value)}
                className="px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
              >
                <option value="all">All</option>
                {costCenters.map((center) => (
                  <option key={center.id} value={center.id}>
                    {center.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              tickFormatter={(value) => `Rs ${(value / 1000).toFixed(0)}K`}
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
              formatter={(value: number, name: string) => [
                <span className="font-semibold font-mono">Rs {value.toLocaleString("en-IN")}</span>,
                <span className="text-xs text-slate-600 ml-2">{name}</span>,
              ]}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
            <Bar dataKey="allocated" fill="#94a3b8" name="Allocated" radius={[6, 6, 0, 0]} maxBarSize={60} />
            <Bar dataKey="spent" fill="#0077B6" name="Spent" radius={[6, 6, 0, 0]} maxBarSize={60} />
            <Bar dataKey="remaining" fill="#90E0EF" name="Remaining" radius={[6, 6, 0, 0]} maxBarSize={60} opacity={0.7} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

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

        {error && (
          <div className="px-8 py-4 text-sm text-red-600">{error}</div>
        )}

        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading budgets...</div>
        ) : (
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
                {filteredBudgets.map((budget, idx) => {
                  const utilization = budget.utilization;
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
                          {isHighUtilization && <AlertCircle className="w-4 h-4 text-amber-500" />}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{budget.id}</span>
                        <div className="text-xs text-slate-400">{formatPeriodLabel(budget.periodStart, budget.periodEnd)}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm text-slate-700 dark:text-slate-300">{budget.costCenterLabel}</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="text-sm font-mono text-slate-600 dark:text-slate-400">{formatINR(budget.allocated)}</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="text-sm font-mono font-semibold text-brand-dark dark:text-white">{formatINR(budget.spent)}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${utilization.toFixed(1)}%` }}
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
                          <span
                            className={`text-sm font-semibold font-mono min-w-[48px] text-right ${
                              isHighUtilization
                                ? "text-amber-600 dark:text-amber-500"
                                : isMediumUtilization
                                ? "text-brand-primary"
                                : "text-emerald-600 dark:text-emerald-500"
                            }`}
                          >
                            {utilization.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            budget.viewStatus === "active"
                              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30"
                              : budget.viewStatus === "warning"
                              ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/30"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/30"
                          }`}
                        >
                          {budget.viewStatus === "active" ? "Active" : budget.viewStatus === "warning" ? "Warning" : "Archived"}
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
        )}
      </motion.div>

      {dialogOpen && (
        <CreateBudgetDialog
          costCenters={costCenters}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleCreateBudget}
          isSaving={isSaving}
        />
      )}

      {reviseOf && (
        <ReviseDialog
          budget={reviseOf}
          costCenters={costCenters}
          onClose={() => setReviseOf(null)}
          onSubmit={(lines, reason) => handleReviseBudget(reviseOf.id, lines, reason)}
          isSaving={isSaving}
        />
      )}
    </AppLayout>
  );
}

function CreateBudgetDialog({
  costCenters,
  onClose,
  onSubmit,
  isSaving,
}: {
  costCenters: BackendCostCenter[];
  onClose: () => void;
  onSubmit: (draft: BudgetDraft) => void;
  isSaving: boolean;
}) {
  const [name, setName] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [lines, setLines] = useState<Record<string, string>>({});

  const handleAmountChange = (id: string, value: string) => {
    setLines((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const draftLines = Object.entries(lines)
      .map(([analyticAccountId, amount]) => ({
        analyticAccountId,
        amount: Number(amount) || 0,
      }))
      .filter((line) => line.amount > 0);

    onSubmit({
      name,
      periodStart,
      periodEnd,
      status: "approved",
      lines: draftLines,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Create Budget</h2>
          <button onClick={onClose} className="rounded-full border border-slate-300 p-2 dark:border-slate-700" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Budget Name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Period Start
              <input
                required
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Period End
              <input
                required
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
              />
            </label>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Allocate by Cost Center</p>
            <div className="mt-2 space-y-3">
              {costCenters.map((center) => (
                <div key={center.id} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-600 dark:text-slate-300">{center.name}</span>
                  <input
                    type="number"
                    min={0}
                    value={lines[center.id] ?? ""}
                    onChange={(e) => handleAmountChange(center.id, e.target.value)}
                    className="w-40 rounded-md border border-slate-300 px-3 py-2 text-right font-mono dark:border-slate-700 dark:bg-slate-800"
                    placeholder="0"
                  />
                </div>
              ))}
              {costCenters.length === 0 && (
                <p className="text-sm text-slate-500">No cost centers found. Create cost centers first.</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Creating..." : "Create Budget"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReviseDialog({
  budget,
  costCenters,
  onClose,
  onSubmit,
  isSaving,
}: {
  budget: BudgetView;
  costCenters: BackendCostCenter[];
  onClose: () => void;
  onSubmit: (lines: BudgetDraftLine[], reason: string) => void;
  isSaving: boolean;
}) {
  const initial = useMemo(() => {
    const map = new Map(budget.lines.map((line) => [line.analyticAccountId, line.amount]));
    const result: Record<string, string> = {};
    costCenters.forEach((center) => {
      const amount = map.get(center.id) ?? 0;
      result[center.id] = amount ? String(amount) : "";
    });
    return result;
  }, [budget.lines, costCenters]);

  const [amounts, setAmounts] = useState<Record<string, string>>(initial);
  const [reason, setReason] = useState("");

  const handleAmountChange = (id: string, value: string) => {
    setAmounts((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = Object.entries(amounts)
      .map(([analyticAccountId, amount]) => ({
        analyticAccountId,
        amount: Number(amount) || 0,
      }))
      .filter((line) => line.amount > 0);
    onSubmit(lines, reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Revise Budget - {budget.name}</h2>
          <button onClick={onClose} className="rounded-full border border-slate-300 p-2 dark:border-slate-700" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Update Allocations</p>
            <div className="mt-2 space-y-3">
              {costCenters.map((center) => (
                <div key={center.id} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-600 dark:text-slate-300">{center.name}</span>
                  <input
                    type="number"
                    min={0}
                    value={amounts[center.id] ?? ""}
                    onChange={(e) => handleAmountChange(center.id, e.target.value)}
                    className="w-40 rounded-md border border-slate-300 px-3 py-2 text-right font-mono dark:border-slate-700 dark:bg-slate-800"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Revision Reason (optional)
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
              rows={3}
              placeholder="E.g. scope change, updated forecasts"
            />
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Apply Revision"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 rounded-md border border-slate-300 px-4 py-2 text-sm dark:border-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
