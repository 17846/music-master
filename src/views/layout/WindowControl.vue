<template>
  <!-- 窗口控制、设置以及用户头像昵称 -->

  <div class="control-wrap">
    <!-- 头像 -->
    <img class="w-30px h-30px border-rd-50%" :src="userInfo.headurl" alt="" />
    <!-- 用户名 -->
    <span class="text-14px m-0-18 color-dark-5">
      {{ userInfo.nick }}
    </span>

    <span class="m-r-18px text-18px">|</span>

    <!-- 设置 -->
    <el-icon
      @click="dialogVisible = true"
      size="18"
      color="#aa9b9b"
      class="point green-hover"
      ><Setting
    /></el-icon>

    <!-- 最小化按钮 -->
    <el-icon
      @click="handleControl(0)"
      class="point green-hover z-9999 m-0-18"
      color="#aa9b9b"
    >
      <SemiSelect />
    </el-icon>

    <!-- 关闭按钮 -->
    <el-icon
      @click="handleControl(1)"
      class="point green-hover z-9999"
      color="#aa9b9b"
      size="18px"
    >
      <CloseBold />
    </el-icon>
  </div>

  <!-- 设置弹窗 -->
  <el-dialog v-model="dialogVisible" title="设置" width="45%">
    <div class="h310px"></div>
    <div class="absolute w-90% top-0">
      <h3>下载设置</h3>
      <div class="pl20px">
        <p>
          <span class="label">下载路径:</span>{{ downloader.path.downloadPath }}
        </p>
        <div class="mt5px">
          <el-button @click="handleChooseDir" size="small">修改目录</el-button>
          <el-button @click="openDir" size="small">打开目录</el-button>
        </div>
      </div>

      <h3>缓存设置</h3>
      <div class="pl20px">
        <div>
          <span class="label">缓存数量(首):</span>
          <el-select v-model="maxCacheNum" class="mr15px w100px" size="small">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-button @click="handleCacheSetting(0)" size="small"
            >保存设置</el-button
          >
        </div>
        <p>
          <span class="label">缓存占用空间:</span>缓存空间大小是基于启动时计算的
        </p>
        <div class="mt5px flex">
          <div class="w86px">
            <el-input v-model="cacheSize" size="small" disabled></el-input>
          </div>
          <span class="ml5px mr22px">MB</span>
          <el-button @click="handleCacheSetting(1)" size="small"
            >清除缓存</el-button
          >
        </div>
      </div>

      <h3>账号设置</h3>
      <div class="pl20px">
        <p><span class="label">当前登录账号:</span>{{ store.userInfo.uin }}</p>
        <div class="mt5px">
          <el-button @click="handleControl(2)" size="small">退出登录</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { useIpcRenderer } from "@vueuse/electron";
import { useInfoStore } from "@/stores/user";
import { useDownloadStore } from "@/stores/useDownload";
import { ref, computed } from "vue";
import { useResponse } from "@/utils/correspond";
import { ElMessage } from "element-plus";

const ipcRenderer = useIpcRenderer();

const store = useInfoStore();

const downloader = useDownloadStore();

//设置弹窗显示
const dialogVisible = ref<boolean>(false);

//设置的缓存数量
const cacheNum = ref<number>();

//缓存大小选项
const options = [300, 500, 800].map((item) => ({ value: item, label: item }));

// 将字节转为mb
const cacheSize = computed(() => {
  return Math.floor((downloader.path.cacheSize as number) / (1024 * 1024));
});

//用于绑定select cachenum 为null则使用 downloader.path.maxSize
const maxCacheNum = computed({
  set(val: number) {
    cacheNum.value = val;
  },
  get() {
    if (cacheNum.value) return cacheNum.value;
    return downloader.path.maxSize;
  },
});

//打开下载目录
const openDir = () => {
  useResponse("open-download-path", null, false);
};

//打开选择文件夹窗口
const handleChooseDir = () => {
  useResponse<string>("choose-dir", null).then((res) => {
    if (res !== "canceled") {
      downloader.setPath("downloadPath", res);
    }
  });
};

/**
 * 缓存操作
 * @param flag flag为0设置缓存大小，为1清空缓存
 */
const handleCacheSetting = (flag: number) => {
  const data = { maxCache: null };
  let message: string;
  if (flag === 0) {
    // 设置缓存大小
    //当前值和设置值一样 不操作
    if (!cacheNum.value || cacheNum.value === downloader.path.maxSize) return;

    data.maxCache = cacheNum.value;
    downloader.setPath("maxSize", cacheNum.value);
    message = "设置缓存数量成功";
  } else {
    //清除缓存
    downloader.setPath("cacheSize", 0);
    message = "清除缓存成功";
  }

  useResponse("cache-operation", data, false);

  ElMessage({
    message,
    type: "success",
    offset: 268,
  });
};

/**
 * 关闭和最小化按钮点击回调函数
 * @param channel  0 窗口最小化 1 关闭应用 2退出登录
 */
const handleControl = (channel: number) => {
  if (channel === 2) {
    localStorage.setItem("userInfo", null);
  }
  ipcRenderer.send("control-window", channel);
};
ipcRenderer.on("json-data", (e, data: UserInfo) => {
  console.log(data);
});

//用户信息
const userInfo = store.userInfo;
</script>

<style lang="scss" scoped>
.control-wrap {
  display: flex;
  align-items: center;
  .icon {
    width: 15px;
    height: 15px;
  }
}
h3 {
  color: black;
  margin: 10px 0;
}
.label {
  color: rgb(156, 163, 175);
  margin-right: 10px;
}
p {
  padding: 3px 0;
}
</style>
