<template>
  <!-- 音乐馆 歌单卡片 -->

  <div>
    <div
      class="transform-hover cursor-pointer relative"
      @click="handleToSheetDetail"
    >
      <!-- 图片 -->
      <div class="w160px h160px rd-10px overflow-hidden">
        <img :src="props.cover" class="w160px h160px" alt="" />
      </div>
      <!-- 遮罩层 -->
      <div class="z-5 absolute top-0" v-if="props.src">
        <img :src="props.src" class="w160px h160px rd-10px" alt="" />
      </div>

      <!-- 播放数量  -->
      <div v-if="props.cnt" class="listen-num">
        <CustomSvg
          :name="SvgName.Listen"
          :width="12"
          :height="12"
          color="#fff"
          :top="1"
        />

        <span class="ml8px">{{ numChangeUnit(props.cnt) }}</span>
      </div>
    </div>

    <!-- 歌单名称  -->
    <div class="mt10px c-black font-400 text-14px w160px h65px overflow-hidden">
      {{ props.title }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { numChangeUnit } from "@/utils/common";
import { useRouter } from "vue-router";
import { SvgName } from "../../../types/svg";

/**
 * title 歌单名称
 * cover 歌单海报
 * type 歌单标识
 * id 歌单id
 * src 遮罩图片地址
 * cnt 播放数量
 */
type Props = {
  title?: string;
  cover?: string;
  type?: number;
  id?: number | string;
  src?: string;
  cnt?: number;
};
const props = defineProps<Props>();

const $router = useRouter();

//跳转歌单详情页
const handleToSheetDetail = () => {
  $router.push("/index/sheet?id=" + props.id);
};
</script>

<style scoped lang="scss">
.listen-num {
  display: flex;
  position: absolute;
  right: 8px;
  bottom: 10px;
  background: rgba($color: #000000, $alpha: 0.8);
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 15px;
}
.transform-hover:hover {
  .listen-num {
    display: none;
  }
}
</style>
