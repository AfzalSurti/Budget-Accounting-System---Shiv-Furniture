"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { DEFAULT_COMPANY_ID } from "@/config";
import { apiGet } from "@/lib/api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Download, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { exportReportToPDF } from "@/lib/pdf-utils";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";

type TrendRow = {
  period: string;
  actualAmount: number;
  budgetedAmount: number;
};

type BudgetVsActualRow = {
  analyticAccountId: string | null;
  budgetedAmount: number;
  actualAmount: number;
  variance: number;
};

type CostCenter = {
  id: string;
  name: string;
};

export default function ReportsPage() {
  const [reportType, setReportType] = useState("Financial Summary");
  const [timePeriod, setTimePeriod] = useState("Last 6 Months");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [trendData, setTrendData] = useState<TrendRow[]>([]);
  const [costCenterRows, setCostCenterRows] = useState<BudgetVsActualRow[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [error, setError] = useState<string | null>(null);

  const dateRange = useMemo(() => {
    const end = dayjs();
    if (timePeriod === "Last Year") {
      return { start: end.subtract(1, "year").startOf("month"), end };
    }
    if (timePeriod === "YTD") {
      return { start: end.startOf("year"), end };
    }
    if (timePeriod === "Custom Range" && customStart && customEnd) {
      return { start: dayjs(customStart), end: dayjs(customEnd) };
    }
    return { start: end.subtract(5, "month").startOf("month"), end };
  }, [timePeriod, customStart, customEnd]);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const startIso = dateRange.start.toISOString();
        const endIso = dateRange.end.toISOString();
        const [trends, costCenterReport, centers] = await Promise.all([
          apiGet<TrendRow[]>(
            `/reports/dashboard/trends?companyId=${DEFAULT_COMPANY_ID}&start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}`,
          ),
          apiGet<BudgetVsActualRow[]>(
            `/reports/budget-vs-actual?companyId=${DEFAULT_COMPANY_ID}&start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}`,
          ),
          apiGet<CostCenter[]>(`/analytical-accounts?companyId=${DEFAULT_COMPANY_ID}`),
        ]);
        setTrendData(trends ?? []);
        setCostCenterRows(costCenterReport ?? []);
        setCostCenters(centers ?? []);
      } catch (loadError) {
        console.error("Failed to load reports:", loadError);
        setError("Failed to load reports.");
      }
    };

    load();
  }, [dateRange]);

  const chartData = useMemo(() => {
    return trendData.map((row) => ({
      month: dayjs(`${row.period}-01`).format("MMM"),
      budget: Number(row.budgetedAmount || 0),
      actual: Number(row.actualAmount || 0),
      variance: Number(row.budgetedAmount || 0) - Number(row.actualAmount || 0),
    }));
  }, [trendData]);

  const costCenterReport = useMemo(() => {
    const map = new Map(costCenters.map((center) => [center.id, center.name]));
    return costCenterRows.map((row) => ({
      name: row.analyticAccountId ? map.get(row.analyticAccountId) ?? "Unassigned" : "Unassigned",
      budget: Number(row.budgetedAmount || 0),
      actual: Number(row.actualAmount || 0),
      variance: Number(row.variance || 0),
    }));
  }, [costCenterRows, costCenters]);

  const handleExportPDF = () => {
    exportReportToPDF({
      title: "Financial Summary Report",
      date: new Date().toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      companyName: "Shiv Furniture",
      data: costCenterReport,
      columns: [
        { header: "Cost Center", dataKey: "name" },
        { header: "Budget (Rs)", dataKey: "budget" },
        { header: "Actual (Rs)", dataKey: "actual" },
        { header: "Variance (Rs)", dataKey: "variance" },
      ],
    });
  };

  return (
    <AppLayout>
      {/* Page Header - Official Report Style */}
      <div className="mb-8 pb-6 border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-brand-primary/10 rounded-lg">
                <FileText className="w-6 h-6 text-brand-primary" />
              </div>
              <h1 className="text-3xl font-semibold text-brand-dark dark:text-white">Financial Reports</h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Comprehensive financial analysis and reporting for management review
            </p>
          </div>
          <div>
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary/90 hover:shadow-md transition-all duration-200 shadow-sm active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-right">
              Exports reflect current filters and report selection
            </p>
          </div>
        </div>
      </div>

      {/* Report Setup Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card p-6 mb-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Report Configuration</h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all duration-200 text-sm font-medium"
            >
              <option>Financial Summary</option>
              <option>Cost Center Analysis</option>
              <option>Cash Flow Report</option>
              <option>Budget vs Actual</option>
            </select>
          </div>
          <div className="sm:w-56">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Time Period</label>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all duration-200 text-sm font-medium"
            >
              <option>Last 6 Months</option>
              <option>Last Year</option>
              <option>YTD</option>
              <option>Custom Range</option>
            </select>
          </div>
          {timePeriod === "Custom Range" && (
            <div className="flex gap-3 sm:items-end">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Start</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">End</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>
        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
      </motion.div>

      {/* Revenue vs Expenses - Primary Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="card p-8 mb-8"
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-brand-dark dark:text-white mb-1.5">Budget vs Actual</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Monthly budget and actual spend</p>
        </div>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
            <XAxis
              dataKey="month"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
            />
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
              formatter={(value: number, name: string) => [
                <span className="font-semibold font-mono">Rs {value.toLocaleString("en-IN")}</span>,
                <span className="text-xs text-slate-600 ml-2">{name}</span>,
              ]}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
            <Line
              type="monotone"
              dataKey="budget"
              stroke="#0077B6"
              strokeWidth={3}
              dot={{ fill: "#0077B6", r: 5 }}
              activeDot={{ r: 7 }}
              name="Budget"
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#94a3b8"
              strokeWidth={3}
              dot={{ fill: "#94a3b8", r: 5 }}
              activeDot={{ r: 7 }}
              name="Actual"
            />
            <Line
              type="monotone"
              dataKey="variance"
              stroke="#10B981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "#10B981", r: 4 }}
              activeDot={{ r: 6 }}
              name="Variance"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Cost Center Variance - Accountability */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="card p-8 mb-8"
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-brand-dark dark:text-white mb-1.5">Cost Center Variance</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Budget vs actual spending by department</p>
        </div>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={costCenterReport} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              angle={-45}
              textAnchor="end"
              height={100}
              fontSize={12}
              tickLine={false}
            />
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
              formatter={(value: number) => [
                <span className="font-semibold font-mono">Rs {value.toLocaleString("en-IN")}</span>,
              ]}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
            <Bar dataKey="budget" fill="#94a3b8" name="Budget" radius={[6, 6, 0, 0]} maxBarSize={60} />
            <Bar dataKey="actual" fill="#0077B6" name="Actual" radius={[6, 6, 0, 0]} maxBarSize={60} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Cost Center Summary Table - Validation Layer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="card overflow-hidden"
      >
        <div className="px-8 py-6 border-b border-slate-200/60 dark:border-slate-700/60">
          <h3 className="text-lg font-semibold text-brand-dark dark:text-white">Cost Center Summary</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Detailed breakdown with variance analysis</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/70 dark:border-slate-700">
                <th className="px-8 py-4 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Cost Center</span>
                </th>
                <th className="px-6 py-4 text-right">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Budget</span>
                </th>
                <th className="px-6 py-4 text-right">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Actual</span>
                </th>
                <th className="px-6 py-4 text-right">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Variance</span>
                </th>
                <th className="px-6 py-4 text-right">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">%</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-700">
              {costCenterReport.map((item, idx) => {
                const percentage = item.budget === 0 ? 0 : (item.variance / item.budget) * 100;
                const isUnderBudget = item.variance < 0;

                return (
                  <motion.tr
                    key={item.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all duration-200"
                  >
                    <td className="px-8 py-5">
                      <span className="text-sm font-semibold text-brand-dark dark:text-white">{item.name}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
                        Rs {item.budget.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-sm font-mono font-semibold text-brand-dark dark:text-white">
                        Rs {item.actual.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span
                        className={`text-sm font-mono font-semibold ${
                          isUnderBudget
                            ? "text-emerald-600 dark:text-emerald-500"
                            : "text-rose-600 dark:text-rose-500"
                        }`}
                      >
                        {isUnderBudget ? "-" : "+"}Rs {Math.abs(item.variance).toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span
                        className={`text-sm font-semibold font-mono ${
                          isUnderBudget
                            ? "text-emerald-600 dark:text-emerald-500"
                            : "text-rose-600 dark:text-rose-500"
                        }`}
                      >
                        {isUnderBudget ? "" : "+"}{percentage.toFixed(1)}%
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </AppLayout>
  );
}
