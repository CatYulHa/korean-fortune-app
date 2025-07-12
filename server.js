const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const moment = require('moment-timezone');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors());
app.use(express.json());

// 개발/프로덕션 환경 구분
const isProduction = process.env.NODE_ENV === 'production';

// 프로덕션 환경에서만 정적 파일 제공
if (isProduction) {
  app.use(express.static(path.join(__dirname, 'client/build')));
}

// 사주 계산 유틸리티 함수들
const sajuUtils = {
  // 천간 (10개)
  heavenlyStems: ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'],
  
  // 지지 (12개)
  earthlyBranches: ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'],
  
  // 십이지지 동물
  zodiacAnimals: ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'],
  
  // 오행
  elements: ['목', '화', '토', '금', '수'],
  
  // 년도에서 간지 계산
  getYearGanJi: function(year) {
    const ganIndex = (year - 4) % 10;
    const jiIndex = (year - 4) % 12;
    return {
      gan: this.heavenlyStems[ganIndex],
      ji: this.earthlyBranches[jiIndex],
      zodiac: this.zodiacAnimals[jiIndex]
    };
  },
  
  // 월에서 간지 계산
  getMonthGanJi: function(year, month) {
    const yearGan = (year - 4) % 10;
    const monthGanBase = (yearGan % 5) * 2;
    const ganIndex = (monthGanBase + month - 1) % 10;
    const jiIndex = (month + 1) % 12;
    return {
      gan: this.heavenlyStems[ganIndex],
      ji: this.earthlyBranches[jiIndex]
    };
  },
  
  // 일에서 간지 계산 (간단한 공식 사용)
  getDayGanJi: function(year, month, day) {
    const date = new Date(year, month - 1, day);
    const daysSince1900 = Math.floor((date - new Date(1900, 0, 1)) / (1000 * 60 * 60 * 24));
    const ganIndex = (daysSince1900 + 1) % 10;
    const jiIndex = (daysSince1900 + 1) % 12;
    return {
      gan: this.heavenlyStems[ganIndex],
      ji: this.earthlyBranches[jiIndex]
    };
  },
  
  // 시간에서 간지 계산
  getTimeGanJi: function(hour, dayGan) {
    const timeIndex = Math.floor(hour / 2);
    const dayGanIndex = this.heavenlyStems.indexOf(dayGan);
    const ganIndex = (dayGanIndex * 2 + timeIndex) % 10;
    return {
      gan: this.heavenlyStems[ganIndex],
      ji: this.earthlyBranches[timeIndex]
    };
  }
};

