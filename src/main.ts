import "./assets/main.css";
import "element-plus/dist/index.css";
import "uno.css";
import "virtual:svg-icons-register";

import ElementPlus from "element-plus";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import CustomSvg from "@/components/common/CustomSvg.vue";
import App from "./App.vue";
import router from "./router";

import { createApp } from "vue";
import { createPinia } from "pinia";
import { clickAnim } from "./utils/clickAnimation";

const app = createApp(App);

//自定义指令，实现鼠标点击下沉效果
app.directive("click", clickAnim);
//全局注册自定义图标
app.component("CustomSvg", CustomSvg);

//将element-plus图标注册为全局组件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

const store = createPinia();

app.use(store);
app.use(router);
app.use(ElementPlus);
app.mount("#app");
