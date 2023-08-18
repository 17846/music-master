<template>
  <!-- 播放器左侧模块 -->

  <div class="position-absolute left-90px">
    <!-- 歌曲名称 -->
    <div class="text-12px w-170px h-20px overflow-hidden nowarp">
      <!-- 在未播放任何歌曲时显示 -->
      <span
        ref="songNameSpan"
        class="position-absolute"
        :style="{ left: left + 'px' }"
      >
        {{ songName }}
        <span v-if="store.songList.length > 0" class="color-blueGray">
          - {{ singer }}
        </span>
      </span>
    </div>
    <div class="m-t-5px flex">
      <!-- 下载按钮 -->
      <CustomSvg
        :width="18"
        :height="18"
        color="#797979"
        hover-color="#1ece9b"
        :name="isDownload ? SvgName.Downloaded : SvgName.Download"
        @click="handleDownload"
      />
      <!-- 添加到歌单按钮 -->
      <AddTo :item="currentMusic" :need-add-play="false" :top="1"></AddTo>
    </div>
  </div>
</template>

<script lang="ts" setup>
import AddTo from "./common/AddTo.vue";
import { ElMessage } from "element-plus";

import { onMounted, onUnmounted, ref, watch } from "vue";
import { useMusicStore } from "@/stores/useMusic";
import { computed } from "vue";
import { useDownloadStore } from "@/stores/useDownload";

import { SvgName } from "../../types/svg";

// musicStore
const store = ref<MusicStore>({
  songList: [],
  currentMusic: null,
});

//download store
const downloader = useDownloadStore();

//歌词left值
const left = ref(0);

//获取歌曲名dom
const songNameSpan = ref(null);

//定时器
let interval: NodeJS.Timer;
let timeout: NodeJS.Timeout;

//歌曲名
const songName = computed(() => {
  if (!!store.value.currentMusic) return store.value.currentMusic.name;
  return "随时随地听音乐";
});

//歌手
const singer = computed(() => {
  if (!!store.value.currentMusic) {
    return store.value.currentMusic.singer.map((item) => item.name).join("&");
  }
});

const currentMusic = computed(() => {
  return store.value.currentMusic;
});

//判断当前播放歌曲是否下载
const isDownload = computed(() => {
  if (!!currentMusic.value) {
    return (
      currentMusic.value.isDownload ||
      downloader.downloaded.has(currentMusic.value.mid)
    );
  }
});

//歌曲下载
const handleDownload = () => {
  if (!currentMusic) return;
  if (isDownload.value) {
    ElMessage({
      message: "当前歌曲已下载",
      type: "error",
      offset: 268,
    });
    return;
  }
  downloader.handleDownload([currentMusic.value], store.value.quality);
  ElMessage({
    message: "已将歌曲添加到下载队列",
    type: "success",
    offset: 268,
  });
};

//控制歌词滚动方向 false负方向 true为正方向
let flag = false;
/**
 * 当歌曲名称超过宽度后开启歌词滚动
 * @len 需要滚动的长度
 */
const textRoll = (len: number) => {
  const width = songNameSpan.value.offsetWidth;
  if (width < 170) return;
  interval = setInterval(() => {
    const val = left.value;
    if (flag) {
      if (val + 5 >= 0) {
        left.value = 0;
        flag = false;
        //到达最右边清除定时器，等待3秒再启动
        clearInterval(interval);
        timeout = setTimeout(() => {
          textRoll(len);
        }, 3000);
      } else {
        left.value = val + 5;
      }
    } else {
      if (val - 5 <= -len) {
        left.value = -len;
        flag = true;
        //到达最左边后清除定时器，然后等三秒钟再开始滚动歌名
        clearInterval(interval);
        timeout = setTimeout(() => {
          textRoll(len);
        }, 3000);
      } else {
        left.value = val - 5;
      }
    }
  }, 100);
};

//歌词滚动
watch(
  songName,
  () => {
    if (!songNameSpan.value) return;
    setTimeout(() => {
      const width = songNameSpan.value.offsetWidth;
      left.value = 0;
      clearInterval(interval);
      clearTimeout(timeout);
      textRoll(width - 170);
    });
  },
  { immediate: true }
);

onMounted(() => {
  store.value = useMusicStore();
  console.log(store.value.currentMusic);
});
/**
 * 组件卸载后删除定时器
 */
onUnmounted(() => {
  clearInterval(interval);
});
</script>
