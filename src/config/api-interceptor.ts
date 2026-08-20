import axios, {AxiosInstance, AxiosError} from 'axios';
import useLoadingStore from '@/store/use-loading-store';

let baseURL = process.env.NEXT_PUBLIC_API_URL;

const { startLoading, stopLoading } = useLoadingStore.getState();

const service: AxiosInstance = axios.create({
  timeout: 10000,
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
    if (error.response?.status === 401 || error.response?.status === 403) {
      //alert.open({title: null, message: data.message, redirect: '/login'});
      return Promise.reject();
    }
    if (data && data.message) {
      //alert.open({title: null, message: data.message});
    }
    return Promise.reject();
  }
);
export function axiosOnLoad() {
  startLoading();
}

export function axiosOnLoaded() {
  stopLoading();
}
export default service;
