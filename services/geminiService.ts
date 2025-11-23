import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const sendMessageToGemini = async (
  message: string,
  contextData: string
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const systemInstruction = `
      Você é um especialista em contabilidade e imposto de renda para motoristas de aplicativo (Uber, 99, Indrive) no Brasil.
      Responda dúvidas sobre Carne-Leão, isenção de 40%, despesas dedutíveis e DARF.
      Use uma linguagem clara, direta e encorajadora.
      
      Contexto atual do usuário:
      ${contextData}
      
      Regras importantes:
      1. A regra dos 40% é uma presunção de despesas para quem não faz escrituração completa (livro caixa).
      2. O limite de isenção mensal para o IRPF mencionado pelo usuário é R$ 2.428,80.
      3. Se o valor tributável passar desse limite, o usuário deve recolher o Carnê-Leão via DARF.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: message,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "Desculpe, não consegui processar sua pergunta no momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ocorreu um erro ao conectar com o assistente inteligente. Verifique sua chave de API ou tente novamente mais tarde.";
  }
};