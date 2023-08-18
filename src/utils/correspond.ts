import { useInfoStore } from "@/stores/user";
import { useIpcRenderer } from "@vueuse/electron";
const crypto = require("crypto");
const render = useIpcRenderer();

/**
 * 模拟http请求，与主线程通信后等待主线程返回数据
 * @param event 事件名称
 * @param data 传输的数据
 * @param response 是否需要返回数据
 * @returns 返回的数据
 */
export function useResponse<V>(
  event: string,
  data: any,
  response: boolean = true
): Promise<V> | undefined {
  const responseEvent = crypto.randomUUID();
  const temp = {
    responseEvent,
    data,
  };
  render.send(event, temp);
  /**
   * 如果需要返回数据，则返回
   */
  if (response) {
    return new Promise((resolve, reject) => {
      render.once(responseEvent, (e, res: V | "fail request") => {
        if (res === "fail request") {
          reject();
        } else {
          resolve(res);
        }
      });
    });
  }
}
