"""
Gemini API를 사용한 임베딩 생성기
"""
import google.generativeai as genai
from typing import List, Union
from loguru import logger
import time

from .config import GEMINI_API_KEY, EMBEDDING_MODEL


class GeminiEmbedder:
    """Gemini API를 사용하여 텍스트를 벡터로 임베딩하는 클래스"""

    def __init__(
        self,
        api_key: str = GEMINI_API_KEY,
        model: str = EMBEDDING_MODEL,
        task_type: str = "RETRIEVAL_DOCUMENT",
        max_retries: int = 3,
        retry_delay: float = 1.0,
    ):
        """
        Args:
            api_key: Gemini API 키
            model: 임베딩 모델 이름
            task_type: 임베딩 작업 유형 (RETRIEVAL_DOCUMENT, RETRIEVAL_QUERY 등)
            max_retries: 재시도 최대 횟수
            retry_delay: 재시도 대기 시간 (초)
        """
        self.api_key = api_key
        self.model = model
        self.task_type = task_type
        self.max_retries = max_retries
        self.retry_delay = retry_delay

        # Gemini API 설정
        genai.configure(api_key=self.api_key)
        logger.info(f"GeminiEmbedder 초기화 완료: model={model}")

    def embed_text(self, text: str, task_type: str = None) -> List[float]:
        """
        단일 텍스트를 임베딩

        Args:
            text: 임베딩할 텍스트
            task_type: 작업 유형 (기본값: 초기화 시 설정한 값)

        Returns:
            임베딩 벡터 (float 리스트)
        """
        task_type = task_type or self.task_type

        for attempt in range(self.max_retries):
            try:
                result = genai.embed_content(
                    model=self.model,
                    content=text,
                    task_type=task_type,
                )
                return result["embedding"]

            except Exception as e:
                logger.warning(
                    f"임베딩 생성 실패 (시도 {attempt + 1}/{self.max_retries}): {str(e)}"
                )
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay * (attempt + 1))
                else:
                    logger.error(f"임베딩 생성 최종 실패: {text[:50]}...")
                    raise

    def embed_batch(
        self, texts: List[str], task_type: str = None, batch_size: int = 500
    ) -> List[List[float]]:
        """
        여러 텍스트를 배치로 임베딩
        
        Gemini API의 배치 임베딩 기능을 활용하여 여러 텍스트를 한 번에 처리합니다.
        배치 크기 500은 대용량 데이터(10만개 이상) 처리 시 API 호출 횟수를 최소화하면서
        안정성을 유지하는 최적의 크기입니다.

        Args:
            texts: 임베딩할 텍스트 리스트
            task_type: 작업 유형
            batch_size: 배치 크기 (한 번의 API 호출로 처리할 텍스트 수, 기본값: 500)

        Returns:
            임베딩 벡터 리스트
        """
        task_type = task_type or self.task_type
        all_embeddings = []

        logger.info(f"{len(texts)}개의 텍스트를 임베딩 중...")

        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            logger.debug(
                f"배치 처리 중: {i + 1}-{min(i + batch_size, len(texts))}/{len(texts)}"
            )

            # 배치 전체를 한 번의 API 호출로 처리
            batch_success = False
            for attempt in range(self.max_retries):
                try:
                    # content 파라미터에 리스트를 전달하여 배치 처리 시도
                    # google-generativeai의 embed_content는 리스트를 지원할 수 있음
                    result = genai.embed_content(
                        model=self.model,
                        content=batch,  # 리스트를 전달하여 배치 처리
                        task_type=task_type,
                    )
                    
                    # 결과에서 임베딩 추출
                    # google-generativeai의 응답 구조 확인 필요
                    if isinstance(result, dict):
                        # 응답에 "embedding" 키가 있고 리스트인 경우 (배치 결과)
                        if "embedding" in result:
                            embedding_value = result["embedding"]
                            if isinstance(embedding_value, list) and len(embedding_value) > 0:
                                # 첫 번째 요소가 리스트인지 확인 (중첩 리스트)
                                if isinstance(embedding_value[0], list):
                                    # 배치 결과: [[emb1], [emb2], ...] 형식
                                    all_embeddings.extend(embedding_value)
                                elif isinstance(embedding_value[0], (int, float)):
                                    # 단일 임베딩 벡터인 경우 (배치가 아닌 경우)
                                    # 이 경우 배치가 지원되지 않으므로 개별 호출로 폴백
                                    logger.debug("배치가 지원되지 않는 것으로 보입니다. 개별 호출로 전환합니다.")
                                    raise ValueError("Batch not supported")
                                else:
                                    all_embeddings.extend(embedding_value)
                            else:
                                # 단일 임베딩 벡터
                                all_embeddings.append(embedding_value)
                        # 응답에 "embeddings" 키가 있는 경우 (복수형)
                        elif "embeddings" in result:
                            embeddings_list = result["embeddings"]
                            if isinstance(embeddings_list, list):
                                all_embeddings.extend(embeddings_list)
                            else:
                                raise ValueError(f"Unexpected embeddings format: {type(embeddings_list)}")
                        else:
                            # 예상치 못한 응답 형식
                            logger.debug(f"예상치 못한 응답 키: {result.keys()}")
                            raise ValueError(f"Unexpected response format: {list(result.keys())}")
                    else:
                        # dict가 아닌 경우
                        logger.debug(f"예상치 못한 응답 타입: {type(result)}")
                        raise ValueError(f"Unexpected response type: {type(result)}")
                    
                    batch_success = True
                    break  # 성공 시 재시도 루프 탈출

                except (ValueError, TypeError, KeyError) as e:
                    # 배치가 지원되지 않거나 응답 형식이 다른 경우
                    logger.debug(f"배치 처리 시도 실패: {str(e)}. 개별 호출로 전환합니다.")
                    break  # 개별 호출로 전환
                except Exception as e:
                    logger.warning(
                        f"배치 임베딩 실패 (시도 {attempt + 1}/{self.max_retries}): {str(e)}"
                    )
                    if attempt < self.max_retries - 1:
                        time.sleep(self.retry_delay * (attempt + 1))
                    else:
                        # 최종 실패 시 개별 호출로 폴백
                        logger.warning("배치 처리 최종 실패. 개별 호출로 전환합니다.")
                        break
            
            # 배치 처리 실패 시 개별 호출로 폴백
            if not batch_success:
                logger.debug(f"배치 {i // batch_size + 1}: 개별 호출로 처리 중...")
                for text in batch:
                    try:
                        embedding = self.embed_text(text, task_type)
                        all_embeddings.append(embedding)
                    except Exception as e2:
                        logger.error(f"개별 임베딩 실패: {text[:50]}... - {str(e2)}")
                        raise

            # API 레이트 리밋 방지 (배치 간 대기)
            if i + batch_size < len(texts):
                time.sleep(0.5)

        logger.info(f"임베딩 완료: {len(all_embeddings)}개")
        return all_embeddings

    def embed_query(self, query: str) -> List[float]:
        """
        검색 쿼리를 임베딩

        Args:
            query: 검색 쿼리

        Returns:
            임베딩 벡터
        """
        return self.embed_text(query, task_type="RETRIEVAL_QUERY")

    def embed_document(self, document: str) -> List[float]:
        """
        문서를 임베딩

        Args:
            document: 문서 텍스트

        Returns:
            임베딩 벡터
        """
        return self.embed_text(document, task_type="RETRIEVAL_DOCUMENT")

