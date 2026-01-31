"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, Filter } from "lucide-react";

const reportData = [
  { month: "Jan", revenue: 185000, expenses: 142000, profit: 43000 },
  { month: "Feb", revenue: 195000, expenses: 148000, profit: 47000 },
  { month: "Mar", revenue: 210000, expenses: 155000, profit: 55000 },
  { month: "Apr", revenue: 225000, expenses: 162000, profit: 63000 },
  { month: "May", revenue: 240000, expenses: 170000, profit: 70000 },
  { month: "Jun", revenue: 255000, expenses: 178000, profit: 77000 },
];

const costCenterReport = [
  { name: "Manufacturing", budget: 125000, actual: 108500, variance: -16500 },
  { name: "Sales", budget: 85000, actual: 72300, variance: -12700 },
  { name: "Operations", budget: 75000, actual: 65400, variance: -9600 },
  { name: "Admin", budget: 45000, actual: 38200, variance: -6800 },
  { name: "Capital", budget: 250000, actual: 180000, variance: -70000 },
];

export default function ReportsPage() {
  return (
    <AppLayout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="section-heading mb-2">Financial Reports</h1>
          <p className="text-slate-600 dark:text-slate-400">Comprehensive financial analysis and reporting</p>
        </div>
        <button className="btn-primary inline-flex items-center gap-2 mt-4 md:mt-0">
          <Download className="w-5 h-5" />
          Export Report
        </button>
      </div>

      {/* Report Filters */}
      <div className="flex gap-4 mb-8">
        <div className="flex-1">
          <select className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary">
            <option>Financial Summary</option>
            <option>Cost Center Analysis</option>
            <option>Cash Flow Report</option>
            <option>Budget vs Actual</option>
          </select>
        </div>
        <select className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary">
          <option>Last 6 Months</option>
          <option>Last Year</option>
          <option>YTD</option>
        </select>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue vs Expenses */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-6">Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportData}>
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
                dataKey="revenue"
                stroke="#0077B6"
                strokeWidth={3}
                dot={{ fill: "#0077B6", r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#00B4D8"
                strokeWidth={3}
                dot={{ fill: "#00B4D8", r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: "#10B981", r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Center Variance */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-6">Cost Center Variance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costCenterReport}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="budget" fill="#0077B6" name="Budget" />
              <Bar dataKey="actual" fill="#00B4D8" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Table */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-6">Cost Center Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Cost Center</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Budget</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Actual</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Variance</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {costCenterReport.map((item) => {
                const percentage = ((item.variance / item.budget) * 100).toFixed(1);
                return (
                  <tr key={item.name} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4 font-medium text-brand-dark dark:text-white">{item.name}</td>
                    <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-300">
                      ${item.budget.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-300">
                      ${item.actual.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-mono text-success">
                      ${Math.abs(item.variance).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-success">{percentage}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
