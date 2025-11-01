import React, { createContext, useState, useContext, useMemo } from 'react';
import { User, Role, Permission, Product, StockAdjustment, Customer, CustomerGroup, Supplier, Variation, VariationValue, Brand, Category, Unit, Sale, Draft, Quotation, Purchase, PurchaseReturn, Expense, ExpenseCategory, BusinessLocation, StockTransfer, Shipment, PaymentMethod, CustomerRequest } from '../types';
import { MOCK_USERS, MOCK_ROLES, MOCK_PRODUCTS, MOCK_STOCK_ADJUSTMENTS, MOCK_CUSTOMERS, MOCK_CUSTOMER_GROUPS, MOCK_SUPPLIERS, MOCK_VARIATIONS, MOCK_VARIATION_VALUES, MOCK_BRANDS, MOCK_CATEGORIES, MOCK_UNITS, MOCK_SALES, MOCK_DRAFTS, MOCK_QUOTATIONS, MOCK_PURCHASES, MOCK_PURCHASE_RETURNS, MOCK_EXPENSES, MOCK_EXPENSE_CATEGORIES, MOCK_BUSINESS_LOCATIONS, MOCK_STOCK_TRANSFERS, MOCK_SHIPMENTS, MOCK_PAYMENT_METHODS, MOCK_CUSTOMER_REQUESTS } from '../data/mockData';

interface AgeVerificationSettings {
    minimumAge: number;
    isIdScanningEnabled: boolean;
}

