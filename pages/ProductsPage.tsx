
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Product, Brand, Category, Unit, BusinessLocation } from '../types';
import ConfirmationModal from '../components/ConfirmationModal';
import { useCurrency } from '../contexts/CurrencyContext';

type SortableKeys = 'name' | 'sku' | 'categoryName' | 'brandName' | 'locationName' | 'price' | 'stock';
type SortDirection = 'ascending' | 'descending';
type SortConfig = {
    key: SortableKeys;
    direction: SortDirection;
} | null;

const baseInputClasses = "mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500";
const errorInputClasses = "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500";

const Tooltip: React.FC<{ text: string }> = ({ text }) => (
    <span className="group relative ml-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 cursor-help" fill="none" viewBox="0 0 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="absolute bottom-full mb-2 w-72 scale-0 rounded bg-slate-800 p-2 text-xs text-white transition-all group-hover:scale-100 left-1/2 -translate-x-1/2 z-10">
            {text}
        </span>
    </span>
);

const ProductFormModal: React.FC<{
    product: Product | null;
    products: Product[];
    brands: Brand[];
    categories: Category[];
    units: Unit[];
    businessLocations: BusinessLocation[];
    onClose: () => void;
    onSave: (productData: Product) => void;
}> = ({ product, products, brands, categories, units, businessLocations, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        sku: product?.sku || '',
        categoryId: product?.categoryId || categories[0]?.id || '',
        brandId: product?.brandId || brands[0]?.id || '',
        unitId: product?.unitId || units[0]?.id || '',
        businessLocationId: product?.businessLocationId || businessLocations[0]?.id || '',
        costPrice: product?.costPrice || 0,
        price: product?.price || 0,
        stock: product?.stock || 0,
        reorderPoint: product?.reorderPoint || 0,
        isNotForSale: product?.isNotForSale || false,
        taxAmount: product?.taxAmount || 0,
        taxType: product?.taxType || 'percentage',
    });
    const [errors, setErrors] = useState({ name: '', sku: '', costPrice: '', price: '' });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                sku: product.sku,
                categoryId: product.categoryId,
                brandId: product.brandId,
                unitId: product.unitId,
                businessLocationId: product.businessLocationId,
                costPrice: product.costPrice,
                price: product.price,
                stock: product.stock,
                reorderPoint: product.reorderPoint,
                isNotForSale: product.isNotForSale,
                taxAmount: product.taxAmount || 0,
                taxType: product.taxType || 'percentage',
            });
        }
    }, [product]);

    const validate = () => {
        const newErrors = { name: '', sku: '', costPrice: '', price: '' };
        let isValid = true;
        if (!formData.name.trim()) {
            newErrors.name = 'Product name is required.';
            isValid = false;
        }
        
        const trimmedSku = formData.sku.trim();
        if (!trimmedSku) {
            newErrors.sku = 'SKU is required.';
            isValid = false;
        } else if (products.some(p => p.sku.toLowerCase() === trimmedSku.toLowerCase() && p.id !== product?.id)) {
            newErrors.sku = 'This SKU is already in use by another product.';
            isValid = false;
        }

        if (formData.costPrice <= 0) {
            newErrors.costPrice = 'Cost price must be a positive number.';
            isValid = false;
        }
        if (formData.price <= 0) {
            newErrors.price = 'Price must be a positive number.';
            isValid = false;
        }
        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate() && product) {
            onSave({ ...product, ...formData });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            const numValue = (name === 'price' || name === 'stock' || name === 'reorderPoint' || name === 'costPrice' || name === 'taxAmount') ? parseFloat(value) : value;
            setFormData(prev => ({ ...prev, [name]: numValue }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="p-6 border-b dark:border-slate-700">
                        <h2 className="text-xl font-bold">Edit Product</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium">Product Name*</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={`${baseInputClasses} ${errors.name ? errorInputClasses : ''}`} />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="sku" className="block text-sm font-medium">SKU*</label>
                            <input type="text" id="sku" name="sku" value={formData.sku} onChange={handleChange} className={`${baseInputClasses} ${errors.sku ? errorInputClasses : ''}`} />
                            {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
                        </div>
                        <div>
                            <label htmlFor="costPrice" className="block text-sm font-medium">Cost Price*</label>
                            <input type="number" id="costPrice" name="costPrice" value={formData.costPrice} onChange={handleChange} step="0.01" min="0" className={`${baseInputClasses} ${errors.costPrice ? errorInputClasses : ''}`} />
                            {errors.costPrice && <p className="mt-1 text-sm text-red-600">{errors.costPrice}</p>}
                        </div>
                         <div>
                            <label htmlFor="price" className="block text-sm font-medium">Selling Price*</label>
                            <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} step="0.01" min="0" className={`${baseInputClasses} ${errors.price ? errorInputClasses : ''}`} />
                            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                        </div>
                         <div>
                            <label htmlFor="stock" className="block text-sm font-medium">Stock</label>
                            <input type="number" id="stock" name="stock" value={formData.stock} onChange={handleChange} min="0" className={baseInputClasses} />
                        </div>
                         <div>
                            <label htmlFor="reorderPoint" className="block text-sm font-medium">Reorder Point</label>
                            <input type="number" id="reorderPoint" name="reorderPoint" value={formData.reorderPoint} onChange={handleChange} min="0" className={baseInputClasses} />
                        </div>
                         <div>
                            <label htmlFor="categoryId" className="block text-sm font-medium">Category</label>
                            <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange} className={baseInputClasses}>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="brandId" className="block text-sm font-medium">Brand</label>
                            <select id="brandId" name="brandId" value={formData.brandId} onChange={handleChange} className={baseInputClasses}>
                                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="unitId" className="block text-sm font-medium">Unit</label>
                            <select id="unitId" name="unitId" value={formData.unitId} onChange={handleChange} className={baseInputClasses}>
                                {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="businessLocationId" className="block text-sm font-medium">Business Location</label>
                            <select id="businessLocationId" name="businessLocationId" value={formData.businessLocationId} onChange={handleChange} className={baseInputClasses}>
                                {businessLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="taxAmount" className="block text-sm font-medium">Tax <Tooltip text="Set the tax rate for this product. This can be a percentage or a fixed cash amount." /></label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <input type="number" name="taxAmount" id="taxAmount" value={formData.taxAmount || ''} onChange={handleChange} step="0.01" min="0" className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="0.00" />
                                <select name="taxType" value={formData.taxType || 'percentage'} onChange={handleChange} className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount</option>
                                </select>
                            </div>
                        </div>
                         <div className="md:col-span-2">
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="isNotForSale"
                                        name="isNotForSale"
                                        type="checkbox"
                                        checked={formData.isNotForSale}
                                        onChange={handleChange}
                                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="isNotForSale" className="font-medium text-gray-700 dark:text-gray-300">This product is not for sale</label>
                                    <p className="text-gray-500 dark:text-gray-400">If checked, it won't appear in the POS screen.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const ProductsPage: React.FC = () => {
    const { products, brands, categories, units, businessLocations, hasPermission, updateProduct, deleteProduct } = useAuth();
    const { formatCurrency } = useCurrency();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState('all');
    const [locationFilter, setLocationFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    const isFiltered = useMemo(() => searchTerm !== '' || categoryFilter !== 'all' || stockFilter !== 'all' || locationFilter !== 'all', [searchTerm, categoryFilter, stockFilter, locationFilter]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setCategoryFilter('all');
        setStockFilter('all');
        setLocationFilter('all');
    };

    const canManageProducts = hasPermission('products:manage');
    const canAddProducts = hasPermission('products:add');
    const canDeleteProducts = hasPermission('products:delete');
    
    const categoriesMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);
    const brandsMap = useMemo(() => new Map(brands.map(b => [b.id, b.name])), [brands]);
    const locationsMap = useMemo(() => new Map(businessLocations.map(l => [l.id, l.name])), [businessLocations]);

    // Sorting State and Logic
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'ascending' });

    const filteredProducts = useMemo(() => {
        let sortableProducts = products
            .filter(product => {
                const lowercasedTerm = searchTerm.toLowerCase();
                if (!lowercasedTerm) return true;

                const categoryName = categoriesMap.get(product.categoryId)?.toLowerCase() || '';
                const brandName = brandsMap.get(product.brandId)?.toLowerCase() || '';

                return (
                    product.name.toLowerCase().includes(lowercasedTerm) ||
                    product.sku.toLowerCase().includes(lowercasedTerm) ||
                    categoryName.includes(lowercasedTerm) ||
                    brandName.includes(lowercasedTerm)
                );
            })
            .filter(product =>
                categoryFilter === 'all' || product.categoryId === categoryFilter
            )
            .filter(product =>
                locationFilter === 'all' || product.businessLocationId === locationFilter
            )
            .filter(product => {
                if (stockFilter === 'all') return true;
                if (stockFilter === 'in_stock') return product.stock > product.reorderPoint;
                if (stockFilter === 'low_stock') return product.stock > 0 && product.stock <= product.reorderPoint;
                if (stockFilter === 'out_of_stock') return product.stock === 0;
                return true;
            });

        if (sortConfig !== null) {
            sortableProducts.sort((a, b) => {
                let aValue: any;
                let bValue: any;

                switch (sortConfig.key) {
                    case 'categoryName':
                        aValue = categoriesMap.get(a.categoryId) || '';
                        bValue = categoriesMap.get(b.categoryId) || '';
                        break;
                    case 'brandName':
                        aValue = brandsMap.get(a.brandId) || '';
                        bValue = brandsMap.get(b.brandId) || '';
                        break;
                    case 'locationName':
                        aValue = locationsMap.get(a.businessLocationId) || '';
                        bValue = locationsMap.get(b.businessLocationId) || '';
                        break;
                    default:
                        aValue = a[sortConfig.key as keyof Product];
                        bValue = b[sortConfig.key as keyof Product];
                }

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return aValue.localeCompare(bValue) * (sortConfig.direction === 'ascending' ? 1 : -1);
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        
        return sortableProducts;
    }, [products, searchTerm, categoryFilter, stockFilter, locationFilter, categoriesMap, brandsMap, locationsMap, sortConfig]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, categoryFilter, stockFilter, locationFilter, itemsPerPage]);

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredProducts.slice(startIndex, endIndex);
    }, [filteredProducts, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    
    const selectClasses = "w-full pl-4 pr-10 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500";

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleSaveProduct = (data: Product) => {
        updateProduct(data);
        setIsModalOpen(false);
    };

    const handleDeleteProduct = (product: Product) => {
        setApiError(null);
        setConfirmDelete(product);
    };

    const confirmDeletion = () => {
        if (confirmDelete) {
            try {
                deleteProduct(confirmDelete.id);
            } catch (error: any) {
                setApiError(error.message);
            } finally {
                setConfirmDelete(null);
            }
        }
    };

    const getStockStatus = (product: Product) => {
        if (product.stock === 0) return { text: 'Out of Stock', count: product.stock, className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' };
        if (product.stock <= product.reorderPoint) return { text: 'Low Stock', count: product.stock, className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' };
        return { text: 'In Stock', count: product.stock, className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
    };
    
    const requestSort = (key: SortableKeys) => {
        let direction: SortDirection = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: SortableKeys) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <span className="text-slate-400">▲▼</span>;
        }
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    };

    const SortableHeader: React.FC<{ sortKey: SortableKeys; children: React.ReactNode }> = ({ sortKey, children }) => (
         <th scope="col" className="px-6 py-3">
            <button onClick={() => requestSort(sortKey)} className="flex items-center gap-2 font-semibold">
                {children}
                <span className="text-indigo-400">{getSortIndicator(sortKey)}</span>
            </button>
        </th>
    );

    return (
        <>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md flex flex-col">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    {apiError && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{apiError}</span>
                            <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setApiError(null)}>
                                <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                            </span>
                        </div>
                    )}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">Products</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your products inventory.</p>
                        </div>
                         <Link 
                            to="/app/products/add"
                            className={`bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold whitespace-nowrap order-first md:order-last ${!canAddProducts ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={(e) => !canAddProducts && e.preventDefault()}
                            aria-disabled={!canAddProducts}
                            title={!canAddProducts ? "You don't have permission to add products" : ""}
                        >
                            Add Product
                        </Link>
                    </div>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <input 
                            type="text" 
                            placeholder="Search by name, SKU, brand, category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-4 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:col-span-2 lg:col-span-1"
                        />
                         <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className={selectClasses}
                            aria-label="Filter by category"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                        <select
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className={selectClasses}
                            aria-label="Filter by location"
                        >
                            <option value="all">All Locations</option>
                            {businessLocations.map(location => (
                                <option key={location.id} value={location.id}>{location.name}</option>
                            ))}
                        </select>
                        <select
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value)}
                            className={selectClasses}
                            aria-label="Filter by stock status"
                        >
                            <option value="all">All Stock Statuses</option>
                            <option value="in_stock">In Stock</option>
                            <option value="low_stock">Low Stock</option>
                            <option value="out_of_stock">Out of Stock</option>
                        </select>
                        <button
                            onClick={handleClearFilters}
                            disabled={!isFiltered}
                            className="w-full px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                            <tr>
                                <th scope="col" className="px-6 py-3 font-semibold">Image</th>
                                <SortableHeader sortKey="name">Product Name</SortableHeader>
                                <SortableHeader sortKey="sku">SKU</SortableHeader>
                                <SortableHeader sortKey="categoryName">Category</SortableHeader>
                                <SortableHeader sortKey="brandName">Brand</SortableHeader>
                                <SortableHeader sortKey="locationName">Location</SortableHeader>
                                <SortableHeader sortKey="price">Price</SortableHeader>
                                <SortableHeader sortKey="stock">Stock Status</SortableHeader>
                                <th scope="col" className="px-6 py-3 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedProducts.length > 0 ? paginatedProducts.map(product => {
                                const stockStatus = getStockStatus(product);
                                return (
                                <tr key={product.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                    <td className="px-6 py-4">
                                        <Link to={`/app/products/${product.id}`}>
                                            <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-md object-cover transition-transform hover:scale-110"/>
                                        </Link>
                                    </td>
                                    <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                        <Link to={`/app/products/${product.id}`} className="hover:underline">
                                            {product.name}
                                        </Link>
                                        {product.isNotForSale && (
                                            <span className="ml-2 bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs font-medium">
                                                Not for Sale
                                            </span>
                                        )}
                                    </th>
                                    <td className="px-6 py-4">{product.sku}</td>
                                    <td className="px-6 py-4">{categoriesMap.get(product.categoryId)}</td>
                                    <td className="px-6 py-4">{brandsMap.get(product.brandId)}</td>
                                    <td className="px-6 py-4">{locationsMap.get(product.businessLocationId)}</td>
                                    <td className="px-6 py-4">{formatCurrency(product.price)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.className}`}>
                                                {stockStatus.text}
                                            </span>
                                            <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">({stockStatus.count})</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap space-x-4">
                                        <button 
                                            onClick={() => handleEditProduct(product)}
                                            disabled={!canManageProducts}
                                            className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProduct(product)}
                                            disabled={!canDeleteProducts}
                                            className="font-medium text-red-600 dark:text-red-500 hover:underline disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed"
                                        >
                                            Delete
                                        </button>
                                        <Link
                                            to={`/app/products/add?duplicate_from=${product.id}`}
                                            className={`font-medium text-blue-600 dark:text-blue-500 hover:underline ${!canAddProducts ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                                            aria-disabled={!canAddProducts}
                                            title={!canAddProducts ? "You don't have permission to add products" : "Duplicate this product"}
                                        >
                                            Duplicate
                                        </Link>
                                    </td>
                                </tr>
                            )}) : (
                                <tr>
                                    <td colSpan={9} className="text-center py-10 text-slate-500 dark:text-slate-400">
                                        No products found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label htmlFor="itemsPerPage" className="text-sm font-medium">Products per page:</label>
                        <select
                            id="itemsPerPage"
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            className="rounded-lg bg-slate-100 dark:bg-slate-700 border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={200}>200</option>
                            <option value={500}>500</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            Page {currentPage} of {totalPages > 0 ? totalPages : 1} ({filteredProducts.length} products)
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {isModalOpen && (
                <ProductFormModal 
                    product={editingProduct}
                    products={products}
                    brands={brands}
                    categories={categories}
                    units={units}
                    businessLocations={businessLocations}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveProduct}
                />
            )}
            {confirmDelete && (
                <ConfirmationModal
                    isOpen={!!confirmDelete}
                    title="Delete Product"
                    message={`Are you sure you want to delete "${confirmDelete.name}"? This action cannot be undone.`}
                    onClose={() => setConfirmDelete(null)}
                    onConfirm={confirmDeletion}
                />
            )}
        </>
    );
};

export default ProductsPage;
