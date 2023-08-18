<template>
  <!-- 下载页面 -->

  <div>
    <div
      class="flex pt10px justify-between pl10px color-#000 fixed z-999 w730px"
    >
      <!-- 菜单 切换 本地歌曲和正在下载 -->
      <div class="flex">
        <div
          class="cursor-pointer hover-color-#1cc38f"
          :class="{ 'active-item': activeItem === 'local' }"
          @click="handleChangeTab('local')"
        >
          本地歌曲
        </div>

        <div
          @click="handleChangeTab('downloading')"
          class="cursor-pointer ml46px hover-color-#1cc38f"
        >
          <el-badge
            :hidden="downloadingNum === 0"
            :value="downloadingNum"
            class="item"
          >
            <div :class="{ 'active-item': activeItem === 'downloading' }">
              正在下载
            </div>
          </el-badge>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div>
        <!-- 本地歌曲操作按钮 -->
        <div class="flex items-center" v-if="activeItem === 'local'">
          <!-- 播放全部 -->
          <el-button
            style="color: #fff"
            size="small"
            color="rgb(30, 206, 156)"
            @click="handlePlayAll"
          >
            <CustomSvg
              color="#fff"
              :width="15"
              :height="15"
              :top="1"
              :name="SvgName.PlayPlain"
            ></CustomSvg>
            <span class="ml3px">播放全部</span>
          </el-button>

          <!-- 打开下载目录 -->
          <el-icon
            @click="openDir"
            :size="18"
            title="打开下载目录"
            color="#9d9d9d"
            class="cursor-pointer hover-color-#1fcfa1 ml25px"
            ><FolderOpened
          /></el-icon>
        </div>

        <!-- 正在下载操作按钮 -->
        <div class="flex items-center" v-else>
          <!-- 全部开始 -->
          <el-button
            style="color: #fff"
            size="small"
            color="rgb(30, 206, 156)"
            @click="handleStartAll"
          >
            <CustomSvg
              color="#fff"
              :width="15"
              :height="15"
              :top="1"
              :name="SvgName.PlayPlain"
            ></CustomSvg>
            <span class="ml3px">全部开始</span>
          </el-button>
          <!-- 全部暂停 -->
          <el-button type="danger" size="small" @click="handlePauseAll">
            <CustomSvg
              color="#fff"
              :width="15"
              :height="15"
              :top="1"
              :name="SvgName.PauseIcon"
            ></CustomSvg>
            <span class="ml3px">全部暂停</span>
          </el-button>

          <!-- 清空 -->
          <el-button
            @click="handleClearAll"
            title="清空"
            size="small"
            type="info"
            circle
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 歌曲列表区域 -->
    <div>
      <!-- 本地歌曲列表 -->
      <MusicList
        v-if="activeItem === 'local'"
        :song-list="songList"
        :need-default-button="false"
        :padding-top="80"
        :loading="false"
        :page-info="{}"
        ref="musicDom"
      >
        <!-- 设置一个空白的slot撑开MusicList头部 -->
        <div class="h26px"></div>
      </MusicList>

      <!-- 正在下载列表 -->
      <div v-else class="pt28px">
        <DownloadingList></DownloadingList>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MusicList from "@/components/MusicList.vue";
import DownloadingList from "@/components/DownloadinList.vue";

import { ref } from "vue";
import { useDownloadStore } from "@/stores/useDownload";
import { computed } from "vue";
import { useResponse } from "@/utils/correspond";
import { onMounted } from "vue";

import { SvgName } from "../../../types/svg";

//通过ref操作MusicList播放全部或者下载全部
const musicDom = ref(null);

// 值为local 和 downloading 菜单标记
const activeItem = ref<string>();

const downloader = useDownloadStore();

//歌曲列表
const songList = computed(() => {
  const list: SongItem[] = [];
  //直接赋值会影响downloaded
  downloader.downloaded.forEach((item) => {
    list.push(item.info);
  });
  //反转列表
  return list.reverse();
});

//计算正在下载数量
const downloadingNum = computed(() => {
  return downloader.downloading.length;
});

//菜单切换
const handleChangeTab = (name: string) => {
  activeItem.value = name;
};

//打开下载目录
const openDir = () => {
  useResponse("open-download-path", null);
};

//播放全部
const handlePlayAll = () => {
  if (downloader.downloading.length === 0) return;
  musicDom.value.handlePlayAll();
};

// 暂停全部
const handlePauseAll = () => {
  if (downloader.downloading.length === 0) return;
  downloader.pauseAll();
};

//全部开始
const handleStartAll = () => {
  //只将当前状态不为暂停的开始 (state是显示的操作按钮名称 暂停 表示正在下载 点击按钮暂停 )
  const list = downloader.downloading.filter((item) => item.state !== "暂停");
  if (list.length === 0) return;
  //修改被开始下载任务状态
  list.forEach((item) => (item.state = "暂停"));
  downloader.handleDownload(list, null, true);
};

//清空下载队列
const handleClearAll = () => {
  if (downloader.downloading.length === 0) return;
  downloader.pauseAll(true);
};

onMounted(() => {
  if (downloader.downloading.length > 0) {
    activeItem.value = "downloading";
  } else {
    activeItem.value = "local";
  }
});
</script>

<style scoped lang="scss">
.active-item {
  color: #1cc38f;
  position: relative;
  &::after {
    content: "";
    position: absolute;
    width: 30px;
    height: 3px;
    display: block;
    background-color: #1cc38f;
    border-radius: 2px;
    top: 27px;
    left: 13px;
  }
}
</style>