// 무료 AI API 호출 함수 (Hugging Face 사용)
async function getAIFortune(sajuData, name, gender) {
  try {
    const prompt = `
사주 정보:
- 년주: ${sajuData.year.gan}${sajuData.year.ji} (${sajuData.year.zodiac})
- 월주: ${sajuData.month.gan}${sajuData.month.ji}
- 일주: ${sajuData.day.gan}${sajuData.day.ji}
- 시주: ${sajuData.time.gan}${sajuData.time.ji}
- 이름: ${name}
- 성별: ${gender}

위 사주 정보를 바탕으로 한국 전통 사주 해석을 해주세요. 
성격, 운세, 직업운, 연애운, 건강운, 재물운을 포함해서 상세히 분석해주세요.
긍정적이고 희망적인 메시지로 작성해주세요.
`;

    // Hugging Face API 호출 (무료)
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
      {
        inputs: prompt,
        parameters: {
          max_length: 500,
          temperature: 0.7
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY || 'hf_demo_key'}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data[0]?.generated_text || generateBasicFortune(sajuData, name, gender);
  } catch (error) {
    console.error('AI API 호출 실패:', error.message);
    // AI 호출 실패 시 기본 해석 제공
    return generateBasicFortune(sajuData, name, gender);
  }
}

// 기본 운세 해석 함수 (AI 호출 실패 시 백업)
function generateBasicFortune(sajuData, name, gender) {
  const yearElement = getElementFromGanJi(sajuData.year.gan, sajuData.year.ji);
  const monthElement = getElementFromGanJi(sajuData.month.gan, sajuData.month.ji);
  
  return `
🌟 ${name}님의 사주 해석 🌟

📅 사주팔자
• 년주: ${sajuData.year.gan}${sajuData.year.ji} (${sajuData.year.zodiac}띠)
• 월주: ${sajuData.month.gan}${sajuData.month.ji}
• 일주: ${sajuData.day.gan}${sajuData.day.ji}
• 시주: ${sajuData.time.gan}${sajuData.time.ji}

💎 성격 분석
${sajuData.year.zodiac}띠 성격을 가진 당신은 ${getPersonalityByZodiac(sajuData.year.zodiac)}

🍀 전체 운세
당신의 사주는 ${yearElement} 기운이 강하여 ${getFortuneByElement(yearElement)}

💼 직업운
${getCareerFortune(sajuData)}

💕 연애운
${getLoveFortune(sajuData, gender)}

💰 재물운
${getWealthFortune(sajuData)}

🏥 건강운
${getHealthFortune(sajuData)}

✨ 조언
${getAdvice(sajuData)}
`;
}

// 오행 계산 함수
function getElementFromGanJi(gan, ji) {
  const ganElements = {
    '갑': '목', '을': '목', '병': '화', '정': '화', '무': '토',
    '기': '토', '경': '금', '신': '금', '임': '수', '계': '수'
  };
  return ganElements[gan] || '토';
}

// 띠별 성격 분석
function getPersonalityByZodiac(zodiac) {
  const personalities = {
    '쥐': '똑똑하고 재치있으며 적응력이 뛰어납니다.',
    '소': '성실하고 끈기있으며 신뢰할 수 있습니다.',
    '호랑이': '용감하고 리더십이 있으며 정의감이 강합니다.',
    '토끼': '온화하고 예술적 감각이 있으며 평화를 추구합니다.',
    '용': '카리스마가 있고 야심찬 꿈을 추구합니다.',
    '뱀': '지혜롭고 직감이 뛰어나며 신중합니다.',
    '말': '활동적이고 자유로우며 모험을 좋아합니다.',
    '양': '친절하고 예술적이며 조화를 중시합니다.',
    '원숭이': '영리하고 유머러스하며 창의적입니다.',
    '닭': '정확하고 책임감이 있으며 완벽주의적입니다.',
    '개': '충실하고 정직하며 정의감이 강합니다.',
    '돼지': '관대하고 성실하며 인정이 많습니다.'
  };
  return personalities[zodiac] || '특별한 매력을 가지고 있습니다.';
}

// 오행별 운세
function getFortuneByElement(element) {
  const fortunes = {
    '목': '성장과 발전의 기운이 강합니다. 새로운 시작에 좋은 시기입니다.',
    '화': '열정과 활력이 넘칩니다. 인기운이 상승하고 있습니다.',
    '토': '안정과 포용의 기운이 있습니다. 신뢰받는 시기입니다.',
    '금': '결단력과 의지가 강합니다. 성과를 거두는 시기입니다.',
    '수': '지혜와 유연성이 돋보입니다. 적응력이 뛰어난 시기입니다.'
  };
  return fortunes[element] || '균형잡힌 좋은 운세를 가지고 있습니다.';
}

// 직업운 분석
function getCareerFortune(sajuData) {
  return `${sajuData.day.gan}일간의 특성상 창의적이고 전문적인 분야에서 두각을 나타낼 것입니다. 꾸준한 노력으로 큰 성과를 거둘 수 있는 시기입니다.`;
}

// 연애운 분석
function getLoveFortune(sajuData, gender) {
  const genderText = gender === 'male' ? '남성' : '여성';
  return `${genderText}으로서 매력적인 면모를 가지고 있습니다. ${sajuData.year.zodiac}띠의 특성상 진실한 사랑을 만날 가능성이 높습니다.`;
}

// 재물운 분석
function getWealthFortune(sajuData) {
  return `${sajuData.month.gan}월간의 영향으로 점진적인 재물 증가가 예상됩니다. 투자보다는 저축을 통한 안정적인 재물 관리가 좋겠습니다.`;
}

// 건강운 분석
function getHealthFortune(sajuData) {
  return `전반적으로 건강한 체질을 가지고 있습니다. 규칙적인 생활과 적절한 운동으로 더욱 건강한 삶을 유지할 수 있을 것입니다.`;
}

// 조언
function getAdvice(sajuData) {
  return `당신의 사주는 ${sajuData.year.zodiac}띠의 긍정적인 면이 잘 나타나 있습니다. 자신감을 가지고 목표를 향해 나아가세요. 주변 사람들과의 조화를 이루며 살아가시면 더 큰 행복을 얻을 수 있을 것입니다.`;
}

// API 라우트들
app.post('/api/saju', async (req, res) => {
  try {
    console.log('사주 API 호출됨:', req.body); // 디버그 로그 추가
    
    const { year, month, day, hour, minute, name, gender } = req.body;
    
    // 입력 검증
    if (!year || !month || !day || !name || !gender) {
      return res.status(400).json({ error: '필수 정보가 누락되었습니다.' });
    }

    // 사주 계산
    const sajuData = {
      year: sajuUtils.getYearGanJi(year),
      month: sajuUtils.getMonthGanJi(year, month),
      day: sajuUtils.getDayGanJi(year, month, day),
      time: sajuUtils.getTimeGanJi(hour || 12, sajuUtils.getDayGanJi(year, month, day).gan)
    };

    // AI 운세 해석
    const fortune = await getAIFortune(sajuData, name, gender);

    res.json({
      success: true,
      data: {
        sajuData,
        fortune,
        name,
        gender,
        birthDate: { year, month, day, hour: hour || 12, minute: minute || 0 }
      }
    });

  } catch (error) {
    console.error('사주 계산 오류:', error);
    res.status(500).json({ error: '사주 계산 중 오류가 발생했습니다.' });
  }
});

// 이름 사주 API
app.post('/api/name-saju', async (req, res) => {
  try {
    console.log('이름 사주 API 호출됨:', req.body); // 디버그 로그 추가
    
    const { name, gender } = req.body;
    
    if (!name || !gender) {
      return res.status(400).json({ error: '이름과 성별을 입력해주세요.' });
    }

    // 이름 기반 간단한 사주 해석
    const nameAnalysis = analyzeNameSaju(name, gender);
    
    res.json({
      success: true,
      data: nameAnalysis
    });

  } catch (error) {
    console.error('이름 사주 오류:', error);
    res.status(500).json({ error: '이름 사주 해석 중 오류가 발생했습니다.' });
  }
});

// 이름 사주 분석 함수
function analyzeNameSaju(name, gender) {
  const nameLength = name.length;
  const firstChar = name.charAt(0);
  const lastChar = name.charAt(name.length - 1);
  
  const analysis = `
🌟 ${name}님의 이름 사주 🌟

📝 이름 분석
• 이름: ${name} (${nameLength}글자)
• 성별: ${gender === 'male' ? '남성' : '여성'}

💎 이름에 담긴 의미
${getNameMeaning(name)}

🍀 이름 운세
${getNameFortune(name, gender)}

💼 직업운
이름의 기운이 ${getNameCareer(name)}

💕 인간관계
${getNameRelationship(name)}

✨ 이름 조언
${getNameAdvice(name)}
`;

  return {
    name,
    gender,
    analysis,
    nameLength,
    firstChar,
    lastChar
  };
}

function getNameMeaning(name) {
  const meanings = [
    '아름다운 의미를 담고 있는 이름입니다.',
    '희망과 밝음을 상징하는 이름입니다.',
    '지혜와 총명함을 나타내는 이름입니다.',
    '성실함과 착함을 의미하는 이름입니다.',
    '건강과 장수를 기원하는 이름입니다.'
  ];
  return meanings[name.length % meanings.length];
}

function getNameFortune(name, gender) {
  const fortunes = [
    '전반적으로 운이 좋은 이름입니다.',
    '인기운이 상승하는 이름입니다.',
    '재물운이 따르는 이름입니다.',
    '건강운이 좋은 이름입니다.',
    '사랑운이 풍부한 이름입니다.'
  ];
  return fortunes[(name.charCodeAt(0) + name.charCodeAt(name.length-1)) % fortunes.length];
}

function getNameCareer(name) {
  const careers = [
    '창의적인 분야에서 성공할 가능성이 높습니다.',
    '리더십을 발휘하는 직업에 적합합니다.',
    '전문직에서 인정받을 수 있습니다.',
    '사람들과 소통하는 일에 재능이 있습니다.',
    '예술적 감각을 활용한 일에 좋습니다.'
  ];
  return careers[name.length % careers.length];
}

function getNameRelationship(name) {
  return `${name}님은 주변 사람들에게 신뢰를 받는 성격으로, 좋은 인간관계를 유지할 수 있습니다.`;
}

function getNameAdvice(name) {
  return `${name}이라는 이름은 긍정적인 에너지를 가지고 있습니다. 자신감을 가지고 도전하시면 좋은 결과를 얻을 수 있을 것입니다.`;
}

// 헬스체크 엔드포인트 추가
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: '서버가 정상 작동 중입니다.' });
});