interface AuthContextType {
    currentUser: User | null;
    setCurrentUser: (user: User) => void;
    users: User[];
    roles: Role[];
    hasPermission: (permission: Permission) => boolean;
    // Roles
    addRole: (role: Omit<Role, 'id'>) => void;
    updateRole: (role: Role) => void;
    deleteRole: (roleId: string) => void;
    // Users
    updateUser: (user: User) => void;
    addUser: (userData: Omit<User, 'id'>) => void;
    deleteUser: (userId: string) => void;
    // Products & Stock
    products: Product[];
    addProduct: (productData: Omit<Product, 'id' | 'imageUrl'>, imageDataUrl?: string | null) => void;
    updateProduct: (product: Product) => void;
    updateMultipleProducts: (updatedProducts: Pick<Product, 'id' | 'price' | 'costPrice'>[]) => void;
    brands: Brand[];
    addBrand: (brandData: Omit<Brand, 'id'>) => Brand;
    updateBrand: (brand: Brand) => void;
    deleteBrand: (brandId: string) => void;
    categories: Category[];
    addCategory: (categoryData: Omit<Category, 'id'>) => void;
    updateCategory: (category: Category) => void;
    deleteCategory: (categoryId: string) => void;
    units: Unit[];
    addUnit: (unitData: Omit<Unit, 'id'>) => void;
    updateUnit: (unit: Unit) => void;
    deleteUnit: (unitId: string) => void;
    stockAdjustments: StockAdjustment[];
    addStockAdjustment: (adjustmentData: Omit<StockAdjustment, 'id' | 'date'>) => void;
    businessLocations: BusinessLocation[];
    addBusinessLocation: (locationData: Omit<BusinessLocation, 'id'>) => void;
    updateBusinessLocation: (location: BusinessLocation) => void;
    deleteBusinessLocation: (locationId: string) => void;
    stockTransfers: StockTransfer[];
    addStockTransfer: (transferData: Omit<StockTransfer, 'id' | 'date'>) => void;
    // Variations
    variations: Variation[];
    variationValues: VariationValue[];
    addVariation: (variationData: Omit<Variation, 'id'>) => void;
    updateVariation: (variation: Variation) => void;
    deleteVariation: (variationId: string) => void;
    addVariationValue: (valueData: Omit<VariationValue, 'id'>) => void;
    updateVariationValue: (value: VariationValue) => void;
    deleteVariationValue: (valueId: string) => void;
    // Contacts
    customers: Customer[];
    customerGroups: CustomerGroup[];
    suppliers: Supplier[];
    addCustomer: (customerData: Omit<Customer, 'id'>) => void;
    updateCustomer: (customer: Customer) => void;
    deleteCustomer: (customerId: string) => void;
    addSupplier: (supplierData: Omit<Supplier, 'id'>) => void;
    updateSupplier: (supplier: Supplier) => void;
    deleteSupplier: (supplierId: string) => void;
    addCustomerGroup: (groupData: Omit<CustomerGroup, 'id'>) => void;
    updateCustomerGroup: (group: CustomerGroup) => void;
    deleteCustomerGroup: (groupId: string) => void;
    // Purchases
    purchases: Purchase[];
    addPurchase: (purchaseData: Omit<Purchase, 'id' | 'date'>) => void;
    purchaseReturns: PurchaseReturn[];
    addPurchaseReturn: (returnData: Omit<PurchaseReturn, 'id' | 'date'>) => void;
    // Sell
    sales: Sale[];
    drafts: Draft[];
    quotations: Quotation[];
    addSale: (saleData: Omit<Sale, 'id' | 'date'>) => Sale;
    voidSale: (saleId: string) => void;
    addDraft: (draftData: Omit<Draft, 'id' | 'date'>) => void;
    updateDraft: (updatedDraft: Draft) => void;
    deleteDraft: (draftId: string) => void;
    // Shipping
    shipments: Shipment[];
    addShipment: (shipmentData: Omit<Shipment, 'id'>) => void;
    updateShipment: (shipment: Shipment) => void;
    deleteShipment: (shipmentId: string) => void;
    // Expenses
    expenses: Expense[];
    expenseCategories: ExpenseCategory[];
    addExpense: (expenseData: Omit<Expense, 'id' | 'date'>) => void;
    updateExpense: (expense: Expense) => void;
    deleteExpense: (expenseId: string) => void;
    addExpenseCategory: (categoryData: Omit<ExpenseCategory, 'id'>) => void;
    updateExpenseCategory: (category: ExpenseCategory) => void;
    deleteExpenseCategory: (categoryId: string) => void;
    // Payments
    paymentMethods: PaymentMethod[];
    addPaymentMethod: (data: Omit<PaymentMethod, 'id'>) => void;
    updatePaymentMethod: (method: PaymentMethod) => void;
    deletePaymentMethod: (methodId: string) => void;
    // Settings
    ageVerificationSettings: AgeVerificationSettings;
    updateAgeVerificationSettings: (settings: AgeVerificationSettings, restrictedIds: string[]) => void;
    // Customer Requests
    customerRequests: CustomerRequest[];
    addCustomerRequests: (requestsText: string, cashier: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
    const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USERS[0]); // Default to Admin
    const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
    const [brands, setBrands] = useState<Brand[]>(MOCK_BRANDS);
    const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
    const [units, setUnits] = useState<Unit[]>(MOCK_UNITS);
    const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(MOCK_STOCK_ADJUSTMENTS);
    const [businessLocations, setBusinessLocations] = useState<BusinessLocation[]>(MOCK_BUSINESS_LOCATIONS);
    const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>(MOCK_STOCK_TRANSFERS);
    const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
    const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>(MOCK_CUSTOMER_GROUPS);
    const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
    const [variations, setVariations] = useState<Variation[]>(MOCK_VARIATIONS);
    const [variationValues, setVariationValues] = useState<VariationValue[]>(MOCK_VARIATION_VALUES);
    const [sales, setSales] = useState<Sale[]>(MOCK_SALES);
    const [shipments, setShipments] = useState<Shipment[]>(MOCK_SHIPMENTS);
    const [drafts, setDrafts] = useState<Draft[]>(MOCK_DRAFTS);
    const [quotations, setQuotations] = useState<Quotation[]>(MOCK_QUOTATIONS);
    const [purchases, setPurchases] = useState<Purchase[]>(MOCK_PURCHASES);
    const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>(MOCK_PURCHASE_RETURNS);
    const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
    const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(MOCK_EXPENSE_CATEGORIES);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(MOCK_PAYMENT_METHODS);
    const [ageVerificationSettings, setAgeVerificationSettings] = useState<AgeVerificationSettings>({ minimumAge: 21, isIdScanningEnabled: false });
    const [customerRequests, setCustomerRequests] = useState<CustomerRequest[]>(MOCK_CUSTOMER_REQUESTS);


