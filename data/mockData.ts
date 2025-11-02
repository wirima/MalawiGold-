import { Product, Customer, Sale, Supplier, CustomerGroup, Role, User, Brand, Category, Unit, StockAdjustment, Variation, VariationValue, Draft, Quotation, Purchase, PurchaseReturn, ExpenseCategory, Expense, BusinessLocation, StockTransfer, Shipment, PaymentMethod, CustomerRequest, ProductDocument } from '../types';

export const MOCK_BUSINESS_LOCATIONS: BusinessLocation[] = [
    { id: 'LOC01', name: 'Main Warehouse' },
    { id: 'LOC02', name: 'Downtown Branch' },
    { id: 'LOC03', name: 'Westside Kiosk' },
];

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
    { id: 'pay_cash', name: 'Cash' },
    { id: 'pay_card', name: 'Card' },
    { id: 'pay_qr', name: 'QR Code' },
    { id: 'pay_nfc', name: 'NFC / Tap to Pay' },
    { id: 'pay_airtel', name: 'Airtel Money' },
    { id: 'pay_changu', name: 'PayChangu' },
    { id: 'pay_tnm', name: 'TNM Mpamba' },
    { id: 'pay_stripe', name: 'Stripe' },
    { id: 'pay_mo626', name: 'Mo626' },
];

export const MOCK_CUSTOMER_GROUPS: CustomerGroup[] = [
    { id: 'CG001', name: 'Standard', discountPercentage: 0 },
    { id: 'CG002', name: 'Wholesale', discountPercentage: 15 },
    { id: 'CG003', name: 'VIP', discountPercentage: 25 },
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'CUST001', name: 'John Doe', email: 'john.doe@example.com', phone: '555-1234', address: '123 Main St, Anytown', customerGroupId: 'CG003' },
  { id: 'CUST002', name: 'Jane Smith', email: 'jane.smith@example.com', phone: '555-5678', address: '456 Oak Ave, Anytown', customerGroupId: 'CG001' },
  { id: 'CUST003', name: 'Walk-in Customer', email: '', phone: '', address: '', customerGroupId: 'CG001' },
  { id: 'CUST004', name: 'Bob Johnson', email: 'bob.j@example.com', phone: '555-8765', address: '789 Pine Ln, Anytown', customerGroupId: 'CG002' },
];

export const MOCK_SUPPLIERS: Supplier[] = [
    { id: 'SUP001', name: 'Global Coffee Beans', companyName: 'Global Coffee Inc.', email: 'sales@globalcoffee.com', phone: '800-555-BEAN', address: '1 Coffee Plaza, Beanville' },
    { id: 'SUP002', name: 'Premium Pastries Co.', companyName: 'Premium Pastries Co.', email: 'orders@premiumpastries.com', phone: '800-555-CAKE', address: '25 Pastry Path, Sweetville' },
    { id: 'SUP003', name: 'Beverage World', companyName: 'Beverage World LLC', email: 'contact@bevworld.com', phone: '800-555-DRNK', address: '500 Drink Dr, Thirston' },
];

export const MOCK_BRANDS: Brand[] = [
    { id: 'B01', name: 'Morning Dew' },
    { id: 'B02', name: 'Sweet Treats' },
    { id: 'B03', name: 'AquaPure' },
    { id: 'B04', name: 'Fresh Fare' },
    { id: 'B05', name: 'VapeNation' },
    { id: 'B06', name: 'Hops & Barley' },
];

export const MOCK_CATEGORIES: Category[] = [
    { id: 'C01', name: 'Coffee' },
    { id: 'C02', name: 'Pastry' },
    { id: 'C03', name: 'Beverage' },
    { id: 'C04', name: 'Food' },
    { id: 'C05', name: 'Alcohol' },
    { id: 'C06', name: 'Tobacco' },
    { id: 'C07', name: 'CBD' },
];

