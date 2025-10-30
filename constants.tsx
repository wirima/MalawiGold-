import React from 'react';
import { Permission } from './types';

// Heroicons SVG paths
const ICONS = {
    DASHBOARD: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />,
    PRODUCTS: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6C2.754 12 2.25 11.496 2.25 10.875v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" />,
    CONTACTS: <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.969A3 3 0 0010.5 9.5m-7.5 5.25c0-1.02.394-1.943 1.054-2.652A3 3 0 019 12.5m6-3.75a3 3 0 11-6 0 3 3 0 016 0zM12 12.75a3 3 0 00-3 3h6a3 3 0 00-3-3z" />,
    PURCHASES: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.658-.463 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />,
    SELL: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h6m-6 2.25h6M12 9.75l.75-1.5.75 1.5M12 12.75l.75-1.5.75 1.5M12 15.75l.75-1.5.75 1.5M4.5 9v10.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V9" />,
    STOCK_TRANSFERS: <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />,
    STOCK_ADJUSTMENTS: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />,
    EXPENSES: <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" />,
    REPORTS: <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />,
    USERS: <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493m-4.098 2.493a4.125 4.125 0 00-7.533-2.493m15.066-2.493c0 1.233-.242 2.408-.666 3.5m-13.734-3.5c-.424-1.092-.666-2.267-.666-3.5m15.066 0a9.337 9.337 0 00-4.121-.952M4.625 15.128a9.337 9.337 0 00-4.121-.952M9 12.75a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0z" />,
    NOTIFICATIONS: <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.31 5.632l-1.42 2.13a1.125 1.125 0 001.125 1.621h12.158c.621 0 1.125-.504 1.125-1.125a23.848 23.848 0 015.454-1.31zM9 18a3 3 0 006 0H9z" />,
    SETTINGS: <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.025 1.11-1.11a1.125 1.125 0 011.085.056l.053.042a.562.562 0 00.56.096c.38.118.74.298 1.07.538a.562.562 0 00.672.032l.094-.055a1.125 1.125 0 011.185.19l.044.053a1.125 1.125 0 01-.202 1.554l-.089.07a.562.562 0 00-.28.592c.03.407.054.819.054 1.234a.562.562 0 00.28.592l.089.07a1.125 1.125 0 01.202 1.554l-.044.053a1.125 1.125 0 01-1.185.19l-.094-.055a.562.562 0 00-.672.032c-.33.24-.69.42-1.07.538a.562.562 0 00-.56.096l-.053.042a1.125 1.125 0 01-1.085-.056c-.55-.085-1.02-.568-1.11-1.11a.562.562 0 00-.948 0c-.09.542-.56 1.025-1.11 1.11a1.125 1.125 0 01-1.085-.056l-.053-.042a.562.562 0 00-.56-.096c-.38-.118-.74-.298-1.07-.538a.562.562 0 00-.672-.032l-.094.055a1.125 1.125 0 01-1.185-.19l-.044-.053a1.125 1.125 0 01.202-1.554l.089-.07a.562.562 0 00.28-.592c-.03-.407-.054-.819-.054-1.234a.562.562 0 00.28.592l-.089-.07a1.125 1.125 0 01-.202-1.554l.044-.053a1.125 1.125 0 011.185-.19l.094.055a.562.562 0 00.672-.032c.33-.24.69-.42-1.07-.538a.562.562 0 00.56-.096l.053-.042a1.125 1.125 0 011.085-.056c.55.085 1.02.568 1.11 1.11a.562.562 0 00.948 0zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />,
};

