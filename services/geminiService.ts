import { GoogleGenAI, FunctionDeclaration, Type, Part, Content } from "@google/genai";
import { Sale, CustomerRequest, CustomerReturn, Product } from '../types';
import { MOCK_CATEGORIES, MOCK_SALES, MOCK_PRODUCTS } from '../data/mockData';

// This is a new, secure function that calls our own backend proxy.
const generateSecureInsights = async (prompt: string): Promise<string> => {
    // The frontend now calls a local API endpoint.
    // This endpoint is a serverless function that will securely call the Gemini API.
    const response = await fetch('/api/generate-insights', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: "An unknown error occurred" }));
        console.error("Error from API proxy:", errorBody);
        throw new Error(errorBody.error || "Failed to generate insights from API proxy.");
    }
    
    const data = await response.json();
    return data.text;
}


export const getBusinessInsights = async (salesData: Sale[]): Promise<string> => {
  const categoryMap = new Map(MOCK_CATEGORIES.map(c => [c.id, c.name]));

  const simplifiedSales = salesData.map(sale => ({
      date: sale.date,
      total: sale.total,
      item_count: sale.items.length,
      products_sold: sale.items.map(item => ({ name: item.name, quantity: item.quantity, category: categoryMap.get(item.categoryId), price: item.price }))
  }));

  const prompt = `
    You are a world-class business analyst for a retail/cafe business. 
    Analyze the following recent sales data and provide actionable insights.

    Sales Data (JSON format):
    ${JSON.stringify(simplifiedSales, null, 2)}

    Based on this data, provide a concise report covering the following points:
    1.  **Sales Performance:** Briefly summarize the overall sales trend.
    2.  **Top Selling Products:** Identify the 2-3 most popular products by quantity sold.
    3.  **Top Categories:** Which product categories are performing the best?
    4.  **Actionable Recommendations:** Provide three concrete, actionable recommendations for the business owner to increase sales or improve operations. For example, suggest a "combo deal", a promotion on a less popular item, or a stock adjustment.
    
    Format your response as clean HTML. Use headings (e.g., <h4>), bold text (<strong> tags), and lists (<ul>, <li> tags). Do not include html, head, or body tags.
  `;

  return generateSecureInsights(prompt);
};

export const getSalesAnalysisInsights = async (salesData: Sale[], dateRange: { start: string, end: string }): Promise<string> => {
  const categoryMap = new Map(MOCK_CATEGORIES.map(c => [c.id, c.name]));

  if (salesData.length === 0) {
    return "<p>There is no sales data for the selected period. Cannot generate analysis.</p>";
  }

  const simplifiedSales = salesData.map(sale => ({
      date: sale.date,
      total: sale.total,
      item_count: sale.items.length,
      products_sold: sale.items.map(item => ({ name: item.name, quantity: item.quantity, category: categoryMap.get(item.categoryId), price: item.price }))
  }));

  const prompt = `
    You are a senior business analyst for a retail/cafe business. 
    Analyze the following sales data for the period from ${dateRange.start || 'the beginning'} to ${dateRange.end || 'the end'}.

    Sales Data (JSON format):
    ${JSON.stringify(simplifiedSales, null, 2)}

    Provide a detailed analysis covering the following points:
    1.  **Overall Performance:** Summarize total revenue, total number of sales, and the average sale value for this period.
    2.  **Product Performance:** Identify the top 3 best-selling products by quantity and by revenue. Also mention if there are any products that sold significantly less and might need attention.
    3.  **Category Insights:** Which product categories are driving the most sales revenue?
    4.  **Peak Times (if possible):** Based on the timestamps, are there any noticeable peak sales times or days? (e.g., "Sales seem to be higher in the mornings").
    5.  **Actionable Recommendations:** Provide three concrete, data-driven recommendations based on your analysis. For example: "Given the popularity of Croissants, consider a 'Coffee & Croissant' breakfast deal to increase average order value." or "Iced Tea sales are low; a 'buy one, get one half price' promotion could boost its performance."

    Format your response as clean HTML. Use headings (e.g., <h4>), bold text (<strong> tags), and lists (<ul>, <li> tags) to make it highly readable and professional. Do not include html, head, or body tags.
  `;

  return generateSecureInsights(prompt);
};

export const getCustomerDemandAnalysis = async (requests: CustomerRequest[]): Promise<string> => {
    const rawRequestsText = requests.map(r => `- "${r.text}" (logged by ${r.cashierName} on ${new Date(r.date).toLocaleDateString()})`).join('\n');

    if (rawRequestsText.length === 0) {
        return "<p>There are no customer requests to analyze.</p>";
    }

    const prompt = `
        You are a senior purchasing analyst for a retail store. 
        You have received the following raw log of items that customers asked for but were not available.

        Customer Request Log:
        ${rawRequestsText}

        Based on this log, provide an intelligent analysis and actionable recommendations. Your report should include:
        1.  **Top Requested Items:** Identify and consolidate recurring requests into a clear list of the most-demanded products (e.g., if you see "oat milk latte" and "oat milk", consolidate under "Oat Milk").
        2.  **Emerging Trends:** Are there any keywords or themes that suggest a new market trend? (e.g., "gluten-free", "organic", "vegan options").
        3.  **Actionable Stocking Recommendations:** Provide 3-5 concrete suggestions for new products the store should consider stocking, based directly on the customer feedback. Phrase these as direct advice to the store manager.

        Format your response as clean, professional HTML. Use headings (e.g., <h4>), bold text (<strong> tags), and lists (<ul>, <li> tags) to make the analysis easy to read and act upon. Do not include html, head, or body tags.
    `;

    return generateSecureInsights(prompt);
};

