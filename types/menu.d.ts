//菜单配置项
interface MenuConfig<T> {
  // 图标
  icon?: T;
  id: string;
  name: string;
  // 图标宽高 top left值
  width?: string | number;
  height?: string | number;
  top?: string | number;
  left?: string | number;
}
