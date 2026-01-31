"use client";

import { AppLayout } from "@/components/layout/app-layout";

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, FileText, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

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
  return (      {/* Page Header - Official Report Style */}
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
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary/90 hover:shadow-md transition-all duration-200 shadow-sm active:scale-[0.98]">
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
            <select className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all duration-200 text-sm font-medium">
              <option>Financial Summary</option>
              <option>Cost Center Analysis</option>
              <option>Cash Flow Report</option>
              <option>Budget vs Actual</option>
            </select>
          </div>
          <div className="sm:w-56">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Time Period</label>
            <select className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all duration-200 text-sm font-medium">
              <option>Last 6 Months</option>
              <option>Last Year</option>
              <option>YTD</option>
              <option>Custom Range</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Revenue vs Expenses - Primary Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="card p-8 mb-8"
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-brand-dark dark:text-white mb-1.5">Revenue vs Expenses</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Monthly financial performance</p>
        </div>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={reportData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
              formatter={(value: number, name: string) => [
                <span className="font-semibold font-mono">₹{value.toLocaleString('en-IN')}</span>,
                <span className="text-xs text-slate-600 ml-2">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </span>
              ]}
            />
            <Legend 
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#0077B6"
              strokeWidth={3}
              dot={{ fill: "#0077B6", r: 5 }}
              activeDot={{ r: 7 }}
              name="Revenue"
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#94a3b8"
              strokeWidth={3}
              dot={{ fill: "#94a3b8", r: 5 }}
              activeDot={{ r: 7 }}
              name="Expenses"
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#10B981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "#10B981", r: 4 }}
              activeDot={{ r: 6 }}
              name="Profit"
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
              formatter={(value: number) => [
                <span className="font-semibold font-mono">₹{value.toLocaleString('en-IN')}</span>
              ]}
            />
            <Legend 
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
            />
            <Bar 
              dataKey="budget" 
              fill="#94a3b8" 
              name="Budget"
              radius={[6, 6, 0, 0]}
              maxBarSize={60}
            />
            <Bar 
              dataKey="actual" 
              fill="#0077B6" 
              name="Actual"
              radius={[6, 6, 0, 0]}
              maxBarSize={60}
            />
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
                const percentage = ((item.variance / item.budget) * 100);
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
                        ₹{item.budget.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-sm font-mono font-semibold text-brand-dark dark:text-white">
                        ₹{item.actual.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className={`text-sm font-mono font-semibold ${
                        isUnderBudget 
                          ? "text-emerald-600 dark:text-emerald-500" 
                          : "text-rose-600 dark:text-rose-500"
                      }`}>
                        {isUnderBudget ? "-" : "+"}₹{Math.abs(item.variance).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className={`text-sm font-semibold font-mono ${
                        isUnderBudget 
                          ? "text-emerald-600 dark:text-emerald-500" 
                          : "text-rose-600 dark:text-rose-500"
                      }`}>
                        {isUnderBudget ? "" : "+"}{percentage.toFixed(1)}%
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>  );
}
