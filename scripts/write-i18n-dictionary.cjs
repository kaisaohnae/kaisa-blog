const fs = require('fs');
const path = require('path');

const dictionary = {
  Login: {ko: '로그인', zh: '登录', hi: 'लॉगिन'},
  Register: {ko: '회원가입', zh: '注册', hi: 'पंजीकरण'},
  Email: {ko: '이메일', zh: '邮箱', hi: 'ईमेल'},
  Password: {ko: '비밀번호', zh: '密码', hi: 'पासवर्ड'},
  'Confirm password': {ko: '비밀번호 확인', zh: '确认密码', hi: 'पासवर्ड पुष्टि'},
  'Save email': {ko: '아이디 저장', zh: '保存账号', hi: 'ईमेल सहेजें'},
  Member: {ko: 'Member', zh: 'Member', hi: 'Member'},
  'Complete the robot check.': {
    ko: '로봇 방지 확인을 완료해 주세요.',
    zh: '请完成人机验证。',
    hi: 'रोबोट जांच पूरी करें।'
  },
  'Login failed.': {ko: '로그인에 실패했습니다.', zh: '登录失败。', hi: 'लॉगिन विफल।'},
  'No account? ': {ko: '계정이 없으면 ', zh: '没有账号？', hi: 'खाता नहीं है? '},
  'Find ID': {ko: '아이디 찾기', zh: '找回账号', hi: 'आईडी खोजें'},
  'Forgot password': {ko: '비밀번호 찾기', zh: '找回密码', hi: 'पासवर्ड भूल गए'},
  'Send verification code': {ko: '인증번호 받기', zh: '获取验证码', hi: 'सत्यापन कोड भेजें'},
  '6-digit code': {ko: '인증번호 6자리', zh: '6位验证码', hi: '6 अंकों का कोड'},
  Nickname: {ko: '닉네임', zh: '昵称', hi: 'उपनाम'},
  Resend: {ko: '다시 받기', zh: '重新发送', hi: 'फिर भेजें'},
  'Sign up': {ko: '가입하기', zh: '注册', hi: 'साइन अप'},
  'Already have an account? ': {ko: '이미 계정이 있으면 ', zh: '已有账号？', hi: 'पहले से खाता है? '},
  'We sent a verification code to your email. Enter it within 5 minutes. Check spam if you do not see it.': {
    ko: '인증번호를 메일로 보냈습니다. 5분 안에 입력해 주세요. 메일이 없으면 스팸함을 확인해 주세요.',
    zh: '验证码已发送到邮箱，请在5分钟内输入。如未收到请检查垃圾邮件。',
    hi: 'हमने ईमेल पर सत्यापन कोड भेजा है। 5 मिनट में दर्ज करें। न दिखे तो स्पैम जांचें।'
  },
  'Failed to send verification code.': {
    ko: '인증번호 발송에 실패했습니다.',
    zh: '验证码发送失败。',
    hi: 'सत्यापन कोड भेजने में विफल।'
  },
  'Please request a verification code first.': {
    ko: '인증번호 받기를 먼저 진행해 주세요.',
    zh: '请先获取验证码。',
    hi: 'पहले सत्यापन कोड का अनुरोध करें।'
  },
  'Passwords do not match.': {
    ko: '비밀번호가 일치하지 않습니다.',
    zh: '密码不一致。',
    hi: 'पासवर्ड मेल नहीं खाते।'
  },
  'Registration failed.': {
    ko: '회원가입에 실패했습니다.',
    zh: '注册失败。',
    hi: 'पंजीकरण विफल।'
  },
  'If you request a new code, the previous one will no longer work. ': {
    ko: '인증번호를 다시 받으면 이전 번호는 사용할 수 없습니다. ',
    zh: '重新获取后，旧验证码将失效。',
    hi: 'नया कोड मांगने पर पुराना कोड काम नहीं करेगा। '
  },
  'Switch to light mode': {ko: '라이트 모드로 전환', zh: '切换到浅色模式', hi: 'लाइट मोड पर जाएँ'},
  'Switch to dark mode': {ko: '다크 모드로 전환', zh: '切换到深色模式', hi: 'डार्क मोड पर जाएँ'},
  Admin: {ko: '관리자', zh: '管理', hi: 'प्रशासक'},
  'Account settings': {ko: '회원 설정', zh: '账号设置', hi: 'खाता सेटिंग'},
  Logout: {ko: '로그아웃', zh: '退出登录', hi: 'लॉग आउट'},
  'Change password': {ko: '비밀번호 변경', zh: '修改密码', hi: 'पासवर्ड बदलें'},
  'Current password': {ko: '현재 비밀번호', zh: '当前密码', hi: 'वर्तमान पासवर्ड'},
  'New password': {ko: '새 비밀번호', zh: '新密码', hi: 'नया पासवर्ड'},
  'Confirm new password': {ko: '새 비밀번호 확인', zh: '确认新密码', hi: 'नया पासवर्ड पुष्टि'},
  Close: {ko: '닫기', zh: '关闭', hi: 'बंद करें'},
  Change: {ko: '변경', zh: '更改', hi: 'बदलें'},
  'New passwords do not match.': {
    ko: '새 비밀번호가 일치하지 않습니다.',
    zh: '新密码不一致。',
    hi: 'नए पासवर्ड मेल नहीं खाते।'
  },
  'Password changed.': {
    ko: '비밀번호가 변경되었습니다.',
    zh: '密码已更改。',
    hi: 'पासवर्ड बदल दिया गया।'
  },
  'Change failed.': {
    ko: '변경에 실패했습니다.',
    zh: '更改失败。',
    hi: 'परिवर्तन विफल।'
  },
  'Search posts': {
    ko: '글 검색',
    zh: '搜索文章',
    hi: 'पोस्ट खोजें'
  },
  Search: {
    ko: '검색',
    zh: '搜索',
    hi: 'खोजें'
  },
  'No published posts yet.': {
    ko: '아직 공개된 글이 없습니다.',
    zh: '暂无已发布的文章。',
    hi: 'अभी कोई प्रकाशित पोस्ट नहीं है।'
  }
};

const out = `export type LocaleEntry = Partial<Record<'ko' | 'zh' | 'hi', string>>;

export const dictionary: Record<string, LocaleEntry> = ${JSON.stringify(dictionary, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '../src/i18n/dictionary.ts'), out, 'utf8');
console.log('keys', Object.keys(dictionary).length);
