import React, { createContext, useState, useContext, useMemo, useEffect, useCallback } from "react";
import { createClient, SupabaseClient, Session, User as SupabaseUser } from "@supabase/supabase-js";
// FIX: Moved ALL_PERMISSIONS import from './types' to '../constants' as it is exported from constants.tsx
import {
  User,
  Role,
  Permission,
  Product,
  StockAdjustment,
  Customer,
  CustomerGroup,
  Supplier,
  Variation,
  VariationValue,
  Brand,
  Category,
  Unit,
  Sale,
  Draft,
  Quotation,
  Purchase,
  PurchaseReturn,
  Expense,
  ExpenseCategory,
  BusinessLocation,
  StockTransfer,
  Shipment,
  PaymentMethod,
  CustomerRequest,
  BrandingSettings,
  ProductDocument,
  CustomerReturn,
  IntegrationConnection,
  BankAccount,
  StockTransferRequest,
  NotificationTemplate,
} from "../types";
import { ALL_PERMISSIONS } from "../constants";
import {
  MOCK_USERS,
  MOCK_ROLES,
  MOCK_PRODUCTS,
  MOCK_STOCK_ADJUSTMENTS,
  MOCK_CUSTOMERS,
  MOCK_CUSTOMER_GROUPS,
  MOCK_SUPPLIERS,
  MOCK_VARIATIONS,
  MOCK_VARIATION_VALUES,
  MOCK_BRANDS,
  MOCK_CATEGORIES,
  MOCK_UNITS,
  MOCK_SALES,
  MOCK_DRAFTS,
  MOCK_QUOTATIONS,
  MOCK_PURCHASES,
  MOCK_PURCHASE_RETURNS,
  MOCK_EXPENSES,
  MOCK_EXPENSE_CATEGORIES,
  MOCK_BUSINESS_LOCATIONS,
  MOCK_STOCK_TRANSFERS,
  MOCK_SHIPMENTS,
  MOCK_PAYMENT_METHODS,
  MOCK_CUSTOMER_REQUESTS,
  MOCK_PRODUCT_DOCUMENTS,
  MOCK_CUSTOMER_RETURNS,
  MOCK_BANK_ACCOUNTS,
  MOCK_STOCK_TRANSFER_REQUESTS,
  MOCK_NOTIFICATION_TEMPLATES,
  MOCK_INTEGRATIONS,
} from "../data/mockData";

interface AgeVerificationSettings {
  minimumAge: number;
  isIdScanningEnabled: boolean;
}

const DEFAULT_BRANDING: BrandingSettings = {
  businessName: "ZawiPOS",
  logoUrl: "",
  address: "123 Business Rd, Suite 456, City, Country",
  phone: "+1 (555) 123-4567",
  website: "www.zawipos.com",
};

