import { GoogleGenAI, Type } from "@google/genai";
import type { AiResponse, PCComponent } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    analysis: {
      type: Type.STRING,
      description: "사용자의 요구사항과 예산에 대한 심층 분석을 한국어로 제공합니다. 이 분석은 사용자와의 대화 형식으로, 친절하고 상세하게 설명되어야 합니다. 핵심 고려 사항과 예산 관련 조언을 포함해야 합니다.",
    },
    components: {
      type: Type.ARRAY,
      description: "추천된 PC 부품 목록입니다.",
      items: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            description: "부품 카테고리 (예: CPU, GPU, RAM, 메인보드, SSD, 케이스, 파워).",
          },
          name: {
            type: Type.STRING,
            description: "제품의 전체 이름입니다 (예: 'AMD Ryzen 7 7800X3D').",
          },
          price: {
            type: Type.STRING,
            description: "부품의 예상 가격을 원화(KRW)로 표시합니다 (예: '약 450,000원').",
          },
          features: {
            type: Type.ARRAY,
            description: "부품의 핵심 특징들을 키워드 중심으로 짧게 작성한 배열입니다 (예: ['최고의 게이밍 성능', '뛰어난 멀티코어']).",
            items: {
              type: Type.STRING,
            },
          },
        },
        required: ["category", "name", "price", "features"],
      },
    },
  },
  required: ["analysis", "components"],
};


export const getPCBuildRecommendation = async (prompt: string): Promise<AiResponse> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: `사용자 요청: "${prompt}". 이 요청에 따라 PC 부품 견적을 맞춰주세요. 상세한 분석과 함께 추천 부품 목록을 제공해주세요.`,
            config: {
                systemInstruction: "당신은 'Spckit AI'입니다. 사용자의 요구사항, 예산, 사용 목적에 따라 맞춤형 PC 부품을 추천하는 전문 AI 어시스턴트입니다. 항상 한국어로 답변해야 합니다.",
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.7,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);

        // More robust validation
        if (!parsedResponse || typeof parsedResponse.analysis !== 'string' || !Array.isArray(parsedResponse.components)) {
          throw new Error("Invalid response structure from AI");
        }

        // Filter out any invalid or incomplete component objects
        const validComponents = parsedResponse.components.filter((comp: any): comp is PCComponent => {
            return (
                comp &&
                typeof comp === 'object' &&
                typeof comp.category === 'string' &&
                typeof comp.name === 'string' &&
                typeof comp.price === 'string' &&
                Array.isArray(comp.features) &&
                comp.features.every((f: any) => typeof f === 'string')
            );
        });

        return {
            analysis: parsedResponse.analysis,
            components: validComponents,
        };

    } catch (error) {
        console.error("Error fetching from Gemini API:", error);
        throw new Error("Failed to get recommendation from AI.");
    }
};