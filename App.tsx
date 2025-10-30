


import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { OfflineProvider } from './contexts/OfflineContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ProductsPage from './pages/ProductsPage';
import POSPage from './pages/POSPage';
import ContactsPage from './pages/ContactsPage';
import NotFoundPage from './pages/NotFoundPage';
import UsersRolesPage from './pages/UsersRolesPage';
import UserProfilePage from './pages/UserProfilePage';
import StockAdjustmentsPage from './pages/StockAdjustmentsPage';
import ImportContactsPage from './pages/ImportContactsPage';
import VariationsPage from './pages/VariationsPage';
import BrandsPage from './pages/BrandsPage';
import CategoriesPage from './pages/CategoriesPage';
import UnitsPage from './pages/UnitsPage';
import AddProductPage from './pages/AddProductPage';
import UpdatePricePage from './pages/UpdatePricePage';
import SalesListPage from './pages/SalesListPage';
import AddSalePage from './pages/AddSalePage';
import UnderConstructionPage from './pages/UnderConstructionPage';
import ListDraftsPage from './pages/ListDraftsPage';
import AddDraftPage from './pages/AddDraftPage';
import PurchasesPage from './pages/PurchasesPage';
import AddPurchasePage from './pages/AddPurchasePage';
import AddPurchaseReturnPage from './pages/AddPurchaseReturnPage';
import ExpensesPage from './pages/ExpensesPage';
import ExpenseCategoriesPage from './pages/ExpenseCategoriesPage';
import ProfitLossReportPage from './pages/reports/ProfitLossReportPage';
import PurchaseSaleReportPage from './pages/reports/PurchaseSaleReportPage';
import SalesAnalysisReportPage from './pages/reports/SalesAnalysisReportPage';
import TaxReportPage from './pages/reports/TaxReportPage';
import SupplierCustomerReportPage from './pages/reports/SupplierCustomerReportPage';
import CustomerGroupReportPage from './pages/reports/CustomerGroupReportPage';
import StockReportPage from './pages/reports/StockReportPage';
import StockAdjustmentReportPage from './pages/reports/StockAdjustmentReportPage';
import TrendingProductsReportPage from './pages/reports/TrendingProductsReportPage';
import ItemsReportPage from './pages/reports/ItemsReportPage';
import ProductPurchaseReportPage from './pages/reports/ProductPurchaseReportPage';
import ProductSellReportPage from './pages/reports/ProductSellReportPage';
import ExpenseReportPage from './pages/reports/ExpenseReportPage';
import RegisterReportPage from './pages/reports/RegisterReportPage';
import SalesRepReportPage from './pages/reports/SalesRepReportPage';
import ActivityLogPage from './pages/reports/ActivityLogPage';
import StockTransfersPage from './pages/StockTransfersPage';
import AddStockTransferPage from './pages/AddStockTransferPage';
import ShipmentsPage from './pages/ShipmentsPage';
import SettingsPage from './pages/SettingsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ListPurchaseReturnsPage from './pages/ListPurchaseReturnsPage';
import AddStockAdjustmentPage from './pages/AddStockAdjustmentPage';
import BusinessLocationsPage from './pages/BusinessLocationsPage';
import PaymentMethodsPage from './pages/PaymentMethodsPage';
import ImportProductsPage from './pages/ImportProductsPage';
import ImportOpeningStockPage from './pages/ImportOpeningStockPage';
import DeploymentPage from './pages/DeploymentPage';
import PrintLabelsPage from './pages/PrintLabelsPage';
import SaleReceiptPage from './pages/SaleReceiptPage';
import AgeVerificationSettingsPage from './pages/AgeVerificationSettingsPage';
import CustomerDemandReportPage from './pages/reports/CustomerDemandReportPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <OfflineProvider>
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 dark:bg-slate-800 p-4 sm:p-6 lg:p-8">
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
                <Route path="/settings/locations" element={<BusinessLocationsPage />} />
                <Route path="/settings/payment-methods" element={<PaymentMethodsPage />} />
                <Route path="/settings/age-verification" element={<AgeVerificationSettingsPage />} />
                <Route path="/settings/deployment" element={<DeploymentPage />} />


                {/* Catch-all */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </OfflineProvider>
    </AuthProvider>
  );
};

export default App;