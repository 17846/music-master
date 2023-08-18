<template>
  <!-- 中间内容区 -->

  <div class="window-container">
    <div class="inner-wrap">
      <!-- 页面头部 -->
      <div class="page-head">
        <!-- 搜索组件 -->
        <SearchBar />

        <!-- 窗体控制组件 -->
        <WindowControl />
      </div>
      <!-- 页面中间 -->
      <div class="h-550px box-border p-20-2">
        <div
          id="center-model"
          ref="centerContainer"
          class="scroll h-514px p-0-18"
        >
          <router-view v-slot="{ Component }">
            <!-- 针对keep alive -->
            <keep-alive>
              <component
                :key="$route.name"
                :is="Component"
                v-if="$route.meta.keepAlive"
              />
            </keep-alive>

            <!-- 普通页面 -->
            <component
              :key="$route.name"
              :is="Component"
              v-if="!$route.meta.keepAlive"
            />
          </router-view>
        </div>
      </div>

      <!-- 底部播放器 -->
      <div class="h-70px audio-player">
        <AudioPlayer />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchBar from "./SearchBar.vue";
import WindowControl from "./WindowControl.vue";
import AudioPlayer from "./AudioPlayer.vue";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

const $route = useRoute();

//容器dom
const centerContainer = ref(null);

//回到顶部
const handleScrollToTop = () => {
  const div = centerContainer.value as HTMLDivElement;
  div.scrollTop = 0;
};

//路由改变时回到顶部,因为所有页面滚动都是使用的 centerContainer的
watch(
  $route,
  () => {
    handleScrollToTop();
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
.window-container {
  position: absolute;
  width: 780px;
  left: 220px;
  background-color: reg(246, 246, 246);
  height: 100%;
  .page-head {
    box-sizing: border-box;
    width: 100%;
    height: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 30px;
  }
}
.audio-player {
  &:hover {
    :deep(.current-time) {
      display: none;
    }
    :deep(.play-setting) {
      display: flex;
    }
  }
}
</style>
