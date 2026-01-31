"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, X, ChevronDown } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/cn";

const primaryNavItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Transactions", href: "/transactions", submenu: true },
  { label: "Budgets", href: "/budgets", submenu: true },
  { label: "AI Insights", href: "/ai-insights" },
  { label: "Reports", href: "/reports" },
  { label: "Portal", href: "/portal" },
];

export function TopNavigation() {
  const pathname = usePathname();
  const { theme, resolvedTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  const isActive = (href: string) => pathname?.startsWith(href);

  // Use resolvedTheme to handle 'system' preference correctly
  const currentTheme = resolvedTheme || theme;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <Image
              src={currentTheme === "dark" ? "/logo_light.png" : "/logo_dark.png"}
              alt="Shiv Furniture ERP"
              width={180}
              height={60}
              className="h-16 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {primaryNavItems.map((item) => (
              <div key={item.href} className="relative group">
                <Link
                  href={item.href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 flex items-center gap-1",
                    isActive(item.href)
                      ? "text-brand-primary bg-brand-lighter dark:bg-slate-800"
                      : "text-slate-700 dark:text-slate-300 hover:text-brand-primary hover:bg-brand-lighter dark:hover:bg-slate-800"
                  )}
                >
                  {item.label}
                  {item.submenu && <ChevronDown className="w-4 h-4" />}
                </Link>
              </div>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {/* Profile Menu (placeholder) */}
            <button className="hidden sm:inline-flex w-9 h-9 rounded-full bg-brand-lighter dark:bg-slate-700 text-brand-dark dark:text-white font-medium hover:bg-brand-accent transition-colors duration-200">
              U
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 dark:text-slate-300"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-700 py-4 space-y-2">
            {primaryNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200",
                  isActive(item.href)
                    ? "text-brand-primary bg-brand-lighter dark:bg-slate-800"
                    : "text-slate-700 dark:text-slate-300 hover:text-brand-primary hover:bg-brand-lighter dark:hover:bg-slate-800"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