export const MOCK_UNITS: Unit[] = [
    { id: 'U01', name: 'Piece', shortName: 'pc(s)' },
    { id: 'U02', name: 'Kilogram', shortName: 'kg' },
    { id: 'U03', name: 'Gram', shortName: 'g' },
    { id: 'U04', name: 'Liter', shortName: 'l' },
    { id: 'U05', name: 'Milliliter', shortName: 'ml' },
    { id: 'U06', name: 'Meter', shortName: 'm' },
    { id: 'U07', name: 'Centimeter', shortName: 'cm' },
    { id: 'U08', name: 'Millimeter', shortName: 'mm' },
    { id: 'U09', name: 'Inch', shortName: 'in' },
    { id: 'U10', name: 'Foot', shortName: 'ft' },
    { id: 'U11', name: 'Ounce', shortName: 'oz' },
    { id: 'U12', name: 'Pound', shortName: 'lb' },
    { id: 'U13', name: 'Dozen', shortName: 'dz' },
    { id: 'U14', name: 'Pack', shortName: 'pk' },
    { id: 'U15', name: 'Box', shortName: 'bx' },
    { id: 'U16', name: 'Carton', shortName: 'ctn' },
    { id: 'U17', name: 'Bottle', shortName: 'btl' },
    { id: 'U18', name: 'Can', shortName: 'can' },
    { id: 'U19', name: 'Jar', shortName: 'jar' },
    { id: 'U20', name: 'Roll', shortName: 'roll' },
    { id: 'U21', name: 'Bag', shortName: 'bag' },
    { id: 'U22', name: 'Pair', shortName: 'pr' },
    { id: 'U23', name: 'Set', shortName: 'set' },
    { id: 'U24', name: 'Sheet', shortName: 'sht' },
    { id: 'U25', name: 'Bundle', shortName: 'bndl' },
    { id: 'U26', name: 'Tray', shortName: 'tray' },
    { id: 'U27', name: 'Tube', shortName: 'tube' },
    { id: 'U28', name: 'Strip', shortName: 'strip' },
    { id: 'U29', name: 'Tablet', shortName: 'tab' },
    { id: 'U30', name: 'Serving', shortName: 'serv' },
    { id: 'U31', name: 'Unit', shortName: 'unit' },
];

export const MOCK_VARIATIONS: Variation[] = [
    { id: 'V01', name: 'Size' },
    { id: 'V02', name: 'Color' },
    { id: 'V03', name: 'Material' },
];

