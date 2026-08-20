'use client';

import {create} from 'zustand';
import type {ReactNode} from 'react';

export type PopupProps = {
  title?: string;
  message?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  hideOnBackdrop?: boolean;
};

type State = {
  popup: PopupProps | null;
};

type Actions = {
  showPopup: (options: PopupProps) => void;
  hidePopup: () => void;
};

const usePopupStore = create<State & Actions>((set) => ({
  popup: null,
  showPopup: (options) => {
    set({popup: options});
  },
  hidePopup: () => {
    set({popup: null});
  },
}));

export default usePopupStore;
