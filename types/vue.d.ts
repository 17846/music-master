import type { DefineComponent } from "vue";
import type { IconProps } from "./svg";
declare module "vue" {
  //为全局注册组件声明类型
  export interface GlobalComponents {
    CustomSvg: IconProps;
  }
}

declare module "*.vue" {
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
