'use client';

import { create } from 'zustand';

type State = {
  alert: AlertProps | null;
  error: boolean;
};

type Actions = {
  showAlert: (o: AlertProps) => void;
  hideAlert: () => void;
  showError: () => void;
  hideError: () => void;
};

/*type ButtonProps = {
  type: string;
  rate: number;
  text: string;
  callback: () => void;
}*/

type AlertProps = {
  type?: string;
  message: any;
  button?:  any; // ButtonProps | ButtonProps[];
};

const useAlertStore = create<State & Actions>((set) => ({
  alert: null,
  error: false,
  showAlert: (o: AlertProps) => {
    set(() => ({ alert: o }));
  },
  hideAlert: () => {
    set(() => ({ alert: null }));
  },
  showError: () => {
    set(() => ({ error: true }));
  },
  hideError: () => {
    set(() => ({ error: false }));
  },
}));

export default useAlertStore;
