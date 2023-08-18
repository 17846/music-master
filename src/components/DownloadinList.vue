<template>
  <!-- 正在下载下载队列 -->

  <div class="pl10px">
    <div class="flex mt25px color-#7b7b7b">
      <span class="inline-block w-100px">歌曲</span>
      <span class="ml200px">大小</span>
      <span class="ml115px">进度</span>
      <span class="ml151px">操作</span>
    </div>
    <div class="mt16px h410px scroll absolute w742px">
      <div v-if="downloader.downloading.length === 0">
        <el-empty
          description="暂无正在下载歌曲"
          image="http://cdn.uviewui.com/uview/empty/order.png"
        />
      </div>
      <!-- 下载列表 -->
      <div
        class="flex p-10-5 hover-bg-#f3f3f3 item-row"
        :class="{ 'active-row': item.mid === activeRow }"
        v-for="item in downloader.downloading"
        :key="item.mid"
        @click="activeRow = item.mid"
      >
        <!-- 歌曲名称 -->
        <div class="w-230px text-truncate">{{ item.name }}</div>

        <!-- 文件大小 -->
        <div class="w-120px ml65px text-truncate">{{ getSize(item) }}M</div>

        <!-- 下载进度 -->
        <div class="w-150px pt8px ml27px">
          <el-progress
            :striped-flow="true"
            :stroke-width="8"
            :striped="true"
            :show-text="false"
            :percentage="item.progress"
            :status="item.progress === -1 ? 'exception' : ''"
          />
        </div>

        <!-- 操作栏 -->
        <div class="ml30px flex items-center">
          <!-- 暂停 继续 重试 -->
          <el-tag @click="handleOperation(item)" class="cursor-pointer">{{
            item.state
          }}</el-tag>

          <!-- 取消下载 -->
          <el-icon
            @click="handleCancel(item)"
            class="ml10px cursor-pointer hover-color-#1fcfa1 close-button"
            ><Close
          /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useDownloadStore } from "@/stores/useDownload";

const downloader = useDownloadStore();

const activeRow = ref<string>();

//暂停或继续下载
const handleOperation = (item: Downloading) => {
  if (item.state === "暂停") {
    //暂停
    downloader.handlePause(item);
  } else {
    //继续下载
    item.state = "暂停";
    downloader.handleDownload([item], item.quality, true);
  }
};

//取消下载
const handleCancel = (item: Downloading) => {
  downloader.handlePause(item, true);
};

//计算文件大小 byte => Mb
const getSize = (item: Downloading) => {
  const map = {
    "320kmp3": "size_128mp3",
    hq: "size_320mp3",
    sq: "size_flac",
  };
  const size = item.file[map[item.quality]] / (1024 * 1024);
  return size.toFixed(2);
};
</script>

<style scoped lang="scss">
.close-button {
  display: none;
}
.item-row:hover {
  .close-button {
    display: block;
  }
}
.active-row {
  background-color: #f3f3f3;
  .close-button {
    display: block;
  }
}
</style>
