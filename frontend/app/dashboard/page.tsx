"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, AlertCircle, Target, DollarSign } from "lucide-react";
import dayjs from "dayjs";

// Sample data
const budgetData = [
  { month: "Jan", budget: 50000, actual: 48000, forecast: 52000 },
  { month: "Feb", budget: 55000, actual: 54000, forecast: 56000 },
  { month: "Mar", budget: 60000, actual: 58500, forecast: 61000 },
  { month: "Apr", budget: 65000, actual: 62000, forecast: 67000 },
  { month: "May", budget: 70000, actual: 68500, forecast: 72000 },
  { month: "Jun", budget: 75000, actual: 73000, forecast: 76000 },
];

const costCenterData = [
  { name: "Manufacturing", value: 45, fill: "#0077B6" },
  { name: "Sales", value: 25, fill: "#00B4D8" },
  { name: "Operations", value: 20, fill: "#90E0EF" },
  { name: "Admin", value: 10, fill: "#CAF0F8" },
];

const keyMetrics = [
  {
    label: "Total Budget",
    value: "$375,000",
    change: "+2.5%",
    icon: DollarSign,
    color: "text-brand-primary",
    bgColor: "bg-brand-lighter dark:bg-slate-800",
  },
  {
    label: "Budget Utilization",
    value: "87%",
    change: "+1.2%",
    icon: Target,
    color: "text-brand-accent",
    bgColor: "bg-brand-lighter dark:bg-slate-800",
  },
  {
    label: "Actual Spend",
    value: "$326,500",
    change: "-3.1%",
    icon: TrendingUp,
    color: "text-success",
    bgColor: "bg-green-50 dark:bg-slate-800",
  },
  {
    label: "Remaining",
    value: "$48,500",
    change: "+5.8%",
    icon: AlertCircle,
    color: "text-warning",
    bgColor: "bg-amber-50 dark:bg-slate-800",
  },
];

export default function DashboardPage() {
  return (
    <AppLayout>
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="section-heading">Financial Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Last updated: {dayjs().format("MMMM D, YYYY [at] h:mm A")}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {keyMetrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} className={`card p-6 ${metric.bgColor}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{metric.label}</p>
                  <p className="text-3xl font-bold text-brand-dark dark:text-white font-mono">
                    {metric.value}
                  </p>
                </div>
                <Icon className={`w-8 h-8 ${metric.color} opacity-75`} />
              </div>
              <div className="flex items-center gap-1 text-sm font-medium">
                <span className="text-success">{metric.change}</span>
                <span className="text-slate-600 dark:text-slate-400">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Budget vs Actual Chart */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-6">Budget vs Actual</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={budgetData}>
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
              <Line
                type="monotone"
                dataKey="budget"
                stroke="#0077B6"
                strokeWidth={2}
                dot={{ fill: "#0077B6", r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#00B4D8"
                strokeWidth={2}
                dot={{ fill: "#00B4D8", r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#90E0EF"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "#90E0EF", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Center Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-6">Cost Centers</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={costCenterData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {costCenterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2 text-sm">
            {costCenterData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                <span className="ml-auto font-bold text-brand-dark dark:text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {[
              { desc: "Office Supplies", amount: "-$2,450", date: "Today" },
              { desc: "Equipment Lease", amount: "-$5,000", date: "Yesterday" },
              { desc: "Client Invoice", amount: "+$12,500", date: "2 days ago" },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div>
                  <p className="font-medium text-brand-dark dark:text-white">{item.desc}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{item.date}</p>
                </div>
                <p className={`font-bold font-mono ${item.amount.startsWith("+") ? "text-success" : "text-slate-700 dark:text-slate-300"}`}>
                  {item.amount}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-4">AI Insights</h3>
          <div className="space-y-3">
            {[
              { type: "Opportunity", title: "Cost Optimization", desc: "Potential savings identified" },
              { type: "Risk", title: "Budget Overage", desc: "Operations exceeding 15%" },
              { type: "Anomaly", title: "Unusual Activity", desc: "Check Q2 vendor payments" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-gradient-to-r from-brand-accent/10 to-brand-light/10 border border-brand-accent/20 rounded-lg"
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="font-medium text-brand-dark dark:text-white">{item.title}</p>
                  <span className="text-xs font-bold px-2 py-1 bg-brand-accent/20 text-brand-accent rounded">
                    {item.type}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
