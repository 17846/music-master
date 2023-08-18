import axios from "axios";
import { requestQueue } from "./requestQueue";
import { tansParams } from "./common";

axios.defaults.headers["Content-Type"] = "text/plain; charset=utf-8;";
const service = axios.create({
  // 超时
  timeout: 5000,
});

// request拦截器
service.interceptors.request.use((config) => {
  // get请求映射params参数
  if (config.method === "get" && config.params) {
    let url = config.url + "?" + tansParams(config.params);
    //去除最后一个&
    url = url.slice(0, -1);
    config.params = {};
    config.url = url;
  }
  //取消上一次请求
  requestQueue.addRequest(config);
  return config;
});

//响应拦截器
service.interceptors.response.use(
  (res) => {
    return Promise.resolve(res.data);
  },
  async (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject("请求已被取消");
    }

    const config = error.config;

    // 超时重传
    if (error.message.includes("timeout")) {
      // __retryCount用来记录当前是第几次发送请求
      config.__retryCount = config.__retryCount || 0;

      // 如果当前发送的请求大于等于设置好的请求次数时，不再发送请求，返回最终的错误信息
      if (config.__retryCount >= 2) {
        return Promise.reject(error);
      }

      // 记录请求次数+1
      config.__retryCount += 1;

      // 设置请求间隔 在发送下一次请求之前停留一段时间，时间为上方设置好的请求间隔时间
      var backoff = new Promise(function (resolve) {
        setTimeout(function () {
          resolve(0);
        }, config.retryDelay || 1);
      });

      // 再次发送请求
      return backoff.then(function () {
        return service(config);
      });
    } else {
      // 非超时直接reject
      return Promise.reject(error);
    }
  }
);

export default service;
