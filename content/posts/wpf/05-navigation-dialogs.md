---
slug: wpf-05
order: 5
category: wpf
categoryLabel: WPF
title: "화면 전환과 다이얼로그 패턴"
summary: "Frame/Page, UserControl 전환, 대화상자 서비스 추상화로 WPF에서 화면 흐름을 깔끔하게 만드는 방법을 정리한다."
publishedAt: 2026-08-26
tags: ["wpf"]
---

# 화면 전환과 다이얼로그 패턴

> 요약: Frame/Page, UserControl 전환, 대화상자 서비스 추상화로 WPF에서 화면 흐름을 깔끔하게 만드는 방법을 정리한다.

---

## 1. 전환 방식 선택

| 방식 | 적합 |
|------|------|
| Window 다중 | 독립 툴 창 |
| Frame + Page | 마법사/내비게이션 |
| UserControl 교체 | 단일 메인 셸 |

작은 앱은 UserControl 교체 패턴이 단순하다.

---

## 2. ViewModel 기반 전환

현재 ViewModel을 바꿔 ContentControl에 템플릿 매핑하는 방식이 흔하다.

```xml
<ContentControl Content="{Binding CurrentViewModel}" />
```

DataTemplate으로 ViewModel → View 연결.

---

## 3. 다이얼로그 추상화

MessageBox를 ViewModel에서 직접 호출하지 말고 서비스로 감싼다.

```csharp
public interface IDialogService {
    bool Confirm(string message);
}
```

테스트에서는 mock 구현으로 대체 가능하다.

---

## 4. 파일/폴더 선택

OpenFileDialog, SaveFileDialog도 서비스 계층으로 감싸면 ViewModel 순수성이 높아진다.

---

## 정리

WPF 전환 구조는 초기에 결정하면 이득이 크다. **CurrentViewModel + DialogService** 조합이 실무에서 단순하고 강하다.
