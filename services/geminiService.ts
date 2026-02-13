
import { GoogleGenAI } from "@google/genai";
import { CompanyInfo } from "../types";

export const generateAIGreeting = async (company: CompanyInfo): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY_MISSING");

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `당신은 ${company.name}의 채용 담당자입니다. ${company.jobTitle} 직무 지원자들에게 보여줄 따뜻하고 전문적인 환영 인사말을 2~3문장 이내로 작성해 주세요. 구체적인 시간 선택을 유도하는 내용을 포함해 주세요.`,
    });
    
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

// 기존 함수 유지 (하위 호환성용)
export const getAIPersonnalizedGreeting = async (company: CompanyInfo, candidateName: string = "지원자님") => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return `안녕하세요! ${company.name}입니다. ${company.jobTitle} 직무 지원에 감사드립니다.`;

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `당신은 ${company.name}의 채용 담당자입니다. ${candidateName}님에게 면접 안내를 위한 인사말을 작성해 주세요.`,
    });
    return response.text?.trim() || "반갑습니다.";
  } catch {
    return "반갑습니다.";
  }
};
