import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { LanguageProvider } from './src/i18n';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Loading indicator for lazy-loaded pages
const PageLoader: React.FC = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-indigo-500"></div>
  </div>
);

// Lazy-load all page components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const POSPage = lazy(() => import('./pages/POSPage'));
const ContactsPage = lazy(() => import('./pages/ContactsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const UsersRolesPage = lazy(() => import('./pages/UsersRolesPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const StockAdjustmentsPage = lazy(() => import('./pages/StockAdjustmentsPage'));
const ImportContactsPage = lazy(() => import('./pages/ImportContactsPage'));
const VariationsPage = lazy(() => import('./pages/VariationsPage'));
const BrandsPage = lazy(() => import('./pages/BrandsPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const UnitsPage = lazy(() => import('./pages/UnitsPage'));
const ImportUnitsPage = lazy(() => import('./pages/ImportUnitsPage'));
const AddProductPage = lazy(() => import('./pages/AddProductPage'));
const UpdatePricePage = lazy(() => import('./pages/UpdatePricePage'));
const SalesListPage = lazy(() => import('./pages/SalesListPage'));
const AddSalePage = lazy(() => import('./pages/AddSalePage'));
const UnderConstructionPage = lazy(() => import('./pages/UnderConstructionPage'));
const ListDraftsPage = lazy(() => import('./pages/ListDraftsPage'));
const AddDraftPage = lazy(() => import('./pages/AddDraftPage'));
const PurchasesPage = lazy(() => import('./pages/PurchasesPage'));
const AddPurchasePage = lazy(() => import('./pages/AddPurchasePage'));
const AddPurchaseReturnPage = lazy(() => import('./pages/AddPurchaseReturnPage'));
const ExpensesPage = lazy(() => import('./pages/ExpensesPage'));
const ExpenseCategoriesPage = lazy(() => import('./pages/ExpenseCategoriesPage'));
const ProfitLossReportPage = lazy(() => import('./pages/reports/ProfitLossReportPage'));
const PurchaseSaleReportPage = lazy(() => import('./pages/reports/PurchaseSaleReportPage'));
const SalesAnalysisReportPage = lazy(() => import('./pages/reports/SalesAnalysisReportPage'));
const TaxReportPage = lazy(() => import('./pages/reports/TaxReportPage'));
const SupplierCustomerReportPage = lazy(() => import('./pages/reports/SupplierCustomerReportPage'));
const CustomerGroupReportPage = lazy(() => import('./pages/reports/CustomerGroupReportPage'));
const StockReportPage = lazy(() => import('./pages/reports/StockReportPage'));
const StockAdjustmentReportPage = lazy(() => import('./pages/reports/StockAdjustmentReportPage'));
const TrendingProductsReportPage = lazy(() => import('./pages/reports/TrendingProductsReportPage'));
const ItemsReportPage = lazy(() => import('./pages/reports/ItemsReportPage'));
const ProductPurchaseReportPage = lazy(() => import('./pages/reports/ProductPurchaseReportPage'));
const ProductSellReportPage = lazy(() => import('./pages/reports/ProductSellReportPage'));
const ExpenseReportPage = lazy(() => import('./pages/reports/ExpenseReportPage'));
const RegisterReportPage = lazy(() => import('./pages/reports/RegisterReportPage'));
const SalesRepReportPage = lazy(() => import('./pages/reports/SalesRepReportPage'));
const ActivityLogPage = lazy(() => import('./pages/reports/ActivityLogPage'));
const StockTransfersPage = lazy(() => import('./pages/StockTransfersPage'));
const AddStockTransferPage = lazy(() => import('./pages/AddStockTransferPage'));
const ShipmentsPage = lazy(() => import('./pages/ShipmentsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const ListPurchaseReturnsPage = lazy(() => import('./pages/ListPurchaseReturnsPage'));
const AddStockAdjustmentPage = lazy(() => import('./pages/AddStockAdjustmentPage'));
const BusinessLocationsPage = lazy(() => import('./pages/BusinessLocationsPage'));
const PaymentMethodsPage = lazy(() => import('./pages/PaymentMethodsPage'));
const ImportProductsPage = lazy(() => import('./pages/ImportProductsPage'));
const ImportOpeningStockPage = lazy(() => import('./pages/ImportOpeningStockPage'));
const DeploymentPage = lazy(() => import('./pages/DeploymentPage'));
const PrintLabelsPage = lazy(() => import('./pages/PrintLabelsPage'));
const SaleReceiptPage = lazy(() => import('./pages/SaleReceiptPage'));
const AgeVerificationSettingsPage = lazy(() => import('./pages/AgeVerificationSettingsPage'));
const CustomerDemandReportPage = lazy(() => import('./pages/reports/CustomerDemandReportPage'));
const BrandingSettingsPage = lazy(() => import('./pages/BrandingSettingsPage'));

const App: React.FC = () => {
  return (
    <AuthProvider>
      <OfflineProvider>
        <LanguageProvider>
          <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 dark:bg-slate-800 p-4 sm:p-6 lg:p-8">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    {/* Products Routes */}
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:productId" element={<ProductDetailPage />} />
                    <Route path="/products/add" element={<AddProductPage />} />
                    <Route path="/products/update-price" element={<UpdatePricePage />} />
                    <Route path="/products/print-labels" element={<PrintLabelsPage />} />
                    <Route path="/products/variations" element={<VariationsPage />} />
                    <Route path="/products/import" element={<ImportProductsPage />} />
                    <Route path="/products/import-opening-stock" element={<ImportOpeningStockPage />} />
                    <Route path="/products/selling-price-group" element={<NotFoundPage />} />
                    <Route path="/products/units" element={<UnitsPage />} />
                    <Route path="/products/units/import" element={<ImportUnitsPage />} />
                    <Route path="/products/categories" element={<CategoriesPage />} />
                    <Route path="/products/brands" element={<BrandsPage />} />
                    <Route path="/products/warranties" element={<NotFoundPage />} />

                    {/* Contacts Routes */}
                    <Route path="/contacts" element={<ContactsPage />} />
                    <Route path="/contacts/suppliers" element={<ContactsPage />} />
                    <Route path="/contacts/groups" element={<ContactsPage />} />
                    <Route path="/contacts/import" element={<ImportContactsPage />} />

                    {/* Purchases Routes */}
                    <Route path="/purchases" element={<PurchasesPage />} />
                    <Route path="/purchases/add" element={<AddPurchasePage />} />
                    <Route path="/purchases/returns" element={<ListPurchaseReturnsPage />} />
                    <Route path="/purchases/returns/add" element={<AddPurchaseReturnPage />} />

                    {/* Sell Routes */}
                    <Route path="/sell/sales" element={<SalesListPage />} />
                    <Route path="/sell/add" element={<AddSalePage />} />
                    <Route path="/sell/pos-list" element={<UnderConstructionPage />} />
                    <Route path="/sell/pos" element={<POSPage />} />
                    <Route path="/sell/drafts" element={<ListDraftsPage />} />
                    <Route path="/sell/drafts/add" element={<AddDraftPage />} />
                    <Route path="/sell/drafts/edit/:draftId" element={<AddDraftPage />} />
                    <Route path="/sell/quotations/add" element={<UnderConstructionPage />} />
                    <Route path="/sell/quotations" element={<UnderConstructionPage />} />
                    <Route path="/sell/returns" element={<UnderConstructionPage />} />
                    <Route path="/sell/shipments" element={<ShipmentsPage />} />
                    <Route path="/sell/discounts" element={<UnderConstructionPage />} />
                    <Route path="/sell/import" element={<UnderConstructionPage />} />
                    <Route path="/sell/receipt/:saleId" element={<SaleReceiptPage />} />
                    
                    {/* Stock Adjustment & Transfer Routes */}
                    <Route path="/stock-adjustments" element={<StockAdjustmentsPage />} />
                    <Route path="/stock-adjustments/add" element={<AddStockAdjustmentPage />} />
                    <Route path="/stock-transfers" element={<StockTransfersPage />} />
                    <Route path="/stock-transfers/add" element={<AddStockTransferPage />} />
                    
                    {/* Expenses Routes */}
                    <Route path="/expenses" element={<ExpensesPage />} />
                    <Route path="/expenses/add" element={<ExpensesPage />} />
                    <Route path="/expenses/categories" element={<ExpenseCategoriesPage />} />


                    {/* Reports Routes */}
                    <Route path="/reports/profit-loss" element={<ProfitLossReportPage />} />
                    <Route path="/reports/purchase-sale" element={<PurchaseSaleReportPage />} />
                    <Route path="/reports/sales-analysis" element={<SalesAnalysisReportPage />} />
                    <Route path="/reports/tax" element={<TaxReportPage />} />
                    <Route path="/reports/supplier-customer" element={<SupplierCustomerReportPage />} />
                    <Route path="/reports/customer-group" element={<CustomerGroupReportPage />} />
                    <Route path="/reports/stock" element={<StockReportPage />} />
                    <Route path="/reports/stock-adjustment" element={<StockAdjustmentReportPage />} />
                    <Route path="/reports/trending-products" element={<TrendingProductsReportPage />} />
                    <Route path="/reports/items" element={<ItemsReportPage />} />
                    <Route path="/reports/product-purchase" element={<ProductPurchaseReportPage />} />
                    <Route path="/reports/product-sell" element={<ProductSellReportPage />} />
                    <Route path="/reports/expense" element={<ExpenseReportPage />} />
                    <Route path="/reports/register" element={<RegisterReportPage />} />
                    <Route path="/reports/sales-rep" element={<SalesRepReportPage />} />
                    <Route path="/reports/activity-log" element={<ActivityLogPage />} />
                    <Route path="/reports/customer-demand" element={<CustomerDemandReportPage />} />

                    {/* User Management Routes */}
                    <Route path="/users" element={<UsersRolesPage />} />
                    <Route path="/profile" element={<UserProfilePage />} />
                    
                    {/* Settings & Notifications */}
                    <Route path="/notification-templates" element={<NotFoundPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/settings/branding" element={<BrandingSettingsPage />} />
                    <Route path="/settings/locations" element={<BusinessLocationsPage />} />
                    <Route path="/settings/payment-methods" element={<PaymentMethodsPage />} />
                    <Route path="/settings/age-verification" element={<AgeVerificationSettingsPage />} />
                    <Route path="/settings/deployment" element={<DeploymentPage />} />


                    {/* Catch-all */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </main>
            </div>
          </div>
        </LanguageProvider>
      </OfflineProvider>
    </AuthProvider>
  );
};

export default App;