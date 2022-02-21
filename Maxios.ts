
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'
type ResponseType = 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream'

interface AxiosRequest {
    baseURL?: string;
    url: string;
    data?: any;
    params?: any;
    method?: Method;
    headers?: any;
    timeout?: number;
    responseType?: ResponseType;
}

interface CustomResponse {
    readonly status: boolean;
    readonly message: string;
    data: any;
    origin?: any;
}


import axios, { AxiosRequestConfig } from 'axios';

// 定义接口
interface PendingType {
    url?: string;
    method?: Method;
    params: any;
    data: any;
    cancel: Function;
}

// 取消重复请求
const pending: Array<PendingType> = [];
const CancelToken = axios.CancelToken;

// axios 实例
const instance = axios.create({
    timeout: 10000,
    responseType: 'json'
});

// 移除重复请求
const removePending = (config: AxiosRequestConfig) => {
    for (const key in pending) {
        const item: number = +key;
        const list: PendingType = pending[key];
        // 当前请求在数组中存在时执行函数体
        if (list.url === config.url && list.method === config.method && JSON.stringify(list.params) === JSON.stringify(config.params) && JSON.stringify(list.data) === JSON.stringify(config.data)) {
            // 执行取消操作
            list.cancel('操作太频繁，请稍后再试');
            // 从数组中移除记录
            pending.splice(item, 1);
        }
    }
};

// 添加请求拦截器
instance.interceptors.request.use(
    (request:any) => {
        // TODO: handle loading

        removePending(request);
        request.cancelToken = new CancelToken((c) => {
            pending.push({ url: request.url, method: request.method, params: request.params, data: request.data, cancel: c });
        });
        return request;
    },
    (error: any) => {
        return Promise.reject(error);
    }
);
// 添加响应拦截器
instance.interceptors.response.use(
    (response: any) => {
        removePending(response.config);

        const errorCode = response?.data?.errorCode;
        switch (errorCode) {
            case '401':
                // 根据errorCode，对业务做异常处理(和后端约定)
                break;
            default:
                break;
        }

        return response;
    },
    (error: any) => {
        const response = error.response;

        // 根据返回的http状态码做不同的处理
        switch (response?.status) {
            case 401:
                // token失效
                break;
            case 403:
                // 没有权限
                break;
            case 500:
                // 服务端错误
                break;
            case 503:
                // 服务端错误
                break;
            default:
                break;
        }

        return Promise.reject(response || {message: error.message});
    }
);

class BaseHttp {
    // 外部传入的baseUrl
    protected baseURL: string = process.env.VUE_APP_BaseURL as string;
    // 自定义header头
    protected headers: object = {
        ContentType: 'application/json;charset=UTF-8'
    }

    private apiAxios({ 
        baseURL = this.baseURL, 
        headers = this.headers, 
        method, 
        url, 
        data, 
        params, 
        responseType 
    }: AxiosRequest): Promise<CustomResponse> {

        return new Promise((resolve, reject) => {
            instance({
                baseURL,
                headers,
                method,
                url,
                params,
                data,
                responseType
            }).then((res: any) => {
                // 200:服务端业务处理正常结束
                if (res.status === 200) {
                    // TODO ...
                    // resolve({});
                } else {
                    resolve({ 
                        status: false, 
                        message: res.data?.errorMessage || (url + '请求失败'), 
                        data: null 
                    });
                }
            }).catch((err: any) => {
                const message = err?.data?.errorMessage || err?.message || (url + '请求失败');
                // eslint-disable-next-line
                reject({ status: false, message, data: null});
            });
        });
    }

    /**
     * GET类型的网络请求
     */
    protected getReq({ 
        baseURL, 
        headers, 
        url, 
        data, 
        params, 
        responseType 
    }: AxiosRequest) {
        return this.apiAxios({ 
            baseURL, 
            headers, 
            method: 'GET', 
            url, 
            data, 
            params, 
            responseType 
        });
    }

    /**
     * POST类型的网络请求
     */
    protected postReq({ baseURL, headers, url, data, params, responseType }: AxiosRequest) {
        return this.apiAxios({ baseURL, headers, method: 'POST', url, data, params, responseType });
    }

    /**
     * PUT类型的网络请求
     */
    protected putReq({ baseURL, headers, url, data, params, responseType }: AxiosRequest) {
        return this.apiAxios({ baseURL, headers, method: 'PUT', url, data, params, responseType });
    }

    /**
     * DELETE类型的网络请求
     */
    protected deleteReq({ baseURL, headers, url, data, params, responseType }: AxiosRequest) {
        return this.apiAxios({ baseURL, headers, method: 'DELETE', url, data, params, responseType });
    }
}

