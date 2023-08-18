<template>
  <!-- 音乐馆骨架屏 -->

  <div>
    <el-skeleton style="width: 100%" :loading="loading" animated>
      <template #template>
        <div v-for="index in 3" :key="index" class="mb48px">
          <el-skeleton-item variant="rect" style="width: 220px; height: 32px" />
          <div class="flex justify-between mt15px">
            <div v-for="item in 4" :key="item">
              <el-skeleton-item
                variant="rect"
                style="width: 160px; height: 160px"
              />
              <div class="mt5px">
                <el-skeleton-item
                  variant="text"
                  style="width: 120px; height: 25px"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #default>
        <slot></slot>
      </template>
    </el-skeleton>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ loading: boolean }>();
</script>

<style scoped></style>
