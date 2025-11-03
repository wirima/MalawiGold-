// FIX: Add React import and global JSX namespace declaration to fix project-wide JSX type issues.
// The global declaration below was causing type conflicts and has been removed.

export interface Brand {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Unit {
  id: string;
  name: string;
  shortName: string;
}

export interface Variation {
  id: string;
  name: string;
}

export interface VariationValue {
  id: string;
  variationId: string;
  name: string;
}

export type BarcodeType = 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPC' | 'UPCE';

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  brandId: string;
  unitId: string;
  businessLocationId: string;
  costPrice: number;
  price: number;
  stock: number;
  reorderPoint: number;
  imageUrl: string;
  isNotForSale: boolean;
  description?: string;
  productType: 'single' | 'variable' | 'combo';
  barcodeType: BarcodeType;
  taxAmount?: number;
  taxType?: 'percentage' | 'fixed';
  isAgeRestricted?: boolean;
}

export interface ProductDocument {
  id: string;
  name: string;
  description: string;
  productIds: string[];
  fileUrl: string;
  fileName: string;
  fileType: 'coa' | 'warranty';
  uploadedDate: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  customerGroupId: string;
}

export interface Supplier {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
}

export interface CustomerGroup {
    id: string;
    name: string;
    discountPercentage: number;
}

export interface CartItem extends Product {
  quantity: number;
  originalPrice?: number;
}

export interface PaymentMethod {
    id: string;
    name: string;
}

export interface Sale {
  id: string;
  date: string;
  customer: Pick<Customer, 'id' | 'name'>;
  items: CartItem[];
  total: number;
  payments: { methodId: string; amount: number }[];
  passportNumber?: string;
  nationality?: string;
  status?: 'completed' | 'voided' | 'return';
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  isQueued?: boolean;
  customerEmailForDocs?: string;
}

export interface CustomerReturn {
  id: string;
  date: string;
  originalSaleId: string;
  customer: Pick<Customer, 'id' | 'name'>;
  items: CartItem[];
  reason: string;
  total: number;
}

export interface Shipment {
  id: string;
  saleId: string;
  customerName: string;
  shippingAddress: string;
  trackingNumber: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
}

export interface Purchase {
  id: string;
  date: string;
  supplier: Pick<Supplier, 'id' | 'name'>;
  items: CartItem[];
  total: number;
}

export interface PurchaseReturn {
  id: string;
  date: string;
  supplier: Pick<Supplier, 'id' | 'name'>;
  items: CartItem[];
  total: number;
}

export interface Draft {
  id: string;
  date: string;
  customer: Pick<Customer, 'id' | 'name'>;
  items: CartItem[];
  total: number;
}

export interface Quotation {
  id: string;
  date: string;
  customer: Pick<Customer, 'id' | 'name'>;
  items: CartItem[];
  total: number;
  expiryDate: string;
}

export type StockAdjustmentType = 'addition' | 'subtraction';

export interface StockAdjustment {
    id: string;
    date: string;
    productId: string;
    type: StockAdjustmentType;
    quantity: number;
    reason: string;
}

export interface BusinessLocation {
    id: string;
    name: string;
}

export interface StockTransfer {
    id: string;
    date: string;
    fromLocationId: string;
    toLocationId: string;
    items: CartItem[];
    status: 'in_transit' | 'completed';
}

export interface ExpenseCategory {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  date: string;
  categoryId: string;
  amount: number;
  description: string;
}

export interface CustomerRequest {
  id: string;
  text: string;
  cashierId: string;
  cashierName: string;
  date: string;
}

export type Permission = 
  | 'dashboard:view'
  // Products
  | 'products:view'
  | 'products:manage'
  | 'products:add'
  | 'products:delete'
  | 'products:update_price'
  | 'products:print_labels'
  | 'products:variations'
  | 'products:import'
  | 'products:import_stock'
  | 'products:import_units'
  | 'products:price_groups'
  | 'products:units'
  | 'products:categories'
  | 'products:brands'
  | 'products:documents'
  // Contacts
  | 'contacts:view'
  | 'contacts:manage'
  | 'contacts:import'
  // Purchases
  | 'purchases:view'
  | 'purchases:manage'
  // Sell
  | 'sell:view'
  | 'sell:pos'
  | 'sell:sales'
  | 'sell:manage'
  | 'shipping:view'
  | 'shipping:manage'
  | 'discounts:view'
  | 'returns:view'
  | 'returns:manage'
  // POS Specific
  | 'pos:apply_discount'
  | 'pos:change_price'
  | 'pos:process_return'
  | 'pos:void_sale'
  // Stock
  | 'stock_transfer:view'
  | 'stock_transfer:manage'
  | 'stock_adjustment:view'
  | 'stock_adjustment:manage'
  // Expenses
  | 'expense:view'
  | 'expense:manage'
  // Reports
  | 'reports:view'
  | 'reports:customer_demand'
  | 'reports:return_analysis'
  // Users
  | 'users:view'
  | 'users:manage'
  // Notifications
  | 'notifications:manage'
  // Settings
  | 'settings:view'
  | 'settings:tax'
  | 'settings:product'
  | 'settings:contact'
  | 'settings:sale'
  | 'settings:pos'
  | 'settings:purchases'
  | 'settings:payment'
  | 'settings:dashboard'
  | 'settings:system'
  | 'settings:prefixes'
  | 'settings:email'
  | 'settings:sms'
  | 'settings:reward_points'
  | 'settings:modules'
  | 'settings:custom_labels'
  | 'settings:locations'
  | 'settings:age_verification';

export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
}

export interface User {
    id: string;
    name: string;
    email: string;
    roleId: Role['id'];
}

export interface BrandingSettings {
    businessName: string;
    logoUrl: string;
    address: string;
    phone: string;
    website?: string;
}