<template>
  <!-- 歌曲列表 -->

  <div class="w-100% pl14px pr14px">
    <MusicListSkeleton
      :need-button="props.needDefaultButton"
      :loading="props.loading && props.songList.length === 0"
    >
      <div class="fixed z-99 bg-white w-720px">
        <!-- 默认播放和下载按钮 -->
        <div v-if="props.needDefaultButton">
          <div>
            <slot></slot>
          </div>
          <div class="flex">
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
            <el-button
              style="width: 110px; height: 32px"
              round
              color="rgb(230, 230, 230)"
              @click="dialogVisible = true"
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
          </div>
        </div>

        <!-- 自定义头部插槽 -->
        <div v-else>
          <slot></slot>
        </div>
        <!-- 歌曲列表表头 -->
        <div class="flex mt25px color-#7b7b7b">
          <span class="inline-block w-100px">歌曲</span>
          <span class="ml236px">歌手</span>
          <span class="ml115px">专辑</span>
          <span class="ml115px">时长</span>
        </div>
      </div>
      <div
        :style="{
          paddingTop: props.paddingTop + 'px',
        }"
      >
        <el-empty
          description="歌曲列表为空"
          image="http://cdn.uviewui.com/uview/empty/order.png"
          v-if="songList.length === 0"
        />
        <!-- 歌曲列表 -->
        <VirtualList
          :scroll-top="scrollTop"
          :visible-height="visibleHeight"
          :container-height="containerHeight"
          :song-list="songList"
        ></VirtualList>
      </div>
      <!-- 加载下一页 -->
      <div
        v-if="loading && props.songList.length > 0 && props.pageInfo.nextpage"
      >
        <el-divider border-style="dashed">
          <div>
            <el-icon class="rotate" :size="20" color="#3dc2a5"
              ><Loading
            /></el-icon>
          </div>
        </el-divider>
      </div>
      <!-- 回到顶部 -->
      <div class="to-top" @click="handleToTop" v-show="scrollTop > 20">
        <el-icon><ArrowUp /></el-icon>
      </div>
    </MusicListSkeleton>

    <!-- 下载弹框 -->
    <el-dialog v-model="dialogVisible" title="歌曲下载" width="45%">
      <div>
        <span class="color-black font-600">歌曲名称: </span>
        <span class="c-rose">{{
          props.songList.length > 0 ? props.songList[0].name : ""
        }}</span>
        <span>{{
          props.songList.length > 1
            ? " 等" + props.songList.length + "首歌曲"
            : ""
        }}</span>
      </div>
      <div class="m-15-0">
        <span class="color-black font-600">下载音质: </span>
        <el-select v-model="downloadQuality" placeholder="Select">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <div>
        <span class="color-black font-600">下载地址: </span>
        <span>{{
          (downloader.path.downloadPath as string).replaceAll("\\", "/")
        }}</span>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="downloadAll"> 确定 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import VirtualList from "./common/VirtualList.vue";

import { onMounted, ref, toRaw, watchEffect, onUnmounted } from "vue";
import { useMusicStore } from "@/stores/useMusic";
import { useDownloadStore } from "@/stores/useDownload";
import MusicListSkeleton from "./skeleton/MusicListSkeleton.vue";

import { SvgName } from "../../types/svg";

/**
 * props
 * loading 页面加载状态
 * songList 歌曲列表
 * pageInfo 歌曲列表分页信息
 * needDefaultButton 是否需要默认的播放和下载按钮
 * paddingTop 列表的padding-top
 */
type Props = {
  loading: boolean;
  songList: SongItem[];
  pageInfo: SearchMeta;
  needDefaultButton?: boolean;
  paddingTop?: number;
};
const props = withDefaults(defineProps<Props>(), {
  paddingTop: 85,
  needDefaultButton: true,
});

//music store 获取音质
const store = ref<MusicStore>({ quality: "320kmp3" });

//下载store
const downloader = useDownloadStore();

// nextPage 加载下一页
const emit = defineEmits(["nextPage"]);

//滚动容器
const el = ref<HTMLDivElement>();

//页面滚动距离
const scrollTop = ref<number>(0);

//批量下载时的显示框`
const dialogVisible = ref<boolean>(false);

//下载音质
const downloadQuality = ref<Quality>("320kmp3");

const options = [
  { value: "320kmp3", label: "标准" },
  { value: "hq", label: "HQ高品质" },
  { value: "sq", label: "SQ无损品质" },
];

const containerHeight = ref<number>(0);

const visibleHeight = ref<number>(514 - props.paddingTop);

//歌曲列表滚动事件处理函数
const handleScroll = (e: MouseEvent) => {
  const target = e.target as HTMLDivElement;
  scrollTop.value = target.scrollTop;
  if (target.scrollTop + 514 === target.scrollHeight) {
    emit("nextPage");
  }
};

//回到顶部
const handleToTop = () => {
  const scroll = el.value as HTMLDivElement;
  scroll.scrollTop = 0;
};

//播放全部
const handlePlayAll = () => {
  store.value.playAll(props.songList, null);
};

//下载全部
const downloadAll = () => {
  const len = props.songList.length;
  if (len === 0) {
    ElMessage({
      message: `当前页面暂无歌曲`,
      type: "error",
    });
    return;
  }
  ElMessage({
    message: `已将 ${props.songList.length} 首歌曲添加到下载队列`,
    type: "success",
  });
  downloader.handleDownload(toRaw(props.songList), downloadQuality.value);
};

//用于暴露
const setDownloadVisible = () => {
  dialogVisible.value = true;
};

/**
 * 高度 subtitle 80 无desc 48
 */
watchEffect(() => {
  if (props.songList.length > 0) {
    let height = 0;
    props.songList.forEach((item) => {
      if (item.subtitle) height += 76;
      else height += 44;
    });
    containerHeight.value = height;
  }
});

//监控歌曲列表滚动事件，用于控制回到顶部显示和触底加载下一页
onMounted(() => {
  const box = document.querySelector("#center-model");
  el.value = box as HTMLDivElement;
  box.addEventListener("scroll", handleScroll);
  store.value = useMusicStore();

  downloadQuality.value = store.value.quality;
});

//移除组件时清除滚动事件监听
onUnmounted(() => {
  el.value.removeEventListener("scroll", handleScroll);
});

defineExpose({
  handlePlayAll,
  setDownloadVisible,
});
</script>

<style scoped lang="scss">
.rotate {
  animation: rotate 0.8s infinite linear;
  transform-origin: center center;
}

@keyframes rotate {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}

.to-top {
  position: fixed;
  right: 22px;
  bottom: 80px;
  width: 30px;
  height: 30px;
  border: 1px solid #bfbebe;
  opacity: 0.7;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}
.to-top:hover {
  color: #1ece9a;
  border-color: #1ece9a;
}
</style>