    const rolesMap = useMemo(() => new Map(roles.map(role => [role.id, role])), [roles]);

    const hasPermission = (permission: Permission): boolean => {
        if (!currentUser) return false;
        const userRole = rolesMap.get(currentUser.roleId);
        return userRole?.permissions.includes(permission) ?? false;
    };
    
    // #region Role Management
    const addRole = (roleData: Omit<Role, 'id'>) => {
        const newRole: Role = {
            id: `role_${Date.now()}`,
            ...roleData,
        };
        setRoles(prevRoles => [...prevRoles, newRole]);
    };

    const updateRole = (updatedRole: Role) => {
        setRoles(prevRoles => prevRoles.map(role => role.id === updatedRole.id ? updatedRole : role));
    };
    
    const deleteRole = (roleId: string) => {
        if (users.some(user => user.roleId === roleId)) {
            throw new Error('Cannot delete a role that is currently assigned to one or more users.');
        }
        if (['admin', 'manager', 'cashier'].includes(roleId)) {
            throw new Error('Cannot delete default system roles.');
        }
        setRoles(prevRoles => prevRoles.filter(role => role.id !== roleId));
    };
    // #endregion

    // #region User Management
    const updateUser = (updatedUser: User) => {
        setUsers(prevUsers => prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user));
        if (currentUser && currentUser.id === updatedUser.id) {
            setCurrentUser(updatedUser);
        }
    };
    
    const addUser = (userData: Omit<User, 'id'>) => {
        const newUser: User = {
            id: `user_${Date.now()}`,
            ...userData
        };
        setUsers(prevUsers => [...prevUsers, newUser]);
    };

    const deleteUser = (userId: string) => {
        if (currentUser?.id === userId) {
            throw new Error("Error: You cannot delete your own account.");
        }
        if (userId === 'USER001') { // Assuming USER001 is the primary admin
            throw new Error("Error: The primary administrator account cannot be deleted.");
        }
        setUsers(prev => prev.filter(user => user.id !== userId));
    };
    // #endregion

    // #region Product Management
    const addProduct = (productData: Omit<Product, 'id' | 'imageUrl'>, imageDataUrl?: string | null) => {
        const newProduct: Product = {
            id: `prod_${Date.now()}`,
            imageUrl: imageDataUrl || `https://picsum.photos/seed/${Date.now()}/400`,
            ...productData
        };
        setProducts(prev => [newProduct, ...prev]);
    };

    const updateProduct = (updatedProduct: Product) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    };

    const updateMultipleProducts = (updatedProducts: Pick<Product, 'id' | 'price' | 'costPrice'>[]) => {
        const updatesMap = new Map(updatedProducts.map(p => [p.id, { price: p.price, costPrice: p.costPrice }]));
        setProducts(prevProducts =>
            prevProducts.map(p =>
                updatesMap.has(p.id) ? { ...p, price: updatesMap.get(p.id)!.price, costPrice: updatesMap.get(p.id)!.costPrice } : p
            )
        );
    };

    const addBrand = (brandData: Omit<Brand, 'id'>): Brand => {
        const newBrand = { id: `b_${Date.now()}`, ...brandData };
        setBrands(prev => [...prev, newBrand]);
        return newBrand;
    };
    const updateBrand = (updatedBrand: Brand) => setBrands(prev => prev.map(b => b.id === updatedBrand.id ? updatedBrand : b));
    const deleteBrand = (brandId: string) => {
        if (products.some(p => p.brandId === brandId)) {
            throw new Error("Cannot delete brand. It is currently in use by one or more products.");
        }
        setBrands(prev => prev.filter(b => b.id !== brandId));
    };

    const addCategory = (catData: Omit<Category, 'id'>) => setCategories(prev => [...prev, { id: `c_${Date.now()}`, ...catData }]);
    const updateCategory = (updatedCat: Category) => setCategories(prev => prev.map(c => c.id === updatedCat.id ? updatedCat : c));
    const deleteCategory = (catId: string) => {
        if (products.some(p => p.categoryId === catId)) {
            throw new Error("Cannot delete category. It is currently in use by one or more products.");
        }
        setCategories(prev => prev.filter(c => c.id !== catId));
    };

    const addUnit = (unitData: Omit<Unit, 'id'>) => setUnits(prev => [...prev, { id: `u_${Date.now()}`, ...unitData }]);
    const updateUnit = (updatedUnit: Unit) => setUnits(prev => prev.map(u => u.id === updatedUnit.id ? updatedUnit : u));
    const deleteUnit = (unitId: string) => {
        if (products.some(p => p.unitId === unitId)) {
            throw new Error("Cannot delete unit. It is currently in use by one or more products.");
        }
        setUnits(prev => prev.filter(u => u.id !== unitId));
    };

    const addBusinessLocation = (locData: Omit<BusinessLocation, 'id'>) => setBusinessLocations(prev => [...prev, { id: `loc_${Date.now()}`, ...locData }]);
    const updateBusinessLocation = (updatedLoc: BusinessLocation) => setBusinessLocations(prev => prev.map(loc => loc.id === updatedLoc.id ? updatedLoc : loc));
    const deleteBusinessLocation = (locId: string) => {
        if (products.some(p => p.businessLocationId === locId)) {
            throw new Error("Cannot delete location. It is currently assigned to one or more products.");
        }
        setBusinessLocations(prev => prev.filter(loc => loc.id !== locId));
    };
    // #endregion
    
    // #region Stock Management
    const addStockAdjustment = (adjustmentData: Omit<StockAdjustment, 'id' | 'date'>) => {
        const newAdjustment: StockAdjustment = {
            id: `sa_${Date.now()}`,
            date: new Date().toISOString(),
            ...adjustmentData
        };
        setStockAdjustments(prev => [newAdjustment, ...prev]);

        setProducts(prevProducts => {
            return prevProducts.map(p => {
                if (p.id === adjustmentData.productId) {
                    const newStock = adjustmentData.type === 'addition'
                        ? p.stock + adjustmentData.quantity
                        : p.stock - adjustmentData.quantity;
                    return { ...p, stock: Math.max(0, newStock) }; // Ensure stock doesn't go below 0
                }
                return p;
            });
        });
    };

    const addStockTransfer = (transferData: Omit<StockTransfer, 'id' | 'date'>) => {
        const newTransfer: StockTransfer = {
            id: `st_${Date.now()}`,
            date: new Date().toISOString(),
            ...transferData,
        };
        setStockTransfers(prev => [newTransfer, ...prev]);

        // Process stock updates for the transfer
        setProducts(prevProducts => {
            const newProducts = [...prevProducts];

            for (const item of transferData.items) {
                // Find and decrease stock at source location
                const sourceProductIndex = newProducts.findIndex(p =>
                    p.sku === item.sku && p.businessLocationId === transferData.fromLocationId
                );
                
                if (sourceProductIndex > -1) {
                    const currentStock = newProducts[sourceProductIndex].stock;
                    newProducts[sourceProductIndex] = {
                        ...newProducts[sourceProductIndex],
                        stock: Math.max(0, currentStock - item.quantity),
                    };
                }

                // Find and increase stock at destination location
                const destProductIndex = newProducts.findIndex(p =>
                    p.sku === item.sku && p.businessLocationId === transferData.toLocationId
                );
                if (destProductIndex > -1) {
                    const currentStock = newProducts[destProductIndex].stock;
                    newProducts[destProductIndex] = {
                        ...newProducts[destProductIndex],
                        stock: currentStock + item.quantity,
                    };
                } else {
                    // if product does not exist in destination location, create it
                    const productInfo = products.find(p => p.sku === item.sku); // get generic info from any instance of the product
                    if (productInfo) {
                        const newProductAtDest: Product = {
                            ...productInfo,
                            id: `prod_${Date.now()}_${item.sku}`, // new unique ID
                            businessLocationId: transferData.toLocationId,
                            stock: item.quantity,
                        };
                        newProducts.push(newProductAtDest);
                    }
                }
            }
            return newProducts;
        });
    };
    // #endregion
    
    // #region Variation Management
    const addVariation = (variationData: Omit<Variation, 'id'>) => {
        const newVariation: Variation = { id: `v_${Date.now()}`, ...variationData };
        setVariations(prev => [...prev, newVariation]);
    };
    const updateVariation = (updatedVariation: Variation) => {
        setVariations(prev => prev.map(v => v.id === updatedVariation.id ? updatedVariation : v));
    };
    const deleteVariation = (variationId: string) => {
        if (variationValues.some(val => val.variationId === variationId)) {
            throw new Error('Cannot delete this variation because it has values associated with it. Please delete the values first.');
        }
        setVariations(prev => prev.filter(v => v.id !== variationId));
    };
    const addVariationValue = (valueData: Omit<VariationValue, 'id'>) => {
        const newValue: VariationValue = { id: `vv_${Date.now()}`, ...valueData };
        setVariationValues(prev => [...prev, newValue]);
    };
    const updateVariationValue = (updatedValue: VariationValue) => {
        setVariationValues(prev => prev.map(v => v.id === updatedValue.id ? updatedValue : v));
    };
    const deleteVariationValue = (valueId: string) => {
        // In a real app, you would check if this value is used by any product variant.
        setVariationValues(prev => prev.filter(v => v.id !== valueId));
    };
    // #endregion

    // #region Contact Management
    const addCustomer = (customerData: Omit<Customer, 'id'>) => {
        const newCustomer: Customer = { id: `cust_${Date.now()}`, ...customerData };
        setCustomers(prev => [newCustomer, ...prev]);
    };
    const updateCustomer = (updatedCustomer: Customer) => {
        setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    };
    const deleteCustomer = (customerId: string) => {
        setCustomers(prev => prev.filter(c => c.id !== customerId));
    };
    
    const addSupplier = (supplierData: Omit<Supplier, 'id'>) => {
        const newSupplier: Supplier = { id: `supp_${Date.now()}`, ...supplierData };
        setSuppliers(prev => [newSupplier, ...prev]);
    };
    const updateSupplier = (updatedSupplier: Supplier) => {
        setSuppliers(prev => prev.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
    };
    const deleteSupplier = (supplierId: string) => {
        if (purchases.some(p => p.supplier.id === supplierId) || purchaseReturns.some(pr => pr.supplier.id === supplierId)) {
            throw new Error('Cannot delete supplier. They are associated with existing purchases or returns.');
        }
        setSuppliers(prev => prev.filter(s => s.id !== supplierId));
    };

    const addCustomerGroup = (groupData: Omit<CustomerGroup, 'id'>) => {
        const newGroup: CustomerGroup = { id: `cg_${Date.now()}`, ...groupData };
        setCustomerGroups(prev => [newGroup, ...prev]);
    };
    const updateCustomerGroup = (updatedGroup: CustomerGroup) => {
        setCustomerGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
    };
    const deleteCustomerGroup = (groupId: string) => {
        if(customers.some(c => c.customerGroupId === groupId)) {
            throw new Error('Cannot delete a customer group that is assigned to one or more customers.');
        }
        setCustomerGroups(prev => prev.filter(g => g.id !== groupId));
    };
    // #endregion

    // #region Purchase Management
    const addPurchase = (purchaseData: Omit<Purchase, 'id' | 'date'>) => {
        const newPurchase: Purchase = {
            id: `PO-${Date.now().toString().slice(-4)}`,
            date: new Date().toISOString(),
            ...purchaseData,
        };
        setPurchases(prev => [newPurchase, ...prev]);

        // Update product stock
        setProducts(prevProducts => {
            const productUpdates = new Map<string, number>();
            for (const item of purchaseData.items) {
                productUpdates.set(item.id, item.quantity);
            }

            return prevProducts.map(product => {
                if (productUpdates.has(product.id)) {
                    const receivedQty = productUpdates.get(product.id)!;
                    return { ...product, stock: product.stock + receivedQty };
                }
                return product;
            });
        });
    };

    const addPurchaseReturn = (returnData: Omit<PurchaseReturn, 'id' | 'date'>) => {
        const newReturn: PurchaseReturn = {
            id: `PR-${Date.now().toString().slice(-4)}`,
            date: new Date().toISOString(),
            ...returnData,
        };
        setPurchaseReturns(prev => [newReturn, ...prev]);

        // Update product stock by DEDUCTING
        setProducts(prevProducts => {
            const productUpdates = new Map<string, number>();
            for (const item of returnData.items) {
                productUpdates.set(item.id, item.quantity);
            }

            return prevProducts.map(product => {
                if (productUpdates.has(product.id)) {
                    const returnedQty = productUpdates.get(product.id)!;
                    return { ...product, stock: Math.max(0, product.stock - returnedQty) };
                }
                return product;
            });
        });
    };
    // #endregion

    // #region Sell Management
    const addSale = (saleData: Omit<Sale, 'id' | 'date'>): Sale => {
        const newSale: Sale = {
            id: `SALE${Date.now()}`,
            date: new Date().toISOString(),
            ...saleData,
        };
        setSales(prev => [newSale, ...prev]);

        // Update product stock based on sale status
        setProducts(prevProducts => {
            const productUpdates = new Map<string, number>();
            for (const item of saleData.items) {
                productUpdates.set(item.id, item.quantity);
            }

            return prevProducts.map(product => {
                if (productUpdates.has(product.id)) {
                    const transactionQty = productUpdates.get(product.id)!;
                    let newStock = product.stock;
                    if (saleData.status === 'return') {
                        newStock += transactionQty; // Add stock back for returns
                    } else { // 'completed'
                        newStock -= transactionQty; // Deduct stock for sales
                    }
                    return { ...product, stock: Math.max(0, newStock) };
                }
                return product;
            });
        });
        
        return newSale;
    };

    const voidSale = (saleId: string) => {
        const saleToVoid = sales.find(s => s.id === saleId);
        if (!saleToVoid || saleToVoid.status === 'voided') return;

        // Set sale status to voided
        setSales(prev => prev.map(s => s.id === saleId ? { ...s, status: 'voided' } : s));

        // Adjust stock based on original sale type
        setProducts(prevProducts => {
            const productUpdates = new Map<string, number>();
            for (const item of saleToVoid.items) {
                productUpdates.set(item.id, item.quantity);
            }

            return prevProducts.map(product => {
                if (productUpdates.has(product.id)) {
                    const transactionQty = productUpdates.get(product.id)!;
                    let newStock = product.stock;

                    // Reverse the original stock movement
                    if (saleToVoid.status === 'return') {
                        newStock -= transactionQty; // It was a return, so we deduct stock to void
                    } else { // 'completed'
                        newStock += transactionQty; // It was a sale, so we add stock back to void
                    }
                    return { ...product, stock: Math.max(0, newStock) };
                }
                return product;
            });
        });
    };

    const addDraft = (draftData: Omit<Draft, 'id' | 'date'>) => {
        const newDraft: Draft = {
            id: `draft_${Date.now()}`,
            date: new Date().toISOString(),
            ...draftData,
        };
        setDrafts(prev => [newDraft, ...prev]);
    };

    const updateDraft = (updatedDraft: Draft) => {
        setDrafts(prev => prev.map(d => d.id === updatedDraft.id ? updatedDraft : d));
    };

    const deleteDraft = (draftId: string) => {
        setDrafts(prev => prev.filter(d => d.id !== draftId));
    };
    // #endregion

    // #region Shipping Management
    const addShipment = (shipmentData: Omit<Shipment, 'id'>) => {
        const newShipment: Shipment = { id: `ship_${Date.now()}`, ...shipmentData };
        setShipments(prev => [newShipment, ...prev]);
    };
    const updateShipment = (updatedShipment: Shipment) => {
        setShipments(prev => prev.map(s => s.id === updatedShipment.id ? updatedShipment : s));
    };
    const deleteShipment = (shipmentId: string) => {
        setShipments(prev => prev.filter(s => s.id !== shipmentId));
    };
    // #endregion

    // #region Expense Management
    const addExpense = (expenseData: Omit<Expense, 'id' | 'date'>) => {
        const newExpense: Expense = {
            id: `exp_${Date.now()}`,
            date: new Date().toISOString(),
            ...expenseData
        };
        setExpenses(prev => [newExpense, ...prev]);
    };
    const updateExpense = (updatedExpense: Expense) => {
        setExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e));
    };
    const deleteExpense = (expenseId: string) => {
        setExpenses(prev => prev.filter(e => e.id !== expenseId));
    };
    const addExpenseCategory = (categoryData: Omit<ExpenseCategory, 'id'>) => {
        const newCategory: ExpenseCategory = { id: `ecat_${Date.now()}`, ...categoryData };
        setExpenseCategories(prev => [...prev, newCategory]);
    };
    const updateExpenseCategory = (updatedCategory: ExpenseCategory) => {
        setExpenseCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
    };
    const deleteExpenseCategory = (categoryId: string) => {
        if (expenses.some(e => e.categoryId === categoryId)) {
            throw new Error("Cannot delete category. It is currently in use by one or more expenses.");
        }
        setExpenseCategories(prev => prev.filter(c => c.id !== categoryId));
    };
    // #endregion

    // #region Payment Method Management
    const addPaymentMethod = (data: Omit<PaymentMethod, 'id'>) => {
        const newMethod: PaymentMethod = { id: `pay_${Date.now()}`, ...data };
        setPaymentMethods(prev => [...prev, newMethod]);
    };
    const updatePaymentMethod = (updatedMethod: PaymentMethod) => {
        setPaymentMethods(prev => prev.map(p => p.id === updatedMethod.id ? updatedMethod : p));
    };
    const deletePaymentMethod = (methodId: string) => {
        if (sales.some(s => s.payments.some(p => p.methodId === methodId))) {
            throw new Error('Cannot delete payment method. It is in use by one or more sales records.');
        }
        setPaymentMethods(prev => prev.filter(p => p.id !== methodId));
    };
    // #endregion
    
    // #region Settings Management
    const updateAgeVerificationSettings = (settings: AgeVerificationSettings, restrictedIds: string[]) => {
        setAgeVerificationSettings(settings);
        const restrictedIdSet = new Set(restrictedIds);
        setProducts(prevProducts => prevProducts.map(p => ({
            ...p,
            isAgeRestricted: restrictedIdSet.has(p.id)
        })));
    };
    // #endregion

    // #region Customer Request Management
    const addCustomerRequests = (requestsText: string, cashier: User) => {
        if (!requestsText.trim()) return;

        const newRequest: CustomerRequest = {
            id: `CR_${Date.now()}`,
            text: requestsText.trim(),
            cashierId: cashier.id,
            cashierName: cashier.name,
            date: new Date().toISOString(),
        };
        setCustomerRequests(prev => [newRequest, ...prev]);
    };
    // #endregion

    const value = {
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
        updateProduct,
        updateMultipleProducts,
        brands, addBrand, updateBrand, deleteBrand,
        categories, addCategory, updateCategory, deleteCategory,
        units, addUnit, updateUnit, deleteUnit,
        stockAdjustments,
        addStockAdjustment,
        businessLocations,
        addBusinessLocation,
        updateBusinessLocation,
        deleteBusinessLocation,
        stockTransfers,
        addStockTransfer,
        variations,
        variationValues,
        addVariation,
        updateVariation,
        deleteVariation,
        addVariationValue,
        updateVariationValue,
        deleteVariationValue,
        customers,
        customerGroups,
        suppliers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addCustomerGroup,
        updateCustomerGroup,
        deleteCustomerGroup,
        purchases,
        addPurchase,
        purchaseReturns,
        addPurchaseReturn,
        sales,
        drafts,
        quotations,
        addSale,
        voidSale,
        addDraft,
        updateDraft,
        deleteDraft,
        shipments,
        addShipment,
        updateShipment,
        deleteShipment,
        expenses,
        expenseCategories,
        addExpense,
        updateExpense,
        deleteExpense,
        addExpenseCategory,
        updateExpenseCategory,
        deleteExpenseCategory,
        paymentMethods,
        addPaymentMethod,
        updatePaymentMethod,
        deletePaymentMethod,
        ageVerificationSettings,
        updateAgeVerificationSettings,
        customerRequests,
        addCustomerRequests,
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