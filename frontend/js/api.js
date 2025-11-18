/**
 * API 통신 모듈
 * Gemini AI와 통신하여 PC 부품 추천을 받는다
 */

import { SYSTEM_INSTRUCTION, buildUserPrompt } from './prompts.js';

/**
 * Gemini API 키 가져오기
 * 우선순위: VITE_GEMINI_API_KEY > GEMINI_API_KEY (환경 변수)
 * 개발 환경: .env.local의 GEMINI_API_KEY 사용
 * 프로덕션: 배포 플랫폼의 환경 변수 사용
 */
const API_KEY = (() => {
  // Vite 환경 변수에서 읽기 (VITE_ 접두사가 있는 변수)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // VITE_GEMINI_API_KEY 우선 사용
    if (import.meta.env.VITE_GEMINI_API_KEY) {
      return import.meta.env.VITE_GEMINI_API_KEY;
    }
    // VITE_API_KEY도 확인 (기존 호환성)
    if (import.meta.env.VITE_API_KEY) {
      return import.meta.env.VITE_API_KEY;
    }
  }
  
  // 환경 변수가 없으면 에러 발생 (보안상 하드코딩된 키 제거)
  console.error('GEMINI_API_KEY가 설정되지 않았습니다. .env.local 파일에 GEMINI_API_KEY를 설정하거나 배포 환경 변수를 설정하세요.');
  throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
})();

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

/**
 * Gemini AI에 PC 부품 추천 요청
 * @param {string} userMessage - 사용자 메시지
 * @returns {Promise<{analysis: string, components: Array}>} AI 응답
 */
export async function getPCRecommendation(userMessage) {
  try {
    // 프롬프트 모듈에서 프롬프트 가져오기
    const userPrompt = buildUserPrompt(userMessage);
    
    const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: userPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
          responseMimeType: "application/json"
        },
        systemInstruction: {
          parts: [{
            text: SYSTEM_INSTRUCTION
          }]
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Gemini 응답 파싱
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('응답 형식이 올바르지 않습니다');
    }

    const textContent = data.candidates[0].content.parts[0].text;
    const parsedResponse = JSON.parse(textContent);

    // 응답 검증
    if (!parsedResponse.analysis || !Array.isArray(parsedResponse.components)) {
      throw new Error('응답 데이터 구조가 올바르지 않습니다');
    }

    // 부품 데이터 검증 및 필터링
    const validComponents = parsedResponse.components.filter(comp => {
      return comp && 
             typeof comp.category === 'string' &&
             typeof comp.name === 'string' &&
             typeof comp.price === 'string' &&
             Array.isArray(comp.features);
    });

    return {
      analysis: parsedResponse.analysis,
      components: validComponents
    };

  } catch (error) {
    console.error('API 호출 오류:', error);
    throw new Error('AI로부터 응답을 받는데 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
}

/**
 * 가격 문자열에서 숫자 추출
 * @param {string} priceStr - 가격 문자열 (예: "약 450,000원")
 * @returns {number} 숫자 가격
 */
export function extractPrice(priceStr) {
  if (!priceStr) return 0;
  const numbers = priceStr.replace(/[^\d]/g, '');
  return parseInt(numbers, 10) || 0;
}

/**
 * 숫자를 원화 형식으로 변환
 * @param {number} price - 숫자 가격
 * @returns {string} 포맷된 가격 문자열
 */
export function formatPrice(price) {
  return price.toLocaleString('ko-KR') + '원';
}

