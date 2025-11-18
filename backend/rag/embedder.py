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
        self, texts: List[str], task_type: str = None, batch_size: int = 100
    ) -> List[List[float]]:
        """
        여러 텍스트를 배치로 임베딩

        Args:
            texts: 임베딩할 텍스트 리스트
            task_type: 작업 유형
            batch_size: 배치 크기

        Returns:
            임베딩 벡터 리스트
        """
        task_type = task_type or self.task_type
        embeddings = []

        logger.info(f"{len(texts)}개의 텍스트를 임베딩 중...")

        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            logger.debug(
                f"배치 처리 중: {i + 1}-{min(i + batch_size, len(texts))}/{len(texts)}"
            )

            for text in batch:
                embedding = self.embed_text(text, task_type)
                embeddings.append(embedding)

            # API 레이트 리밋 방지
            if i + batch_size < len(texts):
                time.sleep(0.5)

        logger.info(f"임베딩 완료: {len(embeddings)}개")
        return embeddings

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

