<template>
  <!-- 自定义svg图标组件 -->

  <div>
    <div
      class="relative z-1"
      :style="{
        top: top + 'px',
        left: left + 'px',
      }"
    >
      <!-- svg图标 -->
      <svg :width="props.width" :height="props.height" :fill="color">
        <use :xlink:href="'#icon-' + props.name"></use>
      </svg>
      <!-- 由于svg图标是中空的，在空白部分鼠标移入识别不到，所以在上面添加一层透明遮罩，通过判断鼠标移入遮罩来设置图标hover-color -->
      <div
        @mouseenter="handleMouseIn"
        @mouseout="handleMouseOut"
        :style="{
          width: props.width + 'px',
          height: props.height + 'px',
          zIndex: 9999,
          left: 0,
          top: 0,
          background: 'transparent',
          position: 'absolute',
          cursor: 'pointer',
        }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SvgName } from "../../../types/svg";

/**
 * svg图标通用组件
 */
import { onMounted, ref, watch } from "vue";

type IconProps = {
  //图标颜色
  color?: string;
  //图标宽度
  width?: string | number;
  //图标高度
  height?: string | number;
  //图标鼠标悬浮色
  hoverColor?: string;
  //图标top值，需上级容器relative
  top?: number | string;
  //图标left值
  left?: number | string;
  //文件夹中的svg图标文件名称
  name: SvgName;
};

const props = withDefaults(defineProps<IconProps>(), {
  color: "#9b9b9b",
  width: 50,
  height: 50,
  top: 0,
  left: 0,
});
//图标当前颜色
const color = ref<string>();

//图标鼠标移入事件
const handleMouseIn = () => {
  if (props.hoverColor) {
    color.value = props.hoverColor;
  }
};

//图标鼠标移出事件
const handleMouseOut = () => {
  color.value = props.color;
};

//监听props.color，当值变化时动态更新color值
watch<string>(
  () => props.color,
  (value: string) => {
    color.value = value;
  }
);

//组件挂载完成后赋予color默认值为props.color
onMounted(() => {
  color.value = props.color;
});
</script>
