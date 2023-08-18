import { useResponse } from "./correspond";

/**
 * 将用户设置保存
 * @param props 声音、播放速度、音效、音质等设置
 */
export function localSetting<T extends Setting>(props: T) {
  useResponse<void>("user-setting", props, false);
}
