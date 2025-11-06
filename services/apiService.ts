import { Product, User, Role, Sale, StockAdjustment, Customer, CustomerGroup, Supplier, Variation, VariationValue, Brand, Category, Unit, Draft, Quotation, Purchase, PurchaseReturn, Expense, ExpenseCategory, BusinessLocation, StockTransfer, Shipment, PaymentMethod, CustomerRequest, BrandingSettings, ProductDocument, CustomerReturn, IntegrationConnection, BankAccount, StockTransferRequest } from '../types';

// In a real application, this would be an environment variable
const BASE_URL = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'An unknown API error occurred.' }));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }
    // Handle cases where the response body might be empty (e.g., for a 204 No Content response)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
        return response.json();
    }
    return undefined as T;

  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    throw error;
  }
}

// Generic CRUD functions
const apiFactory = <T extends { id: string }>(resource: string) => ({
  getAll: () => request<T[]>(`/${resource}`),
  getById: (id: string) => request<T>(`/${resource}/${id}`),
  create: (data: Omit<T, 'id'>) => request<T>(`/${resource}`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<T>) => request<T>(`/${resource}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/${resource}/${id}`, { method: 'DELETE' }),
});


// Export API services for each resource
export const productsApi = apiFactory<Product>('products');
export const usersApi = apiFactory<User>('users');
export const rolesApi = apiFactory<Role>('roles');
export const salesApi = apiFactory<Sale>('sales');
export const customersApi = apiFactory<Customer>('customers');
export const suppliersApi = apiFactory<Supplier>('suppliers');
export const categoriesApi = apiFactory<Category>('categories');
export const brandsApi = apiFactory<Brand>('brands');
export const unitsApi = apiFactory<Unit>('units');
export const businessLocationsApi = apiFactory<BusinessLocation>('business-locations');
export const expensesApi = apiFactory<Expense>('expenses');
export const expenseCategoriesApi = apiFactory<ExpenseCategory>('expense-categories');
export const stockAdjustmentsApi = apiFactory<StockAdjustment>('stock-adjustments');
export const stockTransfersApi = apiFactory<StockTransfer>('stock-transfers');
export const stockTransferRequestsApi = apiFactory<StockTransferRequest>('stock-transfer-requests');
export const purchasesApi = apiFactory<Purchase>('purchases');
export const purchaseReturnsApi = apiFactory<PurchaseReturn>('purchase-returns');
export const customerReturnsApi = apiFactory<CustomerReturn>('customer-returns');
export const draftsApi = apiFactory<Draft>('drafts');
export const quotationsApi = apiFactory<Quotation>('quotations');
export const shipmentsApi = apiFactory<Shipment>('shipments');
export const paymentMethodsApi = apiFactory<PaymentMethod>('payment-methods');
export const bankAccountsApi = apiFactory<BankAccount>('bank-accounts');
export const integrationsApi = apiFactory<IntegrationConnection>('integrations');
export const customerRequestsApi = apiFactory<CustomerRequest>('customer-requests');
export const productDocumentsApi = apiFactory<ProductDocument>('product-documents');
export const customerGroupsApi = apiFactory<CustomerGroup>('customer-groups');
export const variationsApi = apiFactory<Variation>('variations');
export const variationValuesApi = apiFactory<VariationValue>('variation-values');

// Special cases or non-CRUD operations can be defined separately
export const settingsApi = {
    getBranding: () => request<BrandingSettings>('/settings/branding'),
    updateBranding: (data: Partial<BrandingSettings>) => request<BrandingSettings>('/settings/branding', { method: 'POST', body: JSON.stringify(data) }),
    getAgeVerification: () => request<any>('/settings/age-verification'),
    updateAgeVerification: (data: any) => request<any>('/settings/age-verification', { method: 'POST', body: JSON.stringify(data) }),
};
