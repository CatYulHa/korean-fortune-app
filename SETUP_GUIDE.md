# 🚀 AI 사주 보기 - 설정 및 배포 가이드

## 📋 목차
1. [구글 애드센스 설정](#구글-애드센스-설정)
2. [환경 변수 설정](#환경-변수-설정)
3. [실제 서비스 배포](#실제-서비스-배포)
4. [배포 후 관리](#배포-후-관리)

## 1. 구글 애드센스 설정

### 1.1 애드센스 계정 생성
1. [Google AdSense](https://www.google.com/adsense/) 사이트 접속
2. 계정 생성 및 본인 인증
3. 웹사이트 추가 신청
4. 애드센스 정책 검토 및 승인 대기

### 1.2 애드센스 코드 삽입
승인 후 받은 코드를 다음과 같이 설정:

```javascript
// client/src/components/AdSense.js에서 수정
const AdSense = ({ 
  adClient = "ca-pub-YOUR_ACTUAL_CLIENT_ID", // 실제 클라이언트 ID
  adSlot = "YOUR_ACTUAL_SLOT_ID",           // 실제 슬롯 ID
  // ...
}) => {
```

### 1.3 주의사항
- 애드센스 승인까지 보통 1-2주 소요
- 콘텐츠 품질과 트래픽이 중요
- 정책 위반 시 계정 정지 가능

## 2. 환경 변수 설정

### 2.1 .env 파일 생성
프로젝트 루트에 `.env` 파일 생성:

```env
# 개발/프로덕션 환경
NODE_ENV=production
PORT=5000

# 구글 애드센스
GOOGLE_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXX
GOOGLE_ADSENSE_SLOT_ID=XXXXXXXXXX

# AI API (선택사항)
HUGGING_FACE_API_KEY=hf_your_api_key_here
```

### 2.2 환경 변수 보안
- `.env` 파일을 `.gitignore`에 추가
- 배포 시 호스팅 서비스의 환경 변수 설정 이용

## 3. 실제 서비스 배포

### 3.1 배포 준비
```bash
# 클라이언트 빌드
cd client
npm run build

# 서버 설정 확인
cd ..
npm install
```

### 3.2 추천 배포 방법

#### A. Vercel (추천 - 무료)
1. [Vercel](https://vercel.com) 계정 생성
2. GitHub 연동
3. 프로젝트 가져오기
4. 환경 변수 설정
5. 배포

```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel --prod
```

#### B. Netlify (무료)
1. [Netlify](https://netlify.com) 계정 생성
2. GitHub 연동
3. 빌드 설정:
   ```
   Build command: npm run build
   Publish directory: client/build
   ```

#### C. 네이버 클라우드 플랫폼
1. [네이버 클라우드](https://www.ncloud.com) 계정 생성
2. 서버 인스턴스 생성
3. Node.js 환경 설정
4. PM2로 프로세스 관리

```bash
# PM2 설치
npm install -g pm2

# 앱 실행
pm2 start server.js --name "saju-app"
```

### 3.3 도메인 설정
- 무료 도메인: 무료 DNS 서비스 이용
- 유료 도메인: 가비아, 후이즈, Cloudflare 등

### 3.4 SSL 인증서
- Let's Encrypt (무료)
- Cloudflare SSL (무료)
- 호스팅 서비스 기본 제공

## 4. 배포 후 관리

### 4.1 모니터링 도구
- Google Analytics: 사용자 분석
- Google Search Console: SEO 관리
- Sentry: 오류 추적
- Uptime Robot: 서버 상태 모니터링

### 4.2 성능 최적화
- CDN 사용 (Cloudflare)
- 이미지 압축
- 코드 분할 (Code Splitting)
- 캐싱 설정

### 4.3 SEO 최적화
- 메타 태그 설정
- 사이트맵 생성
- 구조화된 데이터 추가
- 페이지 속도 최적화

## 5. 수익화 전략

### 5.1 광고 수익
- Google AdSense 최적화
- 광고 위치 테스트
- 클릭률(CTR) 개선

### 5.2 추가 수익 모델
- 프리미엄 구독 서비스
- 상세 사주 해석 유료 서비스
- 사주 상담 예약 시스템
- 관련 상품 판매

### 5.3 트래픽 증가 방안
- 소셜 미디어 마케팅
- 검색 엔진 최적화
- 입소문 마케팅
- 콘텐츠 마케팅

## 6. 법적 고려사항

### 6.1 개인정보 보호
- 개인정보 처리방침 작성
- 이용약관 작성
- 쿠키 정책 고지

### 6.2 사업자 등록
- 광고 수익 발생 시 사업자 등록 필요
- 세금 신고 및 납부

## 7. 기술적 개선사항

### 7.1 데이터베이스 연동
- MongoDB, PostgreSQL 등
- 사용자 히스토리 저장
- 통계 데이터 수집

### 7.2 API 개선
- 사주 계산 정확도 향상
- 캐싱 시스템 도입
- 에러 핸들링 강화

### 7.3 보안 강화
- HTTPS 적용
- API 레이트 리미팅
- 입력 값 검증 강화

---

## 🎯 즉시 실행 가능한 단계

1. **Google AdSense 계정 생성** (1-2주 소요)
2. **Vercel에 배포** (30분 소요)
3. **도메인 연결** (1시간 소요)
4. **Google Analytics 설정** (30분 소요)
5. **SEO 최적화** (1-2일 소요)

## 📞 지원 및 문의

배포 과정에서 문제가 발생하면 언제든지 문의하세요! 