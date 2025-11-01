import { showToast } from '@/lib/toastConfig';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_API_URL,
  // Do not set default Content-Type here!
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
      // Only set Content-Type to application/json if data is not FormData
      if (
        config.data &&
        typeof window.FormData !== 'undefined' &&
        config.data instanceof window.FormData
      ) {
        config.headers.delete('Content-Type');
      } else {
        config.headers.set('Content-Type', 'application/json');
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Makes a GET request to the specified URL.
 */
const Get = async <T = any>(url: string): Promise<T | undefined> => {
  try {
    const data: AxiosResponse<T> = await axiosInstance.get(url);
    if (data?.data) {
      // @ts-ignore
      showToast.success((data.data as any)?.message);
      return data.data;
    }
  } catch (error) {
    const err = error as AxiosError<any>;
    showToast.error(err?.response?.data?.detail);
  }
};

/**
 * Makes a POST request to the specified URL with the provided data.
 */
const Post = async <T = any>(url: string, meta: any): Promise<T | undefined> => {
  try {
    const data: AxiosResponse<T> = await axiosInstance.post(url, meta);
    if (data?.data) {
      // @ts-ignore
      showToast.success((data.data as any)?.message);
      return data.data;
    }
  } catch (error) {
    const err = error as AxiosError<any>;
    showToast.error(err?.response?.data?.detail);
  }
};

/**
 * Makes a PUT request to the specified URL with the provided data.
 */
const Put = async <T = any>(url: string, meta: any): Promise<T | undefined> => {
  try {
    const data: AxiosResponse<T> = await axiosInstance.put(url, meta);
    if (data?.data) {
      // @ts-ignore
      showToast.success((data.data as any)?.message);
      return data.data;
    }
  } catch (error) {
    const err = error as AxiosError<any>;
    showToast.error(err?.response?.data?.detail);
  }
};

/**
 * Makes a DELETE request to the specified URL.
 */
const Delete = async <T = any>(url: string, meta?: any): Promise<T | undefined> => {
  try {
    const data: AxiosResponse<T> = await axiosInstance.delete(url, meta ? { data: meta } : undefined);
    if (data?.data) {
      // @ts-ignore
      showToast.success((data.data as any)?.message);
      return data.data;
    }
  } catch (error) {
    const err = error as AxiosError<any>;
    showToast.error(err?.response?.data?.detail);
  }
};

/**
 * Custom hook to use API methods.
 */
export const useApi = () => {
  return { Get, Post, Put, Delete };
};
