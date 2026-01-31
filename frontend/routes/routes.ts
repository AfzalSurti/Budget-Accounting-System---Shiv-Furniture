export interface Route {
  path: string;
  label: string;
  icon?: string;
}

export const adminRoutes: Route[] = [
  { path: '/admin/dashboard', label: 'Dashboard' },
  { path: '/admin/transactions', label: 'Transactions' },
  { path: '/admin/budgets', label: 'Budgets' },
  { path: '/admin/sales-orders', label: 'Sales Orders' },
  { path: '/admin/purchase-orders', label: 'Purchase Orders' },
  { path: '/admin/invoices', label: 'Invoices' },
  { path: '/admin/vendor-bills', label: 'Vendor Bills' },
  { path: '/admin/payments', label: 'Payments' },
  { path: '/admin/contacts', label: 'Contacts' },
  { path: '/analytics', label: 'Cost Centers' },
  { path: '/admin/master-data', label: 'Master Data' },
  { path: '/admin/reports', label: 'Reports' },
];

export const portalRoutes: Route[] = [
  { path: '/portal/overview', label: 'Overview' },
  { path: '/portal/invoices', label: 'My Invoices' },
  { path: '/portal/bills', label: 'My Bills' },
  { path: '/portal/sales-orders', label: 'Sales Orders' },
  { path: '/portal/purchase-orders', label: 'Purchase Orders' },
  { path: '/portal/payments', label: 'Payments' },
];
