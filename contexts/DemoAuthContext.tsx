import React, { useState, useCallback, useMemo } from 'react';
// Import the original context and its type
import { AuthContext, AuthContextType } from './AuthContext';
import { User, Role, Permission, Product, StockAdjustment, Customer, CustomerGroup, Supplier, Variation, VariationValue, Brand, Category, Unit, Sale, Draft, Quotation, Purchase, PurchaseReturn, Expense, ExpenseCategory, BusinessLocation, StockTransfer, Shipment, PaymentMethod, CustomerRequest, BrandingSettings, ProductDocument, CustomerReturn, IntegrationConnection, BankAccount, StockTransferRequest, NotificationTemplate, CartItem } from '../types';
import { MOCK_USERS, MOCK_ROLES, MOCK_PRODUCTS, MOCK_STOCK_ADJUSTMENTS, MOCK_CUSTOMERS, MOCK_CUSTOMER_GROUPS, MOCK_SUPPLIERS, MOCK_VARIATIONS, MOCK_VARIATION_VALUES, MOCK_BRANDS, MOCK_CATEGORIES, MOCK_UNITS, MOCK_SALES, MOCK_DRAFTS, MOCK_QUOTATIONS, MOCK_PURCHASES, MOCK_PURCHASE_RETURNS, MOCK_EXPENSES, MOCK_EXPENSE_CATEGORIES, MOCK_BUSINESS_LOCATIONS, MOCK_STOCK_TRANSFERS, MOCK_SHIPMENTS, MOCK_PAYMENT_METHODS, MOCK_CUSTOMER_REQUESTS, MOCK_PRODUCT_DOCUMENTS, MOCK_CUSTOMER_RETURNS, MOCK_BANK_ACCOUNTS, MOCK_STOCK_TRANSFER_REQUESTS, MOCK_NOTIFICATION_TEMPLATES, MOCK_INTEGRATIONS } from '../data/mockData';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';


interface AgeVerificationSettings {
    minimumAge: number;
    isIdScanningEnabled: boolean;
}

const DEFAULT_BRANDING: BrandingSettings = {
    businessName: 'TranscendPOS',
    logoUrl: '',
    address: '123 Business Rd, Suite 456, City, Country',
    phone: '+1 (555) 123-4567',
    website: 'www.transcendpos.com'
};

const DEMO_ADMIN_USER = MOCK_USERS.find(u => u.email.toLowerCase() === 'admin@transcendpos.com')!;
const FAKE_SUPABASE_USER = { id: DEMO_ADMIN_USER.id, email: DEMO_ADMIN_USER.email, user_metadata: { business_name: 'TranscendPOS' }, app_metadata: {}, aud: 'authenticated', created_at: new Date().toISOString() };
const FAKE_SESSION = { access_token: 'fake-token', user: FAKE_SUPABASE_USER as SupabaseUser, expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: 'fake-refresh', token_type: 'bearer' };