export const MOCK_VARIATION_VALUES: VariationValue[] = [
    { id: 'VV01', variationId: 'V01', name: 'Small' },
    { id: 'VV02', variationId: 'V01', name: 'Medium' },
    { id: 'VV03', variationId: 'V01', name: 'Large' },
    { id: 'VV04', variationId: 'V02', name: 'Red' },
    { id: 'VV05', variationId: 'V02', name: 'Green' },
    { id: 'VV06', variationId: 'V02', name: 'Blue' },
    { id: 'VV07', variationId: 'V03', name: 'Cotton' },
    { id: 'VV08', variationId: 'V03', name: 'Polyester' },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 'PROD001', name: 'Espresso', sku: 'SKU001', categoryId: 'C01', brandId: 'B01', unitId: 'U01', businessLocationId: 'LOC02', costPrice: 1.20, price: 2.50, stock: 115, reorderPoint: 20, imageUrl: 'https://picsum.photos/seed/espresso/400', isNotForSale: false, productType: 'single', barcodeType: 'CODE128', description: 'A rich and aromatic shot of pure coffee.', taxAmount: 5, taxType: 'percentage', isAgeRestricted: false },
  { id: 'PROD002', name: 'Latte', sku: 'SKU002', categoryId: 'C01', brandId: 'B01', unitId: 'U01', businessLocationId: 'LOC02', costPrice: 1.50, price: 3.50, stock: 80, reorderPoint: 20, imageUrl: 'https://picsum.photos/seed/latte/400', isNotForSale: false, productType: 'single', barcodeType: 'CODE128', description: 'Smooth espresso with steamed milk.', taxAmount: 5, taxType: 'percentage', isAgeRestricted: false },
  { id: 'PROD003', name: 'Cappuccino', sku: 'SKU003', categoryId: 'C01', brandId: 'B01', unitId: 'U01', businessLocationId: 'LOC02', costPrice: 1.50, price: 3.50, stock: 75, reorderPoint: 20, imageUrl: 'https://picsum.photos/seed/cappuccino/400', isNotForSale: false, productType: 'single', barcodeType: 'CODE128', description: 'Espresso, steamed milk, and a deep layer of foam.', taxAmount: 0, taxType: 'percentage', isAgeRestricted: false },
  { id: 'PROD004', name: 'Croissant', sku: 'SKU004', categoryId: 'C02', brandId: 'B02', unitId: 'U01', businessLocationId: 'LOC02', costPrice: 1.10, price: 2.75, stock: 50, reorderPoint: 15, imageUrl: 'https://picsum.photos/seed/croissant/400', isNotForSale: false, productType: 'single', barcodeType: 'CODE128', description: 'Buttery, flaky, and delicious.', taxAmount: 0, taxType: 'percentage', isAgeRestricted: false },
  { id: 'PROD005', name: 'Muffin', sku: 'SKU005', categoryId: 'C02', brandId: 'B02', unitId: 'U01', businessLocationId: 'LOC01', costPrice: 0.90, price: 2.25, stock: 28, reorderPoint: 10, imageUrl: 'https://picsum.photos/seed/muffin/400', isNotForSale: false, productType: 'single', barcodeType: 'CODE128', description: 'A delightful baked treat.', taxAmount: 0, taxType: 'percentage', isAgeRestricted: false },
  { id: 'PROD006', name: 'Iced Tea', sku: 'SKU006', categoryId: 'C03', brandId: 'B03', unitId: 'U01', businessLocationId: 'LOC01', costPrice: 0.75, price: 2.00, stock: 90, reorderPoint: 25, imageUrl: 'https://picsum.photos/seed/icedtea/400', isNotForSale: false, productType: 'single', barcodeType: 'CODE128', description: 'Refreshing and cool.', taxAmount: 0, taxType: 'percentage', isAgeRestricted: false },
  { id: 'PROD007', name: 'Mineral Water', sku: 'SKU007', categoryId: 'C03', brandId: 'B03', unitId: 'U01', businessLocationId: 'LOC03', costPrice: 0.50, price: 1.50, stock: 120, reorderPoint: 30, imageUrl: 'https://picsum.photos/seed/water/400', isNotForSale: false, productType: 'single', barcodeType: 'EAN13', description: 'Pure and simple hydration.', taxAmount: 0.25, taxType: 'fixed', isAgeRestricted: false },
  { id: 'PROD008', name: 'Sandwich', sku: 'SKU008', categoryId: 'C04', brandId: 'B04', unitId: 'U01', businessLocationId: 'LOC01', costPrice: 2.50, price: 5.50, stock: 30, reorderPoint: 10, imageUrl: 'https://picsum.photos/seed/sandwich/400', isNotForSale: false, productType: 'single', barcodeType: 'UPC', description: 'Freshly made sandwich.', taxAmount: 0, taxType: 'percentage', isAgeRestricted: false },
  { id: 'PROD009', name: 'Salad', sku: 'SKU009', categoryId: 'C04', brandId: 'B04', unitId: 'U01', businessLocationId: 'LOC01', costPrice: 3.00, price: 6.50, stock: 0, reorderPoint: 5, imageUrl: 'https://picsum.photos/seed/salad/400', isNotForSale: true, productType: 'single', barcodeType: 'CODE128', description: 'Healthy and crisp salad.', taxAmount: 0, taxType: 'percentage', isAgeRestricted: false },
  { id: 'PROD010', name: 'Americano', sku: 'SKU010', categoryId: 'C01', brandId: 'B01', unitId: 'U01', businessLocationId: 'LOC02', costPrice: 1.30, price: 3.00, stock: 85, reorderPoint: 20, imageUrl: 'https://picsum.photos/seed/americano/400', isNotForSale: false, productType: 'single', barcodeType: 'CODE128', description: 'Espresso shots topped with hot water.', taxAmount: 5, taxType: 'percentage', isAgeRestricted: false },
  { id: 'PROD011', name: 'Craft Beer', sku: 'SKU011', categoryId: 'C05', brandId: 'B06', unitId: 'U01', businessLocationId: 'LOC02', costPrice: 2.80, price: 6.50, stock: 48, reorderPoint: 12, imageUrl: 'https://picsum.photos/seed/beer/400', isNotForSale: false, productType: 'single', barcodeType: 'CODE128', description: 'Locally brewed IPA.', taxAmount: 10, taxType: 'percentage', isAgeRestricted: true },
  { id: 'PROD012', name: 'Cigarettes', sku: 'SKU012', categoryId: 'C06', brandId: 'B05', unitId: 'U01', businessLocationId: 'LOC03', costPrice: 5.00, price: 9.00, stock: 30, reorderPoint: 10, imageUrl: 'https://picsum.photos/seed/cigarettes/400', isNotForSale: false, productType: 'single', barcodeType: 'UPC', description: 'Pack of 20.', taxAmount: 1.50, taxType: 'fixed', isAgeRestricted: true },
  { id: 'PROD013', name: 'CBD Oil', sku: 'SKU013', categoryId: 'C07', brandId: 'B05', unitId: 'U01', businessLocationId: 'LOC01', costPrice: 15.00, price: 35.00, stock: 15, reorderPoint: 5, imageUrl: 'https://picsum.photos/seed/cbdoil/400', isNotForSale: false, productType: 'single', barcodeType: 'CODE128', description: '500mg full spectrum oil.', taxAmount: 0, taxType: 'percentage', isAgeRestricted: true },
];