export const ALL_PERMISSIONS: Permission[] = [
    'dashboard:view',
    'products:view', 'products:manage', 'products:add', 'products:update_price', 'products:print_labels', 'products:variations', 'products:import', 'products:import_stock', 'products:price_groups', 'products:units', 'products:categories', 'products:brands', 'products:warranties',
    'contacts:view', 'contacts:manage', 'contacts:import',
    'purchases:view', 'purchases:manage',
    'sell:view', 'sell:pos', 'sell:sales', 'sell:manage', 'shipping:view', 'shipping:manage', 'discounts:view',
    'pos:apply_discount', 'pos:change_price', 'pos:process_return', 'pos:void_sale',
    'stock_transfer:view', 'stock_transfer:manage',
    'stock_adjustment:view', 'stock_adjustment:manage',
    'expense:view', 'expense:manage',
    'reports:view', 'reports:customer_demand',
    'users:view', 'users:manage',
    'notifications:manage',
    'settings:view',
    'settings:tax', 'settings:product', 'settings:contact', 'settings:sale', 'settings:pos', 'settings:purchases', 'settings:payment', 'settings:dashboard', 'settings:system', 'settings:prefixes', 'settings:email', 'settings:sms', 'settings:reward_points', 'settings:modules', 'settings:custom_labels', 'settings:locations', 'settings:age_verification'
];

const NavIcon: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        {children}
    </svg>
);

