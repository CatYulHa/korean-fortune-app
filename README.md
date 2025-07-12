# 🌟 AI 사주 보기 - 무료 사주운세 앱

인공지능과 전통 사주학이 만나 당신의 운명을 해석해드립니다!

## ✨ 주요 기능

- 🎂 **생년월일 사주**: 정확한 생년월일과 시간으로 사주팔자 계산
- 📝 **이름 사주**: 이름만으로도 간편하게 사주 확인
- 🤖 **AI 해석**: 무료 AI 모델을 이용한 상세한 운세 해석
- ⚡ **빠른 결과**: 1분 이내 빠른 사주 해석
- 📱 **모바일 최적화**: 반응형 디자인으로 모든 기기에서 사용 가능
- 💰 **광고 수익**: Google AdSense 연동으로 수익 창출

## 🚀 시작하기

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd saju-ai-app
```

### 2. 서버 의존성 설치
```bash
npm install
```

### 3. 클라이언트 의존성 설치
```bash
cd client
npm install
cd ..
```

### 4. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용을 추가하세요:
```
PORT=5000
HUGGING_FACE_API_KEY=your_hugging_face_api_key_here
GOOGLE_ADSENSE_CLIENT_ID=your_google_adsense_client_id_here
```

### 5. 개발 서버 실행

**방법 1: 개발 모드 (권장)**
```bash
# 터미널 1: 서버 실행
npm run dev

# 터미널 2: 클라이언트 실행
npm run client
```

**방법 2: 프로덕션 모드**
```bash
# 클라이언트 빌드
npm run build

# 서버 실행
npm start
```

### 6. 앱 접속
브라우저에서 `http://localhost:3000`으로 접속하세요!

## 🔧 설정 방법

### Google AdSense 설정
1. [Google AdSense](https://www.google.com/adsense/)에 가입
2. 사이트 추가 및 승인 받기
3. 광고 단위 생성
4. `client/src/components/AdSense.js`에서 `data-ad-client` 값 변경
5. `client/public/index.html`에서 AdSense 클라이언트 ID 변경

### Hugging Face API 설정 (선택사항)
1. [Hugging Face](https://huggingface.co/)에 가입
2. API 토큰 생성
3. `.env` 파일에 `HUGGING_FACE_API_KEY` 추가

**주의**: API 키가 없어도 기본 사주 해석이 제공됩니다.

## 📱 사용 방법

### 생년월일 사주
1. "생년월일 사주" 탭 선택
2. 이름, 성별, 생년월일, 시간 입력
3. "🔮 사주 보기" 버튼 클릭
4. AI 해석 결과 확인

### 이름 사주
1. "이름 사주" 탭 선택
2. 이름과 성별만 입력
3. "🔮 사주 보기" 버튼 클릭
4. 이름 기반 사주 해석 확인

## 🛠️ 기술 스택

### Frontend
- React 18
- CSS3 (Gradient, Animation)
- Responsive Design

### Backend
- Node.js
- Express.js
- 전통 사주 계산 알고리즘

### AI & APIs
- Hugging Face API (무료)
- Google AdSense
- Google Analytics (선택사항)

## 📊 수익 모델

- **Google AdSense**: 자동 광고 배치로 수익 창출
- **확장 가능**: 프리미엄 기능, 상세 해석 등 추가 수익 모델

## 🎨 커스터마이징

### 색상 테마 변경
`client/src/App.css`에서 그라디언트 색상 수정:
```css
background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
```

### 사주 해석 알고리즘 수정
`server.js`의 해석 함수들을 수정하여 더 정확한 사주 해석 제공

## 📈 성능 최적화

- 반응형 디자인으로 모든 기기 지원
- 빠른 로딩을 위한 코드 최적화
- SEO 최적화된 메타 태그

## 🔒 개인정보 보호

- 사용자 정보는 서버에 저장되지 않음
- 모든 계산은 실시간으로 처리
- HTTPS 사용 권장

## 🐛 트러블슈팅

### 서버 실행 오류
```bash
# 포트 충돌 시
PORT=5001 npm start
```

### 클라이언트 빌드 오류
```bash
# 의존성 재설치
cd client
rm -rf node_modules package-lock.json
npm install
```

### AdSense 광고 안 보임
1. AdSense 계정 승인 확인
2. 광고 차단 프로그램 비활성화
3. 실제 도메인에서 테스트

## 🚀 배포 방법

### Heroku 배포
```bash
# Heroku CLI 설치 후
heroku create your-app-name
git push heroku main
```

### Vercel 배포
```bash
# Vercel CLI 설치 후
vercel --prod
```

### 네이버 클라우드 플랫폼
1. 서버 인스턴스 생성
2. Node.js 환경 설정
3. 도메인 연결

## 📞 지원 및 문의

- 이슈 발생 시: GitHub Issues 활용
- 기능 제안: Pull Request 환영
- 상업적 이용: 별도 문의

## 📄 라이선스

MIT License - 상업적 이용 가능

---

**⚠️ 주의사항**: 본 서비스는 오락 목적으로 제공되며, 실제 중요한 결정은 전문가와 상담하시기 바랍니다. 