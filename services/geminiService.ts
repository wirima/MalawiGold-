import { GoogleGenAI, FunctionDeclaration, Type, Part, Content } from "@google/genai";
import { Sale, CustomerRequest, CustomerReturn, Product } from '../types';
import { MOCK_CATEGORIES } from '../data/mockData';

export const getBusinessInsights = async (salesData: Sale[]): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const categoryMap = new Map(MOCK_CATEGORIES.map(c => [c.id, c.name]));

  const simplifiedSales = salesData.map(sale => ({
      date: sale.date,
      total: sale.total,
      item_count: sale.items.length,
      // FIX: The 'category' property does not exist on CartItem. Changed to use 'categoryId' to look up the category name, which provides more useful data for analysis.
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

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `[{"role": "user", "parts": [{"text": "${prompt}"}]}]`
    });
    return response.text;
  } catch (error) {
    console.error("Error generating insights with Gemini API:", error);
    throw new Error("Failed to generate business insights. Please check the API configuration.");
  }
};

export const getSalesAnalysisInsights = async (salesData: Sale[], dateRange: { start: string, end: string }): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `[{"role": "user", "parts": [{"text": "${prompt}"}]}]`
    });
    return response.text;
  } catch (error) {
    console.error("Error generating sales analysis with Gemini API:", error);
    throw new Error("Failed to generate sales analysis. Please check the API configuration.");
  }
};

export const getCustomerDemandAnalysis = async (requests: CustomerRequest[]): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `[{"role": "user", "parts": [{"text": "${prompt}"}]}]`
        });
        return response.text;
    } catch (error) {
        console.error("Error generating demand analysis with Gemini API:", error);
        throw new Error("Failed to generate demand analysis. Please check the API configuration.");
    }
};

export const getReturnAnalysisInsights = async (returns: CustomerReturn[]): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `[{"role": "user", "parts": [{"text": "${prompt}"}]}]`
        });
        return response.text;
    } catch (error) {
        console.error("Error generating return analysis with Gemini API:", error);
        throw new Error("Failed to generate return analysis. Please check the API configuration.");
    }
};

// --- CHATBOT FUNCTIONALITY ---

const getProductInfo = (
  { productName }: { productName: string },
  products: Product[]
) => {
  const product = products.find(p => p.name.toLowerCase() === productName.toLowerCase());
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

const getTodaysSalesSummary = (sales: Sale[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysSales = sales.filter(s => new Date(s.date) >= today && s.status === 'completed');
  const totalRevenue = todaysSales.reduce((acc, s) => acc + s.total, 0);
  return {
    numberOfSales: todaysSales.length,
    totalRevenue: totalRevenue.toFixed(2)
  };
};

const getLowStockProducts = (
  { limit = 5 }: { limit: number },
  products: Product[]
) => {
  const lowStock = products
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
  products: Product[],
  sales: Sale[]
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const contents: Content[] = [...history, { role: 'user', parts: [{ text: message }] }];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        tools: [{ functionDeclarations: tools }],
      },
    });

    if (response.functionCalls) {
      const functionCalls = response.functionCalls;
      const functionResponses: Part[] = [];

      for (const call of functionCalls) {
        let result;
        switch (call.name) {
          case 'getProductInfo':
            result = getProductInfo(call.args as { productName: string }, products);
            break;
          case 'getTodaysSalesSummary':
            result = getTodaysSalesSummary(sales);
            break;
          case 'getLowStockProducts':
            result = getLowStockProducts(call.args as { limit: number }, products);
            break;
          default:
            result = { error: `Unknown function: ${call.name}` };
        }
        
        functionResponses.push({
          functionResponse: {
            name: call.name,
            response: { result },
          },
        });
      }

      // Send the function response back to the model
      const secondResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        // FIX: The history needs to include the model's first turn (the function call) and the tool's response.
        contents: [...contents, response.candidates[0].content, { role: 'tool', parts: functionResponses }],
      });
      return secondResponse.text;
    }

    return response.text;

  } catch (error) {
    console.error("Error processing chat with Gemini API:", error);
    return "Sorry, I encountered an error while processing your request. Please try again.";
  }
};