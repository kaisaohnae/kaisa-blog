---
slug: wpf-03
order: 3
category: wpf
categoryLabel: WPF
title: "이벤트 대신 ICommand로 액션 연결하기"
summary: "버튼 클릭 로직을 코드비하인드에서 분리해 ICommand로 연결하고, CanExecute로 UI 상태를 제어하는 방법을 정리한다."
publishedAt: 2026-08-26
tags: ["wpf"]
---

# 이벤트 대신 ICommand로 액션 연결하기

> 요약: 버튼 클릭 로직을 코드비하인드에서 분리해 ICommand로 연결하고, CanExecute로 UI 상태를 제어하는 방법을 정리한다.

---

## 1. 왜 Command인가

코드비하인드 이벤트만 쓰면 View 로직이 커진다. 
MVVM에서는 ViewModel의 `ICommand`로 액션을 노출한다.

---

## 2. RelayCommand 예

```csharp
public class RelayCommand : ICommand {
    private readonly Action _execute;
    private readonly Func<bool>? _canExecute;

    public RelayCommand(Action execute, Func<bool>? canExecute = null) {
        _execute = execute;
        _canExecute = canExecute;
    }

    public bool CanExecute(object? parameter) => _canExecute?.Invoke() ?? true;
    public void Execute(object? parameter) => _execute();
    public event EventHandler? CanExecuteChanged;
    public void RaiseCanExecuteChanged() => CanExecuteChanged?.Invoke(this, EventArgs.Empty);
}
```

---

## 3. 버튼 바인딩

```csharp
public ICommand SaveCommand { get; }

public MainViewModel() {
    SaveCommand = new RelayCommand(Save, CanSave);
}
```

```xml
<Button Content="저장" Command="{Binding SaveCommand}" />
```

---

## 4. CanExecute

입력 값이 비어있을 때 버튼을 비활성화하는 식으로 UI 상태를 자연스럽게 제어할 수 있다.

- 저장 가능 여부 계산
- 변경 시 `RaiseCanExecuteChanged()`

---

## 정리

WPF 액션 처리의 기본은 이벤트 남발이 아니라 **Command 중심의 테스트 가능한 흐름**이다.
