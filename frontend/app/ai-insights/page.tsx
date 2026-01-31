"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Brain, AlertTriangle, Lightbulb, Zap, ChevronRight, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

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
    description: "Administrative cost center shows 3 duplicate payments to vendor ABC Corp in the past 15 days. Total: ₹15,600",
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
    description: "Based on current burn rate and projected growth, operations may need additional ₹32,000 by Q2 2026",
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
  const [activeFilter, setActiveFilter] = useState("All");

  const filterCounts = {
    All: insights.length,
    Risks: insights.filter(i => i.type === "Risk").length,
    Opportunities: insights.filter(i => i.type === "Opportunity").length,
    Anomalies: insights.filter(i => i.type === "Anomaly").length,
  };

  const filteredInsights = activeFilter === "All" 
    ? insights 
    : insights.filter(insight => 
        activeFilter === "Risks" ? insight.type === "Risk" :
        activeFilter === "Opportunities" ? insight.type === "Opportunity" :
        insight.type === "Anomaly"
      );

  return (
    <AppLayout>
      {/* Page Header - Professional AI Positioning */}
      <div className="mb-8 pb-6 border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-brand-primary/10 rounded-lg">
                <Brain className="w-6 h-6 text-brand-primary" />
              </div>
              <h1 className="text-3xl font-semibold text-brand-dark dark:text-white">AI Intelligence</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                <Info className="w-3 h-3" />
                Explainable AI
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              System-generated insights based on financial patterns and historical transaction data
            </p>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
        {Object.entries(filterCounts).map(([filter, count]) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-medium whitespace-nowrap transition-all duration-200 ${
              filter === activeFilter
                ? "bg-brand-primary text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {filter}
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              filter === activeFilter
                ? "bg-white/20 text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Insights Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredInsights.map((insight, idx) => {
          const Icon = insight.icon;
          const isHighImpact = insight.impact === "High";
          const isMediumImpact = insight.impact === "Medium";
          const isLowImpact = insight.impact === "Low";
          
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              className={`card group cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 ${
                isHighImpact ? "border-l-rose-500 dark:border-l-rose-600" :
                isMediumImpact ? "border-l-amber-500 dark:border-l-amber-600" :
                "border-l-slate-300 dark:border-l-slate-600"
              } ${
                isHighImpact ? "shadow-md" : ""
              }`}
            >
              <div className="p-6">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-lg ${
                      insight.type === "Risk" ? "bg-rose-50 dark:bg-rose-900/20" :
                      insight.type === "Opportunity" ? "bg-emerald-50 dark:bg-emerald-900/20" :
                      "bg-amber-50 dark:bg-amber-900/20"
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        insight.type === "Risk" ? "text-rose-600 dark:text-rose-500" :
                        insight.type === "Opportunity" ? "text-emerald-600 dark:text-emerald-500" :
                        "text-amber-600 dark:text-amber-500"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          insight.type === "Risk" ? "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/30" :
                          insight.type === "Opportunity" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30" :
                          "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/30"
                        }`}>
                          {insight.type}
                        </span>
                      </div>
                      <h3 className={`text-base font-semibold text-brand-dark dark:text-white mb-1 group-hover:text-brand-primary transition-colors ${
                        isHighImpact ? "text-lg" : ""
                      }`}>
                        {insight.title}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Impact Badge */}
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
                      isHighImpact
                        ? "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/30"
                        : isMediumImpact
                        ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/30"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                    }`}>
                      {insight.impact} Impact
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                  {insight.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Confidence:</span>
                    <span className="text-xs font-semibold font-mono text-brand-primary">{insight.confidence}</span>
                  </div>
                  <button className="inline-flex items-center gap-1 text-sm font-medium text-brand-primary hover:text-brand-accent transition-colors group-hover:gap-2 duration-200">
                    View Analysis
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Explainability Hint */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                    Based on {insight.type === "Risk" ? "budget utilization patterns" : insight.type === "Opportunity" ? "historical spending data" : "transaction analysis"} over the last 90 days
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </AppLayout>
  );
}
