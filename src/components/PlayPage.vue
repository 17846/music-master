<template>
  <!-- 全屏播放页面 -->

  <div>
    <!-- 背景遮罩 渐变色 -->
    <div class="mask">
      <!-- 音频可视化 -->
      <div class="absolute bottom-0px left-0px">
        <canvas
          :width="canvasSetting.with"
          :height="canvasSetting.height"
          id="visualizer"
        ></canvas>
      </div>
    </div>
    <!-- 背景遮罩 模糊-->
    <div class="mask2"></div>
    <!-- 背景遮罩 背景图片 -->
    <div :style="{ backgroundImage: `url(${url})` }" class="bg"></div>
    <!-- 内容区 -->
    <div class="z-99999 c-white relative h590px">
      <!-- 关闭播放界面按钮 -->
      <div
        @click="emit('closePage')"
        class="absolute top--40px cursor-pointer hover-color-emerald p-5px"
      >
        <el-icon :size="18"><ArrowDownBold /></el-icon>
      </div>
      <!-- 左侧区域 图片和播放控件 -->
      <div class="absolute w512px h506px left-20px pt60px">
        <!-- 图片 -->
        <img :src="url" alt="" class="ml100px w200px h200px" />
        <!-- 播放控件 -->
        <div class="w-400px h68px control mt75px">
          <!-- 进度条 -->
          <div @click="progressClick" class="p-b-10px cursor-pointer">
            <el-progress
              :percentage="percentage"
              :stroke-width="4"
              :show-text="false"
              color="rgba(22, 141, 123)"
            />
          </div>
          <!-- 播放器控制 -->
          <div class="absolute left--200px top-15px">
            <CenterControl></CenterControl>
          </div>
        </div>
      </div>
      <!-- 歌词区 -->
      <div class="absolute w512px h506px right-20px text-center top-5px">
        <!-- 歌曲名称 -->
        <h2 class="font-600">{{ currentMusic.name }}</h2>
        <!-- 歌手 -->
        <p class="mt10px color-#e1e1e1">
          歌手：{{ currentMusic.singer.map((item) => item.name).join("&") }}
        </p>
        <!-- 歌词内容 -->
        <div class="mt25px lry-list">
          <div
            class="block p-10-0"
            v-for="item in lryVisibleItem"
            :key="item.tiem"
            :class="{
              active: item.tiem === isActiveRow.tiem,
            }"
            v-html="item.words"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CenterControl from "./CenterControl.vue";

import { useWebAudioStore } from "@/stores/useWebAudio";
import { computed, watch, ref, onMounted } from "vue";
import { getLyric } from "@/api/qqApi";
import { strToSecond } from "@/utils/common";

interface Props {
  url: string;
}

type LryicItem = {
  tiem?: number;
  words?: string;
};

defineProps<Props>();

//关闭页面emit
const emit = defineEmits(["closePage"]);

//歌词加载 暂时没用
const loading = ref<boolean>(false);

//完整的歌词列表
const lryList = ref<LryicItem[]>([]);

//canvas画布宽高
const canvasSetting = {
  with: 1000,
  height: 125,
};

const audioStore = useWebAudioStore();

//当前播放歌曲信息
const songInfo = ref<SongItem>();

//当前播放歌曲
const currentMusic = computed(() => {
  return audioStore.musicStore.currentMusic;
});

//播放进度
const currentTime = computed(() => {
  return audioStore.musicStore.currentTime || 0;
});

//标识歌词正在唱的那一句
const isActiveRow = ref<LryicItem>({});

//计算歌词显示内容,只显示9行
const lryVisibleItem = computed(() => {
  const length = lryList.value.length;
  if (length === 0) return;
  let index: number;
  //获取当前正在唱的那一句
  for (let i = 0; i < length; i++) {
    if (
      lryList.value[i].tiem <= currentTime.value &&
      (i + 1 == length || lryList.value[i + 1].tiem > currentTime.value)
    ) {
      index = i;
      break;
    }
  }
  isActiveRow.value = lryList.value[index];
  //将start和end调整合适位置,一般activeRow处于正中间
  let start = index - 4,
    end = index + 5;
  if (start < 0) {
    end += -start;
    start = 0;
  }
  if (end > length) {
    start = start - (end - length) < 0 ? 0 : start - (end - length);
    end = length;
  }
  return lryList.value.slice(start, end);
});

//存放音频频率数据
const dataArray = new Uint8Array(1024);

//画音频频率
const drawVisualization = () => {
  const canvas = document.getElementById("visualizer") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvasSetting.with, canvasSetting.height);
  //获取当前的频率数据
  audioStore.analyser.getByteFrequencyData(dataArray);
  ctx.fillStyle = "transparent";
  ctx.fillRect(0, 0, canvasSetting.with, canvasSetting.height);

  let barWidth = (canvasSetting.with / 1024) * 2.5;
  let barHeight: number;
  let x = 0;
  for (let i = 0; i < 1024; i++) {
    barHeight = dataArray[i] / 2;

    ctx.fillStyle = `rgba(22, 141, 123,${barHeight / 125})`;

    ctx.fillRect(x, canvasSetting.height - barHeight, barWidth, barHeight);

    x += barWidth + 1;
  }
  //循环执行绘制频率
  requestAnimationFrame(drawVisualization);
};

//加载歌词
const loadLry = () => {
  loading.value = true;
  lryList.value = [];
  getLyric(songInfo.value.mid, songInfo.value.id).then((res) => {
    // 将歌词格式化
    //原格式为 [00:00.00]歌词内容
    //转为 {time:number,words:string}
    const reg = /(\[\d{2}:\d{2}[:\.]\d{2}\].*)/g;
    const list = res.match(reg);
    lryList.value = list
      .map((item) => {
        const index = item.indexOf("]");
        return {
          tiem: strToSecond(item.substring(1, index)),
          words: item.substring(index + 1),
        };
      })
      .filter((item) => item.words.length > 0);
  });
};

//进度条点击操控进度
const progressClick = (e: PointerEvent) => {
  audioStore.musicStore.seeking((e.x - 70) / 400);
};

//计算进度条比例
const percentage = computed(() => {
  return (
    (audioStore.musicStore.currentTime /
      (audioStore.musicStore.duration || 1)) *
    100
  );
});

//监听正在播放歌曲变化,加载歌词
watch(
  currentMusic,
  (value) => {
    songInfo.value = value;
    loadLry();
  },
  { immediate: true, deep: true }
);

onMounted(() => drawVisualization());
</script>

<style scoped lang="scss">
.mask,
.mask2,
.bg {
  position: absolute;
  width: 1000px;
  height: 680px;
  left: -20px;
  top: -60px;
}
.mask {
  z-index: 3;
  background-image: linear-gradient(
    to bottom,
    rgba(22, 141, 123, 1),
    rgba(22, 141, 123, 0.6),
    rgba(22, 141, 123, 0.4),
    rgba(22, 141, 123, 0.2)
  );
  opacity: 0.6;
  pointer-events: none;
}
.mask2 {
  z-index: 2;
  background-color: #bcc88f;
  filter: blur(200px);
  opacity: 0.8;
}
.bg {
  z-index: 1;
  opacity: 0.4;
  filter: blur(80px);
  background-size: 600px 600px;
  background-repeat: no-repeat;
  background-position: center;
}
canvas {
  display: block;
}
.lry-list {
  transition: all 0.7s linear;
}
.active {
  color: rgba(22, 141, 123, 1);
  font-size: 18px;
  font-weight: 600;
}
.control {
  background-color: rgba($color: #000000, $alpha: 0.1);
  border-radius: 2px;
  z-index: 99;
}
</style>
