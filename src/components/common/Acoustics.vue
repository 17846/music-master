<template>
  <!-- 播放音效修改 -->

  <!-- 音效名称 -->
  <div class="grid-display">
    <div
      class="text-center p-3-0 cursor-pointer bg-gray-1 border-transparent hover:border-emerald border-2px border-style-solid box-border"
      :class="{
        active: store.acoustics === item.value,
      }"
      v-for="(item, index) in list"
      :key="index"
      @click.stop="store.openEqualizer(item.value)"
    >
      {{ item.label }}
    </div>
  </div>

  <!-- 音效十段均衡器值 -->
  <div class="flex justify-between pl45px pr45px pt25px">
    <div
      class="flex flex-col items-center new-roman w-25px"
      v-for="(item, index) in db"
      :key="index"
    >
      <div class="color-lime text-12px pb10px">
        {{ showValue[index] }}
      </div>
      <MyProgress
        :model-value="eqValue[index]"
        color="#1ece99"
        boal-color="#f6f6f6"
        @update:model-value="handleChangeEq($event, index)"
        :disabled="store.acoustics !== 'zidingyi'"
      />
      <div class="mt6px color-white">
        {{ item }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MyProgress from "./MyProgress.vue";

import { computed, onMounted, ref } from "vue";
import { useWebAudioStore } from "@/stores/useWebAudio";

const store = ref<WebAudioStore>({
  acoustics: "guanbi",
});

//各段均衡器db值
const db = [31, 62, 125, 250, 500, "1k", "2k", "4k", "8k", "16k"];

//音效列表
const list = [
  {
    label: "关闭",
    value: "guanbi",
  },
  {
    label: "人声",
    value: "rensheng",
  },
  {
    label: "蓝调",
    value: "landiao",
  },
  {
    label: "流行",
    value: "liuxing",
  },
  {
    label: "舞曲",
    value: "wuqu",
  },
  {
    label: "古典",
    value: "gudian",
  },
  {
    label: "爵士",
    value: "jueshi",
  },
  {
    label: "慢歌",
    value: "mange",
  },
  {
    label: "电子乐",
    value: "dianziyue",
  },
  {
    label: "摇滚",
    value: "yaogun",
  },
  {
    label: "乡村",
    value: "xiangcun",
  },
  {
    label: "自定义",
    value: "zidingyi",
  },
];

//将音效值由 -10 ~ +10 转为符合进度条的值
const eqValue = computed(() => {
  if (store.value.ACOUSTICS_LIST === undefined) return [];
  const type = store.value.acoustics;
  const value = [...store.value.ACOUSTICS_LIST[type]];
  return value.map((i) => (1 / 24) * i + 0.5);
});

//显示的值
const showValue = computed(() => {
  if (store.value.ACOUSTICS_LIST === undefined) return [];
  const type = store.value.acoustics;
  const value = [...store.value.ACOUSTICS_LIST[type]];
  return value.map((i) => i + "db");
});

//自定义音效
const handleChangeEq = (val: number, index: number) => {
  //y = 1/24*x + 0.5   x=[-12,12]  y=[0,1]
  const newVal = Math.round((24 * val - 12) * 2) / 2;
  store.value.customEqualizer(newVal, index);
};

onMounted(() => {
  store.value = useWebAudioStore();
});
</script>

<style lang="scss" scoped>
.grid-display {
  display: grid;
  grid-template-columns: repeat(4, 88px);
  row-gap: 18px;
  column-gap: 43px;
  padding: 0 35px;
}
.active {
  border-color: rgba(52, 211, 153, 1);
  position: relative;
  &::after {
    content: "√";
    font-size: 11px;
    position: absolute;
    display: block;
    width: 15px;
    height: 15px;
    font-weight: 800;
    background-color: rgba(52, 211, 153, 1);
    color: #fff;
    right: 0;
    bottom: 0;
  }
}
</style>
