<template>
  <!-- 歌手歌曲页面 -->

  <MusicList
    @next-page="handleNext"
    :loading="loading"
    :song-list="songList"
    :page-info="pageInfo"
    :padding-top="165"
  >
    <div class="flex pb16px">
      <img :src="picUrl" class="w60px h60px rd-50%" alt="" />
      <div class="ml28px">
        <h2 class="font-900">{{ singerName }}</h2>
        <span class="color-coolGray">歌曲数量: {{ pageInfo.sum }}</span>
      </div>
    </div>
  </MusicList>
</template>

<script setup lang="ts">
import MusicList from "@/components/MusicList.vue";

import { ref, computed, onActivated } from "vue";
import { useRoute } from "vue-router";
import { singerDetail } from "@/api/qqApi";

const $route = useRoute();

//歌手名称 路由传入
const singerName = ref<string>();

//歌手mid
const mid = ref<string>();

//歌曲列表
const songList = ref<SongItem[]>([]);

//页面加载
const loading = ref<boolean>(false);

//分页信息
const pageInfo = ref<SearchMeta>();

//歌手头像
const picUrl = computed(() => {
  return `https://y.qq.com/music/photo_new/T001R300x300M000${mid.value}.jpg?max_age=2592000`;
});

//加载数据
const loadData = () => {
  const start = pageInfo.value.nextpage;
  if (start === 0) {
    songList.value = [];
  }
  loading.value = true;
  singerDetail(start, mid.value).then((res) => {
    const data = res.req_1.data;

    //设置分页信息,与MusicList组件统一
    pageInfo.value = {
      sum: data.totalNum,
      nextpage: start + 20 < data.totalNum ? start + 20 : undefined,
    };

    const songInfoList = data.songList;
    const list: SongItem[] = songInfoList.map((item) => item.songInfo);
    songList.value.push(...list);
    loading.value = false;
  });
};

//下一页
const handleNext = () => {
  if (pageInfo.value.nextpage) {
    loadData();
  }
};

onActivated(() => {
  const query = $route.query;
  if (query.mid) {
    singerName.value = query.singer as string;
    mid.value = query.mid as string;
    pageInfo.value = {
      sum: 0,
      nextpage: 0,
    };
    loadData();
  }
});
</script>

<style scoped></style>
