import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Product, BarcodeType, Brand, Variation, VariationValue, ProductVariationAttribute } from '../types';

const baseInputClasses = "mt-1 block w-full rounded-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500";
const errorInputClasses = "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500";

const BARCODE_TYPES: { value: BarcodeType, label: string }[] = [
    { value: 'CODE128', label: 'Code 128 (C128)' },
    { value: 'CODE39', label: 'Code 39 (C39)' },
    { value: 'EAN13', label: 'EAN-13' },
    { value: 'EAN8', label: 'EAN-8' },
    { value: 'UPC', label: 'UPC-A' },
    { value: 'UPCE', label: 'UPC-E' },
];

// FIX: Omitted 'businessLocationId' as it's replaced by 'businessLocationIds'
interface AddProductFormData extends Omit<Product, 'id' | 'imageUrl' | 'brandId' | 'stock' | 'businessLocationId'> {
    businessLocationIds: Set<string>;
    locationStocks: Map<string, number>;
}

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

// FIX: Corrected the generic type definition for the `cartesian` function. This resolves multiple downstream type inference errors.
// Changed to a standard function declaration to resolve TSX parsing ambiguity.
function cartesian<T>(...a: T[][]): T[][] {
    return a.reduce((acc: T[][], val: T[]) => acc.flatMap(d => val.map(e => [...d, e])), [[]] as T[][]);
}

interface VariantMatrixItem {
    id: string;
    name: string;
    attributes: { variationId: string; valueId: string }[];
    sku: string;
    costPrice: number;
    price: number;
    stocks: Map<string, number>;
}


