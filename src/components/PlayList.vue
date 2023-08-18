<template>
  <!-- 播放列表 -->

  <div
    class="flex justify-between pr16px color-#a8a8a8 text-14px pb10px pl20px"
  >
    <!-- 歌曲数量 -->
    <span>{{ musicStore.songList.length }} 首歌曲</span>

    <!-- 清空按钮 -->
    <el-icon
      @click="musicStore.deleteAll"
      class="cursor-pointer hover-color-emerald"
      ><Delete
    /></el-icon>
  </div>

  <!-- 播放列表 -->
  <div
    class="scroll h-570px relative"
    ref="scrollBox"
    @scroll="handleScrollEvent"
  >
    <div :style="{ height: totalHeight + 'px' }" class="z--1"></div>
    <!-- 歌曲行 -->
    <div class="absolute" :style="{ top: scrollTop + 'px' }">
      <div
        class="p-16-20 hover-bg-#f0f0f0 music-list w-290px"
        :class="{
          'active-row': isCurrent(item),
        }"
        v-for="(item, index) in visibleItem"
        :key="item.mid"
        @click="handlePlay(item)"
      >
        <!-- 名称,音质和原唱标识 -->
        <div class="color-black max-w-80% text-truncate flex">
          <!-- 歌曲名称 -->
          <span
            class="text-truncate max-w-65% inline-block active-row-effect"
            >{{ item.name }}</span
          >
          <!-- 标识 -->
          <div>
            <MusicTag v-bind="item" />
          </div>
          <!-- 音符跳动，标识正在播放 -->
          <div class="relative" v-if="isCurrent(item, true)">
            <NoteJumping class="ml3px absolute top-7px" />
          </div>
        </div>
        <!-- 删除按钮 -->
        <div
          class="absolute right-5px top-5px control-model cursor-pointer"
          @click.stop="musicStore.deleteMusic(item.mid)"
        >
          <el-icon :size="18" color="#adadad" class="hover:color-#1ecf9d"
            ><CircleCloseFilled
          /></el-icon>
        </div>

        <div class="flex justify-between text-14px color-#999999 mt3px">
          <!-- 歌手 -->
          <span
            v-html="toSingerString(item.singer)"
            class="active-row-effect inline-block w-180px text-truncate"
          ></span>
          <!-- 歌曲时长 -->
          <span class="font-200 color-#d6d6d6">{{
            secondToStr(item.interval)
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MusicTag from "./common/MusicTag.vue";
import NoteJumping from "./common/NoteJumping.vue";

import { useMusicStore } from "@/stores/useMusic";
import { onMounted, ref, watch } from "vue";
import { secondToStr, toSingerString } from "@/utils/common";
import { computed } from "vue";

type Props = {
  show: boolean;
};
const props = defineProps<Props>();

const musicStore = ref<MusicStore>({
  songList: [],
});

const scrollTop = ref<number>(0);

const scrollBox = ref(null);

//计算播放列表总高度
const totalHeight = computed(() => {
  if (musicStore.value.songList) {
    return musicStore.value.songList.length * 81.3;
  }
  return 0;
});

//虚拟列表返回显示内容
const visibleItem = computed(() => {
  if (!musicStore.value.songList) return [];
  const start = Math.ceil(scrollTop.value / 81.3);
  const end = start + 7;
  return musicStore.value.songList.slice(start, end);
});

//播放列表刚开启时滚动到正在播放区域
const handleScrollToCurrent = () => {
  //单首歌曲高度81.3px
  setTimeout(() => {
    const music = musicStore.value.currentMusic;
    const current = musicStore.value.songList.findIndex(
      (item) => item.mid === music.mid
    );

    const len = musicStore.value.songList.length;
    const el = scrollBox.value as HTMLDivElement;
    if (len < 7 || current < 7) {
      el.scrollTop = 0;
      return;
    }

    el.scrollTop = Math.min((current - 3) * 81.3, el.scrollHeight);
  });
};

//播放歌曲
const handlePlay = (item: SongItem) => {
  musicStore.value.playSongItem(item);
};

// 发生滚动时修改scrollTop值
const handleScrollEvent = (e: MouseEvent) => {
  const target = e.target as HTMLDivElement;
  scrollTop.value = target.scrollTop;
};

/**
 * 判断是否是当前正在播放歌曲
 * @param item 歌曲信息
 * @param isPlay 是否需要加上播放判断
 */
const isCurrent = (item: SongItem, isPlay = false) => {
  if (musicStore.value.currentMusic) {
    if (!isPlay) {
      return musicStore.value.currentMusic.mid === item.mid;
    }
    return (
      musicStore.value.currentMusic.mid === item.mid && musicStore.value.isPlay
    );
  }
};

watch(props, () => {
  handleScrollToCurrent();
});

onMounted(() => {
  musicStore.value = useMusicStore();
  handleScrollToCurrent();
});
</script>

<style scoped lang="scss">
.control-model {
  display: none;
}
.active-row {
  background-color: #f0f0f0;
  .active-row-effect {
    color: #1ecf9e;
  }
  .control-model {
    display: block;
  }
}
.music-list {
  &:hover {
    .control-model {
      display: block;
    }
  }
}
</style>
