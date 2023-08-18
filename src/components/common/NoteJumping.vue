<template>
  <!-- 音符跳动动画 -->
  <div>
    <span class="voice">
      <i class="first" />
      <i class="second" />
      <i class="three" />
      <i class="four" />
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    return {};
  },
});
</script>

<style scoped lang="scss">
.voice {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 100%;

  i {
    display: inline-block;
    border-left: 2px solid #1fcfa1;
    margin: 0 1px;
    position: relative;

    &.first {
      height: 8px;
      animation: first 0.5s linear 0s infinite alternate;
    }

    &.second {
      height: 4px;
      animation: second 1s linear 0s infinite alternate;
    }

    &.three {
      height: 6px;
      animation: three 0.8s linear 0s infinite alternate;
    }

    &.four {
      height: 12px;
      animation: four 0.6s linear 0s infinite alternate;
    }
  }

  @keyframes first {
    0% {
      height: 4px;
    }

    50% {
      height: 8px;
    }

    100% {
      height: 10px;
    }
  }

  @keyframes second {
    0% {
      height: 12px;
    }

    50% {
      height: 9px;
    }

    100% {
      height: 7px;
    }
  }

  @keyframes three {
    0% {
      height: 14px;
    }

    50% {
      height: 12px;
    }

    100% {
      height: 10px;
    }
  }

  @keyframes four {
    0% {
      height: 10px;
    }

    50% {
      height: 8px;
    }

    100% {
      height: 5px;
    }
  }
}
</style>