// 오늘의 운세 API 추가
app.post('/api/daily-fortune', async (req, res) => {
  try {
    console.log('오늘의 운세 API 호출됨:', req.body);
    
    const { name, gender, birthYear } = req.body;
    
    if (!name || !gender) {
      return res.status(400).json({ error: '이름과 성별을 입력해주세요.' });
    }

    // 오늘 날짜 기반 운세 생성
    const today = new Date();
    const dailyFortune = generateDailyFortune(name, gender, birthYear, today);
    
    res.json({
      success: true,
      data: dailyFortune
    });

  } catch (error) {
    console.error('오늘의 운세 오류:', error);
    res.status(500).json({ error: '오늘의 운세 조회 중 오류가 발생했습니다.' });
  }
});

// 이번 주 운세 API 추가
app.post('/api/weekly-fortune', async (req, res) => {
  try {
    console.log('이번 주 운세 API 호출됨:', req.body);
    
    const { name, gender, birthYear } = req.body;
    
    if (!name || !gender) {
      return res.status(400).json({ error: '이름과 성별을 입력해주세요.' });
    }

    const today = new Date();
    const weeklyFortune = generateWeeklyFortune(name, gender, birthYear, today);
    
    res.json({
      success: true,
      data: weeklyFortune
    });

  } catch (error) {
    console.error('이번 주 운세 오류:', error);
    res.status(500).json({ error: '이번 주 운세 조회 중 오류가 발생했습니다.' });
  }
});

