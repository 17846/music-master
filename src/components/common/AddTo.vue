<template>
  <!-- 添加到组件 -->

  <div class="inline-block">
    <el-popover
      :hide-after="0"
      trigger="click"
      placement="bottom-start"
      :offset="-1"
      :width="200"
      :show-arrow="false"
      popper-class="add-popper"
    >
      <div class="max-h-300px scroll p-15-0">
        <div v-if="needAddPlay" class="b-b-solid b-b b-b-#f5f5f5">
          <p @click="handlePlay(item, 3)" :class="sheetItemClass">播放队列</p>
          <p @click="handlePlay(item, 2)" :class="sheetItemClass">下一首播放</p>
        </div>
        <!-- 歌单列表 -->
        <div>
          <p
            :class="sheetItemClass"
            v-for="sheet in sheetList"
            :key="sheet.tid"
            @click="handleAddToSheet(item, sheet)"
          >
            {{ sheet.diss_name }}
          </p>
        </div>
      </div>
      <!-- 添加到按钮 -->
      <template #reference>
        <CustomSvg
          :width="18"
          :height="18"
          :top="top ?? 2"
          color="#a4a4a4"
          hover-color="#1ece9b"
          :name="SvgName.AddTo"
          class="m-l-15px"
        />
      </template>
    </el-popover>
  </div>
  <div ref="fakeDom" id="fake-dom"></div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";

import { useMusicStore } from "@/stores/useMusic";
import { useSheetManageStore } from "@/stores/useSheetManage";
import { ref, onMounted, computed } from "vue";

import { SvgName } from "../../../types/svg";

/**
 * item 需要被添加的歌曲信息
 * needAddPlay 是否需要添加到播放列队选项
 * top 控制图标的top 偏移量
 */
interface Props {
  item: SongItem;
  needAddPlay: boolean;
  top?: number;
}
defineProps<Props>();

const sheetManageStore = useSheetManageStore();

const store = ref<MusicStore>({ quality: "320kmp3" });

//歌单项class
const sheetItemClass =
  "w-100% text-truncate p-8-15 hover-bg-#efefef cursor-pointer";

//控制添加到面板显示
//不知道为什么 使用v-model 控制显示的时候会有问题
const fakeDom = ref(null);

//添加到歌单
const handleAddToSheet = (item: SongItem, sheet: DissList) => {
  const div = fakeDom.value as HTMLDivElement;
  div.click();
  if (!item) {
    ElMessage({
      message: "当前暂无歌曲",
      type: "error",
      offset: 268,
    });
    return;
  }

  sheetManageStore.addMusicToSheet(item, sheet);
};

//歌单列表
const sheetList = computed<DissList[]>(() => {
  const list = sheetManageStore.createdSheet;
  return list || [];
});

//播放歌曲
const handlePlay = (item: SongItem, playMethod: 1 | 2 | 3) => {
  const div = fakeDom.value as HTMLDivElement;
  div.click();
  ElMessage({
    message: "已成功添加一首歌曲到播放队列",
    type: "success",
    offset: 268,
  });
  store.value.addToList(item, playMethod);
};

onMounted(() => {
  store.value = useMusicStore();
});
</script>

<style scoped></style>
