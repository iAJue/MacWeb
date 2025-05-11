import axios from 'axios';
import { ElMessage } from 'element-plus';

// 创建一个 axios 实例
const httpClient = axios.create({
    baseURL: 'https://ai.moejue.cn/',
    timeout: 10000, 
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// 请求拦截器
httpClient.interceptors.request.use(
    config => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 响应拦截器
httpClient.interceptors.response.use(
    response => {
        return response.data;
    },
    error => {
        if (error.response) {
            // 请求已发出，但服务器响应的状态码不在 2xx 范围内
            const { status, data } = error.response;

            if (status === 401) {
                // 处理 401 Unauthorized 错误
                console.error('认证失败或Token过期:', data?.message || 'Unauthorized');
                ElMessage.error(data?.message || '会话已过期，请重新登录');
                localStorage.removeItem('auth_token');
                window.location.href = '/';
                return;
            } else {
                // 处理其他错误状态码 (400, 403, 404, 500 etc.)
                console.error(`API Error ${status}:`, data?.message || error.message);
                ElMessage.error(`请求错误 ${status}: ${data?.message || '请稍后重试'}`);
            }
        } else if (error.request) {
            // 请求已发出，但没有收到响应
            console.error('网络错误，未收到响应:', error.request);
            ElMessage.error('网络连接失败，请检查网络');
        } else {
            // 在设置请求时触发了一个错误
            console.error('请求设置错误:', error.message);
        }

        // 对于非401错误，仍然将错误抛出，让具体的API调用处处理
        return Promise.reject(error);
    }
);

// 封装 GET 请求
export const get = async (url, params = {}, config = {}, onSuccess = null, onError = null) => {
    try {
        const response = await httpClient.get(url, { params, ...config });
        if (onSuccess) onSuccess(response);
        return response;
    } catch (error) {
        if (onError) onError(error);
        throw error;
    }
};

// 封装 POST 请求
export const post = async (url, data = {}, config = {}, onSuccess = null, onError = null) => {
    try {
        const response = await httpClient.post(url, data, config);
        if (onSuccess) onSuccess(response);
        return response;
    } catch (error) {
        if (onError) onError(error);
        throw error;
    }
};

// 封装 PUT 请求
export const put = async (url, data = {}, config = {}, onSuccess = null, onError = null) => {
    try {
        const response = await httpClient.put(url, data, config);
        if (onSuccess) onSuccess(response);
        return response;
    } catch (error) {
        if (onError) onError(error);
        throw error;
    }
};

// 封装 DELETE 请求
export const del = async (url, config = {}, onSuccess = null, onError = null) => {
    try {
        const response = await httpClient.delete(url, config);
        if (onSuccess) onSuccess(response);
        return response;
    } catch (error) {
        if (onError) onError(error);
        throw error;
    }
};

// 封装 PATCH 请求
export const patch = async (url, data = {}, config = {}, onSuccess = null, onError = null) => {
    try {
        const response = await httpClient.patch(url, data, config);
        if (onSuccess) onSuccess(response);
        return response;
    } catch (error) {
        if (onError) onError(error);
        throw error;
    }
};

// 封装上传图片请求
export const uploadImage = async (url, file, additionalData = {}, config = {}, onSuccess = null, onError = null) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        for (const key in additionalData) {
            if (Object.prototype.hasOwnProperty.call(additionalData, key)) {
                formData.append(key, additionalData[key]);
            }
        }

        const response = await httpClient.post(url, formData, {
            ...config,
            headers: {
                ...config.headers,
                'Content-Type': 'multipart/form-data'
            }
        });
        
        if (onSuccess) onSuccess(response);
        return response;
    } catch (error) {
        if (onError) onError(error);
        throw error;
    }
};

// 导出 httpClient 以便在需要的时候直接使用 axios 实例
export default httpClient;