export interface NavItem {
    path?: string;
    label: string;
    icon: React.ReactNode;
    permission?: Permission | string;
    subItems?: Omit<NavItem, 'icon' | 'subItems'>[];
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: <NavIcon>{ICONS.DASHBOARD}</NavIcon>, permission: 'dashboard:view' },
  { 
    label: 'Contacts', 
    icon: <NavIcon>{ICONS.CONTACTS}</NavIcon>,
    permission: 'contacts:view',
    subItems: [
        { path: '/contacts', label: 'Customers' },
        { path: '/contacts/suppliers', label: 'Suppliers' },
        { path: '/contacts/groups', label: 'Customer Groups' },
        { path: '/contacts/import', label: 'Import Contacts', permission: 'contacts:import' },
    ]
  },
  { 
    label: 'Products', 
    icon: <NavIcon>{ICONS.PRODUCTS}</NavIcon>, 
    permission: 'products:view',
    subItems: [
        { path: '/products', label: 'List Products' },
        { path: '/products/add', label: 'Add Product', permission: 'products:add' },
        { path: '/products/update-price', label: 'Update Price', permission: 'products:update_price' },
        { path: '/products/print-labels', label: 'Print Labels', permission: 'products:print_labels' },
        { path: '/products/variations', label: 'Variations', permission: 'products:variations' },
        { path: '/products/import', label: 'Import Products', permission: 'products:import' },
        { path: '/products/import-opening-stock', label: 'Import Opening Stock', permission: 'products:import_stock' },
        { path: '/products/selling-price-group', label: 'Selling Price Group', permission: 'products:price_groups' },
        { path: '/products/units', label: 'Units', permission: 'products:units' },
        { path: '/products/categories', label: 'Categories', permission: 'products:categories' },
        { path: '/products/brands', label: 'Brands', permission: 'products:brands' },
        { path: '/products/warranties', label: 'Warranties', permission: 'products:warranties' },
    ]
  },
  { 
    label: 'Purchases', 
    icon: <NavIcon>{ICONS.PURCHASES}</NavIcon>,
    permission: 'purchases:view',
    subItems: [
        { path: '/purchases', label: 'List Purchases' },
        { path: '/purchases/add', label: 'Add Purchase', permission: 'purchases:manage' },
        { path: '/purchases/returns', label: 'List Purchase Return' },
    ]
  },
  { 
    label: 'Sell', 
    icon: <NavIcon>{ICONS.SELL}</NavIcon>,
    permission: 'sell:view',
    subItems: [
        { path: '/sell/sales', label: 'All Sales', permission: 'sell:sales' },
        { path: '/sell/add', label: 'Add Sale', permission: 'sell:manage' },
        { path: '/sell/pos-list', label: 'List POS', permission: 'sell:pos' },
        { path: '/sell/pos', label: 'POS', permission: 'sell:pos' },
        { path: '/sell/drafts/add', label: 'Add Draft', permission: 'sell:manage' },
        { path: '/sell/drafts', label: 'List Drafts', permission: 'sell:view' },
        { path: '/sell/quotations/add', label: 'Add Quotation', permission: 'sell:manage' },
        { path: '/sell/quotations', label: 'List Quotations', permission: 'sell:view' },
        { path: '/sell/returns', label: 'List Sell Return', permission: 'sell:view' },
        { path: '/sell/shipments', label: 'Shipments', permission: 'shipping:view' },
        { path: '/sell/discounts', label: 'Discounts', permission: 'discounts:view' },
        { path: '/sell/import', label: 'Import Sales', permission: 'sell:manage' },
    ]
  },
  {
    label: 'Stock Transfers',
    icon: <NavIcon>{ICONS.STOCK_TRANSFERS}</NavIcon>,
    permission: 'stock_transfer:view',
    subItems: [
        { path: '/stock-transfers', label: 'List Stock transfers' },
        { path: '/stock-transfers/add', label: 'Add Stock transfers', permission: 'stock_transfer:manage' },
    ]
  },
  {
    label: 'Stock Adjustments',
    icon: <NavIcon>{ICONS.STOCK_ADJUSTMENTS}</NavIcon>,
    permission: 'stock_adjustment:view',
    subItems: [
        { path: '/stock-adjustments', label: 'List Stock Adjustments' },
        { path: '/stock-adjustments/add', label: 'Add Stock Adjustment', permission: 'stock_adjustment:manage' },
    ]
  },
  {
    label: 'Expenses',
    icon: <NavIcon>{ICONS.EXPENSES}</NavIcon>,
    permission: 'expense:view',
    subItems: [
        { path: '/expenses', label: 'List Expenses' },
        { path: '/expenses/add', label: 'Add Expense', permission: 'expense:manage' },
        { path: '/expenses/categories', label: 'Expense Categories', permission: 'expense:manage' },
    ]
  },
  {
    label: 'Reports',
    icon: <NavIcon>{ICONS.REPORTS}</NavIcon>,
    permission: 'reports:view',
    subItems: [
      { path: '/reports/profit-loss', label: 'Profit/Loss Reports' },
      { path: '/reports/purchase-sale', label: 'Purchase & Sale' },
      { path: '/reports/sales-analysis', label: 'Sales Analysis Report' },
      { path: '/reports/tax', label: 'Tax Report' },
      { path: '/reports/supplier-customer', label: 'Supplier & Customer Report' },
      { path: '/reports/customer-group', label: 'Customer Group Report' },
      { path: '/reports/stock', label: 'Stock Report' },
      { path: '/reports/stock-adjustment', label: 'Stock Adjustment Report' },
      { path: '/reports/trending-products', label: 'Trending Products' },
      { path: '/reports/items', label: 'Items Report' },
      { path: '/reports/product-purchase', label: 'Product Purchase Report' },
      { path: '/reports/product-sell', label: 'Product Sell Report' },
      { path: '/reports/expense', label: 'Expense Report' },
      { path: '/reports/register', label: 'Register Report' },
      { path: '/reports/sales-rep', label: 'Sales Representative Report' },
      { path: '/reports/activity-log', label: 'Activity Log' },
      { path: '/reports/customer-demand', label: 'Customer Demand Report', permission: 'reports:customer_demand' },
    ]
  },
  { path: '/users', label: 'User Management', icon: <NavIcon>{ICONS.USERS}</NavIcon>, permission: 'users:view' },
  { path: '/notification-templates', label: 'Notification Templates', icon: <NavIcon>{ICONS.NOTIFICATIONS}</NavIcon>, permission: 'notifications:manage' },
  { 
    label: 'Settings', 
    icon: <NavIcon>{ICONS.SETTINGS}</NavIcon>, 
    permission: 'settings:view',
    subItems: [
        { path: '/settings', label: 'General Settings' },
        { path: '/settings/locations', label: 'Business Locations', permission: 'settings:locations' },
        { path: '/settings/payment-methods', label: 'Payment Methods', permission: 'settings:payment' },
        { path: '/settings/age-verification', label: 'Age Verification', permission: 'settings:age_verification' },
        { path: '/settings/deployment', label: 'Deployment', permission: 'settings:view' }
    ]
  }
];