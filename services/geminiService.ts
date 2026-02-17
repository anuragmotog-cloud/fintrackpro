
import { GoogleGenAI, Type } from "@google/genai";
import { FinancialData } from "../types";

export interface FinancialInsight {
  category: 'savings' | 'investment' | 'business' | 'alert';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

export const getFinancialInsights = async (data: FinancialData): Promise<FinancialInsight[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Prepare a condensed summary for the prompt to save tokens and improve focus
  const summary = {
    balance: data.accounts.reduce((acc, a) => acc + a.balance, 0) + data.wallets.reduce((acc, w) => acc + w.balance, 0),
    expenses: data.transactions.filter(t => t.type === 'expense').slice(-20),
    income: data.transactions.filter(t => t.type === 'income').slice(-10),
    loans: data.loans.map(l => ({ name: l.name, outstanding: l.principal - l.paidAmount })),
    investments: data.investments.map(i => ({ name: i.name, value: i.currentPrice * i.quantity }))
  };

  const prompt = `Analyze this user's financial data and provide 3-4 actionable insights. 
  Data: ${JSON.stringify(summary)}
  
  Focus on:
  1. Business cash flow optimization (if business data present).
  2. Savings opportunities.
  3. Investment diversification.
  4. Debt management alerts.
  
  Return the response as a JSON array of objects with keys: category (savings, investment, business, alert), title, description, and impact (high, medium, low).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING, enum: ['savings', 'investment', 'business', 'alert'] },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              impact: { type: Type.STRING, enum: ['high', 'medium', 'low'] }
            },
            required: ['category', 'title', 'description', 'impact']
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Insights Error:", error);
    return [
      {
        category: 'alert',
        title: 'Analysis Unavailable',
        description: 'We couldn\'t connect to the AI advisor. Check your connection.',
        impact: 'low'
      }
    ];
  }
};
