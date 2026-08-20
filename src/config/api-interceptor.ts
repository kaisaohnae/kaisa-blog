import axios, {AxiosInstance, AxiosError} from 'axios';
import useLoadingStore from '@/store/use-loading-store';

let baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const { startLoading, stopLoading } = useLoadingStore.getState();

const service: AxiosInstance = axios.create({
  timeout: 20000,
  baseURL: baseURL,
});
service.interceptors.request.use(
  (request: any) => {
    axiosOnLoad();
    return request;
  },
  (error: AxiosError) => {
    stopLoading();
    console.log(error);
    return Promise.reject();
  }
);
service.interceptors.response.use(
  (response: any) => {
    stopLoading();
    if (response.status === 200) {
      return response;
    } else {
      Promise.reject();
    }
  },
  (error: AxiosError) => {
    stopLoading();
    const data: any = error.response?.data;
    if (data && data.message) {
      return Promise.reject(new Error(data.message));
    }
    return Promise.reject(error);
  }
);
export function axiosOnLoad() {
  startLoading();
}

export function axiosOnLoaded() {
  stopLoading();
}
export default service;
