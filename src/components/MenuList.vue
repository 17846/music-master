<template>
  <!-- 左侧菜单栏菜单项 -->
  <div
    class="h-575px scroll scroll-hidden box-border important-p-r-32px p-0-25"
  >
    <!-- 音乐馆 最近播放 本地音乐 -->
    <div
      v-for="item in menuConfig"
      :key="item.id"
      :class="[normal, isActiveComputed === item.id ? active : '']"
      @click="handleClick(item.id)"
    >
      <CustomSvg
        :color="isActiveComputed === item.id ? '#d2f6ee' : '#000'"
        :width="item.width || 16"
        :height="item.height || 16"
        :name="item.icon"
        :top="item.top || 0"
        :left="item.left || 0"
      ></CustomSvg>
      <span class="m-l-5px text-13px font-500">{{ item.name }}</span>
    </div>

    <!-- 创建的歌单 -->
    <el-collapse v-model="activeName">
      <el-collapse-item name="create">
        <template #title>
          <div
            class="text-12px color-#646464 flex flex-items-center flex-justify-between w-85%"
          >
            <span>创建的歌单</span>
            <div
              @click.stop="handleCreate"
              class="text-14px color-#000 font-500 hover:color-green"
            >
              <el-icon><Plus /></el-icon>
            </div>
          </div>
        </template>
        <div>
          <el-input
            v-if="inputShow"
            v-model="sheetName"
            @blur="createSheet"
            @keydown.enter="handleBlur"
            ref="inputDom"
            class="mb15px"
          ></el-input>
          <div
            v-for="item in sheetManageStore.createdSheet"
            :key="item.tid"
            :class="[normal, isActiveComputed == item.tid ? active : '']"
            @click="handleToDetail(item.tid, true)"
          >
            <span class="m-l-5px text-13px font-500">{{ item.diss_name }}</span>
          </div>
        </div>
      </el-collapse-item>

      <!-- 收藏的歌单 -->
      <el-collapse-item name="collect">
        <template #title>
          <div
            class="text-12px color-#646464 flex flex-items-center flex-justify-between w-85%"
          >
            <span>收藏的歌单</span>
          </div>
        </template>
        <div
          v-for="item in sheetManageStore.collectionSheet"
          :key="item.tid"
          :class="[normal, isActive === item.tid ? active : '']"
          @click="handleToDetail(item.tid)"
          :title="item.diss_name"
        >
          <span class="m-l-5px text-13px font-500 w-100% text-truncate">{{
            item.diss_name
          }}</span>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script lang="ts" setup>
import { ElMessage } from "element-plus";

import { ref, nextTick, computed } from "vue";
import { useSheetManageStore } from "@/stores/useSheetManage";
import { useRouter, useRoute } from "vue-router";

import { SvgName } from "../../types/svg";

//菜单项默认样式
const normal =
  "flex flex-items-center p-4-10 point hover:bg-#d8d8d8 border-rd m-b-15px last:m-b-0px relative";
//菜单项激活样式
const active = "important-bg-#1ece9b color-#d2f6ee";

const menuConfig: MenuConfig<SvgName>[] = [
  {
    id: "yyg",
    name: "音乐馆",
    icon: SvgName.Music,
    top: 1,
  },
  {
    id: "zjbf",
    name: "最近播放",
    icon: SvgName.Recently,
    width: 18,
    height: 18,
    top: 2,
    left: -2,
  },
  {
    id: "bdyy",
    name: "本地音乐",
    icon: SvgName.Location,
    width: 14,
    height: 14,
  },
];

//标识菜单激活
const isActive = ref<string | number>("yyg");
//控制输入框显示
const inputShow = ref<boolean>(false);
//新建歌单名称
const sheetName = ref<string>();
//输入框dom元素
const inputDom = ref(null);
//折叠菜单激活
const activeName = ref<ActiveName>([]);

//歌单管理
const sheetManageStore = useSheetManageStore();

//路由
const $router = useRouter();

//当前页面路由
const $route = useRoute();

//根据页面路由计算激活菜单项
const isActiveComputed = computed<string>({
  set(val: string) {
    isActive.value = val;
  },
  get() {
    const path = $route.path;
    let active: string = "";
    switch (path) {
      case "/index/main":
        active = "yyg";
        break;
      case "/index/sheet":
        const key = $route.query.id as string;
        active = key;
        break;
      case "/index/recently":
        active = "zjbf";
        break;
      case "/index/download":
        active = "bdyy";
        break;
      default:
        break;
    }
    console.log(active);
    return active;
  },
});

/**
 * 菜单点击处理函数
 * @param id 菜单id
 */
const handleClick = (id: string | number) => {
  isActiveComputed.value = id.toString();
  switch (id) {
    case "yyg":
      $router.push("/index/main");
      break;
    case "zjbf":
      $router.push("/index/recently");
      break;
    case "bdyy":
      $router.push("/index/download");
      break;
    default:
      break;
  }
};

/**
 * 跳转到歌单详情
 * @param id 歌单id
 */
const handleToDetail = (id: string | number, isCustom = false) => {
  isActive.value = id;
  if (isCustom) {
    $router.push(`/index/sheet?id=${id}&isCustom=true`);
  } else {
    $router.push("/index/sheet?id=" + id);
  }
};

/**
 * 点击新建歌单处理函数
 */
const handleCreate = () => {
  const active = activeName.value;
  if (!active.includes("create")) {
    activeName.value.push("create");
  }
  inputShow.value = true;
  nextTick(() => {
    const input = inputDom.value as HTMLInputElement;
    input.focus();
  });
};

//创建歌单
const createSheet = () => {
  if (!!sheetName.value) {
    console.log("创建个歌单", sheetName.value);
    const index = sheetManageStore.createdSheet.findIndex(
      (item) => item.diss_name === sheetName.value
    );
    if (index !== -1) {
      ElMessage({
        type: "error",
        message: "歌单名称重复",
        offset: 268,
      });
    } else {
      sheetManageStore.createSheet(sheetName.value);
      inputShow.value = false;
    }
  } else {
    inputShow.value = false;
  }
};

//创建歌单输入框回车触发blur调用createSheet
const handleBlur = () => {
  const input = inputDom.value as HTMLInputElement;
  input.blur();
};
</script>
