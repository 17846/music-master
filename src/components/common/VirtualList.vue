<template>
  <!-- 虚拟列表  -->

  <div>
    <div class="z--1" :style="{ height: containerHeight + 'px' }">
      <!-- 占位元素，高度为可见项之前所有项的高度之和 -->
    </div>
    <div class="absolute" :style="{ top: scrollTop + 'px' }">
      <div
        class="flex hover-bg-#efefef text-14px p-11-10 color-black song-item w-720px"
        :class="{
          'active-row': activeRow === item.mid,
        }"
        v-for="(item, index) in visibleItems"
        :key="index"
        @click="activeRow = item.mid"
      >
        <!-- 歌名、音质、原唱、播放控件 -->
        <div class="w326px relative">
          <div class="flex items-center">
            <!-- 歌名  -->
            <span class="inline-block max-w210px text-truncate song-name">{{
              item.name
            }}</span>
            <MusicTag v-bind="item" />
          </div>
          <!-- 播放控件 -->
          <div class="display-none music-control absolute right-22px top-0">
            <CustomSvg
              @click="handlePlay(item)"
              v-bind="controlSvgProps"
              :name="SvgName.PlayPlain"
            />
            <CustomSvg
              v-bind="{
                ...controlSvgProps,
                width: 20,
                height: 20,
                color: '#828282',
              }"
              :name="
                isDownload(item.mid) ? SvgName.Downloaded : SvgName.Download
              "
              class="ml9px"
              @click="handleDownload(item)"
            />
            <!-- 添加到歌单和播放队列 -->
            <AddTo :item="item" :need-add-play="true"></AddTo>
          </div>
          <!-- 子标题 -->
          <div v-if="item.subtitle" class="mt10px color-#787878 text-12px">
            {{ item.subtitle }}
          </div>
        </div>
        <!-- 歌手 -->
        <div
          class="text-truncate w120px"
          @click="handleSingerClick"
          v-html="toSingerString(item.singer)"
        ></div>
        <!-- 专辑 -->
        <div
          :title="item.album?.name"
          @click="handleAlbumClick(item)"
          class="singer w120px ml25px text-truncate"
        >
          {{ item.album?.name }}
        </div>
        <!-- 时长 -->
        <div class="ml25px color-#a8a8a8">
          {{ secondToStr(item.interval) }}
        </div>
        <div
          class="pt4px ml15px"
          v-if="store?.currentMusic?.mid === item.mid && store?.isPlay"
        >
          <NoteJumping />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import NoteJumping from "./NoteJumping.vue";
import MusicTag from "./MusicTag.vue";
import AddTo from "./AddTo.vue";
import { ElMessage } from "element-plus";

import { secondToStr, toSingerString } from "@/utils/common";
import { useMusicStore } from "@/stores/useMusic";
import { useDownloadStore } from "@/stores/useDownload";
import { ref, computed, onMounted, toRaw } from "vue";
import { useRouter } from "vue-router";

import { SvgName } from "../../../types/svg";
/**
 * containerHeight 内容总高度
 * visibleHeight 可视区高度
 * songList 歌曲列表
 * scrollTop 距离顶部值
 */
interface Props {
  containerHeight: number;
  visibleHeight: number;
  songList: SongItem[];
  scrollTop: number;
}

/**
 * class 样式
 * width、height 宽高
 * top 顶部偏移量
 * hoverColor 鼠标悬停色
 */
type NewIconProps = {
  class: string;
  width: string;
  height: string;
  hoverColor: string;
  top: number;
};

const props = defineProps<Props>();

const $router = useRouter();

// icon通用样式
const controlSvgProps: NewIconProps = {
  class: "inline-block",
  width: "18",
  height: "18",
  hoverColor: "#3dc2a5",
  top: 3,
};

const downloader = useDownloadStore();

const store = ref<MusicStore>({ quality: "320kmp3" });

//激活的行
const activeRow = ref<string>();

//计算显示的内容
const visibleItems = computed(() => {
  let start = 0;
  let offset = 0;
  for (let i = 0; i < props.songList.length; i++) {
    if (props.songList[i].subtitle) offset += 76;
    else offset += 44;
    if (offset > props.scrollTop) {
      start = i;
      break;
    }
  }
  let end = start;
  let len = 0;
  while (len < props.visibleHeight && end < props.songList.length) {
    const item = props.songList[end];
    if (item.subtitle) len += 76;
    else len += 44;
    end++;
  }
  if (len > props.visibleHeight && props.songList.length - end < 3) end--;
  return props.songList.slice(start, end);
});

//歌曲下载
const handleDownload = (item: SongItem) => {
  if (isDownload(item.mid)) {
    ElMessage({
      message: "当前歌曲已下载",
      type: "warning",
      offset: 268,
    });
    return;
  }
  ElMessage({
    message: "已将歌曲添加到下载队列",
    type: "success",
    offset: 268,
  });
  downloader.handleDownload([toRaw(item)], store.value.quality);
};

//判断是否下载
const isDownload = (mid: string) => {
  return downloader.downloaded.has(mid);
};

//点击歌手跳转到歌手界面
const handleSingerClick = (e: PointerEvent) => {
  const span = e.target as HTMLSpanElement;
  const dateset = span.dataset;
  if (dateset.mid) {
    // return;
    const path = `/index/singer?singer=${span.innerText}&mid=${dateset.mid}`;
    console.log(path);
    $router.push(path);
  }
};

//跳转到专辑页面
const handleAlbumClick = (item: SongItem) => {
  $router.push("/index/album?mid=" + item.album.mid);
};

//播放歌曲
const handlePlay = (item: SongItem) => {
  store.value.addToList(item, 1);
};

onMounted(() => {
  store.value = useMusicStore();
});
</script>

<style scoped lang="scss">
.song-item {
  &:hover {
    .song-name {
      max-width: 130px;
    }
    .music-control {
      display: block;
    }
  }
}
.active-row {
  background-color: #efefef;
  .song-name {
    max-width: 130px !important;
  }
  .music-control {
    display: block !important;
  }
}
</style>
