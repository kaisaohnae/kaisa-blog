import interceptor from '@/config/api-interceptor';
import {getToken} from '@/lib/auth-storage';

export const ApiConfig = (apiUrl: string, apiData?: any, tokenKind?: 'member' | 'admin' | null, timeout = 20000) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token =
    tokenKind === null ? null : tokenKind ? getToken(tokenKind) : getToken('admin') || getToken('member');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return interceptor({
    url: apiUrl,
    data: JSON.stringify(apiData ?? {}),
    method: 'post',
    headers,
    withCredentials: false,
    timeout,
  });
};

export async function apiPost<T = any>(
  apiUrl: string,
  apiData?: any,
  tokenKind?: 'member' | 'admin' | null,
  timeout = 20000,
): Promise<{success: boolean; message: string; data: T}> {
  const res = await ApiConfig(apiUrl, apiData, tokenKind, timeout);
  const body = res?.data;
  if (!body?.success) {
    throw new Error(body?.message || '요청에 실패했습니다.');
  }
  return body;
}
