"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, X, ChevronDown, LogOut } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/cn";
import { useAuth } from "@/context/AuthContext";

const primaryNavItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Transactions", href: "/transactions" },
  { label: "Budgets", href: "/budgets" },
  { label: "Reports", href: "/reports" },
  { label: "Contacts", href: "/contacts" },
  { label: "Products", href: "/products" },
  { label: "Cost Centers", href: "/analytics" },
];

export function TopNavigation() {
  const pathname = usePathname();
  const { theme, resolvedTheme } = useTheme();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isActive = (href: string) => pathname?.startsWith(href);

  // Use resolvedTheme to handle 'system' preference correctly
  const currentTheme = resolvedTheme || theme;
  const logoSrc = !mounted
    ? "/logo_dark.png"
    : currentTheme === "dark"
      ? "/logo_light.png"
      : "/logo_dark.png";

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <Image
              src={logoSrc}
              alt="Shiv Furniture ERP"
              width={220}
              height={80}
              className="h-20 w-auto"
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
            
            {/* Profile Menu */}
            <div className="relative hidden sm:inline-flex">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-brand-lighter dark:bg-slate-700 text-brand-dark dark:text-white font-medium hover:bg-brand-accent transition-colors duration-200"
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
              >
                <span className="inline-flex justify-center items-center w-7 h-7 rounded-full bg-white/80 dark:bg-slate-800 text-sm font-semibold">
                  A
                </span>
                <span className="text-sm">Admin</span>
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>

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
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:text-brand-primary hover:bg-brand-lighter dark:hover:bg-slate-800"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
