"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Brain, AlertTriangle, Lightbulb, Zap } from "lucide-react";

const insights = [
  {
    id: 1,
    type: "Risk",
    title: "Manufacturing Budget Overage Detected",
    description: "Manufacturing operations are on track to exceed budget by 8.2% this quarter. Current utilization: 91.5%",
    impact: "High",
    confidence: "94%",
    icon: AlertTriangle,
    color: "from-red-500 to-orange-500",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
  },
  {
    id: 2,
    type: "Opportunity",
    title: "Cost Optimization in Supplies",
    description: "Vendor consolidation identified - potential to reduce supply costs by 12% through bulk purchasing agreements",
    impact: "Medium",
    confidence: "87%",
    icon: Lightbulb,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
  },
  {
    id: 3,
    type: "Anomaly",
    title: "Unusual Payment Pattern Detected",
    description: "Administrative cost center shows 3 duplicate payments to vendor ABC Corp in the past 15 days. Total: $15,600",
    impact: "Medium",
    confidence: "91%",
    icon: Zap,
    color: "from-yellow-500 to-amber-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
  },
  {
    id: 4,
    type: "Opportunity",
    title: "Budget Reallocation Recommendation",
    description: "Sales department is underutilizing 18% of allocated budget. Consider reallocating to underbudgeted operations.",
    impact: "Low",
    confidence: "79%",
    icon: Lightbulb,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  {
    id: 5,
    type: "Risk",
    title: "Forecasted Budget Shortfall",
    description: "Based on current burn rate and projected growth, operations may need additional $32,000 by Q2 2026",
    impact: "Medium",
    confidence: "85%",
    icon: AlertTriangle,
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    borderColor: "border-orange-200 dark:border-orange-800",
  },
  {
    id: 6,
    type: "Anomaly",
    title: "Seasonal Cost Variance",
    description: "Q1 transportation costs are 23% higher than historical average. Market conditions or rate changes detected.",
    impact: "Low",
    confidence: "88%",
    icon: Zap,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
];

export default function AIInsightsPage() {
  return (
    <AppLayout>
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Brain className="w-8 h-8 text-brand-accent" />
          <h1 className="text-4xl font-serif font-bold text-brand-dark dark:text-white">AI Intelligence</h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Real-time financial insights powered by machine learning and pattern analysis
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {["All", "Risks", "Opportunities", "Anomalies"].map((filter) => (
          <button
            key={filter}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors duration-200 ${
              filter === "All"
                ? "bg-brand-primary text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-lighter dark:hover:bg-slate-700"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Insights Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {insights.map((insight) => {
          const Icon = insight.icon;
          return (
            <div
              key={insight.id}
              className={`card border-l-4 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group ${insight.borderColor}`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 bg-gradient-to-br ${insight.color} rounded-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${insight.bgColor} text-brand-dark dark:text-white`}>
                          {insight.type}
                        </span>
                        <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-brand-primary">
                          {insight.confidence}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-brand-dark dark:text-white mb-2">
                        {insight.title}
                      </h3>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded whitespace-nowrap ${
                    insight.impact === "High"
                      ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      : insight.impact === "Medium"
                      ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                      : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                  }`}>
                    {insight.impact} Impact
                  </span>
                </div>

                <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                  {insight.description}
                </p>

                <button className="text-brand-primary font-semibold text-sm hover:text-brand-accent transition-colors duration-200">
                  View Details →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
