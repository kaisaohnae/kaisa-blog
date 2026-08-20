export const MEMBER_TOKEN_KEY = 'kaisa_blog_member_token';
export const ADMIN_TOKEN_KEY = 'kaisa_blog_admin_token';
export const MANAGER_SAVED_ID_KEY = 'kaisa_blog_manager_user_id';

export function getSavedManagerId(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(MANAGER_SAVED_ID_KEY) || '';
}

export function saveManagerId(userId: string) {
  localStorage.setItem(MANAGER_SAVED_ID_KEY, userId);
}

export function clearSavedManagerId() {
  localStorage.removeItem(MANAGER_SAVED_ID_KEY);
}

export function getToken(kind: 'member' | 'admin'): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(kind === 'admin' ? ADMIN_TOKEN_KEY : MEMBER_TOKEN_KEY);
}

export function setToken(kind: 'member' | 'admin', token: string) {
  localStorage.setItem(kind === 'admin' ? ADMIN_TOKEN_KEY : MEMBER_TOKEN_KEY, token);
}

export function clearToken(kind: 'member' | 'admin') {
  localStorage.removeItem(kind === 'admin' ? ADMIN_TOKEN_KEY : MEMBER_TOKEN_KEY);
}
