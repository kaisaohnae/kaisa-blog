import {create} from 'zustand';
import {apiPost} from '@/config/api-config';
import {clearToken, getToken, setToken} from '@/lib/auth-storage';

export type AdminInfo = {
  userId: string;
  userName: string;
};

type State = {
  admin: AdminInfo | null;
  hydrated: boolean;
};

type Actions = {
  hydrate: () => Promise<void>;
  login: (userId: string, pwd: string) => Promise<void>;
  logout: () => Promise<void>;
};

const useAdminStore = create<State & Actions>((set) => ({
  admin: null,
  hydrated: false,
  hydrate: async () => {
    if (!getToken('admin')) {
      set({admin: null, hydrated: true});
      return;
    }
    try {
      const body = await apiPost<{userInfo: AdminInfo}>('auth/me', {}, 'admin');
      set({admin: body.data.userInfo, hydrated: true});
    } catch {
      clearToken('admin');
      set({admin: null, hydrated: true});
    }
  },
  login: async (userId, pwd) => {
    const body = await apiPost<{userInfo: AdminInfo; token: string}>('auth/login', {userId, pwd});
    setToken('admin', body.data.token);
    set({admin: body.data.userInfo, hydrated: true});
  },
  logout: async () => {
    try {
      await apiPost('auth/logout', {}, 'admin');
    } catch {
      /* ignore */
    }
    clearToken('admin');
    set({admin: null, hydrated: true});
  },
}));

export default useAdminStore;