// 띠별 오늘의 운세 API
app.get('/api/zodiac-daily', (req, res) => {
  try {
    const today = new Date();
    const zodiacFortunesDaily = generateZodiacDailyFortune(today);
    
    res.json({
      success: true,
      data: zodiacFortunesDaily
    });

  } catch (error) {
    console.error('띠별 운세 오류:', error);
    res.status(500).json({ error: '띠별 운세 조회 중 오류가 발생했습니다.' });
  }
});

// 오늘의 운세 생성 함수
function generateDailyFortune(name, gender, birthYear, date) {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const nameHash = name.split('').reduce((hash, char) => hash + char.charCodeAt(0), 0);
  const seed = dayOfYear + nameHash + (birthYear || 1990);
  
  // 시드 기반 랜덤 생성 (같은 날 같은 결과)
  const random = (seed * 9301 + 49297) % 233280 / 233280;
  
  const luckScores = {
    overall: Math.floor(random * 100) + 1,
    love: Math.floor((random * 123) % 100) + 1,
    money: Math.floor((random * 456) % 100) + 1,
    health: Math.floor((random * 789) % 100) + 1,
    work: Math.floor((random * 321) % 100) + 1
  };
  
  const luckColors = ['빨강', '파랑', '노랑', '초록', '보라', '주황', '분홍', '흰색', '검정', '금색'];
  const luckyColor = luckColors[Math.floor(random * luckColors.length)];
  
  const luckyNumbers = Array.from({length: 3}, (_, i) => 
    Math.floor((random * (i + 1) * 789) % 100) + 1
  );

  const dailyMessages = [
    '오늘은 새로운 기회가 찾아올 날입니다.',
    '작은 친절이 큰 행운을 가져다 줄 것입니다.',
    '오늘 만나는 사람들과의 대화가 도움이 될 것입니다.',
    '계획했던 일을 실행에 옮기기 좋은 날입니다.',
    '주변 사람들의 조언에 귀를 기울여보세요.',
    '오늘은 휴식과 재충전이 필요한 날입니다.',
    '새로운 도전을 시작하기 좋은 시기입니다.',
    '가족이나 친구와 좋은 시간을 보낼 수 있을 것입니다.'
  ];
  
  const todayMessage = dailyMessages[Math.floor(random * dailyMessages.length)];
  
  return {
    date: date.toISOString().split('T')[0],
    name,
    gender,
    luckScores,
    luckyColor,
    luckyNumbers,
    todayMessage,
    detailedFortune: `
🌟 ${name}님의 ${date.getMonth() + 1}월 ${date.getDate()}일 운세 🌟

📊 오늘의 운세 점수
• 종합운: ${luckScores.overall}점
• 연애운: ${luckScores.love}점  
• 재물운: ${luckScores.money}점
• 건강운: ${luckScores.health}점
• 직장운: ${luckScores.work}점

🎨 오늘의 행운 컬러: ${luckyColor}
🔢 행운의 숫자: ${luckyNumbers.join(', ')}

💫 오늘의 메시지
${todayMessage}

✨ 오늘의 조언
${getLuckAdvice(luckScores.overall)}
`
  };
}

