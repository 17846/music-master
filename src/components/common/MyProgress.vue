<template>
  <!-- 待小球的进度条 -->
  <div
    class="progress-wrapper"
    :style="{
      width: props.width + 'px',
      height: props.height + 'px',
    }"
  >
    <!-- 底色 -->
    <div
      class="progress-bar"
      ref="progressBar"
      @click="handleClick($event)"
      @mousedown="handleMouseDown($event)"
    >
      <!-- 当前进度 -->
      <div
        class="progress"
        :style="{ height: progressWidth, background: props.color }"
      >
        <!-- 拖动小球 -->
        <div
          class="progress-btn"
          ref="progressBtn"
          @mousedown="handleMouseDown($event)"
          :style="{
            bottom: bottom,
            width: props.boalWidth + 'px',
            height: props.boalWidth + 'px',
            background: props.boalColor || props.color,
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from "vue";

type Props = {
  modelValue: number;
  width?: number;
  height?: number;
  color?: string;
  boalWidth?: number;
  disabled?: boolean;
  boalColor?: string;
};

/**
 * width 进度条宽度
 * height 进度条高度
 * color 进度条颜色
 * modelValue 当前进度条的百分比 0-1
 * boalWidth 小球宽度
 */
const props = withDefaults(defineProps<Props>(), {
  width: 4,
  height: 128,
  color: "#237594",
  boalWidth: 13,
  disabled: false,
});

//当前小球的bottom值
const bottom = ref<string>();

const emit = defineEmits(["update:modelValue"]);

//底色容器
const progressBar = ref<HTMLDivElement | null>(null);
//小球
const progressBtn = ref<HTMLDivElement | null>(null);
//标记是否在拖拽小球
const dragging = ref(false);
//进度条百分比
const progressWidth = ref("0%");

//获取底色容器高度
const progressBarWidth = computed(() => {
  if (progressBar.value) {
    return progressBar.value?.clientHeight;
  } else {
    return 0;
  }
});

//点击进度条事件处理函数
function handleClick(event: MouseEvent) {
  if (props.disabled) return;
  const progressBottom = progressBar.value?.getBoundingClientRect().bottom ?? 0;
  const clickY = progressBottom - event.clientY;
  bottom.value = clickY + "px";
  updateProgress(clickY / progressBarWidth.value);
}

//鼠标点击时进行小球拖拽监听
function handleMouseDown(event: MouseEvent) {
  if (props.disabled) return;
  event.preventDefault();
  dragging.value = true;
  if (event.target === progressBtn.value) {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  } else if (event.target === progressBar.value) {
    const progressLeft = progressBar.value?.getBoundingClientRect().bottom ?? 0;
    const clickX = progressLeft - event.clientY;
    updateProgress(clickX / progressBarWidth.value);
  }
}

//小球移动
function handleMouseMove(event: MouseEvent) {
  if (dragging.value) {
    const progressLeft = progressBar.value?.getBoundingClientRect().bottom ?? 0;
    let clickX = progressLeft - event.clientY;
    if (clickX < 0) {
      clickX = 0;
    } else if (clickX > progressBarWidth.value) {
      clickX = progressBarWidth.value;
    }
    bottom.value = clickX + "px";
    updateProgress(clickX / progressBarWidth.value);
  }
}

//移出监听
function handleMouseUp() {
  dragging.value = false;
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);
}

//更新进度条
function updateProgress(value: number) {
  value = Math.max(0, Math.min(value, 1));
  progressWidth.value = `${value * 100}%`;
  emit("update:modelValue", value);
}

//根据初始值设置小球和进度条位置
watchEffect(() => {
  progressWidth.value = `${Math.min(props.modelValue, 1) * 100}%`;
  bottom.value = Math.min(props.modelValue, 1) * props.height + "px";
});
</script>

<style scoped>
.progress-wrapper {
  width: 321px;
  height: 25px;
}

.progress-bar {
  width: 100%;
  height: 100%;
  background-color: rgba(225, 222, 222, 0.4);
  cursor: pointer;
  position: relative;
}

.progress {
  width: 100%;
  position: absolute;
  bottom: 0;
}

.progress-btn {
  border-radius: 50%;
  background-color: #fff;
  position: absolute;
  left: 50%;
  transform: translate(-50%, 0);
  bottom: 0;
  cursor: pointer;
}
</style>
