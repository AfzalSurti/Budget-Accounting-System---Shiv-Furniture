"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { 
  Home, 
  FileText, 
  Receipt, 
  Package, 
  CreditCard,
  Menu, 
  X, 
  LogOut,
  User
} from "lucide-react";
import { ThemeToggle } from "../theme-toggle";
import { cn } from "@/lib/cn";
import { useAuth } from "@/context/AuthContext";
import { portalRoutes } from "@/routes/routes";

const iconMap: Record<string, any> = {
  '/portal/overview': Home,
  '/portal/invoices': FileText,
  '/portal/bills': Receipt,
  '/portal/purchase-orders': Package,
  '/portal/payments': CreditCard,
};

export function PortalNavigation() {
  const pathname = usePathname();
  const { theme, resolvedTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => pathname === href;
  const currentTheme = resolvedTheme || theme;

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/portal/overview" className="flex items-center gap-3 flex-shrink-0">
            <Image
              src={currentTheme === "dark" ? "/logo_light.png" : "/logo_dark.png"}
              alt="Shiv Furniture"
              width={140}
              height={50}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {portalRoutes.map((route) => {
              const Icon = iconMap[route.path];
              return (
                <Link
                  key={route.path}
                  href={route.path}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2",
                    isActive(route.path)
                      ? "text-brand-primary bg-brand-lighter dark:bg-slate-800"
                      : "text-slate-700 dark:text-slate-300 hover:text-brand-primary hover:bg-brand-lighter/50 dark:hover:bg-slate-800/50"
                  )}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {route.label}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            {/* Profile Menu */}
            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-700">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Customer Portal</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-700 py-4 space-y-2">
            {/* User Info */}
            <div className="px-3 py-2 mb-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Customer Portal</p>
                </div>
              </div>
            </div>

            {portalRoutes.map((route) => {
              const Icon = iconMap[route.path];
              return (
                <Link
                  key={route.path}
                  href={route.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200",
                    isActive(route.path)
                      ? "text-brand-primary bg-brand-lighter dark:bg-slate-800"
                      : "text-slate-700 dark:text-slate-300 hover:text-brand-primary hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  {route.label}
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-4"
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
