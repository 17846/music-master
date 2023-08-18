<template>
  <!-- 播放器中间的操作模块 -->

  <div class="absolute left-320px top-26px flex-center cursor-pointer">
    <!-- audio播放器 -->
    <audio id="audio"></audio>
    <!-- 播放模式 -->
    <el-popover
      popper-class="play-type-prpover"
      v-model:visible="playTypeVisible"
      :width="130"
      trigger="click"
    >
      <div class="c-black">
        <div
          @click="handleSetPlayType('random')"
          class="pb8px pt10px"
          :class="playTypeCommon"
          v-if="!store.radioId"
        >
          <CustomSvg v-bind="{ ...playTypeSvg, name: SvgName.RandomIcon }" />
          <span class="ml-15px">随机播放</span>
        </div>
        <div
          class="pt8px pb8px b-t-0.5 b-b-0.5 b-#e8e8e8 b-t-solid b-b-solid"
          :class="playTypeCommon"
          @click="handleSetPlayType('single')"
        >
          <CustomSvg v-bind="{ ...playTypeSvg, name: SvgName.Single }" />
          <span class="ml15px">单曲循环</span>
        </div>
        <div
          @click="handleSetPlayType('sequence')"
          class="pt8px pb10px"
          :class="playTypeCommon"
        >
          <CustomSvg v-bind="{ ...playTypeSvg, name: SvgName.Sequence }" />
          <span class="ml15px">列表循环</span>
        </div>
      </div>
      <template #reference>
        <CustomSvg
          :width="18"
          :height="18"
          color="#131313"
          hover-color="#1ece9b"
          :name="playType"
          class="absolute left--3px"
          :top="1"
        />
      </template>
    </el-popover>

    <!-- 上一首 -->
    <CustomSvg
      :width="38"
      :height="38"
      color="#131313"
      hover-color="#1ece9b"
      :name="SvgName.PreviousIcon"
      class="absolute left-25px cursor-pointer"
      @click="store.handlePre"
    />
    <div
      @click="handlePlay"
      class="bg-#1fcfa1 w-35px h-35px flex-center border-rd-50% absolute left-68px top--20px cursor-pointer"
    >
      <!-- 播放 -->
      <CustomSvg
        :width="15"
        :height="15"
        color="#fff"
        :name="SvgName.PlayIcon"
        class="absolute left-11px top-7px"
        v-if="!store.isPlay"
      />
      <!-- 暂停 -->
      <CustomSvg
        :width="18"
        :height="18"
        color="#fff"
        :name="SvgName.PauseIcon"
        class="absolute top-9px cursor-pointer left-8px"
        v-else
      />
    </div>
    <!-- 下一首 -->
    <CustomSvg
      :width="38"
      color="#131313"
      hover-color="#1ece9b"
      :name="SvgName.NextIcon"
      class="absolute left-110px"
      @click="store.handleNext"
    />
    <!-- 声音 -->
    <el-popover
      :teleported="false"
      trigger="click"
      placement="top"
      :hide-after="50"
      :width="77"
    >
      <template #default>
        <div class="w-53px h-255px">
          <div class="w-53px box-border position-border">
            <div class="absolute bottom-5px new-roman w-53px text-center">
              {{ Math.ceil(store.volume * 100) }}%
            </div>
            <MyProgress
              :model-value="store.volume"
              @update:model-value="handleProgressChange"
              color="#1ece9b"
              :height="168"
              :boal-width="15"
            />
          </div>
          <div class="flex-center absolute w-53px bottom--9px">
            <CustomSvg
              :width="18"
              :height="18"
              color="#ff6262"
              :name="SvgName.VoiceMuteIcon"
              class="cursor-pointer"
              @click="handleMuted"
              v-if="store.volume === 0 || store.isMuted"
            />
            <CustomSvg
              :width="18"
              :height="18"
              color="#9e9e9e"
              :name="SvgName.Voice"
              @click="handleMuted"
              class="cursor-pointer"
              v-else
            />
          </div>
        </div>
      </template>
      <template #reference>
        <CustomSvg
          class="absolute left-155px top--14px"
          :name="SvgName.Voice"
          :width="23"
          :height="23"
          color="#131313"
          hover-color="#1fcfa1"
        />
      </template>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import MyProgress from "@/components/common/MyProgress.vue";

import { onMounted, ref } from "vue";
import { useMusicStore } from "../stores/useMusic";
import { computed } from "vue";

import { SvgName } from "../../types/svg";

const store = ref<MusicStore>({
  isPlay: false,
});

//播放类型选项的公共样式
const playTypeCommon = "hover-bg-gray-1 flex justify-center cursor-pointer";

//播放类型svg公共属性
const playTypeSvg = {
  width: 18,
  height: 18,
  left: 10,
  color: "#131313",
  class: "absolute left--3px",
  top: 1,
};

//控制播放类型弹窗显示
const playTypeVisible = ref<boolean>(false);

onMounted(() => {
  const musicStore = useMusicStore();
  store.value = musicStore;
});

//播放处理函数
const handlePlay = () => {
  if (store.value.songList.length === 0) return;
  if (store.value.isPlay) {
    store.value.pause();
  } else {
    store.value.play();
  }
};

//静音
const handleMuted = () => {
  store.value.setMuted(!store.value.isMuted);
};

//根据当前playType返回对应svg名称
const playType = computed(() => {
  switch (store.value.playType) {
    case "random":
      return SvgName.RandomIcon;
    case "single":
      return SvgName.Single;
    default:
      return SvgName.Sequence;
  }
});

//调节音量
const handleProgressChange = (e: number) => {
  store.value.setVolume(e);
};

//设置播放类型
const handleSetPlayType = (type: PlayType) => {
  store.value.setPlayType(type);
  playTypeVisible.value = false;
};
</script>

<style scoped>
.position-border {
  border-bottom: 1px solid #ede9e9;
  padding-bottom: 35px;
  box-sizing: border-box;
  position: absolute;
  /* left: -75px; */
  display: flex;
  justify-content: center;
  top: 25px;
}
.drag-default:-moz-drag-over {
  cursor: default;
}
</style>
