<template>
  <!-- 左侧菜单栏 -->

  <div class="menu-container">
    <div class="inner-wrap">
      <div class="menu-wrap">
        <!-- logo区域 -->
        <div class="logo">
          <div class="app-icon"></div>
          <div class="app-name"></div>
        </div>
      </div>

      <!-- 菜单内容 -->
      <div class="menu-list">
        <MenuList />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MenuList from "@/components/MenuList.vue";
</script>

<style lang="scss" scoped>
.menu-container {
  position: absolute;
  width: 220px;
  height: 100%;
  overflow: hidden;
  background-color: rgb(240, 240, 240);
}
.menu-wrap {
  padding: 0 20px;
  box-sizing: border-box;
}
.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  .app-icon {
    width: 35px;
    height: 35px;
    background-image: url("@/assets/images/logo.svg");
    background-size: 200% 200%;
    background-position: center;
  }
  .app-name {
    width: 120px;
    height: 35px;
    background-image: url("@/assets/images/1284.png");
    background-size: 100% 200%;
    background-position: center;
    background-repeat: no-repeat;
  }
}
.menu-list {
  box-sizing: border-box;
  padding: 20px 0;
  height: 615px;
  overflow: hidden;
}
</style>
