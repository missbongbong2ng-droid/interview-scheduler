
import { GoogleGenAI } from "@google/genai";
import { CompanyInfo } from "../types";

export const getAIPersonnalizedGreeting = async (company: CompanyInfo, candidateName: string = "지원자님") => {
  // 텍스트 기반 서비스는 process.env.API_KEY를 사용하여 자동으로 키를 가져옵니다.
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.warn("API 키가 설정되지 않았습니다. 기본 메시지를 사용합니다.");
    return `안녕하세요! ${company.name}입니다. ${company.jobTitle} 직무에 지원해주셔서 감사합니다. 아래에서 원하시는 면접 시간을 선택해 주세요.`;
  }

  // 매 요청마다 새로운 인스턴스를 생성하여 최신 상태를 유지
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `당신은 ${company.name}의 채용 담당자입니다. ${company.jobTitle} 직무에 지원한 ${candidateName}님에게 면접 안내를 위한 따뜻하고 전문적인 환영 인사말을 2~3문장 이내로 작성해 주세요. 친절하면서도 격식 있는 톤앤매너를 유지해 주세요.`,
    });
    
    return response.text?.trim() || "환영합니다! 아래 리스트에서 면접 일정을 선택해 주세요.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // 할당량 초과나 키 오류 시 사용자에게 친숙한 기본 메시지 제공
    return `반갑습니다! ${company.name}입니다. ${company.jobTitle} 면접을 위해 시간을 예약해 주시기 바랍니다.`;
  }
};
