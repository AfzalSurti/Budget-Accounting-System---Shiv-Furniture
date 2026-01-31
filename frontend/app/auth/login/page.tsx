"use client";

import Link from "next/link";
import Image from "next/image";
import { Lock, Shield, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission
    setTimeout(() => setIsSubmitting(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Left Side - Branding & Trust */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-primary via-brand-accent to-brand-lighter p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/business.png"
            alt="Business"
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          {/* Logo */}
          <div className="mb-8">
            <Image
              src="/logo_light.png"
              alt="Shiv Furniture"
              width={110}
              height={40}
              className="mb-6"
            />
          </div>

          {/* Brand Message */}
          <div className="max-w-md">
            <h1 className="text-4xl font-semibold text-white mb-4">
              Enterprise Budget &
              <br />
              Financial Intelligence
            </h1>
            <p className="text-lg text-white/90 leading-relaxed">
              Secure access to your financial dashboard. Manage budgets, transactions, and insights with enterprise-grade security.
            </p>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative z-10 flex items-center gap-8 text-white/80"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <span className="text-sm">Bank-level encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            <span className="text-sm">Secure authentication</span>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Image
              src="/logo_dark.png"
              alt="Shiv Furniture"
              width={100}
              height={35}
              className="mx-auto mb-4"
            />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Enterprise Budget & Financial Intelligence
            </p>
          </div>

          {/* Form Card */}
          <div className="card p-8 lg:p-10">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl lg:text-3xl font-semibold text-brand-dark dark:text-white mb-2">
                Welcome back
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Sign in to access your financial dashboard
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all duration-200"
                  placeholder="name@company.com"
                />
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <Link
                    href="#"
                    className="text-sm text-brand-primary hover:text-brand-accent transition-colors font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all duration-200"
                  placeholder="Enter your password"
                />
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 text-brand-primary border-slate-300 rounded focus:ring-brand-primary/40"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                  Keep me signed in
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-primary/90 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">New to Shiv ERP?</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-accent font-semibold transition-colors"
              >
                Create an account
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Security Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full">
              <Lock className="w-4 h-4 text-slate-500" />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Your data is encrypted and protected
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
