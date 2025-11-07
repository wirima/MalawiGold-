

import * as React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { LanguageProvider } from './src/i18n';
import { CurrencyProvider } from './contexts/CurrencyContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Chatbot from './components/Chatbot';
import ProtectedRoute from './components/ProtectedRoute';

// Loading indicator for lazy-loaded pages
const PageLoader: React.FC = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-indigo-500"></div>
  </div>
);

// Auth Pages (not lazy-loaded for faster initial access)
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';

// Lazy-load all main application page components
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const ProductsPage = React.lazy(() => import('./pages/ProductsPage'));
const POSPage = React.lazy(() => import('./pages/POSPage'));
const ContactsPage = React.lazy(() => import('./pages/ContactsPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));
const UsersRolesPage = React.lazy(() => import('./pages/UsersRolesPage'));
const UserProfilePage = React.lazy(() => import('./pages/UserProfilePage'));
const StockAdjustmentsPage = React.lazy(() => import('./pages/StockAdjustmentsPage'));
const ImportContactsPage = React.lazy(() => import('./pages/ImportContactsPage'));
const VariationsPage = React.lazy(() => import('./pages/VariationsPage'));
const BrandsPage = React.lazy(() => import('./pages/BrandsPage'));
const CategoriesPage = React.lazy(() => import('./pages/CategoriesPage'));
const UnitsPage = React.lazy(() => import('./pages/UnitsPage'));
const ImportUnitsPage = React.lazy(() => import('./pages/ImportUnitsPage'));
const AddProductPage = React.lazy(() => import('./pages/AddProductPage'));
const UpdatePricePage = React.lazy(() => import('./pages/UpdatePricePage'));
const SalesListPage = React.lazy(() => import('./pages/SalesListPage'));
const AddSalePage = React.lazy(() => import('./pages/AddSalePage'));
const ListDraftsPage = React.lazy(() => import('./pages/ListDraftsPage'));
const AddDraftPage = React.lazy(() => import('./pages/AddDraftPage'));
const ListQuotationsPage = React.lazy(() => import('./pages/ListQuotationsPage'));
const AddQuotationPage = React.lazy(() => import('./pages/AddQuotationPage'));
const NotificationTemplatesPage = React.lazy(() => import('./pages/NotificationTemplatesPage'));
const PurchasesPage = React.lazy(() => import('./pages/PurchasesListPage'));
const AddPurchasePage = React.lazy(() => import('./pages/AddPurchasePage'));
const AddPurchaseReturnPage = React.lazy(() => import('./pages/AddPurchaseReturnPage'));
const ExpensesPage = React.lazy(() => import('./pages/ExpensesPage'));
const ExpenseCategoriesPage = React.lazy(() => import('./pages/ExpenseCategoriesPage'));
const ProfitLossReportPage = React.lazy(() => import('./pages/reports/ProfitLossReportPage'));
const PurchaseSaleReportPage = React.lazy(() => import('./pages/reports/PurchaseSaleReportPage'));
const SalesAnalysisReportPage = React.lazy(() => import('./pages/reports/SalesAnalysisReportPage'));
const TaxReportPage = React.lazy(() => import('./pages/reports/TaxReportPage'));
const SupplierCustomerReportPage = React.lazy(() => import('./pages/reports/SupplierCustomerReportPage'));
const CustomerGroupReportPage = React.lazy(() => import('./pages/reports/CustomerGroupReportPage'));
const StockReportPage = React.lazy(() => import('./pages/reports/StockReportPage'));
const StockAdjustmentReportPage = React.lazy(() => import('./pages/reports/StockAdjustmentReportPage'));
const TrendingProductsReportPage = React.lazy(() => import('./pages/reports/TrendingProductsReportPage'));
const ItemsReportPage = React.lazy(() => import('./pages/reports/ItemsReportPage'));
const ProductPurchaseReportPage = React.lazy(() => import('./pages/reports/ProductPurchaseReportPage'));
const ProductSellReportPage = React.lazy(() => import('./pages/reports/ProductSellReportPage'));
const ExpenseReportPage = React.lazy(() => import('./pages/reports/ExpenseReportPage'));
const RegisterReportPage = React.lazy(() => import('./pages/reports/RegisterReportPage'));
const SalesRepReportPage = React.lazy(() => import('./pages/reports/SalesRepReportPage'));
const ActivityLogPage = React.lazy(() => import('./pages/reports/ActivityLogPage'));
const StockTransfersPage = React.lazy(() => import('./pages/StockTransfersPage'));
const AddStockTransferPage = React.lazy(() => import('./pages/AddStockTransferPage'));
const ShipmentsPage = React.lazy(() => import('./pages/ShipmentsPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const ProductDetailPage = React.lazy(() => import('./pages/ProductDetailPage'));
const ListPurchaseReturnsPage = React.lazy(() => import('./pages/ListPurchaseReturnsPage'));
const AddStockAdjustmentPage = React.lazy(() => import('./pages/AddStockAdjustmentPage'));
const BusinessLocationsPage = React.lazy(() => import('./pages/BusinessLocationsPage'));
const PaymentMethodsPage = React.lazy(() => import('./pages/PaymentMethodsPage'));
const ImportProductsPage = React.lazy(() => import('./pages/ImportProductsPage'));
const ImportOpeningStockPage = React.lazy(() => import('./pages/ImportOpeningStockPage'));
const DeploymentPage = React.lazy(() => import('./pages/DeploymentPage'));
const BackendArchitecturePage = React.lazy(() => import('./pages/BackendArchitecturePage'));
const PrintLabelsPage = React.lazy(() => import('./pages/PrintLabelsPage'));
const SaleReceiptPage = React.lazy(() => import('./pages/SaleReceiptPage'));
const AgeVerificationSettingsPage = React.lazy(() => import('./pages/AgeVerificationSettingsPage'));
const CustomerDemandReportPage = React.lazy(() => import('./pages/reports/CustomerDemandReportPage'));
const BrandingSettingsPage = React.lazy(() => import('./pages/BrandingSettingsPage'));
const ProductDocumentsPage = React.lazy(() => import('./pages/ProductDocumentsPage'));
const ListCustomerReturnsPage = React.lazy(() => import('./pages/ListCustomerReturnsPage'));
const AddCustomerReturnPage = React.lazy(() => import('./pages/AddCustomerReturnPage'));
const ReturnAnalysisReportPage = React.lazy(() => import('./pages/reports/ReturnAnalysisReportPage'));
const IntegrationsPage = React.lazy(() => import('./pages/IntegrationsPage'));
const VendorApiConnectionPage = React.lazy(() => import('./pages/VendorApiConnectionPage'));
const PaymentGatewayConnectionPage = React.lazy(() => import('./pages/PaymentGatewayConnectionPage'));
const BankAccountsPage = React.lazy(() => import('./pages/BankAccountsPage'));
const SubscriptionPage = React.lazy(() => import('./pages/SubscriptionPage'));
const StockTransferRequestsPage = React.lazy(() => import('./pages/StockTransferRequestsPage'));
const GrowthSuggestionsPage = React.lazy(() => import('./pages/GrowthSuggestionsPage'));
const ApiProxyGuidePage = React.lazy(() => import('./pages/ApiProxyGuidePage'));

const MainLayout: React.FC = () => (
  <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 dark:bg-slate-800 p-4 sm:p-6 lg:p-8">
        <React.Suspense fallback={<PageLoader />}>
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
            <Route path="/products/documents" element={<ProductDocumentsPage />} />

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
            <Route path="/sell/pos-list" element={<POSPage />} />
            <Route path="/sell/pos" element={<POSPage />} />
            <Route path="/sell/drafts" element={<ListDraftsPage />} />
            <Route path="/sell/drafts/add" element={<AddDraftPage />} />
            <Route path="/sell/drafts/edit/:draftId" element={<AddDraftPage />} />
            <Route path="/sell/quotations/add" element={<AddQuotationPage />} />
            <Route path="/sell/quotations/edit/:quotationId" element={<AddQuotationPage />} />
            <Route path="/sell/quotations" element={<ListQuotationsPage />} />
            <Route path="/sell/returns" element={<ListCustomerReturnsPage />} />
            <Route path="/sell/returns/add" element={<AddCustomerReturnPage />} />
            <Route path="/sell/shipments" element={<ShipmentsPage />} />
            <Route path="/sell/discounts" element={<POSPage />} />
            <Route path="/sell/import" element={<POSPage />} />
            <Route path="/sell/receipt/:saleId" element={<SaleReceiptPage />} />
            
            {/* Stock Adjustment & Transfer Routes */}
            <Route path="/stock-adjustments" element={<StockAdjustmentsPage />} />
            <Route path="/stock-adjustments/add" element={<AddStockAdjustmentPage />} />
            <Route path="/stock-transfers" element={<StockTransfersPage />} />
            <Route path="/stock-transfers/add" element={<AddStockTransferPage />} />
            <Route path="/stock-transfers/requests" element={<StockTransferRequestsPage />} />
            
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
            <Route path="/reports/return-analysis" element={<ReturnAnalysisReportPage />} />

            {/* User Management Routes */}
            <Route path="/users" element={<UsersRolesPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            
            {/* Growth & Strategy */}
            <Route path="/growth" element={<GrowthSuggestionsPage />} />

            {/* Settings & Notifications */}
            <Route path="/notification-templates" element={<NotificationTemplatesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/branding" element={<BrandingSettingsPage />} />
            <Route path="/settings/locations" element={<BusinessLocationsPage />} />
            <Route path="/settings/payment-methods" element={<PaymentMethodsPage />} />
            <Route path="/settings/bank-accounts" element={<BankAccountsPage />} />
            <Route path="/settings/age-verification" element={<AgeVerificationSettingsPage />} />
            <Route path="/settings/deployment" element={<DeploymentPage />} />
            <Route path="/settings/backend-architecture" element={<BackendArchitecturePage />} />
            <Route path="/settings/api-proxy-guide" element={<ApiProxyGuidePage />} />
            <Route path="/settings/integrations" element={<IntegrationsPage />} />
            <Route path="/settings/integrations/vendor-api" element={<VendorApiConnectionPage />} />
            <Route path="/settings/integrations/vendor-api/:connectionId" element={<VendorApiConnectionPage />} />
            <Route path="/settings/integrations/payment-gateway" element={<PaymentGatewayConnectionPage />} />
            <Route path="/settings/integrations/payment-gateway/:connectionId" element={<PaymentGatewayConnectionPage />} />
            <Route path="/settings/subscription" element={<SubscriptionPage />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </React.Suspense>
      </main>
    </div>
    <Chatbot />
  </div>
);

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OfflineProvider>
          <LanguageProvider>
            <CurrencyProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                
                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/*" element={<MainLayout />} />
                </Route>
              </Routes>
            </CurrencyProvider>
          </LanguageProvider>
        </OfflineProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