export const getReturnAnalysisInsights = async (returns: CustomerReturn[]): Promise<string> => {
    if (returns.length === 0) {
        return "<p>There are no customer returns to analyze in the selected period.</p>";
    }

    const simplifiedReturns = returns.map(r => ({
        products_returned: r.items.map(item => ({ name: item.name, quantity: item.quantity })),
        reason: r.reason
    }));

    const prompt = `
        You are a Quality Control and Business Analyst for a retail business.
        You have been provided with the following customer return data. Your task is to analyze it and provide actionable insights.

        Customer Return Data (JSON format):
        ${JSON.stringify(simplifiedReturns, null, 2)}

        Provide a concise but insightful report covering these points:
        1.  **Common Return Reasons:** Analyze the 'reason' texts and group them into 2-4 common themes (e.g., "Product Quality Issues", "Wrong Item/Size", "Customer Dissatisfaction").
        2.  **Frequently Returned Products:** Identify the top 2-3 products that are being returned most often based on this data.
        3.  **Actionable Insights & Recommendations:** Based on your analysis, provide three concrete, actionable recommendations for the business manager. For example:
            - "The 'Espresso' is frequently returned with comments about a 'burnt taste'. Recommend reviewing the brewing process or coffee bean batch with the staff."
            - "Several returns are for 'wrong size'. Suggest adding clearer size charts or training staff to assist with sizing."
            - "If a specific product has a high return rate due to defects, recommend contacting the supplier or inspecting the current batch."

        Format your response as clean, professional HTML. Use headings (e.g., <h4>), bold text (<strong> tags), and lists (<ul>, <li> tags). Do not include html, head, or body tags.
    `;

    return generateSecureInsights(prompt);
};

// --- CHATBOT FUNCTIONALITY ---

// Note: In a real multi-tenant app, these helper functions would be replaced
// by secure API calls to your backend, which would then query the database.
// The backend would enforce that only data for the current user's tenant is returned.

const getProductInfo = (
  { productName }: { productName: string },
) => {
  // In a real app: This would be an API call `GET /api/products?name=${productName}`
  const product = MOCK_PRODUCTS.find(p => p.name.toLowerCase() === productName.toLowerCase());
  if (!product) {
    return { error: `Product '${productName}' not found.` };
  }
  return {
    name: product.name,
    price: product.price,
    stock: product.stock,
    category: MOCK_CATEGORIES.find(c => c.id === product.categoryId)?.name || 'N/A'
  };
};

const getTodaysSalesSummary = () => {
   // In a real app: This would be an API call `GET /api/reports/sales-summary?period=today`
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysSales = MOCK_SALES.filter(s => new Date(s.date) >= today && s.status === 'completed');
  const totalRevenue = todaysSales.reduce((acc, s) => acc + s.total, 0);
  return {
    numberOfSales: todaysSales.length,
    totalRevenue: totalRevenue.toFixed(2)
  };
};

const getLowStockProducts = (
  { limit = 5 }: { limit: number },
) => {
  // In a real app: This would be an API call `GET /api/products?stockStatus=low&limit=${limit}`
  const lowStock = MOCK_PRODUCTS
    .filter(p => p.stock > 0 && p.stock <= p.reorderPoint)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, limit);
  
  if (lowStock.length === 0) {
    return { message: "All products are well-stocked." };
  }
  return lowStock.map(p => ({ name: p.name, stock: p.stock, reorderPoint: p.reorderPoint }));
};

const tools: FunctionDeclaration[] = [
  {
    name: 'getProductInfo',
    description: 'Get information about a specific product, including its price and stock level.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        productName: {
          type: Type.STRING,
          description: 'The name of the product to look up.',
        },
      },
      required: ['productName'],
    },
  },
  {
    name: 'getTodaysSalesSummary',
    description: 'Get a summary of today\'s sales, including the total number of sales and total revenue.',
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: 'getLowStockProducts',
    description: 'Get a list of products that are low in stock (at or below their reorder point).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        limit: {
          type: Type.NUMBER,
          description: 'The maximum number of low-stock products to return.',
        },
      },
    },
  },
];

export const processChat = async (
  history: Content[],
  message: string,
  // products and sales are no longer needed as arguments as functions get them from mockData directly
): Promise<string> => {
    
    // This entire function should be moved to a backend endpoint for security.
    // The frontend should just call `POST /api/chat` with the message and history.
    
    // For demonstration, we will call the Gemini API directly here,
    // but this exposes the API key and is not secure for production.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return "Sorry, the chatbot is not configured correctly. API key is missing.";
    }
    
    const ai = new GoogleGenAI({ apiKey });

    try {
      // Create a chat session with the full history
      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: history,
        config: {
          tools: [{ functionDeclarations: tools }],
        }
      });
      
      const response = await chat.sendMessage({ message: message });
      
      if (response.functionCalls && response.functionCalls.length > 0) {
        const functionCall = response.functionCalls[0];
        let functionResponse;

        if (functionCall.name === 'getProductInfo') {
            functionResponse = getProductInfo(functionCall.args as {productName: string});
        } else if (functionCall.name === 'getTodaysSalesSummary') {
            functionResponse = getTodaysSalesSummary();
        } else if (functionCall.name === 'getLowStockProducts') {
            functionResponse = getLowStockProducts(functionCall.args as {limit: number});
        }

        if (functionResponse) {
          // Send the function response back to the model
          const finalResponse = await chat.sendMessage({
            tool_responses: [{
              functionResponse: {
                id: functionCall.id,
                name: functionCall.name,
                response: functionResponse,
              }
            }]
          });
          return finalResponse.text;
        }
      }

      return response.text;

    } catch (error) {
        console.error("Error processing chat:", error);
        return "Sorry, I encountered an error. The chatbot functionality requires a backend implementation for full security and function calling.";
    }
};