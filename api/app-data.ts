// File: /api/app-data.ts

import { createClient } from '@supabase/supabase-js';
import { User } from '../types';

export const config = {
    runtime: 'edge',
};

// Helper to add CORS headers for local development
function withCors(response: Response) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
}

export default async function handler(req: Request) {
    if (req.method === 'OPTIONS') {
        return withCors(new Response(null, { status: 204 }));
    }

    try {
        // Initialize the Supabase admin client with the service role key
        // This client bypasses all RLS policies
        const supabaseAdmin = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Verify the user's JWT to secure the endpoint
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return withCors(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }));
        }
        const token = authHeader.split(' ')[1];
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);

        if (!user) {
            return withCors(new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 }));
        }
        
        // Fetch the user's application profile to get their businessLocationId
        const { data: userProfile, error: profileError } = await supabaseAdmin
            .from('User')
            .select('businessLocationId')
            .eq('id', user.id)
            .single<Pick<User, 'businessLocationId'>>();

        if (profileError || !userProfile) {
            console.error('API Error: Could not fetch user profile.', profileError);
            return withCors(new Response(JSON.stringify({ error: 'Could not find user profile.' }), { status: 404 }));
        }
        
        const { businessLocationId } = userProfile;

        // Handle GET request to fetch all initial data
        if (req.method === 'GET') {
            const [
                users, roles, products, stockAdjustments, customers, customerGroups,
                suppliers, variations, variationValues, brands, categories, units,
                sales, drafts, quotations, purchases, purchaseReturns, expenses,
                expenseCategories, businessLocations, stockTransfers, shipments,
                paymentMethods, customerRequests, customerReturns,
                integrations, bankAccounts, stockTransferRequests, notificationTemplates
            ] = await Promise.all([
                supabaseAdmin.from('User').select('*').eq('businessLocationId', businessLocationId),
                supabaseAdmin.from('Role').select('*'), // Roles are global
                supabaseAdmin.from('Product').select('*').eq('businessLocationId', businessLocationId),
                supabaseAdmin.from('StockAdjustment').select('*'), // Needs location scoping via product
                supabaseAdmin.from('Customer').select('*'), // Assume customers are per-business for now
                supabaseAdmin.from('CustomerGroup').select('*'),
                supabaseAdmin.from('Supplier').select('*'),
                supabaseAdmin.from('Variation').select('*'),
                supabaseAdmin.from('VariationValue').select('*'),
                supabaseAdmin.from('Brand').select('*'),
                supabaseAdmin.from('Category').select('*'),
                supabaseAdmin.from('Unit').select('*'),
                supabaseAdmin.from('Sale').select('*').eq('businessLocationId', businessLocationId),
                supabaseAdmin.from('Draft').select('*'),
                supabaseAdmin.from('Quotation').select('*'),
                supabaseAdmin.from('Purchase').select('*'),
                supabaseAdmin.from('PurchaseReturn').select('*'),
                supabaseAdmin.from('Expense').select('*'),
                supabaseAdmin.from('ExpenseCategory').select('*'),
                supabaseAdmin.from('BusinessLocation').select('*').eq('id', businessLocationId),
                supabaseAdmin.from('StockTransfer').select('*'),
                supabaseAdmin.from('Shipment').select('*'),
                supabaseAdmin.from('PaymentMethod').select('*'),
                supabaseAdmin.from('CustomerRequest').select('*'),
                supabaseAdmin.from('CustomerReturn').select('*'),
                supabaseAdmin.from('IntegrationConnection').select('*'),
                supabaseAdmin.from('BankAccount').select('*'),
                supabaseAdmin.from('StockTransferRequest').select('*'),
                supabaseAdmin.from('NotificationTemplate').select('*'),
            ]);
            
            const data = {
                users: users.data, roles: roles.data, products: products.data, stockAdjustments: stockAdjustments.data, customers: customers.data, customerGroups: customerGroups.data,
                suppliers: suppliers.data, variations: variations.data, variationValues: variationValues.data, brands: brands.data, categories: categories.data, units: units.data,
                sales: sales.data, drafts: drafts.data, quotations: quotations.data, purchases: purchases.data, purchaseReturns: purchaseReturns.data, expenses: expenses.data,
                expenseCategories: expenseCategories.data, businessLocations: businessLocations.data, stockTransfers: stockTransfers.data, shipments: shipments.data,
                paymentMethods: paymentMethods.data, customerRequests: customerRequests.data, customerReturns: customerReturns.data,
                integrations: integrations.data, bankAccounts: bankAccounts.data, stockTransferRequests: stockTransferRequests.data, notificationTemplates: notificationTemplates.data,
            };

            return withCors(new Response(JSON.stringify(data), { status: 200 }));
        }

        // Handle POST for data mutations
        if (req.method === 'POST') {
             const { type, payload } = await req.json();
             let result;
             
             switch(type) {
                case 'ADD_PRODUCT': {
                    const { data, error } = await supabaseAdmin.from('Product').insert({ ...payload, businessLocationId }).select().single();
                    if (error) throw error;
                    result = data;
                    break;
                }
                case 'ADD_SALE': {
                    const { data: saleId, error: rpcError } = await supabaseAdmin.rpc('create_sale_and_update_stock', {
                        p_customer_id: payload.customer.id,
                        p_total: payload.total,
                        p_payments: payload.payments,
                        p_items: payload.items.map((item: any) => ({ // Ensure payload matches RPC function arg types
                            productId: item.id,
                            quantity: item.quantity,
                            price: item.price,
                            costPrice: item.costPrice,
                            name: item.name,
                            sku: item.sku,
                            imageUrl: item.imageUrl
                        })),
                        p_business_location_id: businessLocationId
                    });

                    if (rpcError) throw rpcError;

                    // Fetch the newly created sale to return it to the client
                    const { data: newSale, error: fetchError } = await supabaseAdmin.from('Sale').select('*').eq('id', saleId).single();
                    if(fetchError) throw fetchError;
                    
                    // The client expects items to be on the sale object for the receipt
                    result = { ...newSale, items: payload.items };
                    break;
                }
                // ... add other cases like 'UPDATE_PRODUCT', etc. here
                default:
                    return withCors(new Response(JSON.stringify({ error: `Unknown mutation type: ${type}` }), { status: 400 }));
             }
             return withCors(new Response(JSON.stringify(result), { status: 201 }));
        }

        return withCors(new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 }));

    } catch (error: any) {
        console.error("API Error:", error);
        return withCors(new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), { status: 500 }));
    }
}
