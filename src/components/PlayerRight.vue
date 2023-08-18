<template>
  <!-- 播放器右侧模块 -->

  <div class="absolute right-25px top-12px flex" :style="isHidden">
    <!-- 当前播放/总时间 -->
    <!-- v-if="!props.isMouseIn" -->
    <div
      class="text-14px m-r10px color-coolgray new-roman line-height-25px current-time"
    >
      {{ current }}<span class="m-0-3">/</span>{{ duration }}
    </div>
    <!-- 播放速度 音质 和音效  v-else  -->
    <div class="mr10px mt--3px flex-center play-setting">
      <!-- 播放速度 -->
      <el-popover
        v-model:visible="rateVisible"
        trigger="click"
        :teleported="false"
        placement="top"
        :hide-after="50"
        :width="77"
      >
        <template #default>
          <div class="w-53px h-215px relative">
            <div class="w-53px box-border flex-center pt15px">
              <MyProgress
                :model-value="store.musicStore.playRate - 0.5"
                @update:model-value="handleRateChange"
                color="#1ece9b"
                :height="168"
                :boal-width="15"
              />
              <div class="absolute bottom--30px text-16px new-roman">
                {{ store.musicStore.playRate.toFixed(1) }}
              </div>
            </div>
          </div>
        </template>
        <template #reference>
          <div
            v-click
            class="mr10px text-10px p-0-2 border border-solid border-rd-2px line-height-13px normal-style color-coolgray cursor-pointer hover-color-emerald"
          >
            <span class="mr2px">{{ playRate }}</span>
            <el-icon size="10"><ArrowUp /></el-icon>
          </div>
        </template>
      </el-popover>

      <!-- 音质 -->
      <el-popover
        :teleported="false"
        v-model:visible="qualityVisible"
        trigger="click"
        placement="top"
        :hide-after="50"
        :width="145"
      >
        <template #default>
          <div class="w-100% box-border">
            <div
              class="font-600 pl25px border-bottom pb8px cursor-pointer"
              @click="musciStore.setQuality('320kmp3')"
            >
              <div
                class="absolute left-5px top-2px"
                v-show="musciStore.quality === '320kmp3'"
              >
                <el-icon color="#1ece9b"><SuccessFilled /></el-icon>
              </div>
              标准品质
            </div>
            <div
              class="font-600 pt8px pb8px pl25px border-bottom cursor-pointer"
              @click="musciStore.setQuality('hq')"
            >
              <div
                class="absolute left-5px top-10px"
                v-show="musciStore.quality === 'hq'"
              >
                <el-icon color="#1ece9b"><SuccessFilled /></el-icon>
              </div>
              HQ高品质
            </div>
            <div
              class="font-600 pl25px pt8px cursor-pointer"
              @click="musciStore.setQuality('sq')"
            >
              <div
                class="absolute left-5px top-10px"
                v-show="musciStore.quality === 'sq'"
              >
                <el-icon color="#1ece9b"><SuccessFilled /></el-icon>
              </div>
              SQ无损品质
            </div>
          </div>
        </template>
        <template #reference>
          <div
            v-click
            class="text-center w-38px mr10px text-10px p-0-2 border border-solid border-rd-2px line-height-13px normal-style color-coolgray cursor-pointer hover-color-emerald"
          >
            <span class="mr2px">{{ quality }}</span>
            <el-icon size="10"><ArrowUp /></el-icon>
          </div>
        </template>
      </el-popover>

      <!-- 音效 -->
      <div
        v-click
        @click="dialogTableVisible = true"
        class="text-10px p-0-2 border border-solid border-rd-2px line-height-13px normal-style color-coolgray cursor-pointer hover-color-emerald"
        :style="{
          color: store.acoustics === 'guanbi' ? '' : 'rgb(52, 211, 153)',
        }"
      >
        <span class="mr2px">音效</span>
        <el-icon size="10"><ArrowUp /></el-icon>
      </div>
    </div>

    <!-- 显示桌面歌词 暂时不做 -->
    <!-- <div
      v-click
      class="color-warmgray hover:color-#1ece9b cursor-pointer m-r10px text-16px font-500"
    >
      词
    </div> -->

    <!-- 播放列队 -->
    <div
      @click="drawVisible = true"
      v-click
      class="flex color-coolgray hover:color-#1ece9b relative"
      :style="{
        color: musciStore.isPlay ? '#1ece9b' : 'rgba(156, 163, 175)',
      }"
    >
      <!-- 播放列表图标 -->
      <CustomSvg
        :name="SvgName.MusicList"
        width="20"
        height="20"
        :color="musciStore.isPlay ? '#1ece9b' : color"
        top="2"
        class="z-1"
      />
      <!-- 播放列队歌曲数量 -->
      <span class="m-l-3px">{{ musciStore.songList.length }}</span>
      <!-- 遮罩层，使鼠标覆盖时图标和歌曲数量都得以改变颜色 -->
      <div
        class="absolute w-31px h-27px left-0 top-0 cursor-pointer z-999 bg-transparent"
        @mouseenter="color = '#1ece9b'"
        @mouseout="color = 'rgb(156, 163, 175)'"
      ></div>
    </div>
  </div>
  <!-- 音效设置框 -->
  <el-dialog
    v-model="dialogTableVisible"
    title="音效"
    :modal="false"
    :draggable="true"
    :close-on-click-modal="false"
    width="60%"
    top="15vh"
    class="play-right-dialog"
  >
    <Acoustics />
  </el-dialog>
  <el-drawer
    v-model="drawVisible"
    modal-class="play-list-modal"
    :with-header="false"
    :append-to-body="true"
    :z-index="9999999"
    class="play-list"
  >
    <h2 class="color-black font-600 pl20px">播放列队</h2>
    <PlayList :show="drawVisible" />
  </el-drawer>
