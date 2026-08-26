---
slug: react-native-04
order: 4
category: react-native
categoryLabel: React Native
title: "리스트·네비게이션 — FlatList와 Expo Router"
summary: "가상화 리스트로 성능을 지키고, Expo Router로 타입 안전한 화면 이동을 구성한다."
publishedAt: 2026-08-26
tags: ["react-native"]
---

# 리스트·네비게이션 — FlatList와 Expo Router

> 요약: 가상화 리스트로 성능을 지키고, Expo Router로 타입 안전한 화면 이동을 구성한다.

---

---

## 1. ScrollView vs FlatList vs SectionList

| 컴포넌트 | 언제 |
|----------|------|
| `ScrollView` | 짧은 고정 콘텐츠 |
| `FlatList` | **긴 동종 리스트** (기본 선택) |
| `SectionList` | 섹션 헤더가 있는 목록 |
| `FlashList` | 더 공격적인 성능 (Shopify) |

```tsx
// 금지: 수천 개 map + ScrollView
{items.map((item) => <Row key={item.id} item={item} />)}
```

---

## 2. FlatList 기본

```tsx
import { FlatList, Text, View } from 'react-native';

type Item = { id: string; title: string };

export function PostList({ data }: { data: Item[] }) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={{ padding: 16 }}>
          <Text>{item.title}</Text>
        </View>
      )}
      ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#e2e8f0' }} />}
      ListEmptyComponent={<Text style={{ padding: 24 }}>게시글이 없습니다</Text>}
      contentContainerStyle={{ flexGrow: 1 }}
    />
  );
}
```

성능 옵션:

```tsx
<FlatList
  initialNumToRender={10}
  windowSize={7}
  removeClippedSubviews
  getItemLayout={(_, index) => ({
    length: ROW_HEIGHT,
    offset: ROW_HEIGHT * index,
    index,
  })}
/>
```

`getItemLayout`은 고정 높이일 때 스크롤 측정 비용을 줄인다.

### 최적화 팁

- `renderItem`은 가능하면 `memo`된 행 컴포넌트
- 인라인 `() => {}` / 인라인 style 과다 주의
- `extraData`로 선택 상태 등 리렌더 트리거
- 이미지 많으면 `expo-image` + 적절한 크기

```bash
npx expo install @shopify/flash-list
```

---

## 3. Pull to refresh / 무한 스크롤

```tsx
const [refreshing, setRefreshing] = useState(false);

<FlatList
  refreshing={refreshing}
  onRefresh={async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }}
  onEndReached={loadMore}
  onEndReachedThreshold={0.3}
  ListFooterComponent={isFetchingNextPage ? <ActivityIndicator /> : null}
/>
```

페이지 데이터는 React Query `useInfiniteQuery`와 잘 맞는다 .

---

## 4. Expo Router — 파일 기반 라우팅

```
app/
├── _layout.tsx          # 루트 레이아웃
├── index.tsx            # /
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   └── signup.tsx
├── (tabs)/
│   ├── _layout.tsx
│   ├── index.tsx        # 홈 탭
│   └── settings.tsx
└── posts/
    ├── index.tsx
    └── [id].tsx         # 동적 세그먼트
```

```tsx
// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="posts/[id]" options={{ headerShown: true, title: 'Post' }} />
    </Stack>
  );
}
```

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
```

---

## 5. 이동과 파라미터

```tsx
import { Link, router, useLocalSearchParams } from 'expo-router';

<Link href={`/posts/${id}`}>열기</Link>

router.push(`/posts/${id}`);
router.replace('/login');
router.back();
```

```tsx
// app/posts/[id].tsx
export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Text>Post {id}</Text>;
}
```

객체 전달이 필요하면 쿼리/전역 상태/미리 fetch된 캐시를 쓰고, 거대한 객체를 라우트 params에 넣지 않는다.

Typed routes: Expo Router의 typed routes 옵션을 켜면 `href` 자동완성이 좋아진다.

---

## 6. 인증 가드 레이아웃

```tsx
// app/_layout.tsx 개념
const { user, isLoading } = useAuth();

if (isLoading) return <Splash />;

return (
  <Stack>
    <Stack.Protected guard={!!user}>
      <Stack.Screen name="(tabs)" />
    </Stack.Protected>
    <Stack.Protected guard={!user}>
      <Stack.Screen name="(auth)" />
    </Stack.Protected>
  </Stack>
);
```

(버전별 API는 `Redirect` + 세그먼트 분기로도 구현 가능)

```tsx
if (!user) return <Redirect href="/login" />;
```

---

## 7. 딥링크

`app.json`의 `scheme`: `myapp://posts/1`  
Universal Links / App Links는 EAS·도메인 검증이 필요 (운영 배포 문서 참고).

---

## 연습

1. `FlatList`로 50개 이상 아이템 리스트를 만든다.
2. pull-to-refresh와 empty 상태를 구현한다.
3. Expo Router로 탭 + 상세(`[id]`) 화면을 연결한다.
4. 로그인 여부에 따라 `(auth)` / `(tabs)`로 분기한다.