export const MOCK_STOCK_ADJUSTMENTS: StockAdjustment[] = [
    { id: 'SA004', date: '2023-10-30T10:00:00Z', productId: 'PROD001', type: 'addition', quantity: 15, reason: 'Stock correction' },
    { id: 'SA003', date: '2023-10-29T11:00:00Z', productId: 'PROD005', type: 'addition', quantity: 20, reason: 'New shipment received' },
    { id: 'SA001', date: '2023-10-28T09:00:00Z', productId: 'PROD001', type: 'subtraction', quantity: 2, reason: 'Damaged goods' },
    { id: 'SA002', date: '2023-10-27T15:30:00Z', productId: 'PROD008', type: 'addition', quantity: 10, reason: 'Stock take correction' },
];

export const MOCK_STOCK_TRANSFERS: StockTransfer[] = [
    {
        id: 'ST-001',
        date: '2023-10-29T10:00:00Z',
        fromLocationId: 'LOC01',
        toLocationId: 'LOC02',
        items: [{ ...MOCK_PRODUCTS[0], quantity: 20 }],
        status: 'in_transit',
    },
    {
        id: 'ST-002',
        date: '2023-10-28T14:30:00Z',
        fromLocationId: 'LOC01',
        toLocationId: 'LOC03',
        items: [{ ...MOCK_PRODUCTS[6], quantity: 50 }],
        status: 'completed',
    },
];

export const MOCK_EXPENSE_CATEGORIES: ExpenseCategory[] = [
    { id: 'EC01', name: 'Rent' },
    { id: 'EC02', name: 'Utilities' },
    { id: 'EC03', name: 'Supplies' },
    { id: 'EC04', name: 'Marketing' },
    { id: 'EC05', name: 'Salaries' },
];

export const MOCK_EXPENSES: Expense[] = [
    { id: 'EXP01', date: '2023-10-01T00:00:00Z', categoryId: 'EC01', amount: 2000, description: 'October Rent' },
    { id: 'EXP02', date: '2023-10-15T00:00:00Z', categoryId: 'EC02', amount: 350, description: 'Electricity and Water' },
    { id: 'EXP03', date: '2023-10-20T00:00:00Z', categoryId: 'EC03', amount: 150.75, description: 'Napkins, cups, and cleaning supplies' },
];

export const MOCK_SALES: Sale[] = [
    {
        id: 'SALE001',
        date: '2023-10-27T10:00:00Z',
        customer: { id: MOCK_CUSTOMERS[0].id, name: MOCK_CUSTOMERS[0].name },
        items: [
            { ...MOCK_PRODUCTS[0], quantity: 2 },
            { ...MOCK_PRODUCTS[3], quantity: 1 },
        ],
        total: 7.75,
        payments: [{ methodId: 'pay_card', amount: 7.75 }],
        passportNumber: 'AB123456',
        nationality: 'American',
        status: 'completed'
    },
    {
        id: 'SALE002',
        date: '2023-10-27T10:15:00Z',
        customer: { id: MOCK_CUSTOMERS[1].id, name: MOCK_CUSTOMERS[1].name },
        items: [
            { ...MOCK_PRODUCTS[1], quantity: 1 },
        ],
        total: 3.50,
        payments: [{ methodId: 'pay_cash', amount: 3.50 }],
        status: 'completed'
    },
    {
        id: 'SALE003',
        date: '2023-10-27T10:30:00Z',
        customer: { id: MOCK_CUSTOMERS[2].id, name: MOCK_CUSTOMERS[2].name },
        items: [
            { ...MOCK_PRODUCTS[2], quantity: 1 },
            { ...MOCK_PRODUCTS[4], quantity: 2 },
        ],
        total: 8.00,
        payments: [{ methodId: 'pay_airtel', amount: 8.00 }],
        status: 'completed'
    },
     {
        id: 'SALE004',
        date: '2023-10-26T14:00:00Z',
        customer: { id: MOCK_CUSTOMERS[0].id, name: MOCK_CUSTOMERS[0].name },
        items: [
            { ...MOCK_PRODUCTS[8], quantity: 2 },
        ],
        total: 13.00,
        payments: [{ methodId: 'pay_cash', amount: 13.00 }],
        status: 'completed'
    },
];