</template>

<script setup lang="ts">
import MyProgress from "@/components/common/MyProgress.vue";
import Acoustics from "@/components/common/Acoustics.vue";
import PlayList from "./PlayList.vue";

import { computed, onMounted, ref } from "vue";
import { useWebAudioStore } from "@/stores/useWebAudio";
import { secondToStr } from "@/utils/common";
import { useMusicStore } from "@/stores/useMusic";

import { SvgName } from "../../types/svg";

//播放速度弹出层显示
const rateVisible = ref(false);

//音质显示
const qualityVisible = ref(false);

//音效显示
const dialogTableVisible = ref(false);

//侧边播放队列显示
const drawVisible = ref(false);

//播放列表图标颜色
const color = ref<string>("rgb(156, 163, 175)");

const store = ref<WebAudioStore>({
  musicStore: {
    duration: 0,
    currentTime: 0,
    playRate: 1,
  },
});

const musciStore = ref<MusicStore>({
  quality: "320kmp3",
  songList: [],
});

// 当前播放时间
const current = computed(() => {
  return secondToStr(store.value.musicStore?.currentTime ?? 0);
});

// 歌曲时长
const duration = computed(() => {
  return secondToStr(store.value.musicStore?.currentMusic?.interval ?? 0);
});

//在弹出层显示的时候，不隐藏音质、倍速模块
const isHidden = computed(() => {
  return {
    "--myVisible": qualityVisible.value || rateVisible.value ? "flex" : "none",
    "--timeVisible":
      qualityVisible.value || rateVisible.value ? "none" : "block",
  };
});

// 播放速度
const playRate = computed(() => {
  if (store.value.musicStore.playRate.toFixed(1) === "1.0") {
    return "倍速";
  }
  return store.value.musicStore.playRate.toFixed(1) + "X";
});

// 当前音质
const quality = computed(() => {
  const dict = {
    "320kmp3": "标准",
    hq: "HQ",
    sq: "SQ",
  };
  return dict[musciStore.value.quality];
});

//播放速度改变 范围 1 ± 5
const handleRateChange = (rate: number) => {
  store.value.musicStore.setPlayRate(Math.round(rate * 10) / 10 + 0.5);
};

onMounted(() => {
  store.value = useWebAudioStore();
  musciStore.value = useMusicStore();
});
</script>

<style scoped lang="scss">
.border-bottom {
  border-bottom: 1px solid #f0eeee;
}
.current-time {
  display: var(--timeVisible);
}
.play-setting {
  display: var(--myVisible);
}
</style>
