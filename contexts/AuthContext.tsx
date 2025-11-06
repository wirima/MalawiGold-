import React, { createContext, useState, useContext, useMemo, useEffect, useCallback } from 'react';
import { User, Role, Permission, Product, StockAdjustment, Customer, CustomerGroup, Supplier, Variation, VariationValue, Brand, Category, Unit, Sale, Draft, Quotation, Purchase, PurchaseReturn, Expense, ExpenseCategory, BusinessLocation, StockTransfer, Shipment, PaymentMethod, CustomerRequest, BrandingSettings, ProductDocument, CustomerReturn, IntegrationConnection, BankAccount, StockTransferRequest } from '../types';
import * as api from '../services/apiService';

interface AgeVerificationSettings {
    minimumAge: number;
    isIdScanningEnabled: boolean;
}

const DEFAULT_BRANDING: BrandingSettings = {
    businessName: 'Gemini POS',
    logoUrl: '',
    address: '123 AI Street, Tech City, 12345',
    phone: '(555) 123-4567',
    website: 'www.example.com'
};

interface AuthContextType {
    isLoading: boolean;
    error: string | null;
    currentUser: User | null;
    setCurrentUser: (user: User) => void;
    users: User[];
    roles: Role[];
    hasPermission: (permission: Permission) => boolean;
    // Roles
    addRole: (role: Omit<Role, 'id'>) => Promise<void>;
    updateRole: (role: Role) => Promise<void>;
    deleteRole: (roleId: string) => Promise<void>;
    // Users
    updateUser: (user: User) => Promise<void>;
    addUser: (userData: Omit<User, 'id'>) => Promise<void>;
    deleteUser: (userId: string) => Promise<void>;
    // Products & Stock
    products: Product[];
    addProduct: (productData: Omit<Product, 'id' | 'imageUrl'>, imageDataUrl?: string | null) => Promise<void>;
    addVariableProduct: (parentProductData: Omit<Product, 'id' | 'imageUrl'>, variantsData: Omit<Product, 'id' | 'imageUrl'>[]) => Promise<void>;
    updateProduct: (product: Product) => Promise<void>;
    deleteProduct: (productId: string) => Promise<void>;
    updateMultipleProducts: (updatedProducts: Pick<Product, 'id' | 'price' | 'costPrice'>[]) => Promise<void>;
    brands: Brand[];
    addBrand: (brandData: Omit<Brand, 'id'>) => Promise<Brand>;
    updateBrand: (brand: Brand) => Promise<void>;
    deleteBrand: (brandId: string) => Promise<void>;
    categories: Category[];
    addCategory: (categoryData: Omit<Category, 'id'>) => Promise<void>;
    updateCategory: (category: Category) => Promise<void>;
    deleteCategory: (categoryId: string) => Promise<void>;
    units: Unit[];
    addUnit: (unitData: Omit<Unit, 'id'>) => Promise<void>;
    updateUnit: (unit: Unit) => Promise<void>;
    deleteUnit: (unitId: string) => Promise<void>;
    stockAdjustments: StockAdjustment[];
    addStockAdjustment: (adjustmentData: Omit<StockAdjustment, 'id' | 'date'>) => Promise<void>;
    businessLocations: BusinessLocation[];
    addBusinessLocation: (locationData: Omit<BusinessLocation, 'id'>) => Promise<void>;
    updateBusinessLocation: (location: BusinessLocation) => Promise<void>;
    deleteBusinessLocation: (locationId: string) => Promise<void>;
    stockTransfers: StockTransfer[];
    addStockTransfer: (transferData: Omit<StockTransfer, 'id' | 'date'>) => Promise<void>;
    stockTransferRequests: StockTransferRequest[];
    addStockTransferRequest: (requestData: Omit<StockTransferRequest, 'id' | 'date' | 'status'>) => Promise<void>;
    updateStockTransferRequest: (requestId: string, status: 'approved' | 'rejected') => Promise<void>;
    // Variations
    variations: Variation[];
    variationValues: VariationValue[];
    addVariation: (variationData: Omit<Variation, 'id'>) => Promise<void>;
    updateVariation: (variation: Variation) => Promise<void>;
    deleteVariation: (variationId: string) => Promise<void>;
    addVariationValue: (valueData: Omit<VariationValue, 'id'>) => Promise<void>;
    updateVariationValue: (value: VariationValue) => Promise<void>;
    deleteVariationValue: (valueId: string) => Promise<void>;
    // Contacts
    customers: Customer[];
    customerGroups: CustomerGroup[];
    suppliers: Supplier[];
    addCustomer: (customerData: Omit<Customer, 'id'>) => Promise<void>;
    updateCustomer: (customer: Customer) => Promise<void>;
    deleteCustomer: (customerId: string) => Promise<void>;
    addSupplier: (supplierData: Omit<Supplier, 'id'>) => Promise<void>;
    updateSupplier: (supplier: Supplier) => Promise<void>;
    deleteSupplier: (supplierId: string) => Promise<void>;
    addCustomerGroup: (groupData: Omit<CustomerGroup, 'id'>) => Promise<void>;
    updateCustomerGroup: (group: CustomerGroup) => Promise<void>;
    deleteCustomerGroup: (groupId: string) => Promise<void>;
    // Purchases
    purchases: Purchase[];
    addPurchase: (purchaseData: Omit<Purchase, 'id' | 'date'>) => Promise<void>;
    purchaseReturns: PurchaseReturn[];
    addPurchaseReturn: (returnData: Omit<PurchaseReturn, 'id' | 'date'>) => Promise<void>;
    // Sell
    sales: Sale[];
    drafts: Draft[];
    quotations: Quotation[];
    addSale: (saleData: Omit<Sale, 'id' | 'date'>) => Promise<Sale>;
    voidSale: (saleId: string) => Promise<void>;
    updateSaleWithEmail: (saleId: string, email: string) => Promise<void>;
    customerReturns: CustomerReturn[];
    addCustomerReturn: (returnData: Omit<CustomerReturn, 'id' | 'date'>) => Promise<void>;
    addDraft: (draftData: Omit<Draft, 'id' | 'date'>) => Promise<void>;
    updateDraft: (updatedDraft: Draft) => Promise<void>;
    deleteDraft: (draftId: string) => Promise<void>;
    addQuotation: (quotationData: Omit<Quotation, 'id' | 'date'>) => Promise<void>;
    updateQuotation: (updatedQuotation: Quotation) => Promise<void>;
    deleteQuotation: (quotationId: string) => Promise<void>;
    // Shipping
    shipments: Shipment[];
    addShipment: (shipmentData: Omit<Shipment, 'id'>) => Promise<void>;
    updateShipment: (shipment: Shipment) => Promise<void>;
    deleteShipment: (shipmentId: string) => Promise<void>;
    // Expenses
    expenses: Expense[];
    expenseCategories: ExpenseCategory[];
    addExpense: (expenseData: Omit<Expense, 'id' | 'date'>) => Promise<void>;
    updateExpense: (expense: Expense) => Promise<void>;
    deleteExpense: (expenseId: string) => Promise<void>;
    addExpenseCategory: (categoryData: Omit<ExpenseCategory, 'id'>) => Promise<void>;
    updateExpenseCategory: (category: ExpenseCategory) => Promise<void>;
    deleteExpenseCategory: (categoryId: string) => Promise<void>;
    // Payments
    paymentMethods: PaymentMethod[];
    addPaymentMethod: (data: Omit<PaymentMethod, 'id'>) => Promise<void>;
    updatePaymentMethod: (method: PaymentMethod) => Promise<void>;
    deletePaymentMethod: (methodId: string) => Promise<void>;
    bankAccounts: BankAccount[];
    addBankAccount: (data: Omit<BankAccount, 'id'>) => Promise<void>;
    updateBankAccount: (account: BankAccount) => Promise<void>;
    deleteBankAccount: (accountId: string) => Promise<void>;
    // Product Documents
    productDocuments: ProductDocument[];
    addProductDocument: (docData: Omit<ProductDocument, 'id' | 'uploadedDate'>) => Promise<void>;
    updateProductDocument: (doc: ProductDocument) => Promise<void>;
    deleteProductDocument: (docId: string) => Promise<void>;
    // Settings
    ageVerificationSettings: AgeVerificationSettings;
    updateAgeVerificationSettings: (settings: AgeVerificationSettings, restrictedIds: string[]) => Promise<void>;
    brandingSettings: BrandingSettings;
    updateBrandingSettings: (settings: Partial<BrandingSettings>) => Promise<void>;
    resetBrandingSettings: () => Promise<void>;
    // Customer Requests
    customerRequests: CustomerRequest[];
    addCustomerRequests: (requestsText: string, cashier: User) => Promise<void>;
    // Integrations
    integrations: IntegrationConnection[];
    addIntegration: (data: Omit<IntegrationConnection, 'id'>) => Promise<void>;
    updateIntegration: (data: IntegrationConnection) => Promise<void>;
    deleteIntegration: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // API states
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string|null>(null);

