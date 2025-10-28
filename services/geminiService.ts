import { GoogleGenAI } from "@google/genai";
import { Sale } from '../types';
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
    
    Format your response in clean Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt
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
    return "There is no sales data for the selected period. Cannot generate analysis.";
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

    Format your response in clean Markdown. Use headings, bold text, and lists to make it highly readable and professional.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Error generating sales analysis with Gemini API:", error);
    throw new Error("Failed to generate sales analysis. Please check the API configuration.");
  }
};
