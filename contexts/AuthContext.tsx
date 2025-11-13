import React, { createContext, useState, useContext, useMemo, useEffect, useCallback } from 'react';
import { createClient, SupabaseClient, Session, User as SupabaseUser } from '@supabase/supabase-js';
import { User, Role, Permission, Product, StockAdjustment, Customer, CustomerGroup, Supplier, Variation, VariationValue, Brand, Category, Unit, Sale, Draft, Quotation, Purchase, PurchaseReturn, Expense, ExpenseCategory, BusinessLocation, StockTransfer, Shipment, PaymentMethod, CustomerRequest, BrandingSettings, ProductDocument, CustomerReturn, IntegrationConnection, BankAccount, StockTransferRequest, NotificationTemplate, CartItem } from '../types';

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

export interface AuthContextType {
    supabase: SupabaseClient | null;
    session: Session | null;
    user: SupabaseUser | null;
    currentUser: User | null; // Application's user type
    setCurrentUser: (user: User) => void;
    users: User[];
    roles: Role[];
    products: Product[];
    stockAdjustments: StockAdjustment[];
    customers: Customer[];
    customerGroups: CustomerGroup[];
    suppliers: Supplier[];
    variations: Variation[];
    variationValues: VariationValue[];
    brands: Brand[];
    categories: Category[];
    units: Unit[];
    sales: Sale[];
    drafts: Draft[];
    quotations: Quotation[];
    purchases: Purchase[];
    purchaseReturns: PurchaseReturn[];
    expenses: Expense[];
    expenseCategories: ExpenseCategory[];
    businessLocations: BusinessLocation[];
    stockTransfers: StockTransfer[];
    shipments: Shipment[];
    paymentMethods: PaymentMethod[];
    customerRequests: CustomerRequest[];
    productDocuments: ProductDocument[];
    customerReturns: CustomerReturn[];
    integrations: IntegrationConnection[];
    bankAccounts: BankAccount[];
    stockTransferRequests: StockTransferRequest[];
    notificationTemplates: NotificationTemplate[];
    loading: boolean;
    signIn: (email: string, pass: string) => Promise<any>;
    signOut: () => Promise<any>;
    signUp: (email: string, pass: string, metadata: { [key: string]: any }) => Promise<any>;
    resetPasswordForEmail: (email: string) => Promise<any>;
    updateUserPassword: (password: string) => Promise<any>;
    hasPermission: (permission: Permission) => boolean;
    subscribeToPlan: (planName: string) => Promise<void>;
    verifyLicense: (licenseKey: string) => Promise<void>;
    completeOnboarding: () => Promise<void>;
    signUpAndSubscribe: (details: { email: string; password: string; businessName: string; planName: string; }) => Promise<void>;
    // Data mutation functions
    addRole: (roleData: Omit<Role, 'id'>) => Promise<Role>;
    updateRole: (roleData: Role) => Promise<void>;
    deleteRole: (roleId: string) => Promise<void>;
    addUser: (userData: Omit<User, 'id'>) => Promise<void>;
    updateUser: (userData: User) => Promise<void>;
    deleteUser: (userId: string) => Promise<void>;
    addProduct: (productData: Omit<Product, 'id' | 'imageUrl'>, imagePreview: string | null) => Promise<Product>;
    addVariableProduct: (parentData: Omit<Product, 'id'|'imageUrl'>, variantsData: Omit<Product, 'id'|'imageUrl'>[]) => Promise<void>;
    updateProduct: (productData: Product) => Promise<void>;
    updateMultipleProducts: (productsData: Pick<Product, 'id' | 'price' | 'costPrice'>[]) => Promise<void>;
    deleteProduct: (productId: string) => Promise<void>;
    addSale: (saleData: Omit<Sale, 'id' | 'date'>) => Promise<Sale>;
    voidSale: (saleId: string) => Promise<void>;
    updateSaleWithEmail: (saleId: string, email: string) => Promise<void>;
    addStockAdjustment: (adjData: Omit<StockAdjustment, 'id' | 'date'>) => Promise<void>;
    addCustomer: (customerData: Omit<Customer, 'id'>) => Promise<void>;
    updateCustomer: (customerData: Customer) => Promise<void>;
    deleteCustomer: (customerId: string) => Promise<void>;
    addSupplier: (supplierData: Omit<Supplier, 'id'>) => Promise<void>;
    updateSupplier: (supplierData: Supplier) => Promise<void>;
    deleteSupplier: (supplierId: string) => Promise<void>;
    addCustomerGroup: (groupData: Omit<CustomerGroup, 'id'>) => Promise<void>;
    updateCustomerGroup: (groupData: CustomerGroup) => Promise<void>;
    deleteCustomerGroup: (groupId: string) => Promise<void>;
    addDraft: (draftData: Omit<Draft, 'id' | 'date'>) => Promise<void>;
    updateDraft: (draftData: Draft) => Promise<void>;
    deleteDraft: (draftId: string) => Promise<void>;
    addQuotation: (quoteData: Omit<Quotation, 'id' | 'date'>) => Promise<void>;
    updateQuotation: (quoteData: Quotation) => Promise<void>;
    deleteQuotation: (quoteId: string) => Promise<void>;
    addPurchase: (purchaseData: Omit<Purchase, 'id' | 'date'>) => Promise<void>;
    addPurchaseReturn: (returnData: Omit<PurchaseReturn, 'id' | 'date'>) => Promise<void>;
    addExpense: (expenseData: Omit<Expense, 'id' | 'date'>) => Promise<void>;
    updateExpense: (expenseData: Expense) => Promise<void>;
    deleteExpense: (expenseId: string) => Promise<void>;
    addExpenseCategory: (categoryData: Omit<ExpenseCategory, 'id'>) => Promise<void>;
    updateExpenseCategory: (categoryData: ExpenseCategory) => Promise<void>;
    deleteExpenseCategory: (categoryId: string) => Promise<void>;
    addBrand: (brandData: Omit<Brand, 'id'>) => Promise<Brand>;
    updateBrand: (brandData: Brand) => Promise<void>;
    deleteBrand: (brandId: string) => Promise<void>;
    addCategory: (categoryData: Omit<Category, 'id'>) => Promise<void>;
    updateCategory: (categoryData: Category) => Promise<void>;
    deleteCategory: (categoryId: string) => Promise<void>;
    addUnit: (unitData: Omit<Unit, 'id'>) => Promise<void>;
    updateUnit: (unitData: Unit) => Promise<void>;
    deleteUnit: (unitId: string) => Promise<void>;
    addVariation: (variationData: Omit<Variation, 'id'>) => Promise<void>;
    updateVariation: (variationData: Variation) => Promise<void>;
    deleteVariation: (variationId: string) => Promise<void>;
    addVariationValue: (valueData: Omit<VariationValue, 'id'>) => Promise<void>;
    updateVariationValue: (valueData: VariationValue) => Promise<void>;
    deleteVariationValue: (valueId: string) => Promise<void>;
    addBusinessLocation: (locationData: Omit<BusinessLocation, 'id'>) => Promise<void>;
    updateBusinessLocation: (locationData: BusinessLocation) => Promise<void>;
    deleteBusinessLocation: (locationId: string) => Promise<void>;
    addStockTransfer: (transferData: Omit<StockTransfer, 'id'|'date'>) => Promise<void>;
    addCustomerRequests: (requestsText: string, cashier: User) => Promise<void>;
    brandingSettings: BrandingSettings;
    updateBrandingSettings: (newSettings: BrandingSettings) => Promise<void>;
    resetBrandingSettings: () => Promise<void>;
    ageVerificationSettings: AgeVerificationSettings;
    updateAgeVerificationSettings: (newSettings: AgeVerificationSettings, productIds: string[]) => Promise<void>;
    addProductDocument: (docData: Omit<ProductDocument, 'id' | 'uploadedDate'>) => Promise<void>;
    updateProductDocument: (docData: ProductDocument) => Promise<void>;
    deleteProductDocument: (docId: string) => Promise<void>;
    addCustomerReturn: (returnData: Omit<CustomerReturn, 'id' | 'date'>) => Promise<void>;
    addIntegration: (connectionData: Omit<IntegrationConnection, 'id'>) => Promise<void>;
    updateIntegration: (connectionData: IntegrationConnection) => Promise<void>;
    deleteIntegration: (connectionId: string) => Promise<void>;
    addBankAccount: (accountData: Omit<BankAccount, 'id'>) => Promise<void>;
    updateBankAccount: (accountData: BankAccount) => Promise<void>;
    deleteBankAccount: (accountId: string) => Promise<void>;
    addPaymentMethod: (methodData: Omit<PaymentMethod, 'id'>) => Promise<void>;
    updatePaymentMethod: (methodData: PaymentMethod) => Promise<void>;
    deletePaymentMethod: (methodId: string) => Promise<void>;
    addStockTransferRequest: (requestData: Omit<StockTransferRequest, 'id' | 'date' | 'status'>) => Promise<void>;
    updateStockTransferRequest: (requestId: string, status: 'approved' | 'rejected') => Promise<void>;
    addShipment: (shipmentData: Omit<Shipment, 'id'>) => Promise<void>;
    updateShipment: (shipmentData: Shipment) => Promise<void>;
    deleteShipment: (shipmentId: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PLAN_PERMISSIONS: Record<string, string[]> = {
    pos: ['dashboard', 'contacts', 'sell', 'shipping', 'discounts', 'returns', 'pos', 'settings', 'users'],
    inventory: ['dashboard', 'contacts', 'products', 'purchases', 'stock_transfer', 'stock_adjustment', 'settings', 'users'],
    bundle: ['dashboard', 'contacts', 'sell', 'shipping', 'discounts', 'returns', 'pos', 'products', 'purchases', 'stock_transfer', 'stock_adjustment', 'settings', 'users'],
    professional: ['*'], // All permissions
};


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // AUTH STATE
    const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // DATA STATE - Initialized as empty arrays
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [variations, setVariations] = useState<Variation[]>([]);
    const [variationValues, setVariationValues] = useState<VariationValue[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
    const [businessLocations, setBusinessLocations] = useState<BusinessLocation[]>([]);
    const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>([]);
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [customerRequests, setCustomerRequests] = useState<CustomerRequest[]>([]);
    const [productDocuments, setProductDocuments] = useState<ProductDocument[]>([]);
    const [customerReturns, setCustomerReturns] = useState<CustomerReturn[]>([]);
    const [integrations, setIntegrations] = useState<IntegrationConnection[]>([]);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [stockTransferRequests, setStockTransferRequests] = useState<StockTransferRequest[]>([]);
    const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplate[]>([]);
    const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>(DEFAULT_BRANDING);
    const [ageVerificationSettings, setAgeVerificationSettings] = useState<AgeVerificationSettings>({ minimumAge: 21, isIdScanningEnabled: true });
    
     const clearAllData = () => {
        setUsers([]); setRoles([]); setProducts([]); setStockAdjustments([]); setCustomers([]);
        setCustomerGroups([]); setSuppliers([]); setVariations([]); setVariationValues([]);
        setBrands([]); setCategories([]); setUnits([]); setSales([]); setDrafts([]);
        setQuotations([]); setPurchases([]); setPurchaseReturns([]); setExpenses([]);
        setExpenseCategories([]); setBusinessLocations([]); setStockTransfers([]);
        setShipments([]); setPaymentMethods([]); setCustomerRequests([]);
        setProductDocuments([]); setCustomerReturns([]); setIntegrations([]);
        setBankAccounts([]); setStockTransferRequests([]); setNotificationTemplates([]);
    };
    
    // ASYNC INITIALIZATION
    useEffect(() => {
        const initialize = async () => {
            try {
                const response = await fetch('/api/public-config');
                if (!response.ok) {
                    throw new Error('Could not fetch public config: File not found');
                }
                const config = await response.json();
                if (config.supabaseUrl && config.supabaseAnonKey) {
                    const supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey);
                    setSupabase(supabaseClient);
                    console.log('Supabase client initialized successfully.');
                } else {
                    throw new Error('Invalid config from server');
                }
            } catch (error: any) {
                console.warn(error.message);
                console.warn('Falling back to mock/demo mode. If you are not in demo mode, please check your backend configuration.');
                setSupabase(null);
            }
        };

        initialize().finally(() => setLoading(false));
    }, []);

    const fetchAppUser = useCallback(async (session: Session | null) => {
        if (!session || !supabase) {
            setCurrentUser(null);
            return;
        }
        try {
            // This now calls our own secure endpoint instead of Supabase directly from the client
            const response = await fetch('/api/get-user-profile', {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch user profile');
            const userProfile = await response.json();
            setCurrentUser(userProfile as User);
        } catch (error) {
            console.error("Error fetching app user profile:", error);
            setCurrentUser(null);
        }
    }, [supabase]);
    
    const fetchAllData = useCallback(async (session: Session | null) => {
        if (!session) return;
        setLoading(true);
        try {
            const response = await fetch('/api/app-data', {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to fetch app data: ${response.statusText}`);
            }
            const data = await response.json();
            
            // Set all state from the response
            setUsers(data.users || []);
            setRoles(data.roles || []);
            setProducts(data.products || []);
            setStockAdjustments(data.stockAdjustments || []);
            setCustomers(data.customers || []);
            setCustomerGroups(data.customerGroups || []);
            setSuppliers(data.suppliers || []);
            setVariations(data.variations || []);
            setVariationValues(data.variationValues || []);
            setBrands(data.brands || []);
            setCategories(data.categories || []);
            setUnits(data.units || []);
            setSales(data.sales || []);
            setDrafts(data.drafts || []);
            setQuotations(data.quotations || []);
            setPurchases(data.purchases || []);
            setPurchaseReturns(data.purchaseReturns || []);
            setExpenses(data.expenses || []);
            setExpenseCategories(data.expenseCategories || []);
            setBusinessLocations(data.businessLocations || []);
            setStockTransfers(data.stockTransfers || []);
            setShipments(data.shipments || []);
            setPaymentMethods(data.paymentMethods || []);
            setCustomerRequests(data.customerRequests || []);
            setProductDocuments(data.productDocuments || []);
            setCustomerReturns(data.customerReturns || []);
            setIntegrations(data.integrations || []);
            setBankAccounts(data.bankAccounts || []);
            setStockTransferRequests(data.stockTransferRequests || []);
            setNotificationTemplates(data.notificationTemplates || []);

        } catch (error) {
            console.error("Error fetching all app data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (supabase) {
            setLoading(true);
            const fetchInitialSession = async () => {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                if (session) {
                    await fetchAppUser(session);
                    await fetchAllData(session);
                }
                setLoading(false);
            };
            fetchInitialSession();

            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
                setSession(session);
                if(session) {
                    await fetchAppUser(session);
                    await fetchAllData(session);
                } else {
                    clearAllData();
                    setCurrentUser(null);
                }
            });
            return () => subscription.unsubscribe();
        } else {
            setLoading(false); // Not using Supabase, probably demo mode.
        }
    }, [supabase, fetchAppUser, fetchAllData]);
    
    const signUp = async (email: string, pass: string, metadata: { [key: string]: any }) => {
        if (!supabase) throw new Error("Backend not connected.");
        const { data, error } = await supabase.auth.signUp({
            email,
            password: pass,
            options: {
                data: metadata
            }
        });
        if (error) throw error;
        // The trigger will handle profile creation.
        // We just need to set the session for the new user.
        if (data.session) {
            setSession(data.session);
            await fetchAppUser(data.session);
        }
    };
    
    const subscribeToPlan = async (planName: string) => {
        console.log(`Subscribing to ${planName} (This would be a backend call)`);
        if (currentUser && supabase && session) {
            const { error } = await supabase.from('User').update({ account_status: 'onboarding_pending', subscriptionPlan: planName.toLowerCase().split(' ')[0] }).eq('id', currentUser.id);
            if (error) throw error;
            setCurrentUser(u => u ? { ...u, account_status: 'onboarding_pending' } : null);
        }
        return Promise.resolve();
    };

    const signUpAndSubscribe = async (details: { email: string; password: string; businessName: string; planName: string; }) => {
        await signUp(details.email, details.password, { business_name: details.businessName });
        await subscribeToPlan(details.planName);
    };
    
    const verifyLicense = async (licenseKey: string) => {
        console.log(`Verifying license: ${licenseKey} (This would be a backend call)`);
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                if (licenseKey.toUpperCase() === 'VALID-LICENSE-KEY') {
                    if (currentUser && supabase && session) {
                        supabase.from('User').update({ account_status: 'active' }).eq('id', currentUser.id).then(({error}) => {
                            if (error) reject(error);
                            else {
                                setCurrentUser(u => u ? { ...u, account_status: 'active' } : null);
                                resolve();
                            }
                        });
                    } else {
                        resolve();
                    }
                } else {
                    reject(new Error('The provided license key is invalid or has expired.'));
                }
            }, 1000);
        });
    };

    const completeOnboarding = async () => {
        console.log(`Completing onboarding (This would be a backend call)`);
        if (currentUser && supabase && session) {
            const { error } = await supabase.from('User').update({ onboarding_complete: true }).eq('id', currentUser.id);
            if (error) throw error;
            setCurrentUser(u => u ? { ...u, onboarding_complete: true } : null);
        }
        return Promise.resolve();
    }


    const authFunctions = useMemo(() => ({
        signIn: async (email: string, pass: string) => { 
            if(!supabase) throw new Error("Backend not connected.");
            const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
            if (error) throw error;
        },
        signOut: async () => { 
            if(!supabase) throw new Error("Backend not connected.");
            await supabase.auth.signOut();
            clearAllData();
        },
        signUp,
        resetPasswordForEmail: async (email: string) => {
            if (!supabase) throw new Error("Backend not connected.");
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) throw error;
        },
        updateUserPassword: async (password: string) => {
            if (!supabase) throw new Error("Backend not connected.");
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
        },
    }), [supabase]);

    const hasPermission = useCallback((permission: Permission): boolean => {
        if (!currentUser || !currentUser.subscriptionPlan) return false;
        const userRole = roles.find(role => role.id === currentUser.roleId);
        if (!userRole) return false;

        if (currentUser.subscriptionPlan === 'professional') return true;

        if (!userRole.permissions.includes(permission)) return false;

        const allowedModules = PLAN_PERMISSIONS[currentUser.subscriptionPlan];
        if (!allowedModules) return false;
        if (allowedModules.includes('*')) return true;

        const permissionModule = permission.split(':')[0];
        return allowedModules.includes(permissionModule);
    }, [currentUser, roles]);
    
    // --- DATA MUTATION FUNCTIONS (Backend-ready) ---
    const mutateData = async (type: string, payload: any) => {
        if (!session) throw new Error("Not authenticated");
        const response = await fetch('/api/app-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ type, payload })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.details || err.error || 'API mutation failed');
        }
        return response.json();
    };

    const addSale = async (saleData: Omit<Sale, 'id' | 'date'>): Promise<Sale> => {
        const newSale = await mutateData('ADD_SALE', saleData);
        setSales(prev => [newSale, ...prev]);
        // Update product stock locally for immediate UI feedback
        newSale.items.forEach((item: CartItem) => {
            setProducts(prev => prev.map(p => p.id === item.id ? { ...p, stock: p.stock - item.quantity } : p));
        });
        return newSale;
    };
    
    const addProduct = async (productData: Omit<Product, 'id'|'imageUrl'>): Promise<Product> => {
        const newProduct = await mutateData('ADD_PRODUCT', productData);
        setProducts(prev => [newProduct, ...prev]);
        return newProduct;
    };
    
    const updateProduct = async (productData: Product) => {
        const updatedProduct = await mutateData('UPDATE_PRODUCT', productData);
        setProducts(p => p.map(i => i.id === updatedProduct.id ? updatedProduct : i));
    };

    const deleteProduct = async (productId: string) => {
        await mutateData('DELETE_PRODUCT', { id: productId });
        setProducts(p => p.filter(i => i.id !== productId));
    };
    
    const addShipment = async (shipmentData: Omit<Shipment, 'id'>) => console.warn("Not implemented");
    const updateShipment = async (shipmentData: Shipment) => console.warn("Not implemented");
    const deleteShipment = async (shipmentId: string) => console.warn("Not implemented");

    const value: AuthContextType = {
        supabase, session, user: session?.user || null, currentUser, setCurrentUser,
        users, roles, products, stockAdjustments, customers, customerGroups, suppliers, variations, variationValues, brands, categories, units, sales, drafts, quotations, purchases, purchaseReturns, expenses, expenseCategories, businessLocations, stockTransfers, shipments, paymentMethods, customerRequests, productDocuments, customerReturns, integrations, bankAccounts, stockTransferRequests, notificationTemplates,
        loading,
        ...authFunctions,
        hasPermission,
        addSale, addProduct, updateProduct, deleteProduct, addShipment, updateShipment, deleteShipment,
        brandingSettings, ageVerificationSettings,
        subscribeToPlan,
        verifyLicense,
        completeOnboarding,
        signUpAndSubscribe,
        addRole: async () => { throw new Error("Not implemented"); },
        updateRole: async () => console.warn("Not implemented"),
        deleteRole: async () => console.warn("Not implemented"),
        addUser: async () => console.warn("Not implemented"),
        updateUser: async () => console.warn("Not implemented"),
        deleteUser: async () => console.warn("Not implemented"),
        addVariableProduct: async () => console.warn("Not implemented"),
        updateMultipleProducts: async () => console.warn("Not implemented"),
        voidSale: async () => console.warn("Not implemented"),
        updateSaleWithEmail: async () => console.warn("Not implemented"),
        addStockAdjustment: async () => console.warn("Not implemented"),
        addCustomer: async () => console.warn("Not implemented"),
        updateCustomer: async () => console.warn("Not implemented"),
        deleteCustomer: async () => console.warn("Not implemented"),
        addSupplier: async () => console.warn("Not implemented"),
        updateSupplier: async () => console.warn("Not implemented"),
        deleteSupplier: async () => console.warn("Not implemented"),
        addCustomerGroup: async () => console.warn("Not implemented"),
        updateCustomerGroup: async () => console.warn("Not implemented"),
        deleteCustomerGroup: async () => console.warn("Not implemented"),
        addDraft: async () => console.warn("Not implemented"),
        updateDraft: async () => console.warn("Not implemented"),
        deleteDraft: async () => console.warn("Not implemented"),
        addQuotation: async () => console.warn("Not implemented"),
        updateQuotation: async () => console.warn("Not implemented"),
        deleteQuotation: async () => console.warn("Not implemented"),
        addPurchase: async () => console.warn("Not implemented"),
        addPurchaseReturn: async () => console.warn("Not implemented"),
        addExpense: async () => console.warn("Not implemented"),
        updateExpense: async () => console.warn("Not implemented"),
        deleteExpense: async () => console.warn("Not implemented"),
        addExpenseCategory: async () => console.warn("Not implemented"),
        updateExpenseCategory: async () => console.warn("Not implemented"),
        deleteExpenseCategory: async () => console.warn("Not implemented"),
        addBrand: async () => { throw new Error("Not implemented"); },
        updateBrand: async () => console.warn("Not implemented"),
        deleteBrand: async () => console.warn("Not implemented"),
        addCategory: async () => console.warn("Not implemented"),
        updateCategory: async () => console.warn("Not implemented"),
        deleteCategory: async () => console.warn("Not implemented"),
        addUnit: async () => console.warn("Not implemented"),
        updateUnit: async () => console.warn("Not implemented"),
        deleteUnit: async () => console.warn("Not implemented"),
        addVariation: async () => console.warn("Not implemented"),
        updateVariation: async () => console.warn("Not implemented"),
        deleteVariation: async () => console.warn("Not implemented"),
        addVariationValue: async () => console.warn("Not implemented"),
        updateVariationValue: async () => console.warn("Not implemented"),
        deleteVariationValue: async () => console.warn("Not implemented"),
        addBusinessLocation: async () => console.warn("Not implemented"),
        updateBusinessLocation: async () => console.warn("Not implemented"),
        deleteBusinessLocation: async () => console.warn("Not implemented"),
        addStockTransfer: async () => console.warn("Not implemented"),
        addCustomerRequests: async () => console.warn("Not implemented"),
        updateBrandingSettings: async () => console.warn("Not implemented"),
        resetBrandingSettings: async () => console.warn("Not implemented"),
        updateAgeVerificationSettings: async () => console.warn("Not implemented"),
        addProductDocument: async () => console.warn("Not implemented"),
        updateProductDocument: async () => console.warn("Not implemented"),
        deleteProductDocument: async () => console.warn("Not implemented"),
        addCustomerReturn: async () => console.warn("Not implemented"),
        addIntegration: async () => console.warn("Not implemented"),
        updateIntegration: async () => console.warn("Not implemented"),
        deleteIntegration: async () => console.warn("Not implemented"),
        addBankAccount: async () => console.warn("Not implemented"),
        updateBankAccount: async () => console.warn("Not implemented"),
        deleteBankAccount: async () => console.warn("Not implemented"),
        addPaymentMethod: async () => console.warn("Not implemented"),
        updatePaymentMethod: async () => console.warn("Not implemented"),
        deletePaymentMethod: async () => console.warn("Not implemented"),
        addStockTransferRequest: async () => console.warn("Not implemented"),
        updateStockTransferRequest: async () => console.warn("Not implemented"),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};