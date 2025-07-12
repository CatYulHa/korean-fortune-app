const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 AI 사주 보기 앱 빌드 시작...\n');

// 1. 클라이언트 빌드
console.log('📦 클라이언트 빌드 중...');
try {
  execSync('cd client && npm run build', { stdio: 'inherit' });
  console.log('✅ 클라이언트 빌드 완료\n');
} catch (error) {
  console.error('❌ 클라이언트 빌드 실패:', error.message);
  process.exit(1);
}

// 2. 서버 의존성 확인
console.log('🔍 서버 의존성 확인 중...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ 서버 의존성 설치 완료\n');
} catch (error) {
  console.error('❌ 서버 의존성 설치 실패:', error.message);
  process.exit(1);
}

// 3. 빌드 결과 확인
const buildPath = path.join(__dirname, 'client', 'build');
if (fs.existsSync(buildPath)) {
  console.log('✅ 빌드 파일 확인 완료');
  
  // 빌드 파일 크기 확인
  const indexPath = path.join(buildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    const stats = fs.statSync(indexPath);
    console.log(`📊 index.html 크기: ${(stats.size / 1024).toFixed(2)}KB`);
  }
  
  // 정적 파일 확인
  const staticPath = path.join(buildPath, 'static');
  if (fs.existsSync(staticPath)) {
    const jsFiles = fs.readdirSync(path.join(staticPath, 'js')).filter(f => f.endsWith('.js'));
    const cssFiles = fs.readdirSync(path.join(staticPath, 'css')).filter(f => f.endsWith('.css'));
    console.log(`📄 JS 파일: ${jsFiles.length}개`);
    console.log(`🎨 CSS 파일: ${cssFiles.length}개`);
  }
} else {
  console.error('❌ 빌드 파일을 찾을 수 없습니다');
  process.exit(1);
}

// 4. 환경 변수 확인
console.log('\n🔧 환경 변수 확인:');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env 파일 존재');
} else {
  console.log('⚠️  .env 파일 없음 (선택사항)');
}

// 5. 배포 준비 완료
console.log('\n🎉 빌드 완료!');
console.log('📋 배포 준비 사항:');
console.log('  1. 환경 변수 설정 (.env 파일 또는 호스팅 서비스)');
console.log('  2. 구글 애드센스 코드 업데이트');
console.log('  3. 도메인 연결');
console.log('  4. SSL 인증서 설정');
console.log('\n🚀 배포 명령어:');
console.log('  Vercel: vercel --prod');
console.log('  Netlify: netlify deploy --prod');
console.log('  로컬 테스트: npm start');
console.log('\n📖 자세한 가이드: SETUP_GUIDE.md 참조'); 