// 이번 주 운세 생성 함수
function generateWeeklyFortune(name, gender, birthYear, date) {
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - date.getDay());
  
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const weeklyFortunes = weekDays.map((day, index) => {
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + index);
    const dailyData = generateDailyFortune(name, gender, birthYear, dayDate);
    
    return {
      day,
      date: dayDate.getDate(),
      overall: dailyData.luckScores.overall,
      message: dailyData.todayMessage
    };
  });
  
  return {
    weekStart: weekStart.toISOString().split('T')[0],
    name,
    weeklyFortunes,
    weeklyAdvice: getWeeklyAdvice(weeklyFortunes)
  };
}

// 띠별 오늘의 운세 생성
function generateZodiacDailyFortune(date) {
  const zodiacAnimals = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  
  return zodiacAnimals.map((animal, index) => {
    const seed = dayOfYear + index * 123;
    const random = (seed * 9301 + 49297) % 233280 / 233280;
    const score = Math.floor(random * 100) + 1;
    
    return {
      zodiac: animal,
      score,
      rank: 0, // 나중에 정렬 후 순위 매김
      message: getZodiacDailyMessage(animal, score)
    };
  }).sort((a, b) => b.score - a.score)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

function getLuckAdvice(score) {
  if (score >= 80) return '오늘은 모든 일이 순조롭게 풀릴 것입니다. 적극적으로 행동하세요!';
  if (score >= 60) return '전반적으로 좋은 하루가 될 것입니다. 긍정적인 마음가짐을 유지하세요.';
  if (score >= 40) return '평범한 하루가 될 것 같습니다. 작은 것에 감사하는 마음을 가져보세요.';
  return '오늘은 조금 조심스럽게 행동하는 것이 좋겠습니다. 무리하지 마세요.';
}

function getWeeklyAdvice(weeklyFortunes) {
  const avgScore = weeklyFortunes.reduce((sum, day) => sum + day.overall, 0) / 7;
  
  if (avgScore >= 70) return '이번 주는 전반적으로 좋은 운세입니다. 새로운 도전을 시작해보세요!';
  if (avgScore >= 50) return '이번 주는 안정적인 운세입니다. 꾸준히 노력하면 좋은 결과가 있을 것입니다.';
  return '이번 주는 신중하게 행동하는 것이 좋겠습니다. 휴식과 재충전의 시간으로 활용하세요.';
}

function getZodiacDailyMessage(animal, score) {
  const messages = {
    '쥐': score >= 70 ? '오늘은 기회가 많이 찾아올 것입니다.' : '신중한 판단이 필요한 날입니다.',
    '소': score >= 70 ? '꾸준한 노력이 결실을 맺을 날입니다.' : '참을성을 가지고 기다리는 것이 좋습니다.',
    '호랑이': score >= 70 ? '리더십을 발휘할 기회가 올 것입니다.' : '성급한 결정은 피하는 것이 좋습니다.',
    '토끼': score >= 70 ? '평화롭고 행복한 하루가 될 것입니다.' : '조용히 자신만의 시간을 가져보세요.',
    '용': score >= 70 ? '큰 성과를 거둘 수 있는 날입니다.' : '겸손한 자세를 유지하는 것이 좋습니다.',
    '뱀': score >= 70 ? '직감이 뛰어난 날입니다. 믿고 행동하세요.' : '신중하게 생각한 후 행동하세요.',
    '말': score >= 70 ? '활발한 활동이 좋은 결과를 가져올 것입니다.' : '무리한 일정은 피하는 것이 좋습니다.',
    '양': score >= 70 ? '주변 사람들과의 화합이 중요한 날입니다.' : '혼자만의 시간이 필요할 수 있습니다.',
    '원숭이': score >= 70 ? '창의적인 아이디어가 빛을 발할 것입니다.' : '계획을 차근차근 세워보세요.',
    '닭': score >= 70 ? '세심한 준비가 성공으로 이어질 것입니다.' : '완벽을 추구하기보다 적당히 타협하세요.',
    '개': score >= 70 ? '진실된 마음이 통하는 날입니다.' : '신뢰할 만한 사람들과 시간을 보내세요.',
    '돼지': score >= 70 ? '관대한 마음이 복을 부를 것입니다.' : '절약하는 마음가짐이 필요한 날입니다.'
  };
  
  return messages[animal] || '오늘도 좋은 하루 되세요!';
}

// 프로덕션 환경에서만 React 앱 제공
if (isProduction) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행중입니다.`);
  console.log(`📍 환경: ${isProduction ? 'Production' : 'Development'}`);
  if (!isProduction) {
    console.log('🔗 API 테스트: http://localhost:5000/api/health');
  }
}); 