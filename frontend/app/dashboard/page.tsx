"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { DEFAULT_COMPANY_ID } from "@/config";
import { apiGet } from "@/lib/api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  AlertCircle,
  Target,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";

interface SummaryRow {
  budgeted: number;
  actual: number;
  variance: number;
  achievementPercentage: number;
}

interface TrendRow {
  period: string;
  actualAmount: number;
  budgetedAmount: number;
  forecastAmount: number;
}

interface BudgetVsActualRow {
  analyticAccountId: string | null;
  budgetedAmount: number;
  actualAmount: number;
}

interface CostCenter {
  id: string;
  name: string;
}

const COLOR_PALETTE = ["#0077B6", "#00B4D8", "#90E0EF", "#CAF0F8", "#48CAE4", "#ADE8F4"];

const formatINR = (value: number) => `Rs ${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryRow | null>(null);
  const [trendData, setTrendData] = useState<TrendRow[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [costCenterData, setCostCenterData] = useState<Array<{ name: string; value: number; fill: string }>>([]);

  useEffect(() => {
    const load = async () => {
      const end = dayjs();
      const start = end.subtract(5, "month").startOf("month");
      const startIso = start.toISOString();
      const endIso = end.toISOString();

      const [summaryRow, trends, budgetRows, centers] = await Promise.all([
        apiGet<SummaryRow>(`/reports/dashboard/summary?companyId=${DEFAULT_COMPANY_ID}&start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}`),
        apiGet<TrendRow[]>(`/reports/dashboard/trends?companyId=${DEFAULT_COMPANY_ID}&start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}`),
        apiGet<BudgetVsActualRow[]>(`/reports/budget-vs-actual?companyId=${DEFAULT_COMPANY_ID}&start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}`),
        apiGet<CostCenter[]>(`/analytical-accounts?companyId=${DEFAULT_COMPANY_ID}`),
      ]);

      setSummary(summaryRow ?? null);
      setTrendData(trends ?? []);
      setCostCenters(centers ?? []);

      const totalBudgeted = (budgetRows ?? []).reduce((sum, row) => sum + Number(row.budgetedAmount || 0), 0);
      const distribution = (budgetRows ?? []).map((row, idx) => {
        const centerName = centers?.find((c) => c.id === row.analyticAccountId)?.name ?? "Unassigned";
        const value = totalBudgeted > 0 ? (Number(row.budgetedAmount || 0) / totalBudgeted) * 100 : 0;
        return {
          name: centerName,
          value: Number(value.toFixed(1)),
          fill: COLOR_PALETTE[idx % COLOR_PALETTE.length],
        };
      });
      setCostCenterData(distribution);
    };

    load().catch((error) => console.error("Dashboard load failed:", error));
  }, []);

  const budgetData = useMemo(() => {
    return trendData.map((row) => {
      const label = dayjs(`${row.period}-01`).format("MMM");
      return {
        month: label,
        budget: Number(row.budgetedAmount || 0),
        actual: Number(row.actualAmount || 0),
        forecast: Number(row.forecastAmount || row.budgetedAmount || 0),
      };
    });
  }, [trendData]);

  const keyMetrics = useMemo(() => {
    const totalBudget = summary?.budgeted ?? 0;
    const actualSpend = summary?.actual ?? 0;
    const remaining = totalBudget - actualSpend;
    const utilization = summary?.achievementPercentage ?? 0;

    return [
      {
        label: "Total Budget",
        value: formatINR(totalBudget),
        change: "",
        isPositive: true,
        icon: IndianRupee,
        color: "text-brand-primary",
        bgColor: "bg-blue-50/50 dark:bg-slate-800/50",
        highlight: false,
      },
      {
        label: "Budget Utilization",
        value: `${utilization.toFixed(1)}%`,
        change: "",
        isPositive: true,
        icon: Target,
        color: "text-brand-accent",
        bgColor: "bg-cyan-50/50 dark:bg-slate-800/50",
        highlight: true,
      },
      {
        label: "Actual Spend",
        value: formatINR(actualSpend),
        change: "",
        isPositive: true,
        icon: TrendingUp,
        color: "text-success",
        bgColor: "bg-emerald-50/50 dark:bg-slate-800/50",
        highlight: false,
      },
      {
        label: "Remaining",
        value: formatINR(remaining),
        change: "",
        isPositive: remaining >= 0,
        icon: AlertCircle,
        color: "text-amber-600",
        bgColor: "bg-amber-50/50 dark:bg-slate-800/50",
        highlight: false,
      },
    ];
  }, [summary]);

  return (
    <AppLayout>
      <div className="mb-8 pb-6 border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-brand-dark dark:text-white mb-2">Financial Dashboard</h1>
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span>Last updated: {dayjs().format("MMMM D, YYYY [at] h:mm A")}</span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live data
              </span>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10"
      >
        {keyMetrics.map((metric, idx) => {
          const Icon = metric.icon;
          const TrendIcon = metric.isPositive ? ArrowUpRight : ArrowDownRight;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`group relative overflow-hidden rounded-xl border ${
                metric.highlight
                  ? "border-brand-accent/30 dark:border-brand-accent/20 shadow-lg shadow-brand-accent/10"
                  : "border-slate-200/70 dark:border-slate-800"
              } ${metric.bgColor} backdrop-blur-sm p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer`}
            >
              {metric.highlight && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-brand-accent/10 to-transparent rounded-bl-[100px]" />
              )}
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {metric.label}
                  </p>
                  <Icon className={`w-5 h-5 ${metric.color} opacity-40 group-hover:opacity-60 transition-opacity`} />
                </div>
                <p className="text-3xl font-bold text-brand-dark dark:text-white font-mono mb-2">
                  {metric.value}
                </p>
                <div className="flex items-center gap-1.5 text-sm">
                  <TrendIcon className={`w-4 h-4 ${metric.isPositive ? "text-emerald-600" : "text-red-600"}`} />
                  <span className={`font-semibold ${metric.isPositive ? "text-emerald-600" : "text-red-600"}`}>
                    {metric.change || ""}
                  </span>
                  <span className="text-xs text-slate-500">vs last period</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card p-6 lg:col-span-2 hover:shadow-xl transition-shadow duration-300"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-brand-dark dark:text-white mb-1">Budget vs Actual Trend</h3>
            <p className="text-sm text-slate-500">Monthly planned vs actual spending analysis</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={budgetData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: 12, fontWeight: 500 }} />
              <YAxis
                stroke="#94a3b8"
                style={{ fontSize: 12, fontWeight: 500 }}
                tickFormatter={(value) => `Rs ${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "12px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value: any) => [`Rs ${Number(value).toLocaleString("en-IN")}`, ""]}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="line" />
              <Line
                type="monotone"
                dataKey="budget"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "#94a3b8", r: 4 }}
                name="Budget (Planned)"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#0077B6"
                strokeWidth={3}
                dot={{ fill: "#0077B6", r: 5 }}
                name="Actual Spend"
              />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#00B4D8"
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={{ fill: "#00B4D8", r: 4 }}
                name="Forecast"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="card p-6 hover:shadow-xl transition-shadow duration-300"
        >
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-brand-dark dark:text-white mb-1">Cost Centers</h3>
            <p className="text-sm text-slate-500">Budget distribution by department</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={costCenterData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {costCenterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "8px 12px",
                }}
                formatter={(value: any) => [`${value}%`, ""]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-6 space-y-3">
            {costCenterData.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition-colors"
              >
                <div
                  className="w-3 h-3 rounded-full group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: item.fill }}
                ></div>
                <span className="text-sm text-slate-600 dark:text-slate-400 flex-1">{item.name}</span>
                <span className="text-sm font-bold text-brand-dark dark:text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="card p-6 hover:shadow-xl transition-shadow duration-300"
        >
          <h3 className="text-lg font-semibold text-brand-dark dark:text-white mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {[
              { desc: "Office Supplies", amount: "-Rs 2,450", date: "Today" },
              { desc: "Equipment Lease", amount: "-Rs 5,000", date: "Yesterday" },
              { desc: "Client Invoice", amount: "+Rs 12,500", date: "2 days ago" },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                <div>
                  <p className="font-medium text-brand-dark dark:text-white">{item.desc}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.date}</p>
                </div>
                <p className={`font-bold font-mono text-sm ${item.amount.startsWith("+") ? "text-emerald-600" : "text-slate-700 dark:text-slate-300"}`}>
                  {item.amount}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="card p-6 hover:shadow-xl transition-shadow duration-300"
        >
          <h3 className="text-lg font-semibold text-brand-dark dark:text-white mb-4">AI-Powered Insights</h3>
          <div className="space-y-3">
            {[
              { type: "Opportunity", title: "Cost Optimization", desc: "Potential savings identified", color: "emerald" },
              { type: "Risk", title: "Budget Overage", desc: "Operations exceeding 15%", color: "red" },
              { type: "Anomaly", title: "Unusual Activity", desc: "Check Q2 vendor payments", color: "amber" },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`group p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  item.color === "emerald"
                    ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200/50 dark:border-emerald-800/30 hover:border-emerald-300 dark:hover:border-emerald-700"
                    : item.color === "red"
                    ? "bg-red-50/50 dark:bg-red-900/10 border-red-200/50 dark:border-red-800/30 hover:border-red-300 dark:hover:border-red-700"
                    : "bg-amber-50/50 dark:bg-amber-900/10 border-amber-200/50 dark:border-amber-800/30 hover:border-amber-300 dark:hover:border-amber-700"
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="font-medium text-sm text-brand-dark dark:text-white">{item.title}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    item.color === "emerald"
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      : item.color === "red"
                      ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                  }`}>
                    {item.type}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