export const MOCK_SHIPMENTS: Shipment[] = [
    {
        id: 'SHIP001',
        saleId: 'SALE001',
        customerName: 'John Doe',
        shippingAddress: '123 Main St, Anytown',
        trackingNumber: '1Z999AA10123456784',
        status: 'Shipped'
    },
     {
        id: 'SHIP002',
        saleId: 'SALE004',
        customerName: 'John Doe',
        shippingAddress: '123 Main St, Anytown',
        trackingNumber: '1Z999AA10123456785',
        status: 'Processing'
    }
];

export const MOCK_PURCHASES: Purchase[] = [
    {
        id: 'PO-001',
        date: '2023-10-25T09:00:00Z',
        supplier: { id: MOCK_SUPPLIERS[0].id, name: MOCK_SUPPLIERS[0].name },
        items: [
            { ...MOCK_PRODUCTS[0], quantity: 50, price: 1.25 },
            { ...MOCK_PRODUCTS[1], quantity: 50, price: 1.50 },
        ],
        total: 137.5,
    },
    {
        id: 'PO-002',
        date: '2023-10-26T11:00:00Z',
        supplier: { id: MOCK_SUPPLIERS[1].id, name: MOCK_SUPPLIERS[1].name },
        items: [
            { ...MOCK_PRODUCTS[3], quantity: 100, price: 1.00 },
        ],
        total: 100.0,
    },
];

export const MOCK_PURCHASE_RETURNS: PurchaseReturn[] = [
    {
        id: 'PR-001',
        date: '2023-10-28T14:00:00Z',
        supplier: { id: MOCK_SUPPLIERS[0].id, name: MOCK_SUPPLIERS[0].name },
        items: [
            { ...MOCK_PRODUCTS[0], quantity: 5, price: 1.25 },
        ],
        total: 6.25,
    }
];

export const MOCK_DRAFTS: Draft[] = [
    {
        id: 'DRAFT001',
        date: '2023-10-28T11:00:00Z',
        customer: { id: MOCK_CUSTOMERS[3].id, name: MOCK_CUSTOMERS[3].name },
        items: [{ ...MOCK_PRODUCTS[5], quantity: 5 }],
        total: 10.00
    }
];

export const MOCK_QUOTATIONS: Quotation[] = [
    {
        id: 'QUOT001',
        date: '2023-10-25T16:00:00Z',
        customer: { id: MOCK_CUSTOMERS[3].id, name: MOCK_CUSTOMERS[3].name },
        items: [
            { ...MOCK_PRODUCTS[0], quantity: 10 },
            { ...MOCK_PRODUCTS[1], quantity: 10 },
        ],
        total: 60.00,
        expiryDate: '2023-11-25T16:00:00Z'
    }
];

export const MOCK_CUSTOMER_REQUESTS: CustomerRequest[] = [
    { id: 'CR001', text: 'A customer asked for gluten-free muffins.', cashierId: 'USER003', cashierName: 'Casey Cashier', date: '2023-10-30T14:00:00Z' },
    { id: 'CR002', text: 'Several people wanted oat milk for their lattes today.', cashierId: 'USER003', cashierName: 'Casey Cashier', date: '2023-10-30T14:00:00Z' },
    { id: 'CR003', text: 'Someone was looking for cold brew coffee.', cashierId: 'USER004', cashierName: 'David Jones', date: '2023-10-29T18:00:00Z' },
];

const MOCK_PDF_URL = 'data:application/pdf;base64,JVBERi0xLjcgCiXi////////CiAxIDAgb2JqCiA8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PiAKZW5kb2JqCiAyIDAgb2JqCiA8PC9UeXBlL1BhZ2VzL0NvdW50IDEgL0tpZHNbMyAwIFJdPj4gCmVuZG9iagogMyAwIG9iagogPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgNTk1IDg0Ml0vQ29udGVudHMgNCAwIFIvUmVzb3VyY2VzPDw+Pj4gCmVuZG9iagogNCAwIG9iagogPDwvTGVuZ3RoIDM+PiAKc3RyZWFtCiAKRU5DCmVuZHN0cmVhbQplbmRvYmoKICB4cmVmCiAwIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEzIDAwMDAwIG4gCjAwMDAwMDAwNjAgMDAwMDAgbiAKMDAwMDAwMTEzIDAwMDAwIG4gCjAwMDAwMDAyMTggMDAwMDAgbiAKdHJhaWxlcgogIDw8L1Jvb3QgMSAwIFIvU2l6ZSA1Pj4Kc3RhcnR4cmVmCjI2NAolJUVPRgo=';

