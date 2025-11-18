# Backend API

백엔드 API 서버 디렉토리입니다.

## 현재 구조

```
backend/
├── rag/                  # RAG 시스템 구현
│   ├── __init__.py
│   ├── config.py         # 설정 파일
│   ├── embedder.py       # Gemini 임베딩 생성기
│   ├── vector_store.py   # ChromaDB 벡터 데이터베이스
│   ├── retriever.py      # 부품 검색기
│   ├── generator.py      # 추천 응답 생성기
│   ├── data_parser.py    # SQL 데이터 파서
│   └── pipeline.py       # RAG 파이프라인 통합
│
├── api/                  # FastAPI 서버
│   ├── __init__.py
│   └── main.py           # API 엔드포인트
│
├── scripts/              # 유틸리티 스크립트
│   ├── __init__.py
│   ├── init_database.py  # DB 초기화 스크립트
│   └── test_rag.py       # RAG 시스템 테스트
│
├── data/                 # 데이터베이스 파일 (RAG 구현 준비)
│   ├── pc_data_dump.sql         # PC 부품 데이터 덤프 (11MB)
│   ├── PC 부품 DB 스키마 가이드.pdf
│   └── README.md
│
├── prompts/              # 프롬프트 관리
│   ├── system-instruction.js
│   ├── user-prompt-template.js
│   ├── index.js
│   └── README.md
│
├── chroma_db/            # ChromaDB 저장 디렉토리 (자동 생성)
├── pyproject.toml        # uv 패키지 관리
├── .env.example          # 환경 변수 예시
└── README.md             # 이 파일
```

## RAG 시스템 구현

### 1. 설치 및 환경 설정

```bash
# uv 설치 (https://github.com/astral-sh/uv)
pip install uv

# 프로젝트 의존성 설치
cd backend
uv pip install -e .

# 개발 의존성 포함
uv pip install -e ".[dev]"
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 API 키를 설정하세요:

```bash
cp .env.example .env
# .env 파일을 편집하여 GEMINI_API_KEY를 설정
```

### 3. 벡터 데이터베이스 초기화

SQL 덤프 파일을 파싱하고 ChromaDB에 임베딩하여 저장:

```bash
# 프로젝트 루트로 이동 (중요!)
cd ..

# 처음 초기화 (10-30분 소요)
python backend/scripts/init_database.py

# 기존 데이터를 삭제하고 재구축
python backend/scripts/init_database.py --force

# 로그 레벨 설정
python backend/scripts/init_database.py --log-level DEBUG
```

**주의**: 스크립트는 프로젝트 루트에서 실행해야 합니다.

### 4. RAG 시스템 테스트

```bash
python backend/scripts/test_rag.py
```

### 5. API 서버 실행

```bash
# 개발 서버 실행
cd backend/api
uvicorn main:app --reload --port 8000

# 또는 직접 실행
python backend/api/main.py
```

API 문서는 브라우저에서 확인:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API 엔드포인트

### GET /
헬스 체크

### GET /health
시스템 상태 확인

### POST /query
PC 부품 추천 쿼리

**요청 예시:**
```json
{
  "query": "게임용 고성능 그래픽카드 추천해줘",
  "top_k": 5,
  "category": "gpu",
  "include_context": false
}
```

### POST /query-by-specs
사양 기반 부품 추천

**요청 예시:**
```json
{
  "budget": 150,
  "purpose": "게임",
  "categories": ["cpu", "gpu", "memory"],
  "top_k": 3
}
```

### POST /compare
부품 비교

**요청 예시:**
```json
{
  "component_ids": ["gpu_1", "gpu_2", "gpu_3"]
}
```

### GET /stats
시스템 통계 조회

## RAG 시스템 구성

### 1. Embedder (embedder.py)
- Gemini API를 사용한 텍스트 임베딩 생성
- 배치 처리 및 재시도 로직 포함
- 모델: `text-embedding-004` (768 차원)

### 2. Vector Store (vector_store.py)
- ChromaDB를 사용한 벡터 데이터베이스
- 코사인 유사도 기반 검색
- 영구 저장 지원

### 3. Data Parser (data_parser.py)
- SQL 덤프 파일 파싱
- 부품 정보 추출 및 문서화
- 메타데이터 구조화

### 4. Retriever (retriever.py)
- 의미 기반 부품 검색
- 카테고리 필터링
- 사양 기반 검색

### 5. Generator (generator.py)
- Gemini API를 사용한 추천 생성
- JSON 형식 응답
- 부품 비교 분석

### 6. Pipeline (pipeline.py)
- 전체 RAG 시스템 통합
- 워크플로우 자동화
- 엔드-투-엔드 처리

## 향후 계획

- [x] RAG 검색 API (SQL 데이터베이스 기반)
  - `data/pc_data_dump.sql`을 데이터베이스에 임포트 ✅
  - 벡터 데이터베이스 구축 (Gemini Embeddings + ChromaDB) ✅
  - 부품 정보 임베딩 및 검색 API 개발 ✅
- [ ] 3D 에셋 메타데이터 API
- [ ] 부품 호환성 검사 API
- [ ] Gemini API 프록시 (보안 강화)
- [ ] 프롬프트 버전 관리 시스템
- [ ] 프롬프트 A/B 테스트

## 기술 스택

- **Python 3.10+**
- **Gemini API**: 임베딩 및 생성 모델
- **ChromaDB**: 벡터 데이터베이스
- **FastAPI**: API 서버
- **uv**: 패키지 관리
- **Loguru**: 로깅

## 문제 해결

### ChromaDB 초기화 오류
```bash
# ChromaDB 디렉토리 삭제 후 재시도
rm -rf backend/chroma_db
python backend/scripts/init_database.py
```

### Gemini API 키 오류
`.env` 파일에 올바른 API 키가 설정되어 있는지 확인하세요.

### 임포트 에러
프로젝트 루트에서 실행하고 있는지 확인하세요:
```bash
# 프로젝트 루트로 이동
cd /path/to/SpckitAI

# 스크립트 실행
python backend/scripts/init_database.py
```
