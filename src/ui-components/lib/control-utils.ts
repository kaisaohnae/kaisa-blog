export function joinClasses(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export type UiControlState = {
  invalid?: boolean;
  className?: string;
};

export function controlStateClasses(base: string, state: UiControlState) {
  return joinClasses(base, state.invalid && `${base}--invalid`, state.className);
}
