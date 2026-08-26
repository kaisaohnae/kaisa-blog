---
slug: wpf-04
order: 4
category: wpf
categoryLabel: WPF
title: "스타일·리소스·테마 관리"
summary: "ResourceDictionary, StaticResource/DynamicResource, 공통 스타일 분리로 WPF UI를 일관되게 운영하는 방법을 정리한다."
publishedAt: 2026-08-26
tags: ["wpf"]
---

# 스타일·리소스·테마 관리

> 요약: ResourceDictionary, StaticResource/DynamicResource, 공통 스타일 분리로 WPF UI를 일관되게 운영하는 방법을 정리한다.

---

## 1. 리소스 계층

WPF 스타일·브러시·템플릿은 리소스로 관리한다.

| 위치 | 범위 |
|------|------|
| Control.Resources | 해당 컨트롤 |
| Window.Resources | 창 범위 |
| App.xaml | 앱 전역 |
| 별도 Dictionary | 모듈/테마 분리 |

---

## 2. Static vs Dynamic

- `StaticResource`: 로드 시점 해석 (일반적으로 빠름)
- `DynamicResource`: 런타임 변경 반영 (테마 전환)

```xml
<SolidColorBrush x:Key="PrimaryBrush" Color="#0B6E4F" />
<Button Background="{StaticResource PrimaryBrush}" />
```

---

## 3. 공통 스타일

```xml
<Style TargetType="Button">
  <Setter Property="Padding" Value="12,6" />
  <Setter Property="Margin" Value="4" />
</Style>
```

화면마다 버튼 속성을 반복하기보다 스타일로 합의한다.

---

## 4. 테마 분리

```xml
<ResourceDictionary.MergedDictionaries>
  <ResourceDictionary Source="Resources/Colors.xaml" />
  <ResourceDictionary Source="Resources/Controls.xaml" />
</ResourceDictionary.MergedDictionaries>
```

색/타입/컨트롤 스타일을 파일별로 분리하면 규모가 커져도 관리가 쉽다.

---

## 정리

WPF UI 품질은 개별 창 수정이 아니라 **리소스 사전을 중심으로 한 시스템화**에서 나온다.
