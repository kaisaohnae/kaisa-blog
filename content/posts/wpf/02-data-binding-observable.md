---
slug: wpf-02
order: 2
category: wpf
categoryLabel: WPF
title: "데이터 바인딩과 ObservableCollection"
summary: "INotifyPropertyChanged, ObservableCollection, DataTemplate로 UI와 상태를 동기화하는 핵심 패턴을 정리한다."
publishedAt: 2026-08-26
tags: ["wpf"]
---

# 데이터 바인딩과 ObservableCollection

> 요약: INotifyPropertyChanged, ObservableCollection, DataTemplate로 UI와 상태를 동기화하는 핵심 패턴을 정리한다.

---

## 1. 바인딩 핵심

WPF UI는 바인딩으로 상태를 읽고 반영한다.

| 구성 | 역할 |
|------|------|
| DataContext | 바인딩 루트 |
| Binding Path | 속성 경로 |
| Mode | OneWay/TwoWay |
| Converter | 타입 변환 |

---

## 2. 변경 통지

```csharp
public class UserViewModel : INotifyPropertyChanged {
    private string _name = "";
    public string Name {
        get => _name;
        set { _name = value; OnPropertyChanged(); }
    }

    public event PropertyChangedEventHandler? PropertyChanged;
    void OnPropertyChanged([CallerMemberName] string? m = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(m));
}
```

속성 변경 알림이 없으면 화면이 갱신되지 않는다.

---

## 3. 목록 바인딩

```csharp
public ObservableCollection<string> Items { get; } = new();
```

```xml
<ListBox ItemsSource="{Binding Items}" />
```

`ObservableCollection`은 add/remove 변경을 UI에 자동 반영한다.

---

## 4. DataTemplate

```xml
<ListBox ItemsSource="{Binding Users}">
  <ListBox.ItemTemplate>
    <DataTemplate>
      <StackPanel Orientation="Horizontal">
        <TextBlock Text="{Binding Name}" />
      </StackPanel>
    </DataTemplate>
  </ListBox.ItemTemplate>
</ListBox>
```

템플릿으로 리스트 항목 렌더링을 분리하면 유지보수가 쉬워진다.

---

## 정리

WPF 생산성의 핵심은 컨트롤이 아니라 **변경 통지 + 컬렉션 + 템플릿** 조합이다.
