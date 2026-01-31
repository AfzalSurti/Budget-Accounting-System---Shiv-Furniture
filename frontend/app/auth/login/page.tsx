import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-dark to-brand-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex w-16 h-16 rounded-lg bg-brand-accent text-white items-center justify-center mb-4">
            <span className="font-serif font-bold text-3xl">S</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Shiv ERP</h1>
          <p className="text-brand-light">Financial Intelligence Platform</p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-brand-dark dark:text-white mb-6">Welcome Back</h2>
          
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all duration-200"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all duration-200"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-slate-600 dark:text-slate-400">Remember me</span>
              </label>
              <Link href="#" className="text-brand-primary hover:text-brand-accent transition-colors">
                Forgot password?
              </Link>
            </div>

            <button className="w-full btn-primary py-3 font-semibold text-lg mt-6">
              Sign In
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400">or</span>
            </div>
          </div>

          <p className="text-center text-slate-600 dark:text-slate-400">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-brand-primary font-semibold hover:text-brand-accent transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        {/* Demo Info */}
        <div className="mt-8 bg-brand-light/10 border border-brand-light/30 rounded-lg p-4 text-brand-light text-sm text-center">
          <p className="font-semibold mb-2">Demo Credentials</p>
          <p>Email: demo@shivfurniture.com</p>
          <p>Password: Demo123!</p>
        </div>
      </div>
    </div>
  );
}
