// File: /api/app-data.ts

import { createClient } from '@supabase/supabase-js';

export const config = {
    runtime: 'edge',
};

// Helper to add CORS headers
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
        const supabaseAdmin = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return withCors(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }));
        }
        const token = authHeader.split(' ')[1];
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);

        if (!user) {
            return withCors(new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 }));
        }
        
        if (req.method === 'GET') {
            const tables = [
                'User', 'Role', 'Product', 'StockAdjustment', 'Customer', 'CustomerGroup',
                'Supplier', 'Variation', 'VariationValue', 'Brand', 'Category', 'Unit',
                'Sale', 'Draft', 'Quotation', 'Purchase', 'PurchaseReturn', 'Expense',
                'ExpenseCategory', 'BusinessLocation', 'StockTransfer', 'Shipment',
                'PaymentMethod', 'CustomerRequest', 'CustomerReturn',
                'IntegrationConnection', 'BankAccount', 'StockTransferRequest', 'NotificationTemplate'
            ];

            const promises = tables.map(table => supabaseAdmin.from(table).select('*'));
            const results = await Promise.all(promises);
            
            const errors = results.filter(res => res.error);
            if (errors.length > 0) {
                console.error("Supabase fetch errors:", errors.map(e => e.error?.message));
                throw new Error('One or more database queries failed.');
            }

            const data = results.reduce((acc, res, index) => {
                const tableName = tables[index];
                const key = tableName.charAt(0).toLowerCase() + tableName.slice(1) + 's';
                acc[key] = res.data;
                return acc;
            }, {} as Record<string, any>);

            return withCors(new Response(JSON.stringify(data), { status: 200 }));
        }

        if (req.method === 'POST') {
             const { type, payload } = await req.json();
             let result;
             
             switch(type) {
                case 'ADD_PRODUCT': {
                    const { data, error } = await supabaseAdmin.from('Product').insert(payload).select().single();
                    if (error) throw error;
                    result = data;
                    break;
                }
                case 'UPDATE_PRODUCT': {
                    const { id, ...updateData } = payload;
                    const { data, error } = await supabaseAdmin.from('Product').update(updateData).eq('id', id).select().single();
                    if (error) throw error;
                    result = data;
                    break;
                }
                case 'DELETE_PRODUCT': {
                    const { data, error } = await supabaseAdmin.from('Product').delete().eq('id', payload.id);
                    if (error) throw error;
                    result = { success: true, id: payload.id };
                    break;
                }
                case 'ADD_SALE': {
                    const { data: saleId, error: rpcError } = await supabaseAdmin.rpc('create_sale_and_update_stock', {
                        p_customer_id: payload.customer.id,
                        p_total: payload.total,
                        p_payments: payload.payments,
                        p_items: payload.items.map((item: any) => ({
                            productId: item.id,
                            quantity: item.quantity,
                            price: item.price,
                            costPrice: item.costPrice,
                            name: item.name,
                            sku: item.sku,
                            imageUrl: item.imageUrl
                        })),
                        p_business_location_id: payload.businessLocationId
                    });

                    if (rpcError) throw rpcError;

                    const { data: newSale, error: fetchError } = await supabaseAdmin.from('Sale').select('*').eq('id', saleId).single();
                    if(fetchError) throw fetchError;
                    
                    result = { ...newSale, items: payload.items };
                    break;
                }
                default:
                    return withCors(new Response(JSON.stringify({ error: `Unknown mutation type: ${type}` }), { status: 400 }));
             }
             return withCors(new Response(JSON.stringify(result), { status: type.startsWith('ADD') ? 201 : 200 }));
        }

        return withCors(new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 }));

    } catch (error: any) {
        console.error("API Error:", error);
        return withCors(new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), { status: 500 }));
    }
}
