import interceptor from '@/config/api-interceptor';
import {getToken} from '@/lib/auth-storage';

export const ApiConfig = (apiUrl: string, apiData?: any, tokenKind?: 'member' | 'admin') => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = tokenKind ? getToken(tokenKind) : getToken('admin') || getToken('member');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return interceptor({
    url: apiUrl,
    data: JSON.stringify(apiData ?? {}),
    method: 'post',
    headers,
    withCredentials: false,
  });
};

export async function apiPost<T = any>(apiUrl: string, apiData?: any, tokenKind?: 'member' | 'admin'): Promise<{success: boolean; message: string; data: T}> {
  const res = await ApiConfig(apiUrl, apiData, tokenKind);
  const body = res?.data;
  if (!body?.success) {
    throw new Error(body?.message || '요청에 실패했습니다.');
  }
  return body;
}
