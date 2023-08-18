<template>
  <!-- 播放器 -->

  <div ref="area">
    <!-- 进度条 由于进度条太小,所以div内点击都可以修改播放进度 -->
    <div @click="progressClick" class="p-b-10px cursor-pointer">
      <el-progress
        :percentage="percentage"
        :stroke-width="2"
        :show-text="false"
        color="#1ecc94"
      />
    </div>

    <!-- 播放器左侧模块 -->
    <div>
      <div class="music-image">
        <!-- 图片 -->
        <img :class="commonStyle + ' z-0'" :src="picUrl" />
        <!-- 点击显示播放界面 -->
        <div
          @click="openPlayPage"
          title="展开播放页面"
          :class="
            commonStyle +
            ' z-10 bg-gray-7 opacity-50 rotate-90 flex-center image-mask'
          "
        >
          <el-icon color="#fff" size="20"><DArrowLeft /></el-icon>
        </div>
      </div>

      <!-- 歌名、下载和添加歌单 -->
      <PlayerLeft />
    </div>

    <!-- 播放暂停、上一首、下一首、随机播放 -->
    <div>
      <CenterControl />
    </div>

    <!-- 播放器右侧 -->
    <div>
      <PlayRight />
    </div>
  </div>

  <!-- 播放界面 -->
  <el-dialog :show-close="false" :fullscreen="true" v-model="dialogVisible">
    <PlayPage @close-page="dialogVisible = false" :url="picUrl"></PlayPage>
  </el-dialog>
</template>

<script setup lang="ts">
import PlayerLeft from "@/components/PlayerLeft.vue";
import CenterControl from "@/components/CenterControl.vue";
import PlayRight from "@/components/PlayerRight.vue";
import PlayPage from "@/components/PlayPage.vue";

import { useWebAudioStore } from "@/stores/useWebAudio";
import { computed, onMounted, ref } from "vue";

//公共样式 unocss居然支持解析变量
const commonStyle =
  "w-40px h-40px cursor-pointer border-rd-1 position-absolute top-3px left-35px";

const audioStore = ref<WebAudioStore>({
  musicStore: {
    currentTime: 0,
    duration: 0,
  },
});

//播放界面显示
const dialogVisible = ref<boolean>(false);

//计算当前播放进度
const percentage = computed(() => {
  return (
    (audioStore.value.musicStore.currentTime /
      (audioStore.value.musicStore.duration || 1)) *
    100
  );
});

const openPlayPage = () => {
  if (audioStore.value.musicStore.duration === 0) return;
  dialogVisible.value = true;
};

//图片地址
const picUrl = computed(() => {
  const store = audioStore.value.musicStore;
  let tag: number = 2;
  const mid =
    store.currentMusic?.album?.pmid || store.currentMusic?.singer[0]?.mid;
  if (!store.currentMusic?.album?.pmid) {
    tag = 1;
  }
  // 有专辑使用专辑图片
  if (!mid)
    return "https://huijiu-bucket.oss-cn-hangzhou.aliyuncs.com/huijiu4.1/picture/2023-05-29/369bdddd5f58405e95d38da7639f02a9.jpg";
  // 没用专辑使用歌手图片
  return `https://y.qq.com/music/photo_new/T00${tag}R300x300M000${mid}.jpg?max_age=2592000`;
});

/**
 * 进度条点击处理函数
 * width 1000 left 220
 * percentage = (x-220)/780 * 100
 * @param e
 */
const progressClick = (e: PointerEvent) => {
  // percentage.value = ((e.x - 220) / 780) * 100;
  audioStore.value.musicStore.seeking((e.x - 220) / 780);
};

onMounted(() => {
  const store = useWebAudioStore();
  audioStore.value = store;
});
</script>

<style scoped lang="scss">
.music-image {
  .image-mask {
    visibility: hidden;
  }
  &:hover {
    .image-mask {
      visibility: visible;
    }
  }
}
</style>
