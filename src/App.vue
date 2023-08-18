<template>
  <RouterView />
  <!-- app启动动画 -->
  <el-dialog v-model="dialogVisible" :show-close="false" :fullscreen="true">
    <div class="loading">
      <img class="image" src="./assets/images/1100.png" alt="" />
      <div class="typewriter-effect">
        {{ typewriterText }}
        <div class="text" id="typewriter-text"></div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, nextTick, ref } from "vue";
import { RouterView, useRouter } from "vue-router";
import { useInfoStore } from "./stores/user";
import { useResponse } from "@/utils/correspond";
import { useMusicStore } from "./stores/useMusic";
import { useSheetManageStore } from "./stores/useSheetManage";

const infoStore = useInfoStore();

const router = useRouter();

const sheetManageStore = useSheetManageStore();

//过渡页面显示
const dialogVisible = ref<boolean>(false);

//过渡页面显示的文字
const typewriterText = ref<string>("");

//加载之前的播放队列
const handleLoadData = () => {
  const store = useMusicStore();
  useResponse<Setting>("user-setting", null).then((setting) => {
    useResponse<SongItem[]>("db-data", {
      key: "/songList",
      raw: [],
      db: "playListDb",
    }).then((res) => {
      //上次结束时为非雷达播放设置播放类型
      if (!setting?.radioId) {
        store.setPlayType((setting?.playType as PlayType) ?? "sequence");
      }
      //将歌曲添加到播放队列
      store.playAll(res, setting?.radioId, false, setting?.current ?? -1);
    });
  });
};

//加载用户创建和收藏的歌单
const handleLoadSheet = async () => {
  //用户创建歌单
  let created = await useResponse<DissList[]>("db-data", {
    key: "/user-sheet",
    raw: [],
    db: "db",
  });

  //收藏歌单
  const collect = await useResponse<DissList[]>("db-data", {
    key: "/user-collect",
    raw: [],
    db: "db",
  });

  //排除dir_show为0歌单，该类型歌单不可获取歌单详情
  created = created.filter((item) => item.dir_show === 1);
  const data: SetSheet = { created, collect };
  sheetManageStore.setSheet(data);
};

//加载处理
const handleLoading = () => {
  const strings = ["听", "我", "想", "听"];
  let index = 0;
  //逐字显示听我想听
  setTimeout(() => {
    let interval = setInterval(() => {
      typewriterText.value += strings[index];
      index++;
      if (index === 4) {
        clearInterval(interval);
        //显示完成后关闭加载页面
        setTimeout(() => {
          dialogVisible.value = false;
        }, 300);
      }
    }, 300);
  }, 1000);
};

onMounted(async () => {
  console.log("app-start");
  //获取用户信息
  const userInfo = await useResponse<InfoDetail>("db-data", {
    db: "db",
    key: "/user-info",
    raw: {},
  });

  //判断是否登录，未登录则跳转login页，否则跳转首页
  if (!userInfo?.uin) {
    router.push("/login");
  } else {
    dialogVisible.value = true;
    handleLoading();
    router.push("/index/main");

    nextTick(() => {
      infoStore.setUserInfo(userInfo);
      setTimeout(() => {
        handleLoadData();
      }, 100);
      handleLoadSheet();
    });
  }
});
</script>

<style scoped lang="scss">
.loading {
  width: 1000px;
  height: 680px;
  position: absolute;
  left: 0px;
  top: -30px;
  background-image: url("./assets/images/music_bg1.jpg");
  background-size: 100% 100%;
}
.image {
  position: absolute;
  top: -220px;
  transform: translateY(220px);
  transition: all 2s;
}
.typewriter-effect {
  position: absolute;
  left: 520px;
  top: 320px;
  font-size: 72px;
  display: flex;
  font-family: "楷体";
  background-image: linear-gradient(
    to right,
    rgb(54, 155, 147),
    rgb(197, 108, 49)
  );
  color: transparent;
  background-clip: text;
  -webkit-background-clip: text;
}

.typewriter-effect > .text {
  max-width: 0;
  animation: typing 3s steps(var(--characters)) infinite;
  white-space: nowrap;
  overflow: hidden;
}

.typewriter-effect:after {
  color: rgb(44, 44, 44);
  content: " |";
  animation: blink 1s infinite;
  animation-timing-function: step-end;
}

// 闪烁效果
@keyframes typing {
  75%,
  100% {
    max-width: calc(var(--characters) * 1ch);
  }
}

@keyframes blink {
  0%,
  75%,
  100% {
    opacity: 1;
  }
  25% {
    opacity: 0;
  }
}
</style>