export const MOCK_PRODUCT_DOCUMENTS: ProductDocument[] = [
    {
        id: 'DOC001',
        name: 'CBD Oil - Certificate of Analysis',
        description: '3rd party lab results for batch #481516',
        productIds: ['PROD013'],
        fileUrl: MOCK_PDF_URL,
        fileName: 'COA_Batch_481516.pdf',
        fileType: 'coa',
    },
    {
        id: 'DOC002',
        name: 'Standard 1-Year Warranty',
        description: 'Limited 1-year warranty for electronic parts.',
        productIds: [], // Not assigned to any product yet
        fileUrl: MOCK_PDF_URL,
        fileName: 'Standard_Warranty.pdf',
        fileType: 'warranty',
    }
];

export const MOCK_ROLES: Role[] = [
    {
        id: 'admin',
        name: 'Administrator',
        description: 'Has full access to all system features.',
        permissions: [
            'dashboard:view',
            'products:view', 'products:manage', 'products:add', 'products:delete', 'products:update_price', 'products:print_labels', 'products:variations', 'products:import', 'products:import_stock', 'products:import_units', 'products:price_groups', 'products:units', 'products:categories', 'products:brands', 'products:documents',
            'contacts:view', 'contacts:manage', 'contacts:import',
            'purchases:view', 'purchases:manage',
            'sell:view', 'sell:pos', 'sell:sales', 'sell:manage', 'shipping:view', 'shipping:manage', 'discounts:view',
            'pos:apply_discount', 'pos:change_price', 'pos:process_return', 'pos:void_sale',
            'stock_transfer:view', 'stock_transfer:manage',
            'stock_adjustment:view', 'stock_adjustment:manage',
            'expense:view', 'expense:manage',
            'reports:view', 'reports:customer_demand',
            'users:view', 'users:manage',
            'notifications:manage',
            'settings:view',
            'settings:tax', 'settings:product', 'settings:contact', 'settings:sale', 'settings:pos', 'settings:purchases', 'settings:payment', 'settings:dashboard', 'settings:system', 'settings:prefixes', 'settings:email', 'settings:sms', 'settings:reward_points', 'settings:modules', 'settings:custom_labels', 'settings:locations', 'settings:age_verification'
        ]
    },
    {
        id: 'manager',
        name: 'Manager (Supervisor)',
        description: 'Can manage products, sales, and contacts, and view reports.',
        permissions: [
            'dashboard:view',
            'products:view',
            'products:manage',
            'products:delete',
            'products:variations',
            'products:import',
            'products:import_stock',
            'products:import_units',
            'products:update_price',
            'products:documents',
            'contacts:view',
            'contacts:manage',
            'purchases:view', 'purchases:manage',
            'sell:pos',
            'sell:sales',
            'sell:manage',
            'pos:apply_discount', 'pos:change_price', 'pos:process_return', 'pos:void_sale',
            'shipping:view', 'shipping:manage',
            'stock_adjustment:view', 'stock_adjustment:manage',
            'reports:view', 'reports:customer_demand',
            'users:view',
            'settings:view',
            'settings:tax', 'settings:product', 'settings:contact', 'settings:sale', 'settings:pos', 'settings:purchases', 'settings:payment', 'settings:dashboard', 'settings:system', 'settings:prefixes', 'settings:email', 'settings:sms', 'settings:reward_points', 'settings:modules', 'settings:custom_labels', 'settings:locations'
        ]
    },
    {
        id: 'cashier',
        name: 'Cashier',
        description: 'Limited to processing sales via POS and viewing products.',
        permissions: [
            'products:view',
            'purchases:view',
            'sell:pos',
            'shipping:view'
        ]
    }
];

export const MOCK_USERS: User[] = [
    { id: 'USER001', name: 'Alice Admin', email: 'alice.admin@example.com', roleId: 'admin' },
    { id: 'USER002', name: 'Mike Supervisor', email: 'mike.manager@example.com', roleId: 'manager' },
    { id: 'USER003', name: 'Casey Cashier', email: 'casey.cashier@example.com', roleId: 'cashier' },
    { id: 'USER004', name: 'David Jones', email: 'david.jones@example.com', roleId: 'manager' },
];