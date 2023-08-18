<template>
  <!-- 原唱 sq hq标识 -->

  <!-- sq品质标签 -->
  <div
    class="inline-block w-16px ml3px"
    v-if="props?.file?.size_flac"
    title="SQ无损品质"
  >
    <CustomSvg
      color="#e45145"
      :width="16"
      :height="16"
      :top="4"
      :name="SvgName.SuperQuality"
    ></CustomSvg>
  </div>
  <!-- hq品质标签 -->
  <div
    class="inline-block w-16px ml3px"
    v-else-if="props?.file?.size_320mp3"
    title="HQ高品质"
  >
    <CustomSvg
      color="#3dc2a5"
      :width="18"
      :height="18"
      :top="4"
      :name="SvgName.HighQuality"
    ></CustomSvg>
  </div>
  <!-- 原唱标识 -->
  <span
    class="text-10px color-#3dc2a5 font-400 ml5px"
    v-if="(props?.tag ?? 0) === 11"
    >原唱</span
  >
</template>

<script setup lang="ts">
import { SvgName } from "../../../types/svg";
type TagItem = {
  tag?: number;
  file?: {
    size_320mp3?: number;
    size_flac?: number;
  };
};
const props = defineProps<TagItem>();
</script>

<style scoped></style>
