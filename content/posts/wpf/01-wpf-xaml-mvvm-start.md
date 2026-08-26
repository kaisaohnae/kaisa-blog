---
slug: wpf-01
order: 1
category: wpf
categoryLabel: WPF
title: "WPF와 XAML·MVVM 시작하기"
summary: "WPF 프로젝트 구조, XAML, DataContext, MVVM 분리를 기준으로 데스크톱 앱 기본선을 정리한다."
publishedAt: 2026-08-26
tags: ["wpf"]
---

# WPF와 XAML·MVVM 시작하기

> 요약: WPF 프로젝트 구조, XAML, DataContext, MVVM 분리를 기준으로 데스크톱 앱 기본선을 정리한다.

---

## 1. 왜 WPF인가

WPF는 .NET 기반 Windows 데스크톱 UI 프레임워크다. 
XAML 선언형 UI + C# 로직 분리, 데이터 바인딩이 강점이다.

| 항목 | 특징 |
|------|------|
| UI 선언 | XAML |
| 로직 | C# |
| 패턴 | MVVM |
| 렌더링 | DirectX 기반 |

---

## 2. 기본 구조

```
App.xaml
MainWindow.xaml
MainWindow.xaml.cs
ViewModels/
Models/
Services/
```

- View: XAML
- ViewModel: 상태/명령
- Model: 도메인 데이터

---

## 3. 첫 MVVM 연결

```csharp
public class MainViewModel {
    public string Title { get; } = "Hello WPF";
}
```

```xml
<Window ...>
  <Window.DataContext>
    <local:MainViewModel />
  </Window.DataContext>
  <TextBlock Text="{Binding Title}" />
</Window>
```

---

## 4. 실무 팁

- 코드비하인드 이벤트를 최소화
- ViewModel 테스트 가능 구조로 유지
- 리소스/스타일은 App 또는 사전(Dictionary)로 분리

---

## 정리

WPF 시작은 컨트롤 암기가 아니라 **XAML + 바인딩 + MVVM 경계**를 먼저 고정하는 일이다.
