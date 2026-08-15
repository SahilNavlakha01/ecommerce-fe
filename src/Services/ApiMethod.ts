import axios, { AxiosResponse, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import * as Sentry from "@sentry/nextjs";

interface HeaderInfo {
    headers: { "content-type": string };
}

interface ApiResponse {
    data: any;
    status: number;
    statusText: string;
}

const getHeaderInfo = async (): Promise<HeaderInfo> => ({
    headers: { "content-type": "application/json" }
});

const getFormDataHeaderInfo = async (): Promise<HeaderInfo> => ({
    headers: { "content-type": "multipart/form-data" }
});

const handleResponse = (response: AxiosResponse): ApiResponse => {
    if (response?.data) {
        return {
            data: response.data,
            status: response.status,
            statusText: response.statusText
        };
    }
    return response as ApiResponse;
};

import { getAuthToken as getToken, clearAuthCookie } from '../utils/auth';

const getAuthToken = (): string => {
    if (typeof document !== 'undefined') {
        return getToken('admin') || getToken('user') || '';
    }
    return '';
};

export const get = async (url: string, params: Record<string, any> = {}): Promise<ApiResponse> => {
    const header = await getHeaderInfo();
    const token = getAuthToken();
    try {
        const resp = await axios.get(url, {
            ...header,
            params,
            ...(token ? { withCredentials: true } : {})
        });
        return handleResponse(resp);
    } catch (err: any) {
        throw err;
    }
}

export const post = async (url: string, params: any, retries = 3, timeoutMs = 50000): Promise<ApiResponse> => {
    const header = await getHeaderInfo();
    const token = getAuthToken();
    try {
        const response = await axios.post(url, params, {
            ...header,
            timeout: timeoutMs,
            ...(token ? { withCredentials: true } : {})
        });
        return handleResponse(response);
    } catch (err: any) {
        const isNetworkOrTimeout = !err.response && (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK' || err.message === 'Network Error');
        if (isNetworkOrTimeout && retries > 0) {
            // Exponential backoff: 3s, 6s, 12s — enough to survive a Railway cold start
            const delay = retries === 3 ? 3000 : retries === 2 ? 6000 : 12000;
            console.log(`[API Retry] Retrying ${url} in ${delay}ms (${retries} retries left)`);
            await new Promise(r => setTimeout(r, delay));
            return post(url, params, retries - 1, timeoutMs);
        }
        // Attach a clear flag so callers can distinguish network vs server errors
        if (isNetworkOrTimeout) err._isNetworkError = true;
        throw err;
    }
}

export const postFormData = async (url: string, formData: FormData, timeout: number = 300000): Promise<ApiResponse> => {
    const header = await getFormDataHeaderInfo();
    try {
        const response = await axios.post(url, formData, {
            ...header, 
            withCredentials: true,
            timeout,
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        return handleResponse(response);
    } catch (err: any) {
        console.error('POST FormData Error:', {
            url,
            status: err.response?.status,
            data: err.response?.data
        });
        throw err;
    }
}

export const put = async (url: string, params: any): Promise<ApiResponse> => {
    const header = await getHeaderInfo();
    try {
        const response = await axios.put(url, params, {...header, withCredentials: true});
        return handleResponse(response);
    } catch (err: any) {
        throw err;
    }
}

export const patch = async (url: string, params: any): Promise<ApiResponse> => {
    const header = await getHeaderInfo();
    try {
        const response = await axios.patch(url, params, {...header, withCredentials: true});
        return handleResponse(response);
    } catch (err: any) {
        throw err;
    }
}

export const deleteRequest = async (url: string, data?: any): Promise<ApiResponse> => {
    const header = await getHeaderInfo();
    try {
        const response = await axios.delete(url, {...header, withCredentials: true, ...(data ? { data } : {})});
        return handleResponse(response);
    } catch (err: any) {
        throw err;
    }
}

export const downloadFile = async (url: string): Promise<AxiosResponse> => {
    try {
        const response = await axios.get(url, {
            responseType: 'blob',
            withCredentials: true
        });
        return response;
    } catch (err: any) {
        throw err;
    }
}

// Request interceptor for auth token and logging
axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // Log request
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    
    // Add Sentry breadcrumb
    Sentry.addBreadcrumb({
        category: "api",
        message: `API Request: ${config.method?.toUpperCase()} ${config.url}`,
        level: "info",
    });

    const token = getAuthToken();
    if (token && config.headers) {
        config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor for handling common errors and logging
axios.interceptors.response.use(
    (response) => {
        // Log successful response
        console.log(`[API Response] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
        return response;
    },
    (error) => {
        const status = error.response?.status || 'Network Error';
        const url = error.config?.url || '';
        const isCartFetch404 = status === 404 && url.includes('/cart/fetch/');
        
        if (!isCartFetch404) {
            console.error(`[API Error] ${status} ${error.config?.method?.toUpperCase()} ${url}:`, error.message);
            
            // Report API errors to Sentry
            Sentry.withScope((scope) => {
                scope.setTag("component", "api-method");
                scope.setExtra("requestUrl", url);
                scope.setExtra("requestMethod", error.config?.method?.toUpperCase());
                scope.setExtra("responseStatus", error.response?.status);
                scope.setExtra("responseData", error.response?.data);
                Sentry.captureException(error);
            });
        }

        if (error.response?.status === 401) {
            // Don't redirect if user is on checkout page (guest checkout flow)
            const isCheckoutPage = typeof window !== 'undefined' && window.location.pathname === '/checkout';
            if (!isCheckoutPage) {
                clearAuthCookie('admin');
                clearAuthCookie('user');
                const isAdminRoute = window.location.pathname.startsWith('/admin');
                window.location.href = '/auth/otp-login';
            }
        }
        return Promise.reject(error);
    }
);