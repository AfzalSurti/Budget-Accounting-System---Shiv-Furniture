"use client";

import React from "react";
import { cn } from "@/lib/cn";

interface StatusBadgeProps {
  status: "active" | "inactive" | "pending" | "completed" | "failed" | "warning";
  label: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const colors = {
    active: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800",
    inactive: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700",
    pending: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
    completed: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
    failed: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800",
    warning: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800",
  };

  return (
    <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold", colors[status])}>
      {label}
    </span>
  );
}