interface AuthContextType {
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
  // Data mutation functions
  addRole: (roleData: Omit<Role, "id">) => Role;
  updateRole: (roleData: Role) => void;
  deleteRole: (roleId: string) => void;
  addUser: (userData: Omit<User, "id">) => void;
  updateUser: (userData: User) => void;
  deleteUser: (userId: string) => void;
  addProduct: (productData: Omit<Product, "id" | "imageUrl">) => Product;
  addVariableProduct: (
    parentData: Omit<Product, "id" | "imageUrl">,
    variantsData: Omit<Product, "id" | "imageUrl">[]
  ) => void;
  updateProduct: (productData: Product) => void;
  updateMultipleProducts: (productsData: Pick<Product, "id" | "price" | "costPrice">[]) => void;
  deleteProduct: (productId: string) => void;
  addSale: (
    saleData: Omit<Sale, "id" | "date" | "payments"> & {
      payments: { methodId: string; amount: number }[];
    }
  ) => Sale;
  voidSale: (saleId: string) => void;
  updateSaleWithEmail: (saleId: string, email: string) => void;
  addStockAdjustment: (adjData: Omit<StockAdjustment, "id" | "date">) => void;
  addCustomer: (customerData: Omit<Customer, "id">) => void;
  updateCustomer: (customerData: Customer) => void;
  deleteCustomer: (customerId: string) => void;
  addSupplier: (supplierData: Omit<Supplier, "id">) => void;
  updateSupplier: (supplierData: Supplier) => void;
  deleteSupplier: (supplierId: string) => void;
  addCustomerGroup: (groupData: Omit<CustomerGroup, "id">) => void;
  updateCustomerGroup: (groupData: CustomerGroup) => void;
  deleteCustomerGroup: (groupId: string) => void;
  addDraft: (draftData: Omit<Draft, "id" | "date">) => void;
  updateDraft: (draftData: Draft) => void;
  deleteDraft: (draftId: string) => void;
  addQuotation: (quoteData: Omit<Quotation, "id" | "date">) => void;
  updateQuotation: (quoteData: Quotation) => void;
  deleteQuotation: (quoteId: string) => void;
  addPurchase: (purchaseData: Omit<Purchase, "id" | "date">) => void;
  addPurchaseReturn: (returnData: Omit<PurchaseReturn, "id" | "date">) => void;
  addExpense: (expenseData: Omit<Expense, "id" | "date">) => void;
  updateExpense: (expenseData: Expense) => void;
  deleteExpense: (expenseId: string) => void;
  addExpenseCategory: (categoryData: Omit<ExpenseCategory, "id">) => void;
  updateExpenseCategory: (categoryData: ExpenseCategory) => void;
  deleteExpenseCategory: (categoryId: string) => void;
  addBrand: (brandData: Omit<Brand, "id">) => Brand;
  updateBrand: (brandData: Brand) => void;
  deleteBrand: (brandId: string) => void;
  addCategory: (categoryData: Omit<Category, "id">) => void;
  updateCategory: (categoryData: Category) => void;
  deleteCategory: (categoryId: string) => void;
  addUnit: (unitData: Omit<Unit, "id">) => void;
  updateUnit: (unitData: Unit) => void;
  deleteUnit: (unitId: string) => void;
  addVariation: (variationData: Omit<Variation, "id">) => void;
  updateVariation: (variationData: Variation) => void;
  deleteVariation: (variationId: string) => void;
  addVariationValue: (valueData: Omit<VariationValue, "id">) => void;
  updateVariationValue: (valueData: VariationValue) => void;
  deleteVariationValue: (valueId: string) => void;
  addBusinessLocation: (locationData: Omit<BusinessLocation, "id">) => void;
  updateBusinessLocation: (locationData: BusinessLocation) => void;
  deleteBusinessLocation: (locationId: string) => void;
  addStockTransfer: (transferData: Omit<StockTransfer, "id" | "date">) => void;
  addCustomerRequests: (requestsText: string, cashier: User) => void;
  brandingSettings: BrandingSettings;
  updateBrandingSettings: (newSettings: BrandingSettings) => void;
  resetBrandingSettings: () => void;
  ageVerificationSettings: AgeVerificationSettings;
  updateAgeVerificationSettings: (
    newSettings: AgeVerificationSettings,
    productIds: string[]
  ) => void;
  addProductDocument: (docData: Omit<ProductDocument, "id" | "uploadedDate">) => void;
  updateProductDocument: (docData: ProductDocument) => void;
  deleteProductDocument: (docId: string) => void;
  addCustomerReturn: (returnData: Omit<CustomerReturn, "id" | "date">) => void;
  addIntegration: (connectionData: Omit<IntegrationConnection, "id">) => void;
  updateIntegration: (connectionData: IntegrationConnection) => void;
  deleteIntegration: (connectionId: string) => void;
  addBankAccount: (accountData: Omit<BankAccount, "id">) => void;
  updateBankAccount: (accountData: BankAccount) => void;
  deleteBankAccount: (accountId: string) => void;
  addPaymentMethod: (methodData: Omit<PaymentMethod, "id">) => void;
  updatePaymentMethod: (methodData: PaymentMethod) => void;
  deletePaymentMethod: (methodId: string) => void;
  addStockTransferRequest: (
    requestData: Omit<StockTransferRequest, "id" | "date" | "status">
  ) => void;
  updateStockTransferRequest: (requestId: string, status: "approved" | "rejected") => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // AUTH STATE
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null); // Application's user type
  const [loading, setLoading] = useState(true);

  // DATA STATE (simulating a database)
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [stockAdjustments, setStockAdjustments] =
    useState<StockAdjustment[]>(MOCK_STOCK_ADJUSTMENTS);
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
  const [expenseCategories, setExpenseCategories] =
    useState<ExpenseCategory[]>(MOCK_EXPENSE_CATEGORIES);
  const [businessLocations, setBusinessLocations] =
    useState<BusinessLocation[]>(MOCK_BUSINESS_LOCATIONS);
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>(MOCK_STOCK_TRANSFERS);
  const [shipments, setShipments] = useState<Shipment[]>(MOCK_SHIPMENTS);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(MOCK_PAYMENT_METHODS);
  const [customerRequests, setCustomerRequests] =
    useState<CustomerRequest[]>(MOCK_CUSTOMER_REQUESTS);
  const [productDocuments, setProductDocuments] =
    useState<ProductDocument[]>(MOCK_PRODUCT_DOCUMENTS);
  const [customerReturns, setCustomerReturns] = useState<CustomerReturn[]>(MOCK_CUSTOMER_RETURNS);
  const [integrations, setIntegrations] = useState<IntegrationConnection[]>(MOCK_INTEGRATIONS);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(MOCK_BANK_ACCOUNTS);
  const [stockTransferRequests, setStockTransferRequests] = useState<StockTransferRequest[]>(
    MOCK_STOCK_TRANSFER_REQUESTS
  );
  const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplate[]>(
    MOCK_NOTIFICATION_TEMPLATES
  );
  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>(DEFAULT_BRANDING);
  const [ageVerificationSettings, setAgeVerificationSettings] = useState<AgeVerificationSettings>({
    minimumAge: 21,
    isIdScanningEnabled: true,
  });

  // Initialize Supabase client directly from environment variables
  useEffect(() => {
    try {
      // Access environment variables directly (defined in vite.config.ts)
      const supabaseUrl = process.env.PUBLIC_SUPABASE_URL as string | undefined;
      const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

      // Check if environment variables are set and not empty
      if (
        !supabaseUrl ||
        !supabaseAnonKey ||
        supabaseUrl === "undefined" ||
        supabaseAnonKey === "undefined"
      ) {
        console.error(
          "Supabase environment variables are missing. Please ensure PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY are set in your .env file."
        );
        setLoading(false);
        return;
      }

      // Initialize Supabase client
      const client = createClient(supabaseUrl, supabaseAnonKey);
      setSupabase(client);
      console.log("Supabase client initialized successfully");
    } catch (error) {
      console.error("Supabase client initialization failed:", error);
      setLoading(false);
    }
  }, []);

  const authFunctions = useMemo(() => {
    const throwError = () => {
      throw new Error(
        "Supabase client is not initialized. Check server configuration and network."
      );
    };

    return {
      signIn: async (email: string, pass: string) => {
        if (!supabase) return throwError();
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
      },
      signOut: async () => {
        if (!supabase) return throwError();
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
      signUp: async (email: string, pass: string, metadata: { [key: string]: any }) => {
        if (!supabase) return throwError();
        const { error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: { data: metadata },
        });
        if (error) throw error;
      },
      resetPasswordForEmail: async (email: string) => {
        if (!supabase) return throwError();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/#/reset-password",
        });
        if (error) throw error;
      },
      updateUserPassword: async (password: string) => {
        if (!supabase) return throwError();
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
      },
    };
  }, [supabase]);

  const fetchAppUser = useCallback(
    async (session: Session | null) => {
      if (!session) {
        setCurrentUser(null);
        return;
      }
      try {
        const response = await fetch("/api/get-user-profile", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!response.ok) {
          // Fallback: treat logged-in user as admin if profile fetch fails
          const fallbackUser: User = {
            id: session.user.id,
            name: session.user.email?.split("@")[0] || "Admin",
            email: session.user.email || "",
            roleId: "admin",
            businessLocationId: "default",
          };
          setCurrentUser(fallbackUser);
          return;
        }
        const appUser: User = await response.json();
        setCurrentUser(appUser);
      } catch (error: any) {
        // Fallback: treat logged-in user as admin if profile fetch fails
        if (session) {
          const fallbackUser: User = {
            id: session.user.id,
            name: session.user.email?.split("@")[0] || "Admin",
            email: session.user.email || "",
            roleId: "admin",
            businessLocationId: "default",
          };
          setCurrentUser(fallbackUser);
        } else {
          setCurrentUser(null);
        }
      }
    },
    [supabase]
  );

  useEffect(() => {
    if (supabase) {
      setLoading(true);
      const fetchSessionAndUser = async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        // Set loading to false immediately after session is set
        // Don't wait for user profile fetch - it can happen in background
        setLoading(false);
        // Fetch user profile in background (non-blocking)
        if (session) {
          fetchAppUser(session).catch((err) => {
            console.error("Background user profile fetch failed:", err);
          });
        }
      };
      fetchSessionAndUser();

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (_event === "SIGNED_OUT") {
          setCurrentUser(null);
          setLoading(false);
        } else if (session) {
          // Session is valid, ensure loading is false so user can access protected routes
          setLoading(false);
          // Fetch user profile in background when session changes
          fetchAppUser(session).catch((err) => {
            console.error("Background user profile fetch failed:", err);
          });
        } else {
          setCurrentUser(null);
          setLoading(false);
        }
      });
      return () => subscription.unsubscribe();
    } else {
      // If supabase client is not initialized, stop loading
      setLoading(false);
    }
  }, [supabase, fetchAppUser]);

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      // Treat any authenticated session as admin (full access)
      return !!session;
    },
    [session]
  );

  // --- MOCK DATA MUTATIONS ---
  const addSale = (saleData: Omit<Sale, "id" | "date">) => {
    const newSale: Sale = { ...saleData, id: `SALE${Date.now()}`, date: new Date().toISOString() };
    setSales((prev) => [newSale, ...prev]);
    newSale.items.forEach((item) => {
      setProducts((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, stock: p.stock - item.quantity } : p))
      );
    });
    return newSale;
  };

  const addProduct = (productData: Omit<Product, "id" | "imageUrl">) => {
    const newProduct: Product = {
      ...productData,
      id: `PROD${Date.now()}`,
      imageUrl: "https://picsum.photos/400",
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (productData: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === productData.id ? productData : p)));
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const value = useMemo(
    () => ({
      supabase,
      session,
      user: session?.user || null,
      currentUser,
      setCurrentUser,
      users,
      roles,
      products,
      stockAdjustments,
      customers,
      customerGroups,
      suppliers,
      variations,
      variationValues,
      brands,
      categories,
      units,
      sales,
      drafts,
      quotations,
      purchases,
      purchaseReturns,
      expenses,
      expenseCategories,
      businessLocations,
      stockTransfers,
      shipments,
      paymentMethods,
      customerRequests,
      productDocuments,
      customerReturns,
      integrations,
      bankAccounts,
      stockTransferRequests,
      notificationTemplates,
      loading,
      ...authFunctions,
      hasPermission,
      // Mock implementations
      addSale,
      addProduct,
      updateProduct,
      deleteProduct,
      brandingSettings,
      ageVerificationSettings,
      addRole: (d) => {
        setRoles((p) => [...p, { ...d, id: `r${Date.now()}` }]);
        return { ...d, id: `r${Date.now()}` };
      },
      updateRole: (d) => setRoles((p) => p.map((r) => (r.id === d.id ? d : r))),
      deleteRole: (id) => setRoles((p) => p.filter((r) => r.id !== id)),
      addUser: (d) => setUsers((p) => [...p, { ...d, id: `u${Date.now()}` }]),
      updateUser: (d) => setUsers((p) => p.map((u) => (u.id === d.id ? d : u))),
      deleteUser: (id) => setUsers((p) => p.filter((u) => u.id !== id)),
      addVariableProduct: () => {},
      updateMultipleProducts: () => {},
      voidSale: (id) =>
        setSales((p) => p.map((s) => (s.id === id ? { ...s, status: "voided" } : s))),
      updateSaleWithEmail: (id, email) =>
        setSales((p) => p.map((s) => (s.id === id ? { ...s, customerEmailForDocs: email } : s))),
      addStockAdjustment: (d) =>
        setStockAdjustments((p) => [
          ...p,
          { ...d, id: `sa${Date.now()}`, date: new Date().toISOString() },
        ]),
      addCustomer: (d) => setCustomers((p) => [...p, { ...d, id: `c${Date.now()}` }]),
      updateCustomer: (d) => setCustomers((p) => p.map((c) => (c.id === d.id ? d : c))),
      deleteCustomer: (id) => setCustomers((p) => p.filter((c) => c.id !== id)),
      addSupplier: (d) => setSuppliers((p) => [...p, { ...d, id: `s${Date.now()}` }]),
      updateSupplier: (d) => setSuppliers((p) => p.map((s) => (s.id === d.id ? d : s))),
      deleteSupplier: (id) => setSuppliers((p) => p.filter((s) => s.id !== id)),
      addCustomerGroup: (d) => setCustomerGroups((p) => [...p, { ...d, id: `cg${Date.now()}` }]),
      updateCustomerGroup: (d) =>
        setCustomerGroups((p) => p.map((cg) => (cg.id === d.id ? d : cg))),
      deleteCustomerGroup: (id) => setCustomerGroups((p) => p.filter((cg) => cg.id !== id)),
      addDraft: (d) =>
        setDrafts((p) => [...p, { ...d, id: `d${Date.now()}`, date: new Date().toISOString() }]),
      updateDraft: (d) => setDrafts((p) => p.map((dr) => (dr.id === d.id ? d : dr))),
      deleteDraft: (id) => setDrafts((p) => p.filter((dr) => dr.id !== id)),
      addQuotation: (d) =>
        setQuotations((p) => [
          ...p,
          { ...d, id: `q${Date.now()}`, date: new Date().toISOString() },
        ]),
      updateQuotation: (d) => setQuotations((p) => p.map((q) => (q.id === d.id ? d : q))),
      deleteQuotation: (id) => setQuotations((p) => p.filter((q) => q.id !== id)),
      addPurchase: (d) =>
        setPurchases((p) => [
          ...p,
          { ...d, id: `pur${Date.now()}`, date: new Date().toISOString() },
        ]),
      addPurchaseReturn: (d) =>
        setPurchaseReturns((p) => [
          ...p,
          { ...d, id: `pr${Date.now()}`, date: new Date().toISOString() },
        ]),
      addExpense: (d) =>
        setExpenses((p) => [...p, { ...d, id: `e${Date.now()}`, date: new Date().toISOString() }]),
      updateExpense: (d) => setExpenses((p) => p.map((e) => (e.id === d.id ? d : e))),
      deleteExpense: (id) => setExpenses((p) => p.filter((e) => e.id !== id)),
      addExpenseCategory: (d) =>
        setExpenseCategories((p) => [...p, { ...d, id: `ec${Date.now()}` }]),
      updateExpenseCategory: (d) =>
        setExpenseCategories((p) => p.map((ec) => (ec.id === d.id ? d : ec))),
      deleteExpenseCategory: (id) => setExpenseCategories((p) => p.filter((ec) => ec.id !== id)),
      addBrand: (d) => {
        const newBrand = { ...d, id: `b${Date.now()}` };
        setBrands((p) => [...p, newBrand]);
        return newBrand;
      },
      updateBrand: (d) => setBrands((p) => p.map((b) => (b.id === d.id ? d : b))),
      deleteBrand: (id) => setBrands((p) => p.filter((b) => b.id !== id)),
      addCategory: (d) => setCategories((p) => [...p, { ...d, id: `cat${Date.now()}` }]),
      updateCategory: (d) => setCategories((p) => p.map((c) => (c.id === d.id ? d : c))),
      deleteCategory: (id) => setCategories((p) => p.filter((c) => c.id !== id)),
      addUnit: (d) => setUnits((p) => [...p, { ...d, id: `u${Date.now()}` }]),
      updateUnit: (d) => setUnits((p) => p.map((u) => (u.id === d.id ? d : u))),
      deleteUnit: (id) => setUnits((p) => p.filter((u) => u.id !== id)),
      addVariation: (d) => setVariations((p) => [...p, { ...d, id: `v${Date.now()}` }]),
      updateVariation: (d) => setVariations((p) => p.map((v) => (v.id === d.id ? d : v))),
      deleteVariation: (id) => setVariations((p) => p.filter((v) => v.id !== id)),
      addVariationValue: (d) => setVariationValues((p) => [...p, { ...d, id: `vv${Date.now()}` }]),
      updateVariationValue: (d) =>
        setVariationValues((p) => p.map((vv) => (vv.id === d.id ? d : vv))),
      deleteVariationValue: (id) => setVariationValues((p) => p.filter((vv) => vv.id !== id)),
      addBusinessLocation: (d) =>
        setBusinessLocations((p) => [...p, { ...d, id: `bl${Date.now()}` }]),
      updateBusinessLocation: (d) =>
        setBusinessLocations((p) => p.map((bl) => (bl.id === d.id ? d : bl))),
      deleteBusinessLocation: (id) => setBusinessLocations((p) => p.filter((bl) => bl.id !== id)),
      addStockTransfer: (d) =>
        setStockTransfers((p) => [
          ...p,
          { ...d, id: `st${Date.now()}`, date: new Date().toISOString() },
        ]),
      addCustomerRequests: (text, cashier) =>
        setCustomerRequests((p) => [
          ...p,
          {
            id: `cr${Date.now()}`,
            text,
            cashierId: cashier.id,
            cashierName: cashier.name,
            date: new Date().toISOString(),
          },
        ]),
      updateBrandingSettings: setBrandingSettings,
      resetBrandingSettings: () => setBrandingSettings(DEFAULT_BRANDING),
      updateAgeVerificationSettings: (settings, ids) => {
        setAgeVerificationSettings(settings);
        setProducts((p) => p.map((prod) => ({ ...prod, isAgeRestricted: ids.includes(prod.id) })));
      },
      addProductDocument: (d) =>
        setProductDocuments((p) => [
          ...p,
          { ...d, id: `doc${Date.now()}`, uploadedDate: new Date().toISOString() },
        ]),
      updateProductDocument: (d) =>
        setProductDocuments((p) => p.map((doc) => (doc.id === d.id ? d : doc))),
      deleteProductDocument: (id) => setProductDocuments((p) => p.filter((doc) => doc.id !== id)),
      addCustomerReturn: (d) =>
        setCustomerReturns((p) => [
          ...p,
          { ...d, id: `crn${Date.now()}`, date: new Date().toISOString() },
        ]),
      addIntegration: (d) => setIntegrations((p) => [...p, { ...d, id: `int${Date.now()}` }]),
      updateIntegration: (d) => setIntegrations((p) => p.map((i) => (i.id === d.id ? d : i))),
      deleteIntegration: (id) => setIntegrations((p) => p.filter((i) => i.id !== id)),
      addBankAccount: (d) => setBankAccounts((p) => [...p, { ...d, id: `ba${Date.now()}` }]),
      updateBankAccount: (d) => setBankAccounts((p) => p.map((ba) => (ba.id === d.id ? d : ba))),
      deleteBankAccount: (id) => setBankAccounts((p) => p.filter((ba) => ba.id !== id)),
      addPaymentMethod: (d) => setPaymentMethods((p) => [...p, { ...d, id: `pm${Date.now()}` }]),
      updatePaymentMethod: (d) =>
        setPaymentMethods((p) => p.map((pm) => (pm.id === d.id ? d : pm))),
      deletePaymentMethod: (id) => setPaymentMethods((p) => p.filter((pm) => pm.id !== id)),
      addStockTransferRequest: (d) =>
        setStockTransferRequests((p) => [
          ...p,
          { ...d, id: `str${Date.now()}`, date: new Date().toISOString(), status: "pending" },
        ]),
      updateStockTransferRequest: (id, status) =>
        setStockTransferRequests((p) => p.map((str) => (str.id === id ? { ...str, status } : str))),
    }),
    [
      supabase,
      session,
      currentUser,
      loading,
      users,
      roles,
      products,
      stockAdjustments,
      customers,
      customerGroups,
      suppliers,
      variations,
      variationValues,
      brands,
      categories,
      units,
      sales,
      drafts,
      quotations,
      purchases,
      purchaseReturns,
      expenses,
      expenseCategories,
      businessLocations,
      stockTransfers,
      shipments,
      paymentMethods,
      customerRequests,
      productDocuments,
      customerReturns,
      integrations,
      bankAccounts,
      stockTransferRequests,
      notificationTemplates,
      brandingSettings,
      ageVerificationSettings,
      hasPermission,
      authFunctions,
      fetchAppUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
