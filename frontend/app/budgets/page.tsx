"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Plus, TrendingUp } from "lucide-react";

const budgetsData = [
  {
    id: "BUD001",
    name: "Manufacturing Operations",
    allocated: "$125,000",
    spent: "$108,500",
    remaining: "$16,500",
    utilization: "86.8%",
    status: "active" as const,
    costCenter: "Manufacturing",
  },
  {
    id: "BUD002",
    name: "Sales & Marketing",
    allocated: "$85,000",
    spent: "$72,300",
    remaining: "$12,700",
    utilization: "85.1%",
    status: "active" as const,
    costCenter: "Sales",
  },
  {
    id: "BUD003",
    name: "Administrative",
    allocated: "$45,000",
    spent: "$38,200",
    remaining: "$6,800",
    utilization: "84.9%",
    status: "active" as const,
    costCenter: "Admin",
  },
  {
    id: "BUD004",
    name: "Operations Support",
    allocated: "$75,000",
    spent: "$65,400",
    remaining: "$9,600",
    utilization: "87.2%",
    status: "warning" as const,
    costCenter: "Operations",
  },
  {
    id: "BUD005",
    name: "Capital Expenditure",
    allocated: "$250,000",
    spent: "$180,000",
    remaining: "$70,000",
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

export default function BudgetsPage() {
  const columns = [
    {
      key: "name" as const,
      label: "Budget Name",
      sortable: true,
    },
    {
      key: "costCenter" as const,
      label: "Cost Center",
    },
    {
      key: "allocated" as const,
      label: "Allocated",
      className: "font-mono",
    },
    {
      key: "spent" as const,
      label: "Spent",
      className: "font-mono",
    },
    {
      key: "utilization" as const,
      label: "Utilization",
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-primary to-brand-accent"
              style={{ width: value }}
            ></div>
          </div>
          <span className="text-sm font-bold text-brand-primary">{value}</span>
        </div>
      ),
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
          <h1 className="section-heading mb-2">Budget Management</h1>
          <p className="text-slate-600 dark:text-slate-400">Monitor budget allocations and spending across cost centers</p>
        </div>
        <button className="btn-primary inline-flex items-center gap-2 mt-4 md:mt-0">
          <Plus className="w-5 h-5" />
          Create Budget
        </button>
      </div>

      {/* Budget Trend Chart */}
      <div className="card p-6 mb-8">
        <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-accent" />
          Budget vs Actual Trend
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={budgetTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="allocated" fill="#0077B6" name="Allocated" />
            <Bar dataKey="spent" fill="#00B4D8" name="Spent" />
            <Bar dataKey="forecast" fill="#90E0EF" name="Forecast" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Budgets Table */}
      <DataTable columns={columns} data={budgetsData} title="Budget Summary" />
    </AppLayout>
  );
}
