<template>
  <!-- 歌单详情页面 -->

  <!-- 加载失败重试 -->
  <div v-if="isLoadFail" class="w100% h400px flex-center">
    <el-empty
      description="访问失败，点此重试"
      image="https://huijiu-bucket.oss-cn-hangzhou.aliyuncs.com/huijiu4.1/picture/2023-08-17/be1deace0d1647ba92b7c69b76f40c29.png"
      @click="handleLoad(disstId, true)"
    />
  </div>

  <!-- 内容区 -->
  <div v-else>
    <!-- 骨架屏 -->
    <SheetDetailSkeleton :loading="loading" v-if="loading">
    </SheetDetailSkeleton>
    <MusicList
      :song-list="musicList"
      :loading="loading"
      :page-info="{}"
      :need-default-button="false"
      :padding-top="190"
      ref="listRef"
    >
      <div class="flex ml15px">
        <!-- 歌单图片 -->
        <img :src="sheetPicture" class="w120px h120px rd-10px" alt="" />

        <div class="ml35px c-black">
          <!-- 歌单名称 -->
          <h2 class="w-510px text-truncate font-900">
            {{ sheetInfo.diss_name }}
          </h2>
          <!-- 歌单描述 -->
          <p
            class="w520px max-h43px scroll color-#787878 mt5px scroll-hover-hidden"
            v-html="sheetInfo.desc"
          ></p>
          <!-- 按钮组 -->
          <div class="flex mt10px">
            <!-- 播放按钮 -->
            <el-button
              style="width: 110px; height: 32px; color: #fff"
              round
              color="rgb(30, 206, 156)"
              @click="handlePlayAll"
            >
              <CustomSvg
                color="#fff"
                :width="16"
                :height="16"
                :top="1"
                :name="SvgName.PlayPlain"
              ></CustomSvg>
              <span class="ml3px">播放全部</span>
            </el-button>

            <!-- 下载按钮 -->
            <el-button
              style="width: 110px; height: 32px"
              round
              color="rgb(230, 230, 230)"
              @click="handleDownload"
            >
              <CustomSvg
                color="#000"
                :width="18"
                :height="18"
                :top="1"
                :name="SvgName.Download"
              ></CustomSvg>
              <span class="ml5px">下载</span></el-button
            >

            <!-- 收藏按钮 -->
            <el-button
              :title="isCollect ? '取消收藏' : '收藏歌单'"
              v-if="markerShow"
              :type="isCollect ? 'danger' : 'info'"
              :icon="Star"
              circle
              @click="handleMarker"
            />
          </div>
        </div>
      </div>
    </MusicList>
  </div>
</template>

<script setup lang="ts">
import SheetDetailSkeleton from "@/components/skeleton/SheetDetailSkeleton.vue";
import MusicList from "@/components/MusicList.vue";
import { Star } from "@element-plus/icons-vue";

import { computed, watch, ref } from "vue";
import { useRoute } from "vue-router";
import { useResponse } from "@/utils/correspond";
import { useInfoStore } from "@/stores/user";
import { useSheetManageStore } from "@/stores/useSheetManage";
import { deepClone, formatSongInfo } from "@/utils/common";

import { SvgName } from "../../../types/svg";

const sheetManageStore = useSheetManageStore();

const loading = ref<boolean>(false);

//用户信息
const info = useInfoStore();

const $route = useRoute();

//歌单id
const disstId = computed<string>(() => {
  return $route.query.id as string;
});

//歌单信息
const sheetInfo = ref<DissList>({});

//歌单列表
const musicList = ref<SongItem[]>([]);

const listRef = ref(null);

//加载失败标识
const isLoadFail = ref<boolean>(false);

// 播放全部
const handlePlayAll = () => {
  listRef.value.handlePlayAll();
};

// 下载全部
const handleDownload = () => {
  listRef.value.setDownloadVisible();
};

// 收藏或取消收藏歌单
const handleMarker = () => {
  if (isCollect) {
    sheetManageStore.cancelMark(sheetInfo.value);
  } else {
    sheetManageStore.markPlaylists(sheetInfo.value);
  }
};

// 歌单图片
const sheetPicture = computed(() => {
  // 有海报则用海报
  if (sheetInfo.value.diss_cover) return sheetInfo.value.diss_cover;
  // 有歌曲用第一首歌曲的歌手作为图片
  if (musicList.value.length > 0)
    return `https://y.qq.com/music/photo_new/T001R300x300M000${musicList.value[0].singer[0].mid}.jpg?max_age=2592000`;
  // 没用则使用默认图片
  return "https://huijiu-bucket.oss-cn-hangzhou.aliyuncs.com/huijiu4.1/picture/2023-08-17/858b2fb56b55475298d5c0c2b63da098.png";
});

// 是否显示收藏图标 新歌 每日30首 自定义歌单 不可收藏
const markerShow = computed(() => {
  if (!sheetInfo.value) return false;
  return (
    !sheetInfo.value?.diss_name?.includes("今日私享") &&
    !sheetInfo.value?.diss_name?.includes("新发风向") &&
    !$route.query.isCustom
  );
});

//判断歌单是否被收藏
const isCollect = computed(() => {
  if (!sheetInfo.value) return false;
  let flag = false;
  const disstid = sheetInfo.value.tid;
  sheetManageStore.collectionSheet.forEach((item) => {
    if (item.tid == disstid) flag = true;
  });
  return flag;
});

//加载歌单歌曲,在线歌单版
const handleLoadSheet = (val: string) => {
  musicList.value = [];
  loading.value = true;

  useResponse<SheetDetailV2>("sheet-detail", val)
    .then((res) => {
      const { dirinfo, songlist } = res?.req_0.data;
      loading.value = false;
      const { picurl, title, desc, songnum, listennum, id } = dirinfo;
      sheetInfo.value = {
        tid: id,
        diss_name: title,
        diss_cover: picurl,
        listen_num: listennum,
        desc,
        song_cnt: songnum,
      };
      musicList.value = songlist.map((item) => formatSongInfo(item));
    })
    .catch(() => (isLoadFail.value = true));
};

//加载歌曲,用户歌单版 用户歌单会本地保存歌曲
const handleLoadCustomSheet = (id: string) => {
  musicList.value = [];
  loading.value = true;
  const sheet = sheetManageStore.createdSheet.find((item) => item.tid == id);
  sheetInfo.value = sheet;
  useResponse<SongItem[]>("sheet-music-list", {
    sheet: deepClone(sheet),
    userId: info.userInfo.uin,
  })
    .then((res) => {
      musicList.value = res.map((item) => formatSongInfo(item));
      loading.value = false;
    })
    .catch(() => {
      isLoadFail.value = true;
    });
};

//加载歌单歌曲
const handleLoad = (val: string, isFlash = false) => {
  if (!val || (sheetManageStore.disstid == val && !isFlash)) return;

  sheetManageStore.setDisstId(val);

  isLoadFail.value = false;
  if ($route.query.isCustom) {
    handleLoadCustomSheet(val);
  } else {
    handleLoadSheet(val);
  }
};

//根据路由的 id改变来加载歌单
watch(
  disstId,
  (val) => {
    handleLoad(val);
  },
  { immediate: true }
);
</script>

<style scoped></style>