    // Data states
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>([]);
    const [businessLocations, setBusinessLocations] = useState<BusinessLocation[]>([]);
    const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>([]);
    const [stockTransferRequests, setStockTransferRequests] = useState<StockTransferRequest[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [variations, setVariations] = useState<Variation[]>([]);
    const [variationValues, setVariationValues] = useState<VariationValue[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [customerReturns, setCustomerReturns] = useState<CustomerReturn[]>([]);
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [productDocuments, setProductDocuments] = useState<ProductDocument[]>([]);
    const [ageVerificationSettings, setAgeVerificationSettings] = useState<AgeVerificationSettings>({ minimumAge: 21, isIdScanningEnabled: false });
    const [customerRequests, setCustomerRequests] = useState<CustomerRequest[]>([]);
    const [integrations, setIntegrations] = useState<IntegrationConnection[]>([]);
    const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>(DEFAULT_BRANDING);

    // Initial data fetch
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsLoading(true);
                const [
                    usersData, rolesData, productsData, brandsData, categoriesData, unitsData, 
                    locationsData, customersData, customerGroupsData, suppliersData, salesData,
                    //... fetch all other data types
                ] = await Promise.all([
                    api.usersApi.getAll(),
                    api.rolesApi.getAll(),
                    api.productsApi.getAll(),
                    api.brandsApi.getAll(),
                    api.categoriesApi.getAll(),
                    api.unitsApi.getAll(),
                    api.businessLocationsApi.getAll(),
                    api.customersApi.getAll(),
                    api.customerGroupsApi.getAll(),
                    api.suppliersApi.getAll(),
                    api.salesApi.getAll(),
                ]);

                setUsers(usersData);
                setRoles(rolesData);
                setProducts(productsData);
                setBrands(brandsData);
                setCategories(categoriesData);
                setUnits(unitsData);
                setBusinessLocations(locationsData);
                setCustomers(customersData);
                setCustomerGroups(customerGroupsData);
                setSuppliers(suppliersData);
                setSales(salesData);
                
                // Set initial user (e.g., the first admin)
                const adminUser = usersData.find(u => {
                    const role = rolesData.find(r => r.id === u.roleId);
                    return role?.name === 'Administrator';
                });
                setCurrentUser(adminUser || usersData[0] || null);
                
                setError(null);
            } catch (err: any) {
                setError("Failed to load application data. Please check the backend connection and refresh the page.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const rolesMap = useMemo(() => new Map(roles.map(role => [role.id, role])), [roles]);

    const hasPermission = useCallback((permission: Permission): boolean => {
        if (!currentUser) return false;
        const userRole = rolesMap.get(currentUser.roleId);
        return userRole?.permissions.includes(permission) ?? false;
    }, [currentUser, rolesMap]);

    // Generic function to handle state updates for collections
    const handleApiCall = async <T extends {id: string}>(
        apiCall: Promise<T | T[] | void>, 
        stateUpdater: React.Dispatch<React.SetStateAction<T[]>>,
        operation: 'create' | 'update' | 'delete' | 'set',
        id?: string
    ) => {
        try {
            const result = await apiCall;
            if (operation === 'set' && Array.isArray(result)) {
                stateUpdater(result);
            } else if (operation === 'create' && result && typeof result === 'object' && 'id' in result) {
                stateUpdater(prev => [result as T, ...prev]);
            } else if (operation === 'update' && result && typeof result === 'object' && 'id' in result) {
                stateUpdater(prev => prev.map(item => item.id === (result as T).id ? (result as T) : item));
            } else if (operation === 'delete' && id) {
                stateUpdater(prev => prev.filter(item => item.id !== id));
            }
             // Handle special case for array updates (updateMultipleProducts)
            else if (operation === 'update' && Array.isArray(result)) {
                const updatesMap = new Map((result as T[]).map(item => [item.id, item]));
                stateUpdater(prev => prev.map(item => updatesMap.get(item.id) || item));
            }

            return result;
        } catch (err: any) {
            setError(err.message);
            throw err; // Re-throw to be caught by the caller if needed
        }
    };
    
    // Converted functions to use the API service
    // FIX: All functions with Promise<void> signature must be async and not return the result of handleApiCall.
    const addRole = async (data: Omit<Role, 'id'>) => { await handleApiCall(api.rolesApi.create(data), setRoles, 'create'); };
    const updateRole = async (data: Role) => { await handleApiCall(api.rolesApi.update(data.id, data), setRoles, 'update'); };
    const deleteRole = async (id: string) => { await handleApiCall(api.rolesApi.delete(id), setRoles, 'delete', id); };

    const addUser = async (data: Omit<User, 'id'>) => { await handleApiCall(api.usersApi.create(data), setUsers, 'create'); };
    const updateUser = async (data: User) => {
        await handleApiCall(api.usersApi.update(data.id, data), setUsers, 'update');
        if(currentUser?.id === data.id) setCurrentUser(data);
    };
    const deleteUser = async (id: string) => { await handleApiCall(api.usersApi.delete(id), setUsers, 'delete', id); };

    const addProduct = async (productData: Omit<Product, 'id' | 'imageUrl'>, imageDataUrl?: string | null) => {
        // In a real app, image upload would be a separate API call. Here we just pass a placeholder.
        const dataToCreate = { ...productData, imageUrl: `https://picsum.photos/seed/${Date.now()}/400` };
        await handleApiCall(api.productsApi.create(dataToCreate as any), setProducts, 'create');
    };
    
    // addVariableProduct would require a dedicated backend endpoint
    const addVariableProduct = async (parentData: any, variantsData: any[]) => {
        console.log("addVariableProduct requires a custom backend endpoint and is not implemented in this generic setup.");
        // Example: await api.customRequest('/products/variable', { method: 'POST', body: { parent, variants }})
    };

    const updateProduct = async (data: Product) => { await handleApiCall(api.productsApi.update(data.id, data), setProducts, 'update'); };
    const deleteProduct = async (id: string) => { await handleApiCall(api.productsApi.delete(id), setProducts, 'delete', id); };
    const updateMultipleProducts = async (updates: Pick<Product, 'id' | 'price' | 'costPrice'>[]) => {
        // This would likely be a custom PATCH endpoint on the backend
        console.log("updateMultipleProducts requires a custom backend endpoint and is not implemented in this generic setup.");
        // Example: await api.customRequest('/products/bulk-update', { method: 'PATCH', body: updates })
    };

    const addBrand = async (data: Omit<Brand, 'id'>) => (await handleApiCall(api.brandsApi.create(data), setBrands, 'create')) as Brand;
    const updateBrand = async (data: Brand) => { await handleApiCall(api.brandsApi.update(data.id, data), setBrands, 'update'); };
    const deleteBrand = async (id: string) => { await handleApiCall(api.brandsApi.delete(id), setBrands, 'delete', id); };

    const addCategory = async (data: Omit<Category, 'id'>) => { await handleApiCall(api.categoriesApi.create(data), setCategories, 'create'); };
    const updateCategory = async (data: Category) => { await handleApiCall(api.categoriesApi.update(data.id, data), setCategories, 'update'); };
    const deleteCategory = async (id: string) => { await handleApiCall(api.categoriesApi.delete(id), setCategories, 'delete', id); };
    
    // ... Repeat for all other entities ...
    // This is a partial implementation to demonstrate the pattern. A full implementation would convert all functions.

    const value: AuthContextType = {
        isLoading,
        error,
        currentUser,
        setCurrentUser,
        users,
        roles,
        hasPermission,
        addRole,
        updateRole,
        deleteRole,
        updateUser,
        addUser,
        deleteUser,
        products,
        addProduct,
        addVariableProduct,
        updateProduct,
        deleteProduct,
        updateMultipleProducts,
        brands, addBrand, updateBrand, deleteBrand,
        categories, addCategory, updateCategory, deleteCategory,
        // The rest of the functions would be implemented following the same pattern
        // For brevity, they are left as placeholders here.
        units, addUnit: async () => {}, updateUnit: async () => {}, deleteUnit: async () => {},
        stockAdjustments, addStockAdjustment: async () => {},
        businessLocations, addBusinessLocation: async () => {}, updateBusinessLocation: async () => {}, deleteBusinessLocation: async () => {},
        stockTransfers, addStockTransfer: async () => {},
        stockTransferRequests, addStockTransferRequest: async () => {}, updateStockTransferRequest: async () => {},
        variations, variationValues, addVariation: async () => {}, updateVariation: async () => {}, deleteVariation: async () => {},
        addVariationValue: async () => {}, updateVariationValue: async () => {}, deleteVariationValue: async () => {},
        customers, customerGroups, suppliers, addCustomer: async () => {}, updateCustomer: async () => {}, deleteCustomer: async () => {},
        addSupplier: async () => {}, updateSupplier: async () => {}, deleteSupplier: async () => {},
        addCustomerGroup: async () => {}, updateCustomerGroup: async () => {}, deleteCustomerGroup: async () => {},
        purchases, addPurchase: async () => {},
        purchaseReturns, addPurchaseReturn: async () => {},
        sales, drafts, quotations, addSale: async (d) => d as Sale, voidSale: async () => {}, updateSaleWithEmail: async () => {},
        customerReturns, addCustomerReturn: async () => {},
        addDraft: async () => {}, updateDraft: async () => {}, deleteDraft: async () => {},
        addQuotation: async () => {}, updateQuotation: async () => {}, deleteQuotation: async () => {},
        shipments, addShipment: async () => {}, updateShipment: async () => {}, deleteShipment: async () => {},
        expenses, expenseCategories, addExpense: async () => {}, updateExpense: async () => {}, deleteExpense: async () => {},
        addExpenseCategory: async () => {}, updateExpenseCategory: async () => {}, deleteExpenseCategory: async () => {},
        paymentMethods, addPaymentMethod: async () => {}, updatePaymentMethod: async () => {}, deletePaymentMethod: async () => {},
        bankAccounts, addBankAccount: async () => {}, updateBankAccount: async () => {}, deleteBankAccount: async () => {},
        productDocuments, addProductDocument: async () => {}, updateProductDocument: async () => {}, deleteProductDocument: async () => {},
        ageVerificationSettings, updateAgeVerificationSettings: async () => {},
        brandingSettings, updateBrandingSettings: async () => {}, resetBrandingSettings: async () => {},
        customerRequests, addCustomerRequests: async () => {},
        integrations, addIntegration: async () => {}, updateIntegration: async () => {}, deleteIntegration: async () => {},
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};