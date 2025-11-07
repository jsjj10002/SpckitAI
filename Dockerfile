# 빌드 스테이지
FROM node:20-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사 (있는 경우)
COPY package*.json ./

# 의존성 설치 (package-lock.json이 있으면 npm ci, 없으면 npm install)
RUN if [ -f package-lock.json ]; then npm ci; else npm install --production=false; fi

# 소스 코드 복사
COPY . .

# 프로덕션 빌드
RUN npm run build

# 프로덕션 스테이지
FROM node:20-alpine

# serve 패키지 전역 설치
RUN npm install -g serve

# 작업 디렉토리 설정
WORKDIR /app

# 빌드된 정적 파일 복사
COPY --from=builder /app/dist ./dist

# 포트 노출 (Cloud Run은 $PORT 환경 변수 사용)
EXPOSE 8080

# serve로 정적 파일 서빙 (Cloud Run의 $PORT 환경 변수 사용)
CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080}"]
