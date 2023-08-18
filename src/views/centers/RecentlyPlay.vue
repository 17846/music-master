<template>
  <!-- 最近播放 -->

  <MusicList :song-list="songList" :loading="false" :page-info="{}"></MusicList>
</template>

<script setup lang="ts">
import MusicList from "@/components/MusicList.vue";

import { useResponse } from "@/utils/correspond";
import { onMounted, ref } from "vue";

//歌曲列表
const songList = ref<SongItem[]>([]);

interface Cache {
  path: string;
  info: SongItem;
}

type RecentlyPlay = {
  cache: Map<string, Cache>;
  usageQueue: string[];
};

//获取最近播放队列
const loadList = () => {
  useResponse<RecentlyPlay>("recently-play", null).then((res) => {
    const usageQueue = res.usageQueue
      .reverse()
      .filter((mid) => res.cache.has(mid));
    usageQueue.forEach((mid) => songList.value.push(res.cache.get(mid).info));
    console.log(songList);
  });
};

onMounted(() => {
  loadList();
});
</script>

<style scoped></style>
