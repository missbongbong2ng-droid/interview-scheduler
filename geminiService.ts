
import { GoogleGenAI } from "@google/genai";
import { CompanyInfo } from "../types";

export const getAIPersonnalizedGreeting = async (company: CompanyInfo, candidateName: string = "지원자님") => {
  // 호출 직전에 API 키를 가져와 인스턴스 생성 (AI Studio 연동 대응)
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.warn("API 키가 설정되지 않았습니다.");
    return "안녕하세요! 지원해 주셔서 감사합니다. 원하시는 면접 시간을 선택해 주세요.";
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `당신은 ${company.name}의 채용 담당자입니다. ${company.jobTitle} 직무에 지원한 ${candidateName}님에게 면접 안내를 위한 따뜻하고 전문적인 환영 인사말을 3문장 이내로 작성해 주세요.`,
      config: {
        temperature: 0.8,
        thinkingConfig: { thinkingBudget: 0 } // 응답 속도 최적화
      }
    });
    
    return response.text || "환영합니다! 면접 시간을 선택해 주세요.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // 키 관련 에러 발생 시 UI에서 다시 선택하도록 유도하기 위한 로직
    if (error.message?.includes("Requested entity was not found")) {
      // 이 에러는 키 선택이 다시 필요함을 의미함
      return "인사말을 생성하려면 AI Studio 키 연동이 필요합니다.";
    }
    
    return `안녕하세요! ${company.name}입니다. 아래에서 면접 시간을 선택해 주시기 바랍니다.`;
  }
};
