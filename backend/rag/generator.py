"""
Gemini API를 사용한 추천 응답 생성기
"""
import google.generativeai as genai
from typing import List, Dict, Any, Optional
from loguru import logger
import json

from .config import GEMINI_API_KEY, GENERATION_MODEL


class PCRecommendationGenerator:
    """검색된 부품 정보를 기반으로 사용자에게 추천 응답을 생성하는 클래스"""

    def __init__(
        self,
        api_key: str = GEMINI_API_KEY,
        model: str = GENERATION_MODEL,
        temperature: float = 0.7,
    ):
        """
        Args:
            api_key: Gemini API 키
            model: 생성 모델 이름
            temperature: 생성 온도 (0~1, 높을수록 창의적)
        """
        self.api_key = api_key
        self.model_name = model
        self.temperature = temperature

        # Gemini API 설정
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel(model_name=self.model_name)

        logger.info(f"PCRecommendationGenerator 초기화: model={model}")

    def generate_recommendation(
        self,
        user_query: str,
        retrieved_components: List[Dict[str, Any]],
        system_instruction: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        사용자 쿼리와 검색된 부품 정보를 기반으로 추천 생성

        Args:
            user_query: 사용자 쿼리
            retrieved_components: 검색된 부품 리스트
            system_instruction: 시스템 지시사항

        Returns:
            추천 응답 딕셔너리
        """
        # 컨텍스트 구성
        context = self._build_context(retrieved_components)

        # 프롬프트 생성
        prompt = self._build_prompt(user_query, context, system_instruction)

        try:
            # Gemini API 호출
            response = self.model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    temperature=self.temperature,
                    max_output_tokens=2048,
                    response_mime_type="application/json",
                ),
            )

            # 응답 파싱
            result = json.loads(response.text)
            
            logger.info(f"추천 생성 완료: '{user_query[:50]}...'")
            return result

        except json.JSONDecodeError as e:
            logger.error(f"JSON 파싱 실패: {str(e)}")
            # JSON이 아닌 경우 텍스트 그대로 반환
            return {
                "analysis": response.text,
                "components": [],
                "total_price": 0,
            }
        except Exception as e:
            logger.error(f"추천 생성 실패: {str(e)}")
            raise

    def _build_context(self, components: List[Dict[str, Any]]) -> str:
        """
        검색된 부품 정보를 컨텍스트 문자열로 변환

        Args:
            components: 부품 리스트

        Returns:
            컨텍스트 문자열
        """
        if not components:
            return "검색된 부품이 없습니다."

        context_parts = ["### 검색된 PC 부품 정보:"]
        
        for i, comp in enumerate(components, 1):
            metadata = comp.get("metadata", {})
            similarity = comp.get("similarity", 0)

            part = [
                f"\n[부품 {i}]",
                f"- 카테고리: {metadata.get('category', 'N/A')}",
                f"- 제품명: {metadata.get('name', 'N/A')}",
                f"- 유사도: {similarity:.2%}",
            ]

            # 주요 스펙 추가
            for key, value in metadata.items():
                if key not in ["category", "name", "id", "source", "created_at", "updated_at"]:
                    if value:
                        part.append(f"- {key}: {value}")

            context_parts.append("\n".join(part))

        return "\n".join(context_parts)

    def _build_prompt(
        self,
        user_query: str,
        context: str,
        system_instruction: Optional[str] = None,
    ) -> str:
        """
        프롬프트 생성

        Args:
            user_query: 사용자 쿼리
            context: 컨텍스트 (검색된 부품 정보)
            system_instruction: 시스템 지시사항

        Returns:
            프롬프트 문자열
        """
        default_instruction = """당신은 'Spckit AI'입니다. 사용자의 요구사항, 예산, 사용 목적에 따라 맞춤형 PC 부품을 추천하는 전문 AI 어시스턴트입니다. 
항상 한국어로 답변하고, 검색된 부품 정보를 기반으로 정확하고 상세한 추천을 제공하세요."""

        instruction = system_instruction or default_instruction

        prompt = f"""{instruction}

{context}

사용자 요청: "{user_query}"

위의 검색된 부품 정보를 참고하여, 사용자의 요청에 맞는 PC 부품을 추천해주세요.

다음 JSON 형식으로 응답해주세요:
{{
    "analysis": "사용자 요구사항에 대한 상세 분석 (200자 이내)",
    "components": [
        {{
            "category": "부품 카테고리",
            "name": "제품명",
            "price": "예상 가격 (만원)",
            "features": ["특징1", "특징2", "특징3"],
            "why_recommended": "추천 이유"
        }}
    ],
    "total_price": "총 예상 가격 (만원)",
    "additional_notes": "추가 조언 및 주의사항"
}}

**중요**: 검색된 부품 정보에 없는 내용은 추측하지 말고, 있는 정보만을 기반으로 추천하세요."""

        return prompt

    def generate_comparison(
        self,
        components_to_compare: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        여러 부품을 비교 분석

        Args:
            components_to_compare: 비교할 부품 리스트

        Returns:
            비교 결과 딕셔너리
        """
        context = self._build_context(components_to_compare)

        prompt = f"""다음 PC 부품들을 비교 분석해주세요:

{context}

각 부품의 장단점, 가격 대비 성능, 추천 대상을 JSON 형식으로 정리해주세요:

{{
    "comparison": [
        {{
            "component_name": "제품명",
            "pros": ["장점1", "장점2"],
            "cons": ["단점1", "단점2"],
            "value_for_money": "가격 대비 성능 평가",
            "recommended_for": "추천 대상"
        }}
    ],
    "best_choice": "최고의 선택과 이유",
    "budget_choice": "가성비 선택과 이유"
}}"""

        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    temperature=0.5,
                    max_output_tokens=2048,
                    response_mime_type="application/json",
                ),
            )

            return json.loads(response.text)

        except Exception as e:
            logger.error(f"비교 분석 실패: {str(e)}")
            raise