export const DemoAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // AUTH STATE is pre-filled for demo
    const [session] = useState<Session | null>(FAKE_SESSION as any);
    const [currentUser, setCurrentUser] = useState<User | null>(DEMO_ADMIN_USER);
    const [loading] = useState(false);

    // DATA STATE is pre-filled with mock data
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
    const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
    const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(MOCK_STOCK_ADJUSTMENTS);
    const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
    const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>(MOCK_CUSTOMER_GROUPS);
    const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
    const [variations, setVariations] = useState<Variation[]>(MOCK_VARIATIONS);
    const [variationValues, setVariationValues] = useState<VariationValue[]>(MOCK_VARIATION_VALUES);
    const [brands, setBrands] = useState<Brand[]>(MOCK_BRANDS);
    const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
    const [units, setUnits] = useState<Unit[]>(MOCK_UNITS);
    const [sales, setSales] = useState<Sale[]>(MOCK_SALES);
    const [drafts, setDrafts] = useState<Draft[]>(MOCK_DRAFTS);
    const [quotations, setQuotations] = useState<Quotation[]>(MOCK_QUOTATIONS);
    const [purchases, setPurchases] = useState<Purchase[]>(MOCK_PURCHASES);
    const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>(MOCK_PURCHASE_RETURNS);
    const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
    const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(MOCK_EXPENSE_CATEGORIES);
    const [businessLocations, setBusinessLocations] = useState<BusinessLocation[]>(MOCK_BUSINESS_LOCATIONS);
    const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>(MOCK_STOCK_TRANSFERS);
    const [shipments, setShipments] = useState<Shipment[]>(MOCK_SHIPMENTS);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(MOCK_PAYMENT_METHODS);
    const [customerRequests, setCustomerRequests] = useState<CustomerRequest[]>(MOCK_CUSTOMER_REQUESTS);
    const [productDocuments, setProductDocuments] = useState<ProductDocument[]>(MOCK_PRODUCT_DOCUMENTS);
    const [customerReturns, setCustomerReturns] = useState<CustomerReturn[]>(MOCK_CUSTOMER_RETURNS);
    const [integrations, setIntegrations] = useState<IntegrationConnection[]>(MOCK_INTEGRATIONS);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(MOCK_BANK_ACCOUNTS);
    const [stockTransferRequests, setStockTransferRequests] = useState<StockTransferRequest[]>(MOCK_STOCK_TRANSFER_REQUESTS);
    const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplate[]>(MOCK_NOTIFICATION_TEMPLATES);
    const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>(DEFAULT_BRANDING);
    const [ageVerificationSettings, setAgeVerificationSettings] = useState<AgeVerificationSettings>({ minimumAge: 21, isIdScanningEnabled: true });
    
    const hasPermission = useCallback((permission: Permission): boolean => {
        if (!currentUser) return false;
        const userRole = roles.find(role => role.id === currentUser.roleId);
        if (!userRole) return false;
        // In demo mode, admin has all permissions regardless of plan
        if (userRole.id === 'admin') return true;
        return userRole.permissions.includes(permission);
    }, [currentUser, roles]);
    
    // --- MOCK DATA MUTATIONS ---
    const addSale = async (saleData: Omit<Sale, 'id' | 'date'>): Promise<Sale> => {
        const newSale: Sale = { ...saleData, id: `SALE${Date.now()}`, date: new Date().toISOString() };
        setSales(prev => [newSale, ...prev]);
        newSale.items.forEach(item => {
            setProducts(prev => prev.map(p => p.id === item.id ? { ...p, stock: p.stock - item.quantity } : p));
        });
        return newSale;
    };
    
    const addProduct = async (productData: Omit<Product, 'id'|'imageUrl'>, imagePreview: string | null): Promise<Product> => {
        const newProduct: Product = { ...productData, id: `PROD${Date.now()}`, imageUrl: imagePreview || 'https://picsum.photos/400' };
        setProducts(prev => [newProduct, ...prev]);
        return newProduct;
    };

    const signUpAndSubscribe = async (details: { email: string; password: string; businessName: string; planName: string; }) => {
        console.log(`[DEMO] Sign up and subscribe`, details);
        if (currentUser) {
            const planIdentifier = details.planName.toLowerCase().includes('bundle') ? 'bundle'
                                 : details.planName.toLowerCase().includes('pos') ? 'pos'
                                 : details.planName.toLowerCase().includes('inventory') ? 'inventory'
                                 : 'professional';
            setCurrentUser({
                ...currentUser,
                subscriptionPlan: planIdentifier as User['subscriptionPlan'],
                account_status: 'onboarding_pending',
                onboarding_complete: false,
            });
        }
    };
    
    const value: AuthContextType = {
        supabase: null,
        session, user: session?.user || null, currentUser, setCurrentUser,
        users, roles, products, stockAdjustments, customers, customerGroups, suppliers, variations, variationValues, brands, categories, units, sales, drafts, quotations, purchases, purchaseReturns, expenses, expenseCategories, businessLocations, stockTransfers, shipments, paymentMethods, customerRequests, productDocuments, customerReturns, integrations, bankAccounts, stockTransferRequests, notificationTemplates,
        loading,
        signIn: async () => {},
        signOut: async () => {},
        signUp: async () => { throw new Error('Not implemented for demo') },
        resetPasswordForEmail: async () => { throw new Error('Not implemented for demo') },
        updateUserPassword: async () => { throw new Error('Not implemented for demo') },
        hasPermission,
        addSale, addProduct,
        subscribeToPlan: async (planName: string) => { console.log(`[DEMO] Subscribe to ${planName}`); },
        verifyLicense: async (key: string) => {
            if (key.toUpperCase() === 'VALID-LICENSE-KEY') return Promise.resolve();
            return Promise.reject(new Error('Invalid license key'));
        },
        completeOnboarding: async () => { console.log(`[DEMO] Complete onboarding`); },
        signUpAndSubscribe,
        updateProduct: async (d) => setProducts(p => p.map(i => i.id === d.id ? d : i)),
        deleteProduct: async (id) => setProducts(p => p.filter(i => i.id !== id)),
        addShipment: async (d) => setShipments(p => [...p, { ...d, id: `shp${Date.now()}` }]),
        updateShipment: async (d) => setShipments(p => p.map(s => s.id === d.id ? d : s)),
        deleteShipment: async (id) => setShipments(p => p.filter(s => s.id !== id)),
        brandingSettings,
        ageVerificationSettings,
        addRole: async (d: Omit<Role, 'id'>) => { const newRole = {...d, id: `r${Date.now()}`}; setRoles(p => [...p, newRole]); return newRole; },
        updateRole: async (d: Role) => setRoles(p => p.map(r => r.id === d.id ? d : r)),
        deleteRole: async (id: string) => {
            if (users.some(u => u.roleId === id)) throw new Error("Cannot delete role while it is assigned to users.");
            setRoles(p => p.filter(r => r.id !== id));
        },
        addUser: async (d: Omit<User, 'id'>) => setUsers(p => [...p, {...d, id: `u${Date.now()}`}]),
        updateUser: async (d: User) => setUsers(p => p.map(u => u.id === d.id ? d : u)),
        deleteUser: async (id: string) => {
            if (currentUser?.id === id) throw new Error("You cannot delete your own account.");
            setUsers(p => p.filter(u => u.id !== id));
        },
        addVariableProduct: async (parentData: Omit<Product, 'id' | 'imageUrl'>, variantsData: Omit<Product, 'id'|'imageUrl'>[]) => {
            const parentId = `PROD-PARENT-${Date.now()}`;
            const parentProduct: Product = { ...parentData, id: parentId, imageUrl: 'https://picsum.photos/400', stock: 0 };
            const variantProducts: Product[] = variantsData.map(variant => ({
                ...variant,
                id: `PROD-VAR-${Date.now()}-${Math.random()}`,
                imageUrl: 'https://picsum.photos/400',
                parentProductId: parentId
            }));
            setProducts(prev => [...prev, parentProduct, ...variantProducts]);
        },
        updateMultipleProducts: async (productsData: Pick<Product, 'id' | 'price' | 'costPrice'>[]) => {
            setProducts(prev => prev.map(p => {
                const update = productsData.find(pd => pd.id === p.id);
                return update ? { ...p, ...update } : p;
            }));
        },
        voidSale: async (id: string) => setSales(p => p.map(s => s.id === id ? {...s, status: 'voided'} : s)),
        updateSaleWithEmail: async (id: string, email: string) => setSales(p => p.map(s => s.id === id ? {...s, customerEmailForDocs: email} : s)),
        addStockAdjustment: async (d: Omit<StockAdjustment, 'id' | 'date'>) => setStockAdjustments(p => [...p, {...d, id: `sa${Date.now()}`, date: new Date().toISOString()}]),
        addCustomer: async (d: Omit<Customer, 'id'>) => setCustomers(p => [...p, {...d, id: `c${Date.now()}`}]),
        updateCustomer: async (d: Customer) => setCustomers(p => p.map(c => c.id === d.id ? d : c)),
        deleteCustomer: async (id: string) => setCustomers(p => p.filter(c => c.id !== id)),
        addSupplier: async (d: Omit<Supplier, 'id'>) => setSuppliers(p => [...p, {...d, id: `s${Date.now()}`}]),
        updateSupplier: async (d: Supplier) => setSuppliers(p => p.map(s => s.id === d.id ? d : s)),
        deleteSupplier: async (id: string) => {
            if (purchases.some(p => p.supplier.id === id)) throw new Error("Cannot delete supplier with existing purchases.");
            setSuppliers(p => p.filter(s => s.id !== id));
        },
        addCustomerGroup: async (d: Omit<CustomerGroup, 'id'>) => setCustomerGroups(p => [...p, {...d, id: `cg${Date.now()}`}]),
        updateCustomerGroup: async (d: CustomerGroup) => setCustomerGroups(p => p.map(cg => cg.id === d.id ? d : cg)),
        deleteCustomerGroup: async (id: string) => {
            if (customers.some(c => c.customerGroupId === id)) throw new Error("Cannot delete customer group while it is in use by customers.");
            setCustomerGroups(p => p.filter(cg => cg.id !== id));
        },
        addDraft: async (d: Omit<Draft, 'id' | 'date'>) => setDrafts(p => [...p, {...d, id: `d${Date.now()}`, date: new Date().toISOString()}]),
        updateDraft: async (d: Draft) => setDrafts(p => p.map(dr => dr.id === d.id ? d : dr)),
        deleteDraft: async (id: string) => setDrafts(p => p.filter(dr => dr.id !== id)),
        addQuotation: async (d: Omit<Quotation, 'id' | 'date'>) => setQuotations(p => [...p, {...d, id: `q${Date.now()}`, date: new Date().toISOString()}]),
        updateQuotation: async (d: Quotation) => setQuotations(p => p.map(q => q.id === d.id ? d : q)),
        deleteQuotation: async (id: string) => setQuotations(p => p.filter(q => q.id !== id)),
        addPurchase: async (d: Omit<Purchase, 'id' | 'date'>) => setPurchases(p => [...p, {...d, id: `pur${Date.now()}`, date: new Date().toISOString()}]),
        addPurchaseReturn: async (d: Omit<PurchaseReturn, 'id' | 'date'>) => setPurchaseReturns(p => [...p, {...d, id: `pr${Date.now()}`, date: new Date().toISOString()}]),
        addExpense: async (d: Omit<Expense, 'id' | 'date'>) => setExpenses(p => [...p, {...d, id: `e${Date.now()}`, date: new Date().toISOString()}]),
        updateExpense: async (d: Expense) => setExpenses(p => p.map(e => e.id === d.id ? d : e)),
        deleteExpense: async (id: string) => setExpenses(p => p.filter(e => e.id !== id)),
        addExpenseCategory: async (d: Omit<ExpenseCategory, 'id'>) => setExpenseCategories(p => [...p, {...d, id: `ec${Date.now()}`}]),
        updateExpenseCategory: async (d: ExpenseCategory) => setExpenseCategories(p => p.map(ec => ec.id === d.id ? d : ec)),
        deleteExpenseCategory: async (id: string) => {
            if(expenses.some(e => e.categoryId === id)) throw new Error("Cannot delete category with existing expenses.");
            setExpenseCategories(p => p.filter(ec => ec.id !== id));
        },
        addBrand: async (d: Omit<Brand, 'id'>) => { const newBrand = {...d, id: `b${Date.now()}`}; setBrands(p => [...p, newBrand]); return newBrand; },
        updateBrand: async (d: Brand) => setBrands(p => p.map(b => b.id === d.id ? d : b)),
        deleteBrand: async (id: string) => {
            if(products.some(p => p.brandId === id)) throw new Error("Cannot delete brand with associated products.");
            setBrands(p => p.filter(b => b.id !== id));
        },
        addCategory: async (d: Omit<Category, 'id'>) => setCategories(p => [...p, {...d, id: `cat${Date.now()}`}]),
        updateCategory: async (d: Category) => setCategories(p => p.map(c => c.id === d.id ? d : c)),
        deleteCategory: async (id: string) => {
            if(products.some(p => p.categoryId === id)) throw new Error("Cannot delete category with associated products.");
            setCategories(p => p.filter(c => c.id !== id));
        },
        addUnit: async (d: Omit<Unit, 'id'>) => setUnits(p => [...p, {...d, id: `u${Date.now()}`}]),
        updateUnit: async (d: Unit) => setUnits(p => p.map(u => u.id === d.id ? d : u)),
        deleteUnit: async (id: string) => {
            if(products.some(p => p.unitId === id)) throw new Error("Cannot delete unit with associated products.");
            setUnits(p => p.filter(u => u.id !== id));
        },
        addVariation: async (d: Omit<Variation, 'id'>) => setVariations(p => [...p, {...d, id: `v${Date.now()}`}]),
        updateVariation: async (d: Variation) => setVariations(p => p.map(v => v.id === d.id ? d : v)),
        deleteVariation: async (id: string) => {
            if(variationValues.some(v => v.variationId === id)) throw new Error("Cannot delete variation with existing values.");
            setVariations(p => p.filter(v => v.id !== id));
        },
        addVariationValue: async (d: Omit<VariationValue, 'id'>) => setVariationValues(p => [...p, {...d, id: `vv${Date.now()}`}]),
        updateVariationValue: async (d: VariationValue) => setVariationValues(p => p.map(vv => vv.id === d.id ? d : vv)),
        deleteVariationValue: async (id: string) => setVariationValues(p => p.filter(vv => vv.id !== id)),
        addBusinessLocation: async (d: Omit<BusinessLocation, 'id'>) => setBusinessLocations(p => [...p, {...d, id: `bl${Date.now()}`}]),
        updateBusinessLocation: async (d: BusinessLocation) => setBusinessLocations(p => p.map(bl => bl.id === d.id ? d : bl)),
        deleteBusinessLocation: async (id: string) => {
            if(users.some(u => u.businessLocationId === id) || products.some(p => p.businessLocationId === id)) throw new Error("Cannot delete location in use by users or products.");
            setBusinessLocations(p => p.filter(bl => bl.id !== id));
        },
        addStockTransfer: async (d: Omit<StockTransfer, 'id'|'date'>) => setStockTransfers(p => [...p, {...d, id: `st${Date.now()}`, date: new Date().toISOString()}]),
        addCustomerRequests: async (text: string, cashier: User) => setCustomerRequests(p => [...p, {id: `cr${Date.now()}`, text, cashierId: cashier.id, cashierName: cashier.name, date: new Date().toISOString()}]),
        updateBrandingSettings: async (s: BrandingSettings) => setBrandingSettings(s),
        resetBrandingSettings: async () => setBrandingSettings(DEFAULT_BRANDING),
        updateAgeVerificationSettings: async (settings: AgeVerificationSettings, ids: string[]) => { setAgeVerificationSettings(settings); setProducts(p => p.map(prod => ({...prod, isAgeRestricted: ids.includes(prod.id)}))) },
        addProductDocument: async (d: Omit<ProductDocument, 'id' | 'uploadedDate'>) => setProductDocuments(p => [...p, {...d, id: `doc${Date.now()}`, uploadedDate: new Date().toISOString()}]),
        updateProductDocument: async (d: ProductDocument) => setProductDocuments(p => p.map(doc => doc.id === d.id ? d : doc)),
        deleteProductDocument: async (id: string) => setProductDocuments(p => p.filter(doc => doc.id !== id)),
        addCustomerReturn: async (d: Omit<CustomerReturn, 'id' | 'date'>) => setCustomerReturns(p => [...p, {...d, id: `crn${Date.now()}`, date: new Date().toISOString()}]),
        addIntegration: async (d: Omit<IntegrationConnection, 'id'>) => setIntegrations(p => [...p, {...d, id: `int${Date.now()}`}]),
        updateIntegration: async (d: IntegrationConnection) => setIntegrations(p => p.map(i => i.id === d.id ? d : i)),
        deleteIntegration: async (id: string) => setIntegrations(p => p.filter(i => i.id !== id)),
        addBankAccount: async (d: Omit<BankAccount, 'id'>) => setBankAccounts(p => [...p, {...d, id: `ba${Date.now()}`}]),
        updateBankAccount: async (d: BankAccount) => setBankAccounts(p => p.map(ba => ba.id === d.id ? d : ba)),
        deleteBankAccount: async (id: string) => {
            if(paymentMethods.some(pm => pm.accountId === id)) throw new Error("Cannot delete bank account linked to a payment method.");
            setBankAccounts(p => p.filter(ba => ba.id !== id));
        },
        addPaymentMethod: async (d: Omit<PaymentMethod, 'id'>) => setPaymentMethods(p => [...p, {...d, id: `pm${Date.now()}`}]),
        updatePaymentMethod: async (d: PaymentMethod) => setPaymentMethods(p => p.map(pm => pm.id === d.id ? d : pm)),
        deletePaymentMethod: async (id: string) => {
            if(sales.some(s => s.payments.some(p => p.methodId === id))) throw new Error("Cannot delete payment method with historical sales data.");
            setPaymentMethods(p => p.filter(pm => pm.id !== id));
        },
        addStockTransferRequest: async (d: Omit<StockTransferRequest, 'id' | 'date' | 'status'>) => setStockTransferRequests(p => [...p, {...d, id: `str${Date.now()}`, date: new Date().toISOString(), status: 'pending'}]),
        updateStockTransferRequest: async (id: string, status: 'approved' | 'rejected') => setStockTransferRequests(p => p.map(str => str.id === id ? {...str, status} : str)),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};