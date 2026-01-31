"use client";

import Link from "next/link";
import Image from "next/image";
import { Lock, Shield, ArrowRight, Building, User } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function SignupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userType, setUserType] = useState<"business" | "vendor">("business");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate account creation then redirect to role selection
    setTimeout(() => {
      window.location.href = "/auth/select-role";
    }, 1500);
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
          <div className="mb-8">
            <Image
              src="/logo_light.png"
              alt="Shiv Furniture"
              width={110}
              height={40}
              className="mb-6"
            />
          </div>
          <div className="max-w-md">
            <h1 className="text-4xl font-semibold text-white mb-4">
              Start managing your
              <br />
              finances securely
            </h1>
            <p className="text-lg text-white/90 leading-relaxed">
              Join businesses using Shiv ERP for budget control, financial intelligence, and secure transaction management.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative z-10 flex items-center gap-8 text-white/80"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <span className="text-sm">Enterprise-grade security</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            <span className="text-sm">Data protection</span>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
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

          <div className="card p-8 lg:p-10">
            <div className="mb-8">
              <h2 className="text-2xl lg:text-3xl font-semibold text-brand-dark dark:text-white mb-2">
                Create your account
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Get started with secure financial management
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType("business")}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                      userType === "business"
                        ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <Building className="w-5 h-5" />
                    <span className="font-medium">Business</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType("vendor")}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                      userType === "vendor"
                        ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Vendor</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all duration-200"
                  placeholder="Enter your full name"
                />
              </div>

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

              {userType === "business" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all duration-200"
                    placeholder="Your company name"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all duration-200"
                  placeholder="Create a strong password"
                />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Must be at least 8 characters with letters and numbers
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all duration-200"
                  placeholder="Confirm your password"
                />
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="w-4 h-4 mt-1 text-brand-primary border-slate-300 rounded focus:ring-brand-primary/40"
                />
                <label htmlFor="terms" className="ml-3 text-sm text-slate-600 dark:text-slate-400">
                  I agree to the{" "}
                  <Link href="#" className="text-brand-primary hover:text-brand-accent font-medium">
                    Terms of Service
                  </Link>
                  {" "}and{" "}
                  <Link href="#" className="text-brand-primary hover:text-brand-accent font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>

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
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">Already have an account?</span>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-accent font-semibold transition-colors"
              >
                Sign in instead
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full">
              <Shield className="w-4 h-4 text-slate-500" />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Compliant with enterprise security standards
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
