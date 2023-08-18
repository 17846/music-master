<template>
  <!-- 歌单详情骨架屏 -->

  <el-skeleton style="width: 240px" :loading="loading" animated>
    <template #template>
      <div class="flex ml15px">
        <div>
          <el-skeleton-item
            variant="rect"
            style="width: 120px; height: 120px"
          />
        </div>
        <div>
          <el-skeleton-item
            variant="text"
            class="ml35px"
            style="width: 360px; height: 40px"
          />
          <el-skeleton-item
            variant="text"
            class="ml35px mt5px"
            style="width: 360px; height: 25px"
          />
          <div class="flex mt5px">
            <el-skeleton-item
              variant="button"
              class="ml35px"
              style="width: 110px; height: 32px"
            />
            <el-skeleton-item
              variant="button"
              class="ml35px"
              style="width: 110px; height: 32px"
            />
          </div>
        </div>
      </div>
    </template>
    <template #default>
      <slot></slot>
    </template>
  </el-skeleton>
</template>

<script setup lang="ts">
defineProps<{ loading: boolean }>();
</script>

<style scoped></style>
