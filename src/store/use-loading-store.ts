import {create} from 'zustand';

export type LoadingVariant = 'ring' | 'dots' | 'bars' | 'pulse';
export type LoadingOverlay = 'light' | 'dark' | 'blur';

export type LoadingOptions = {
  variant?: LoadingVariant;
  message?: string;
  overlay?: LoadingOverlay;
  target?: string;
};

type State = {
  loading: boolean;
  variant: LoadingVariant;
  message: string;
  overlay: LoadingOverlay;
  target: string;
};

type Actions = {
  startLoading: (options?: LoadingOptions) => void;
  stopLoading: () => void;
};

const DEFAULT_STATE: Omit<State, 'loading'> = {
  variant: 'ring',
  message: '',
  overlay: 'light',
  target: '',
};

const useLoadingStore = create<State & Actions>((set) => ({
  loading: false,
  ...DEFAULT_STATE,
  startLoading: (options) => {
    set({
      loading: true,
      variant: options?.variant ?? DEFAULT_STATE.variant,
      message: options?.message ?? DEFAULT_STATE.message,
      overlay: options?.overlay ?? DEFAULT_STATE.overlay,
      target: options?.target ?? DEFAULT_STATE.target,
    });
  },
  stopLoading: () => {
    set({
      loading: false,
      ...DEFAULT_STATE,
    });
  },
}));

export default useLoadingStore;
