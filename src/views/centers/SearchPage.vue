<template>
  <!-- 搜索结果页面 -->

  <div>
    <MusicList
      @next-page="nextPage"
      :loading="loading"
      :page-info="pageInfo"
      :song-list="songList"
    />
  </div>
</template>

<script setup lang="ts">
import MusicList from "@/components/MusicList.vue";

import { useRoute } from "vue-router";
import { search } from "@/api/qqApi";
import { ref, computed, watch } from "vue";

const loading = ref(true);

//歌曲列表分页信息
const pageInfo = ref<SearchMeta>({});

//歌曲列表
const songList = ref<SongItem[]>([]);

//页面路由,用于获取搜索关键字
const $route = useRoute();

/**
 * 搜索
 * @param page 当前页
 */
const loadData = async (page: number) => {
  if (page === 1) songList.value = [];
  loading.value = true;

  search(searchKey.value, page).then((res) => {
    pageInfo.value = res.req.data.meta ?? {};

    const list = res?.req?.data?.body?.item_song;

    if (list) songList.value.push(...list);
    loading.value = false;
  });
};

//搜索词
const searchKey = computed<string>(() => {
  if ($route.query.key) return $route.query.key.toString();
});

//搜索词变化时触发搜索
watch(
  searchKey,
  () => {
    loadData(1);
  },
  { immediate: true }
);

//加载下一页
const nextPage = () => {
  loadData(pageInfo.value.nextpage);
};
</script>

<style scoped></style>
