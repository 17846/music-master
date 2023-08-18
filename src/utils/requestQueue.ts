import type { CancelTokenSource, InternalAxiosRequestConfig } from "axios";
import axios from "axios";

// 请求队列，用于取消请求
class RequestQueue {
  pendingRequests: Map<string, CancelTokenSource>;

  constructor() {
    this.pendingRequests = new Map();
  }

  addRequest(config: InternalAxiosRequestConfig<any>) {
    const requestKey = this.getRequestKey(config);

    // 如果存在相同 URL 和方法的请求，则取消之前的请求
    if (
      this.pendingRequests.has(requestKey) &&
      this.pendingRequests.get(requestKey)
    ) {
      this.pendingRequests.get(requestKey)?.cancel("请求被取消");
    }

    // 创建 CancelToken 实例并保存到请求配置中
    const source = axios.CancelToken.source();
    config.cancelToken = source.token;

    // 将新请求添加到队列中
    this.pendingRequests.set(requestKey, source);
  }

  getRequestKey(config: InternalAxiosRequestConfig<any>) {
    const { url, method } = config;
    return `${method}:${url}`;
  }
}

export const requestQueue = new RequestQueue();
