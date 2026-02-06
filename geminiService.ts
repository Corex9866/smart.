
import { GoogleGenAI, Type } from "@google/genai";
import { AdherenceLog, Medication } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getHealthInsights = async (meds: Medication[], logs: AdherenceLog[]) => {
  try {
    const context = `
      Patient Medication List: ${JSON.stringify(meds)}
      Recent Adherence Logs: ${JSON.stringify(logs.slice(-20))}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an empathetic health assistant for a Smart Pillbox solution. 
      Analyze this user's medication data and adherence logs. 
      Provide a concise 2-sentence summary of their adherence and one practical tip to improve their health routine.
      Context: ${context}`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "Keep up the great work with your medications!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Adherence is key to managing your health. Stay consistent!";
  }
};
