<template>
  <!-- 专辑详情页 -->

  <MusicList
    :padding-top="210"
    :song-list="songList"
    :page-info="{}"
    :loading="loading"
  >
    <div class="flex pb10px">
      <!-- 海报图片 -->
      <img :src="picurl" class="h120px w120px rd-10px" alt="" />
      <div class="ml28px">
        <!-- 专辑名称 -->
        <h2 class="font-900">专辑: {{ albumInfo.name }}</h2>
        <!-- 专辑介绍 -->
        <p
          class="w580px max-h43px scroll color-#787878 mt5px scroll-hover-hidden"
        >
          {{ albumInfo.desc }}
        </p>
        <div class="mt10px c-coolGray text-14px">
          <span>歌曲数量: {{ albumInfo.total }}</span>
          <span class="ml120px">发布日期: {{ albumInfo.aDate }}</span>
        </div>
      </div>
    </div>
  </MusicList>
</template>

<script setup lang="ts">
import MusicList from "@/components/MusicList.vue";

import { albumDetail } from "@/api/qqApi";
import { formatToNormal } from "@/utils/common";
import { onActivated, ref, computed } from "vue";
import { useRoute } from "vue-router";

const loading = ref<boolean>(false);

const $route = useRoute();

// 专辑信息
const albumInfo = ref<AlbumDetail>({});

// 歌曲列表
const songList = ref<SongItem[]>([]);

// 海报地址
const picurl = computed(() => {
  if (!albumInfo.value?.mid) return;
  return `https://y.qq.com/music/photo_new/T002R300x300M000${albumInfo.value?.mid}.jpg?max_age=2592000`;
});

// 获取专辑详情
const loadData = (mid: string) => {
  songList.value = [];
  loading.value = true;
  albumDetail(mid).then((res) => {
    console.log(res);
    const data = res.data;

    albumInfo.value = {
      aDate: data.aDate,
      name: data.name,
      mid: data.mid,
      total: data.total,
      singername: data.singermid,
      singermid: data.singername,
      desc: data.desc,
    };

    // 将 SheetSongItem 转为 SongItem
    songList.value = data.list.map((item) => formatToNormal(item));
    loading.value = false;
  });
};

onActivated(() => {
  const query = $route.query;
  if (query.mid) loadData(query.mid as string);
});
</script>

<style scoped></style>
