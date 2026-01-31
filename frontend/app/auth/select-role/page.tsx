"use client";

import Link from "next/link";
import Image from "next/image";
import { User, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const roles = [
  {
    id: "ADMIN",
    title: "Administrator",
    description: "Full system access and management",
    icon: ShieldCheck,
    permissions: ["Manage all users", "System configuration", "Full financial control", "All operations access"],
    color: "from-purple-500 to-purple-600"
  },
  {
    id: "PORTAL",
    title: "Portal User",
    description: "Customer portal access",
    icon: User,
    permissions: ["View invoices", "Make payments", "Track orders", "View transaction history"],
    color: "from-blue-500 to-blue-600"
  }
];

export default function SelectRolePage() {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { setUser, user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !user) return;
    
    setIsSubmitting(true);
    
    // Update user role
    const updatedUser = {
      ...user,
      role: selectedRole as 'ADMIN' | 'PORTAL'
    };
    setUser(updatedUser);
    
    // Redirect based on role
    setTimeout(() => {
      if (selectedRole === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/portal/overview');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Image
            src="/logo_dark.png"
            alt="Shiv Furniture"
            width={100}
            height={35}
            className="dark:hidden"
          />
          <Image
            src="/logo_light.png"
            alt="Shiv Furniture"
            width={100}
            height={35}
            className="hidden dark:block"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-accent rounded-2xl mb-6">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-semibold text-brand-dark dark:text-white mb-4">
            Select Your Role
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Choose your role to get personalized access and features tailored to your responsibilities
          </p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
            {roles.map((role, index) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-200 ${
                    selectedRole === role.id
                      ? "border-brand-primary bg-brand-primary/5 shadow-lg shadow-brand-primary/20"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${role.color}`}>
                      <role.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                        {role.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {role.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                      Key Permissions
                    </p>
                    {role.permissions.map((permission, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
                        <span>{permission}</span>
                      </div>
                    ))}
                  </div>

                  {selectedRole === role.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-4 flex items-center justify-center gap-2 text-brand-primary font-medium text-sm"
                    >
                      <div className="w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      Selected
                    </motion.div>
                  )}
                </button>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex items-center justify-center gap-4"
          >
            <Link
              href="/auth/signup"
              className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              Go Back
            </Link>
            <button
              type="submit"
              disabled={!selectedRole || isSubmitting}
              className="inline-flex items-center gap-2 px-8 py-3 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-primary/90 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Setting up...
                </>
              ) : (
                <>
                  Continue to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-blue-600 dark:text-blue-400">
                You can change your role later in account settings
              </span>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