const AddProductPage: React.FC = () => {
    const { products, brands, categories, units, businessLocations, addProduct, addVariableProduct, hasPermission, addBrand, variations: variationTemplates, variationValues } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const nameInputRef = useRef<HTMLInputElement>(null);

    const locationsMap = useMemo(() => new Map(businessLocations.map(l => [l.id, l.name])), [businessLocations]);

    const getInitialFormData = useCallback((): AddProductFormData => ({
        name: '',
        sku: '',
        categoryId: categories[0]?.id || '',
        unitId: units[0]?.id || '',
        businessLocationIds: new Set<string>(businessLocations.length > 0 ? [businessLocations[0].id] : []),
        locationStocks: new Map<string, number>(),
        costPrice: 0,
        price: 0,
        reorderPoint: 0,
        isNotForSale: false,
        productType: 'single' as 'single' | 'variable' | 'combo',
        barcodeType: 'CODE128' as BarcodeType,
        description: '',
        taxAmount: 0,
        taxType: 'percentage' as 'percentage' | 'fixed',
        isAgeRestricted: false,
    }), [categories, units, businessLocations]);

    const [formData, setFormData] = useState<AddProductFormData>(getInitialFormData());
    const [brandName, setBrandName] = useState('');
    const [brandSuggestions, setBrandSuggestions] = useState<Brand[]>([]);
    const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [errors, setErrors] = useState({ name: '', sku: '', costPrice: '', price: '', brand: '', variants: '', locations: '' });
    
    // State for variations
    const [selectedVariations, setSelectedVariations] = useState<Map<string, Set<string>>>(new Map()); // Map<variationId, Set<valueId>>
    const [variantsMatrix, setVariantsMatrix] = useState<VariantMatrixItem[]>([]);
    const [bulkStockLocation, setBulkStockLocation] = useState<string>('');


    const resetForm = useCallback(() => {
        setFormData(getInitialFormData());
        setBrandName('');
        setImagePreview(null);
        setErrors({ name: '', sku: '', costPrice: '', price: '', brand: '', variants: '', locations: '' });
        setSelectedVariations(new Map());
        setVariantsMatrix([]);
    }, [getInitialFormData]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const duplicateId = params.get('duplicate_from');
    
        if (duplicateId) {
            const productToDuplicate = products.find(p => p.id === duplicateId);
            if (productToDuplicate) {
                const { id, imageUrl, brandId, sku, name, businessLocationId, stock, ...rest } = productToDuplicate;
                const newLocationStocks = new Map<string, number>();
                newLocationStocks.set(businessLocationId, stock);

                setFormData({
                    ...rest,
                    name: `Copy of ${name}`,
                    sku: '',
                    businessLocationIds: new Set<string>([businessLocationId]),
                    locationStocks: newLocationStocks,
                });
                const brand = brands.find(b => b.id === brandId);
                if (brand) setBrandName(brand.name);
                setImagePreview(null);
            }
            navigate('/products/add', { replace: true });
        }
    }, [location.search, products, brands, navigate]);


    if (!hasPermission('products:add')) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-5xl font-bold">Access Denied</h1>
                <p className="mt-4">You do not have permission to add products.</p>
                <Link to="/products" className="mt-6 btn-primary">Back to Products</Link>
            </div>
        );
    }
    
    // Generate variants matrix whenever selected variations change
    useEffect(() => {
        if (selectedVariations.size === 0) {
            setVariantsMatrix([]);
            return;
        }

        const variationValueMap = new Map(variationValues.map(v => [v.id, v]));

        const arraysToCombine = Array.from(selectedVariations.entries())
            .map(([variationId, valueIds]) => Array.from(valueIds).map(valueId => ({ variationId, valueId })));

        if (arraysToCombine.length === 0 || arraysToCombine.some(arr => arr.length === 0)) {
            setVariantsMatrix([]);
            return;
        }
        
        const combinations = cartesian(...arraysToCombine);

        // FIX: The `combo` parameter was being inferred as 'unknown[]'. Explicitly typing it resolves property access errors.
        const newMatrix = combinations.map((combo: { variationId: string; valueId: string; }[], index) => {
            const attributes = combo;
            const nameParts = attributes.map(attr => variationValueMap.get(attr.valueId)?.name || '');
            const skuParts = attributes.map(attr => variationValueMap.get(attr.valueId)?.name?.substring(0, 3).toUpperCase() || 'XXX');
            
            const initialStocks = new Map<string, number>();
            formData.businessLocationIds.forEach(locId => {
                initialStocks.set(locId, 0);
            });

            return {
                id: `variant_${index}`,
                name: nameParts.join(' / '),
                attributes,
                sku: `${formData.sku || 'SKU'}-${skuParts.join('-')}`,
                costPrice: formData.costPrice || 0,
                price: formData.price || 0,
                stocks: initialStocks,
            };
        });
        
        setVariantsMatrix(newMatrix);

    }, [selectedVariations, variationValues, formData.businessLocationIds, formData.sku, formData.costPrice, formData.price]);

    // Effect to update matrix values (sku, price, etc.) when base form data changes
    useEffect(() => {
        // FIX: Explicitly typing the 'variant' parameter to VariantMatrixItem to fix type inference issues.
        setVariantsMatrix(prevMatrix => prevMatrix.map((variant: VariantMatrixItem) => {
            const skuParts = variant.attributes.map(attr => variationValues.find(v => v.id === attr.valueId)?.name?.substring(0, 3).toUpperCase() || 'XXX');
            return {
                ...variant,
                sku: `${formData.sku || 'SKU'}-${skuParts.join('-')}`,
                costPrice: formData.costPrice || 0,
                price: formData.price || 0,
            };
        }));
    }, [formData.sku, formData.costPrice, formData.price, variationValues]);


    const validate = () => {
        const newErrors = { name: '', sku: '', costPrice: '', price: '', brand: '', variants: '', locations: '' };
        let isValid = true;
        if (!formData.name.trim()) { newErrors.name = 'Product name is required.'; isValid = false; }
        
        if (formData.businessLocationIds.size === 0) {
            newErrors.locations = 'Please select at least one business location.';
            isValid = false;
        }

        const trimmedSku = formData.sku.trim().toLowerCase();
        if (trimmedSku) {
            for (const locationId of formData.businessLocationIds) {
                if (products.some(p => p.sku.toLowerCase() === trimmedSku && p.businessLocationId === locationId)) {
                    const locationName = businessLocations.find(l => l.id === locationId)?.name || locationId;
                    newErrors.sku = `SKU "${formData.sku.trim()}" already exists in location "${locationName}".`;
                    isValid = false;
                    break;
                }
            }
        }

        if (formData.productType === 'single') {
            if (formData.costPrice <= 0) { newErrors.costPrice = 'Cost price must be positive.'; isValid = false; }
            if (formData.price <= 0) { newErrors.price = 'Selling price must be positive.'; isValid = false; }
        }

        if (formData.productType === 'variable') {
            if (variantsMatrix.length === 0) {
                newErrors.variants = "Please select at least one variation and one value.";
                isValid = false;
            } else if (isValid) { // Only check variant SKUs if base validation passes
                for (const variant of variantsMatrix) {
                    if (!variant.sku) continue;
                    const trimmedVariantSku = variant.sku.trim().toLowerCase();
                    for (const locationId of formData.businessLocationIds) {
                         if (products.some(p => p.sku.toLowerCase() === trimmedVariantSku && p.businessLocationId === locationId)) {
                             const locationName = businessLocations.find(l => l.id === locationId)?.name || locationId;
                             newErrors.variants = `Generated SKU "${variant.sku}" for variant "${variant.name}" already exists in location "${locationName}". Please change the base SKU or variant values.`;
                             isValid = false;
                             break;
                         }
                    }
                    if (!isValid) break;
                }
            }
        }
        
        if (!brandName.trim()) { newErrors.brand = 'Brand is required.'; isValid = false; }
        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        let brandId: string;
        const existingBrand = brands.find(b => b.name.toLowerCase() === brandName.trim().toLowerCase());
        if (existingBrand) {
            brandId = existingBrand.id;
        } else {
            brandId = addBrand({ name: brandName.trim() }).id;
        }
            
        const locationsToProcess = Array.from(formData.businessLocationIds);

        for (const locationId of locationsToProcess) {
            const { businessLocationIds, locationStocks, ...restFormData } = formData;

            if (formData.productType === 'single') {
                 let finalSku = formData.sku.trim();
                 if (!finalSku) {
                    const numericSkus = products.map(p => parseInt(p.sku.replace(/\D/g, ''), 10)).filter(num => !isNaN(num));
                    const maxSku = numericSkus.length > 0 ? Math.max(...numericSkus) : 100000;
                    finalSku = (maxSku + 1 + products.length).toString(); // Make it more unique
                 }

                const productData = { 
                    ...restFormData,
                    sku: finalSku, 
                    brandId,
                    businessLocationId: locationId,
                    stock: locationStocks.get(locationId) || 0,
                };
                addProduct(productData);

            } else { // Variable Product
                const variationValueMap = new Map(variationValues.map(v => [v.id, v]));
                const variationMap = new Map(variationTemplates.map(v => [v.id, v]));

                const parentSku = formData.sku.trim() || `P${Date.now()}`;
                const parentData: Omit<Product, 'id' | 'imageUrl'> = { 
                    ...restFormData,
                    brandId, 
                    sku: parentSku,
                    businessLocationId: locationId 
                };
    
                // FIX: The `variant` parameter was being inferred as 'unknown', leading to a type error when trying to access its properties. Explicitly typing `variant` resolves this.
                const variantsData: Omit<Product, 'id' | 'imageUrl'>[] = variantsMatrix.map((variant: VariantMatrixItem) => {
                    // FIX: Explicitly typing the 'attr' parameter to fix type inference issues, which resolves property access errors.
                    const attributes: ProductVariationAttribute[] = variant.attributes.map((attr: { variationId: string; valueId: string; }) => ({
                        variationName: variationMap.get(attr.variationId)?.name || 'N/A',
                        valueName: variationValueMap.get(attr.valueId)?.name || 'N/A',
                    }));
    
                    return {
                        ...restFormData,
                        brandId,
                        businessLocationId: locationId,
                        name: `${formData.name} - ${variant.name}`,
                        sku: variant.sku,
                        costPrice: variant.costPrice,
                        price: variant.price,
                        stock: variant.stocks.get(locationId) || 0,
                        variationAttributes: attributes
                    };
                });
    
                addVariableProduct(parentData, variantsData);
            }
        }

        setIsSuccessModalOpen(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else if (name === 'productType') {
            setFormData(prev => ({...prev, productType: value as any}));
        }
        else {
            const numValue = ['price', 'stock', 'reorderPoint', 'costPrice', 'taxAmount'].includes(name) ? parseFloat(value) || 0 : value;
            setFormData(prev => ({ ...prev, [name]: numValue }));
        }
    };

    const handleLocationChange = (locationId: string) => {
        const newLocationIds = new Set(formData.businessLocationIds);
        const wasSelected = newLocationIds.has(locationId);

        if (wasSelected) {
            if (newLocationIds.size > 1) newLocationIds.delete(locationId);
        } else {
            newLocationIds.add(locationId);
        }

        setFormData(prev => {
            const newLocationStocks = new Map(prev.locationStocks);
            if (wasSelected && prev.businessLocationIds.size > 1) newLocationStocks.delete(locationId);
            return { ...prev, businessLocationIds: newLocationIds, locationStocks: newLocationStocks };
        });

        setVariantsMatrix(prevMatrix => prevMatrix.map(variant => {
            const newStocks = new Map(variant.stocks);
            if (wasSelected && formData.businessLocationIds.size > 1) {
                newStocks.delete(locationId);
            } else if (!wasSelected) {
                newStocks.set(locationId, 0);
            }
            return { ...variant, stocks: newStocks };
        }));
    };

    const handleLocationStockChange = (locationId: string, value: string) => {
        const quantity = parseInt(value, 10) || 0;
        setFormData(prev => {
            const newStocks = new Map(prev.locationStocks);
            newStocks.set(locationId, quantity);
            return { ...prev, locationStocks: newStocks };
        });
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleBrandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setBrandName(value);
        if (value) {
            setBrandSuggestions(brands.filter(b => b.name.toLowerCase().includes(value.toLowerCase())));
            setShowBrandSuggestions(true);
        } else {
            setBrandSuggestions([]);
            setShowBrandSuggestions(false);
        }
    };

    const handleBrandSuggestionClick = (brand: Brand) => {
        setBrandName(brand.name);
        setShowBrandSuggestions(false);
    };

    // Variation Handlers
    const handleVariationTypeToggle = (variationId: string) => {
        setSelectedVariations(prev => {
            const newMap = new Map<string, Set<string>>(prev);
            if (newMap.has(variationId)) {
                newMap.delete(variationId);
            } else {
                newMap.set(variationId, new Set());
            }
            return newMap;
        });
    };

    const handleVariationValueToggle = (variationId: string, valueId: string) => {
        setSelectedVariations(prev => {
            const newMap = new Map<string, Set<string>>(prev);
            const valueSet = newMap.get(variationId);
            if (valueSet) {
                const newSet = new Set(valueSet);
                if (newSet.has(valueId)) {
                    newSet.delete(valueId);
                } else {
                    newSet.add(valueId);
                }
                newMap.set(variationId, newSet);
            }
            return newMap;
        });
    };

    const handleVariantMatrixChange = (index: number, field: keyof VariantMatrixItem, value: string | number) => {
        setVariantsMatrix(prev => {
            const newMatrix = [...prev];
            // @ts-ignore
            newMatrix[index] = { ...newMatrix[index], [field]: value };
            return newMatrix;
        });
    };

    const handleVariantMatrixStockChange = (index: number, locationId: string, value: string) => {
        const quantity = parseInt(value, 10) || 0;
        setVariantsMatrix(prev => {
            const newMatrix = [...prev];
            const newStocks = new Map(newMatrix[index].stocks);
            newStocks.set(locationId, quantity);
            newMatrix[index] = { ...newMatrix[index], stocks: newStocks };
            return newMatrix;
        });
    };
    
    const handleBulkUpdate = (field: 'costPrice' | 'price', value: string) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0) return;
        setVariantsMatrix(prev => prev.map(variant => ({...variant, [field]: numValue })));
    };

    const handleBulkStockUpdate = (locationId: string, value: string) => {
        if (!locationId) return;
        const numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 0) return;
        setVariantsMatrix(prev => prev.map(variant => {
            const newStocks = new Map(variant.stocks);
            newStocks.set(locationId, numValue);
            return {...variant, stocks: newStocks};
        }));
    };


    return (
        <>
        <form onSubmit={handleSubmit} noValidate>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h1 className="text-2xl font-bold">Add New Product</h1>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    {/* Column 1 & 2 */}
                    <div className="md:col-span-2 space-y-4">
                         <div>
                            <label className="block text-sm font-medium">Product Type*</label>
                            <div className="mt-2 flex gap-6">
                                <label className="inline-flex items-center">
                                    <input type="radio" name="productType" value="single" checked={formData.productType === 'single'} onChange={handleChange} className="form-radio text-indigo-600" />
                                    <span className="ml-2">Single Product</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input type="radio" name="productType" value="variable" checked={formData.productType === 'variable'} onChange={handleChange} className="form-radio text-indigo-600" />
                                    <span className="ml-2">Variable Product</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium">Product Name*</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={`${baseInputClasses} ${errors.name ? errorInputClasses : ''}`} tabIndex={1} ref={nameInputRef}/>
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium">Product Description</label>
                            <textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} rows={3} className={baseInputClasses} tabIndex={2} />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="sku" className="block text-sm font-medium">SKU / Base SKU<Tooltip text="For variable products, this is used as a prefix for auto-generated SKUs. Leave blank to auto-generate." /></label>
                                <input type="text" id="sku" name="sku" value={formData.sku} onChange={handleChange} className={`${baseInputClasses} ${errors.sku ? errorInputClasses : ''}`} tabIndex={4}/>
                                {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
                            </div>
                            <div>
                                <label htmlFor="barcodeType" className="block text-sm font-medium">Barcode Type</label>
                                <select id="barcodeType" name="barcodeType" value={formData.barcodeType} onChange={handleChange} className={baseInputClasses} tabIndex={5}>
                                    {BARCODE_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                                </select>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="categoryId" className="block text-sm font-medium">Category</label>
                                <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange} className={baseInputClasses} tabIndex={6}>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                             <div className="relative">
                                <label htmlFor="brandName" className="block text-sm font-medium">Brand*</label>
                                <input type="text" id="brandName" name="brandName" value={brandName} onChange={handleBrandChange} onFocus={() => setShowBrandSuggestions(true)} onBlur={() => setTimeout(() => setShowBrandSuggestions(false), 150)} autoComplete="off" className={`${baseInputClasses} ${errors.brand ? errorInputClasses : ''}`} tabIndex={7}/>
                                {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand}</p>}
                                {showBrandSuggestions && brandSuggestions.length > 0 && (
                                    <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-900 rounded-md shadow-lg border dark:border-slate-700 max-h-60 overflow-auto">
                                        {brandSuggestions.map(brand => <li key={brand.id}><button type="button" onClick={() => handleBrandSuggestionClick(brand)} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700">{brand.name}</button></li>)}
                                    </ul>
                                )}
                            </div>
                        </div>
                         <div>
                            <label htmlFor="unitId" className="block text-sm font-medium">Unit</label>
                            <select id="unitId" name="unitId" value={formData.unitId} onChange={handleChange} className={baseInputClasses} tabIndex={8}>
                                {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    {/* Column 3 */}
                    <div className="space-y-4">
                         <div>
                            <label className="block text-sm font-medium">Product Image</label>
                             <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    {imagePreview ? <img src={imagePreview} alt="Preview" className="mx-auto h-24 w-24 object-cover rounded-md" /> : <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                    <div className="flex text-sm text-slate-600 dark:text-slate-400"><label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500" tabIndex={3}><span>Upload a file</span><input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" /></label><p className="pl-1">or drag and drop</p></div>
                                    <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                                </div>
                            </div>
                        </div>
                    </div>

                     <div className="md:col-span-3">
                        <label className="block text-sm font-medium">Business Locations*</label>
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 p-3 rounded-md border dark:border-slate-600">
                            {businessLocations.map((location, index) => (
                                <div key={location.id} className="relative flex items-start">
                                    <div className="flex h-5 items-center">
                                        <input
                                            id={`location-${location.id}`}
                                            name="businessLocationIds"
                                            type="checkbox"
                                            checked={formData.businessLocationIds.has(location.id)}
                                            onChange={() => handleLocationChange(location.id)}
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            tabIndex={index === 0 ? 9 : undefined}
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor={`location-${location.id}`} className="font-medium text-gray-700 dark:text-gray-300">{location.name}</label>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {errors.locations && <p className="mt-1 text-sm text-red-600">{errors.locations}</p>}
                    </div>
                    
                     <div className="md:col-span-3 pt-4 border-t dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative flex items-start">
                            <div className="flex h-5 items-center">
                                <input id="isNotForSale" name="isNotForSale" type="checkbox" checked={formData.isNotForSale} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" tabIndex={10} />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="isNotForSale" className="font-medium text-gray-700 dark:text-gray-300">Not for selling</label>
                                <p className="text-gray-500 dark:text-gray-400">If checked, product will not be displayed in POS screen.</p>
                            </div>
                        </div>
                        <div className="relative flex items-start">
                            <div className="flex h-5 items-center">
                                <input id="isAgeRestricted" name="isAgeRestricted" type="checkbox" checked={formData.isAgeRestricted} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" tabIndex={11} />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="isAgeRestricted" className="font-medium text-gray-700 dark:text-gray-300">Requires Age Verification</label>
                                <p className="text-gray-500 dark:text-gray-400">If checked, POS will prompt for age verification.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="md:col-span-3 pt-4 border-t dark:border-slate-700">
                        {formData.productType === 'single' ? (
                            <>
                                <h3 className="text-lg font-medium">Pricing & Stock</h3>
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                     <div><label htmlFor="costPrice" className="block text-sm font-medium">Cost Price*</label><input type="number" id="costPrice" name="costPrice" value={formData.costPrice} onChange={handleChange} step="0.01" min="0" className={`${baseInputClasses} ${errors.costPrice ? errorInputClasses : ''}`} tabIndex={12}/>{errors.costPrice && <p className="mt-1 text-sm text-red-600">{errors.costPrice}</p>}</div>
                                    <div><label htmlFor="price" className="block text-sm font-medium">Selling Price*</label><input type="number" id="price" name="price" value={formData.price} onChange={handleChange} step="0.01" min="0" className={`${baseInputClasses} ${errors.price ? errorInputClasses : ''}`} tabIndex={13}/>{errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}</div>
                                    <div className="lg:col-span-1">
                                        <label htmlFor="taxAmount" className="block text-sm font-medium">Tax <Tooltip text="Set the tax rate for this product. This can be a percentage or a fixed cash amount." /></label>
                                        <div className="mt-1 flex rounded-md shadow-sm">
                                            <input type="number" name="taxAmount" id="taxAmount" value={formData.taxAmount} onChange={handleChange} step="0.01" min="0" className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md bg-slate-100 dark:bg-slate-700 border-transparent focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="0.00" tabIndex={14} />
                                            <select name="taxType" value={formData.taxType} onChange={handleChange} className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm focus:ring-indigo-500 focus:border-indigo-500" tabIndex={15}>
                                                <option value="percentage">Percentage (%)</option>
                                                <option value="fixed">Fixed Amount</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4">
                                     <h4 className="block text-sm font-medium mb-1">Initial Stock per Location</h4>
                                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                         {Array.from(formData.businessLocationIds).map(locationId => (
                                             <div key={locationId}>
                                                 <label htmlFor={`stock-${locationId}`} className="block text-xs font-medium text-slate-500">Stock for {locationsMap.get(locationId)}</label>
                                                 <input type="number" id={`stock-${locationId}`} value={formData.locationStocks.get(locationId) || ''} onChange={e => handleLocationStockChange(locationId, e.target.value)} min="0" className={baseInputClasses} tabIndex={16}/>
                                             </div>
                                         ))}
                                     </div>
                                 </div>
                                 <div className="mt-4">
                                     <label htmlFor="reorderPoint" className="block text-sm font-medium">Reorder Point (per location)</label>
                                     <input type="number" id="reorderPoint" name="reorderPoint" value={formData.reorderPoint} onChange={handleChange} min="0" className={`${baseInputClasses} max-w-xs`} tabIndex={17}/>
                                 </div>
                            </>
                        ) : (
                            <div>
                                <h3 className="text-lg font-medium">Variations</h3>
                                {errors.variants && <p className="mt-1 text-sm text-red-600">{errors.variants}</p>}
                                <div className="mt-4 p-4 border dark:border-slate-700 rounded-lg space-y-4">
                                    {variationTemplates.map(v => (
                                        <div key={v.id}>
                                            <div className="flex items-center"><input type="checkbox" id={`var-${v.id}`} checked={selectedVariations.has(v.id)} onChange={() => handleVariationTypeToggle(v.id)} className="h-4 w-4 rounded text-indigo-600" /><label htmlFor={`var-${v.id}`} className="ml-2 font-semibold">{v.name}</label></div>
                                            {selectedVariations.has(v.id) && <div className="pl-6 mt-2 flex flex-wrap gap-x-4 gap-y-2">
                                                {variationValues.filter(val => val.variationId === v.id).map(val => (
                                                    <div key={val.id} className="flex items-center"><input type="checkbox" id={`val-${val.id}`} checked={selectedVariations.get(v.id)?.has(val.id)} onChange={() => handleVariationValueToggle(v.id, val.id)} className="h-4 w-4 rounded text-indigo-600" /><label htmlFor={`val-${val.id}`} className="ml-2 text-sm">{val.name}</label></div>
                                                ))}
                                            </div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {formData.productType === 'variable' && variantsMatrix.length > 0 && (
                    <div className="p-6 border-t dark:border-slate-700">
                        <h3 className="text-lg font-medium">Generated Variants ({variantsMatrix.length})</h3>
                        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                            <p className="col-span-full text-sm font-medium">Apply to all variants:</p>
                            <div><label className="text-xs">Cost Price</label><input type="number" onBlur={e => handleBulkUpdate('costPrice', e.target.value)} placeholder="0.00" className={baseInputClasses} /></div>
                            <div><label className="text-xs">Selling Price</label><input type="number" onBlur={e => handleBulkUpdate('price', e.target.value)} placeholder="0.00" className={baseInputClasses} /></div>
                             <div className="col-span-2 grid grid-cols-2 gap-2 items-end">
                                <div>
                                    <label className="text-xs">Stock For</label>
                                    <select value={bulkStockLocation} onChange={e => setBulkStockLocation(e.target.value)} className={baseInputClasses}>
                                        <option value="">Select Location</option>
                                        {Array.from(formData.businessLocationIds).map(locId => <option key={locId} value={locId}>{locationsMap.get(locId)}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs">Stock Qty</label>
                                    <input type="number" onBlur={e => handleBulkStockUpdate(bulkStockLocation, e.target.value)} placeholder="0" className={baseInputClasses} />
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 overflow-x-auto"><table className="w-full text-sm">
                            <thead className="text-left bg-slate-50 dark:bg-slate-700"><tr>
                                <th className="p-2 font-semibold">Variant</th><th className="p-2 font-semibold">SKU</th><th className="p-2 font-semibold">Cost Price</th><th className="p-2 font-semibold">Selling Price</th>
                                {Array.from(formData.businessLocationIds).map(locationId => <th key={locationId} className="p-2 font-semibold">Stock @ {locationsMap.get(locationId)}</th>)}
                            </tr></thead>
                            {/* FIX: The `variant` parameter was being inferred as 'unknown'. Explicitly typing it as `VariantMatrixItem` resolves property access errors. */}
                            <tbody>{variantsMatrix.map((variant: VariantMatrixItem, index) => (
                                <tr key={variant.id} className="border-b dark:border-slate-700"><td className="p-2">{variant.name}</td>
                                    <td className="p-2"><input type="text" value={variant.sku} onChange={e => handleVariantMatrixChange(index, 'sku', e.target.value)} className={baseInputClasses} /></td>
                                    <td className="p-2"><input type="number" value={variant.costPrice} onChange={e => handleVariantMatrixChange(index, 'costPrice', parseFloat(e.target.value))} className={baseInputClasses} /></td>
                                    <td className="p-2"><input type="number" value={variant.price} onChange={e => handleVariantMatrixChange(index, 'price', parseFloat(e.target.value))} className={baseInputClasses} /></td>
                                    {Array.from(formData.businessLocationIds).map(locationId => (
                                        <td key={locationId} className="p-2">
                                            <input type="number" value={variant.stocks.get(locationId) || ''} onChange={e => handleVariantMatrixStockChange(index, locationId, e.target.value)} className={`${baseInputClasses} w-24`} />
                                        </td>
                                    ))}
                                </tr>
                            ))}</tbody>
                        </table></div>
                    </div>
                )}


                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t flex justify-end gap-3">
                    <Link to="/products" className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600" tabIndex={19}>Cancel</Link>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700" tabIndex={18}>Save Product</button>
                </div>
            </div>
        </form>
        {isSuccessModalOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
                    <div className="p-6 text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50">
                             <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="mt-4 text-lg font-medium">Product Added Successfully!</h3>
                        <p className="mt-2 text-sm text-slate-500">What would you like to do next?</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 grid grid-cols-2 gap-3 rounded-b-lg">
                        <button type="button" onClick={() => { setIsSuccessModalOpen(false); resetForm(); setTimeout(() => nameInputRef.current?.focus(), 100); }} className="w-full rounded-md border border-slate-300 dark:border-slate-600 px-4 py-2 bg-white dark:bg-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-600">Add Another Product</button>
                        <button type="button" onClick={() => navigate('/products')} className="w-full rounded-md border border-transparent px-4 py-2 bg-indigo-600 font-medium text-white hover:bg-indigo-700">View All Products</button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default AddProductPage;