import Link from "next/link";

export default function SignupPage() {
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
          <h2 className="text-2xl font-bold text-brand-dark dark:text-white mb-6">Create Account</h2>
          
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all duration-200"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all duration-200"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all duration-200"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Company Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all duration-200"
                placeholder="Shiv Furniture"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all duration-200"
                placeholder="••••••••"
              />
            </div>

            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                I agree to the Terms of Service and Privacy Policy
              </span>
            </label>

            <button className="w-full btn-primary py-3 font-semibold text-lg mt-6">
              Create Account
            </button>
          </form>

          <p className="text-center text-slate-600 dark:text-slate-400 mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-brand-primary font-semibold hover:text-brand-accent transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
