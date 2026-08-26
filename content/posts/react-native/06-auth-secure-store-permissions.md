---
slug: react-native-06
order: 6
category: react-native
categoryLabel: React Native
title: "인증·보안 저장소·디바이스 권한"
summary: "토큰 안전 저장, 세션 복구, 생체인증·앱 권한(카메라/앨범/알림)의 현대적 패턴을 익힌다."
publishedAt: 2026-08-26
tags: ["react-native"]
---

# 인증·보안 저장소·디바이스 권한

> 요약: 토큰 안전 저장, 세션 복구, 생체인증·앱 권한(카메라/앨범/알림)의 현대적 패턴을 익힌다.

---

---

## 1. 하지 말 것 / 할 것

| 금지 | 권장 |
|------|------|
| AsyncStorage에 access token 평문 (민감) | **SecureStore** / Keychain |
| 소스에 API 시크릿 | 백엔드만 보유 |
| 로그에 토큰·PII | 마스킹 |
| 모든 권한 앱 시작 시 요청 | **필요 시점(just-in-time)** 요청 |

---

## 2. Expo SecureStore

```bash
npx expo install expo-secure-store
```

```tsx
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'access_token';

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function loadToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
```

큰 JSON blob·리프레시 로직은 설계를 단순하게.  
웹 타깃이 있으면 SecureStore 미지원 → Platform 분기 또는 쿠키 세션.

---

## 3. Auth Provider 패턴

```tsx
type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const t = await loadToken();
      if (t) {
        setToken(t);
        try {
          setUser(await api<User>('/me', { token: t }));
        } catch {
          await clearToken();
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await api<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await saveToken(res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const signOut = async () => {
    await clearToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('AuthProvider missing');
  return ctx;
}
```

스플래시: `isLoading` 동안 라우트 가드를 보류해 깜빡임을 줄인다.  
`expo-splash-screen`으로 네이티브 스플래시를 유지할 수 있다.

---

## 4. OAuth / 소셜 로그인

```bash
npx expo install expo-auth-session expo-web-browser expo-crypto
```

AuthSession + 백엔드 교환 코드 방식이 안전하다.  
클라이언트에서 곧장 장기 시크릿을 쓰지 말고, **인가 코드를 서버에 전달**해 토큰을 받는다.

---

## 5. 생체 인증 (선택)

```bash
npx expo install expo-local-authentication
```

```tsx
import * as LocalAuthentication from 'expo-local-authentication';

const ok = await LocalAuthentication.authenticateAsync({
  promptMessage: '잠금 해제',
});
if (ok.success) {
  // 앱 잠금 해제 / 민감 화면
}
```

생체정보는 로컬 잠금용. 서버 로그인 대체로 착각하지 말 것.

---

## 6. 권한 — 카메라·미디어·알림

```bash
npx expo install expo-image-picker expo-camera expo-notifications
```

```tsx
import * as ImagePicker from 'expo-image-picker';

const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
if (!perm.granted) {
  // 설정 앱으로 유도하는 UI
  return;
}

const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ['images'],
  quality: 0.8,
});
```

권한 거부 시:

1. 왜 필요한지 설명 (pre-prompt)
2. 시스템 다이얼로그
3. 거부되면 설정 이동 안내 (`Linking.openSettings()`)

`app.json` / config plugins에 용도 설명 문자열(usage description) 필수.

```json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "프로필 사진을 업로드하려면 사진첩 접근이 필요합니다."
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "게시글에 사진을 찍기 위해 카메라가 필요합니다."
      }
    }
  }
}
```

---

## 7. 푸시 알림 (개요)

```tsx
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

const { status } = await Notifications.requestPermissionsAsync();
const token = (
  await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  })
).data;
// token을 서버에 등록
```

실기기에서 테스트. 에뮬레이터 제약이 있다.  
알림 탭 → 딥링크 라우팅은 딥링크·배포 설정과 연결한다.

---

## 8. 보안 체크리스트

- [ ] 토큰 SecureStore
- [ ] HTTPS만
- [ ] 인증서 핀닝은 고보안 앱에서 검토
- [ ] jailbreak/root 탐지는 필요 시(과도한 신뢰 금지)
- [ ] 스크린샷 방지 등은 OS별 한계 이해
- [ ] 로그아웃아웃 시 쿼리 캐시 clear

```tsx
queryClient.clear();
```

---

## 연습

1. SecureStore 기반 로그인/자동 로그인/로그아웃을 구현한다.
2. `AuthProvider` + Router 가드를 연결한다.
3. 이미지 피커 권한 플로우(거절 안내 포함)를 만든다.
4. (선택) 앱 포그라운드 복귀 시 생체 잠금을 추가한다.
