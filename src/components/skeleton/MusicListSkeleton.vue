<template>
  <!-- 歌曲列表骨架屏 -->

  <el-skeleton style="width: 100%" :loading="loading" animated>
    <!-- 骨架屏加载 -->
    <template #template>
      <div class="flex" v-if="needButton">
        <el-skeleton-item
          variant="button"
          style="width: 110px; height: 32px; border-radius: 18px"
        />
        <el-skeleton-item
          variant="button"
          style="
            width: 110px;
            height: 32px;
            margin: 0 18px;
            border-radius: 18px;
          "
        />
      </div>
      <div class="flex mt25px">
        <el-skeleton-item variant="text" style="width: 216px; height: 18px" />
        <el-skeleton-item
          variant="text"
          style="width: 110px; height: 18px; margin-left: 120px"
        />
        <el-skeleton-item
          variant="text"
          style="width: 110px; height: 18px; margin-left: 35px"
        />
        <el-skeleton-item
          variant="text"
          style="width: 80px; height: 18px; margin-left: 35px"
        />
      </div>
      <div class="mt20px">
        <div class="flex mb16px" v-for="item in 6" :key="item">
          <el-skeleton-item variant="text" style="width: 216px; height: 48px" />
          <el-skeleton-item
            variant="text"
            style="width: 110px; height: 48px; margin-left: 120px"
          />
          <el-skeleton-item
            variant="text"
            style="width: 110px; height: 48px; margin-left: 35px"
          />
          <el-skeleton-item
            variant="text"
            style="width: 80px; height: 48px; margin-left: 35px"
          />
        </div>
      </div>
    </template>
    <!-- 正式内容 -->
    <template #default>
      <slot></slot>
    </template>
  </el-skeleton>
</template>

<script setup lang="ts">
defineProps<{ loading: boolean; needButton: boolean }>();
</script>

<style scoped></style>
