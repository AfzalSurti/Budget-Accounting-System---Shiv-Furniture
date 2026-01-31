import Link from "next/link";
import { TopNavigation } from "@/components/navigation/top-navigation";
import { ArrowRight, TrendingUp, Brain, BarChart3, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-brand-lighter dark:from-slate-950 dark:to-slate-900">
      <TopNavigation />

      {/* Hero Section */}
      <section className="page-container pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-5xl sm:text-6xl font-bold text-brand-dark dark:text-white mb-6 leading-tight">
            Enterprise Budget & Financial Intelligence
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            Built for Shiv Furniture. Premium ERP system with AI-powered insights, real-time budget monitoring, and enterprise-grade financial controls.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-lg"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#features"
              className="btn-ghost inline-flex items-center gap-2 px-6 py-3 text-lg"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="page-container py-20">
        <h2 className="section-heading text-center">Core Capabilities</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: TrendingUp,
              title: "Budget Control",
              description: "Real-time budget monitoring, variance analysis, and forecast adjustments",
            },
            {
              icon: Brain,
              title: "AI Insights",
              description: "Intelligent anomaly detection, risk identification, and opportunity discovery",
            },
            {
              icon: BarChart3,
              title: "Analytics",
              description: "Comprehensive reporting, cost center analysis, and trend visualization",
            },
            {
              icon: Users,
              title: "Portal Access",
              description: "Customer and vendor portals for invoices, payments, and PO management",
            },
          ].map((feature, idx) => (
            <div key={idx} className="card p-6">
              <feature.icon className="w-12 h-12 text-brand-accent mb-4" />
              <h3 className="font-bold text-lg text-brand-dark dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="page-container py-20">
        <div className="bg-gradient-to-r from-brand-primary to-brand-accent rounded-lg p-12 text-center text-white">
          <h2 className="text-3xl font-serif font-bold mb-4">Ready to Transform Your Finance Operations?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join Shiv Furniture in streamlining budgets, controlling costs, and gaining intelligent financial insights.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-brand-primary px-8 py-3 rounded-lg font-bold hover:bg-slate-100 transition-colors duration-200">
            Start Free Trial <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 py-12">
        <div className="page-container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-brand-dark dark:text-white mb-4">Product</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li><Link href="#" className="hover:text-brand-primary transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-brand-primary transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-brand-primary transition-colors">Security</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-brand-dark dark:text-white mb-4">Company</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li><Link href="#" className="hover:text-brand-primary transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-brand-primary transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-brand-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-brand-dark dark:text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li><Link href="#" className="hover:text-brand-primary transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-brand-primary transition-colors">Terms</Link></li>
                <li><Link href="#" className="hover:text-brand-primary transition-colors">Cookies</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-brand-dark dark:text-white mb-4">Connect</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li><Link href="#" className="hover:text-brand-primary transition-colors">Twitter</Link></li>
                <li><Link href="#" className="hover:text-brand-primary transition-colors">LinkedIn</Link></li>
                <li><Link href="#" className="hover:text-brand-primary transition-colors">GitHub</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 pt-8 flex justify-between items-center">
            <p className="text-slate-600 dark:text-slate-400">© 2026 Shiv Furniture ERP. All rights reserved.</p>
            <p className="text-slate-600 dark:text-slate-400">Enterprise Financial Intelligence</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
