<template>
  <!-- 音乐馆 首页 -->

  <HallSkeleton :loading="loading.recommend1 || loading.recommend2">
    <div>
      <div class="h-32px c-black flex items-center">
        <h2>Hi {{ userInfo.userInfo.nick }} 今日为你推荐</h2>
      </div>

      <div class="mt-10px flex">
        <!-- 猜你喜欢 -->
        <div>
          <div
            class="w-352px h165px gradient cursor-pointer transform-hover"
            @click="handlePlay"
          >
            <!-- 背景遮罩1 -->
            <div class="mask"></div>
            <!-- 背景遮罩2 -->
            <div class="wrap"></div>

            <!-- 内容区 -->
            <div class="inner z-999">
              <!-- 海报图片 -->
              <img
                :src="picUrl"
                alt=""
                class="w120px h120px rd-10px left-35px top-22px"
              />
              <!-- 图片遮罩 -->
              <div class="pic-mask"></div>
              <!-- 文字描述 -->
              <div
                class="z-3 absolute left-75px top-57px w-46px h-46px rd-50% bg-white play-icon"
              >
                <CustomSvg
                  :name="playSvg"
                  :width="20"
                  :height="20"
                  :left="14"
                  :top="14"
                  color="#000000"
                />
              </div>
              <div class="absolute left-175px top-25px color-#fff">
                <div class="text-16px color-#c4ffc4">根据你的听歌口味推荐</div>
                <!-- 歌曲名称 -->
                <h4 class="font-400 mt20px w-170px text-truncate">
                  {{ songName }}
                </h4>
                <!-- 歌手 -->
                <span class="text-14px color-#ececec">{{ singer }}</span>
              </div>
            </div>
          </div>
          <div class="mt10px c-black font-400 text-14px">猜你喜欢</div>
        </div>

        <!-- 每日30首和新歌 -->
        <div class="relative ml25px" v-for="item in vCard" :key="item.id">
          <HallCard v-bind="item" />
        </div>
      </div>
    </div>

    <!-- 有空再做，api不全 -->
    <!-- <div>
      <h2>好歌不容错过</h2>
      <div class="flex flex-wrap mt10px justify-between">
        <div @click="handleNavigate('square')">
          <div class="sheet-list transform-hover">听</div>
          <div class="mt10px c-black font-400 text-14px">歌单广场</div>
        </div>
        <div>
          <div class="rank-list transform-hover">你</div>
          <div class="mt10px c-black font-400 text-14px">排行榜</div>
        </div>
        <div>
          <div class="singer-list transform-hover">想</div>
          <div class="mt10px c-black font-400 text-14px">歌手</div>
        </div>
        <div>
          <div class="million-collection transform-hover">听</div>
          <div class="mt10px c-black font-400 text-14px">电台</div>
        </div>
      </div>
    </div> -->

    <!-- 推荐歌单 -->
    <div class="mt0px">
      <h2>你的私荐歌单</h2>
      <div class="flex justify-between flex-wrap mt10px">
        <div v-for="item in recommendSheet" :key="item.id">
          <HallCard v-bind="item" />
        </div>
      </div>
    </div>
  </HallSkeleton>
</template>

<script setup lang="ts">
import HallCard from "@/components/common/HallCard.vue";
import HallSkeleton from "@/components/skeleton/HallSkeleton.vue";

import { ref, onMounted, computed } from "vue";
import { dailyRecommend, guessYouLike } from "@/api/qqApi";
import { useInfoStore } from "@/stores/user";
import { useMusicStore } from "@/stores/useMusic";
import { useRouter } from "vue-router";

import { SvgName } from "../../../types/svg";

const $router = useRouter();

const userInfo = useInfoStore();

//猜你喜欢歌曲列表
const likeList = ref<SongItem[]>([]);

const musicStore = ref<MusicStore>({});

//每日30和新歌
const vCard = ref<VCard[]>([]);

//推荐歌单
const recommendSheet = ref<VCard[]>([]);

//需要加载 猜你喜欢歌曲和 推荐列表，所以需要两个变量来控制loading
type Loading = {
  recommend1?: boolean;
  recommend2?: boolean;
};
const loading = ref<Loading>({});

//猜你喜欢播放图标
const playSvg = computed(() => {
  if (musicStore.value.isPlay && musicStore.value.radioId === 99)
    return SvgName.PauseIcon;
  return SvgName.PlayIcon;
});

//猜你喜欢点击处理函数
const handlePlay = () => {
  const store = musicStore.value;
  //当前播放的为猜你喜欢则根据情况暂停或继续播放，否则播放猜你喜欢
  if (store.radioId === 99) {
    if (store.isPlay) {
      store.pause();
    } else {
      store.play();
    }
  } else {
    store.playAll(likeList.value, 99, true);
  }
};

//海报
const picUrl = computed(() => {
  if (musicStore.value.radioId !== 99 && likeList.value.length === 0) return;
  let mid = "";
  //如果当前播放是猜你喜欢则使用当前播放，否则使用猜你喜欢列表第一首歌曲
  let tag: number = 2;
  if (musicStore.value.radioId === 99) {
    mid =
      musicStore.value.currentMusic.album.pmid ||
      musicStore.value.currentMusic.singer[0].mid;
    if (!musicStore.value.currentMusic.album.pmid) tag = 1;
  } else {
    mid = likeList.value[0].album.pmid || likeList.value[0].singer[0].mid;
    if (!likeList.value[0].album.pmid) tag = 1;
  }
  if (!mid)
    return "https://huijiu-bucket.oss-cn-hangzhou.aliyuncs.com/huijiu4.1/picture/2023-05-29/369bdddd5f58405e95d38da7639f02a9.jpg";
  return `https://y.qq.com/music/photo_new/T00${tag}R300x300M000${mid}.jpg?max_age=2592000`;
});

//歌曲名称
const songName = computed(() => {
  if (musicStore.value.radioId !== 99 && likeList.value.length === 0) return;
  //如果当前播放是猜你喜欢则使用当前播放，否则使用likeList第一首歌曲
  if (musicStore.value.radioId === 99) {
    return musicStore.value.currentMusic.name;
  }

  return likeList.value[0].name;
});

//歌手
const singer = computed(() => {
  if (musicStore.value.radioId === 99 && likeList.value.length === 0) return;
  let singer: Singer[] = [];
  //如果当前播放是猜你喜欢则使用当前播放，否则使用likeList第一首歌曲
  if (musicStore.value.radioId === 99) {
    singer = musicStore.value.currentMusic.singer;
  } else {
    singer = likeList.value[0].singer;
  }
  return singer.map((item) => item.name).join("&");
});

//加载每日30首
const loadDaily = () => {
  dailyRecommend(userInfo.userInfo.uin).then((res) => {
    console.log("daily", res);
    const v_shelf = res.req?.data?.v_shelf ?? [];
    if (v_shelf[0]) {
      vCard.value = [];
      const v_card = v_shelf[0].v_niche[0].v_card;
      //只需要每日30和新歌推荐
      v_card.forEach((item) => {
        if (item.title === "每日30首" || item.title === "新歌推荐") {
          item.src = item.miscellany.layer_url;
          vCard.value.push(item);
        }
      });
    }

    //私享歌单
    if (v_shelf[1]) {
      recommendSheet.value = [];
      v_shelf[1].v_niche.forEach((item) => {
        recommendSheet.value.push(...item.v_card);
      });
    }
    loading.value.recommend2 = false;
  });
};

//加载猜你喜欢歌曲
const loadLike = () => {
  //如果当前播放是猜你喜欢的内容则由动态加载机制加载
  if (musicStore.value.radioId === 99) {
    loading.value.recommend1 = false;
  }
  guessYouLike(userInfo.userInfo.uin, 99).then((res) => {
    likeList.value = res.req_1?.data?.track_list ?? [];
    loading.value.recommend1 = false;
  });
};

//听你想听导航
const handleNavigate = (tag: string) => {
  const path = "/index/" + tag;
  $router.push(path);
};

onMounted(() => {
  musicStore.value = useMusicStore();
  loading.value = {
    recommend1: true,
    recommend2: true,
  };
  // 延迟加载防止骨架屏一闪而过
  //现在使用了启动加载画面，就不需要了
  setTimeout(() => {
    loadDaily();
    loadLike();
  }, 100);
});
</script>

<style scoped lang="scss">
.gradient {
  border-radius: 10px;
  overflow: hidden;
  background-image: linear-gradient(
    to bottom,
    rgba(#168d7b, 1),
    rgba(#168d7b, 0.6),
    rgba(#168d7b, 0.4),
    rgba(#168d7b, 0.2)
  );
  background-size: 100% 100%;
  position: relative;
  .mask,
  .wrap,
  .inner {
    width: 352px;
    height: 165px;
    position: absolute;
    left: 0;
    top: 0;
  }
  .mask {
    z-index: 2;
    background-color: rgba($color: #000000, $alpha: 0.35);
  }
  .wrap {
    background-color: #fff;
    filter: blur(95px);
    opacity: 0.5;
  }
  .pic-mask {
    position: absolute;
    z-index: 2;
    width: 120px;
    height: 120px;
    background-color: #000000;
    opacity: 0.4;
    border-radius: 10px;
    left: 35px;
    top: 22px;
    display: none;
  }
  .play-icon {
    display: none;
  }
  &:hover {
    .play-icon {
      display: block;
    }
    .pic-mask {
      display: block;
    }
  }
}
.sheet-list,
.rank-list,
.singer-list,
.million-collection {
  width: 160px;
  height: 160px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  background-image: url("/src/assets/images/bg_list.jpg");
  background-repeat: no-repeat;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 45px;
  color: #fff;
  font-family: "楷体";
}
.sheet-list {
  background-position: -672px -110px;
}
.rank-list {
  background-position: -448px -110px;
}

.singer-list {
  background-position: 0 -90px;
}
.million-collection {
  background-position: -254px -110px;
}
</style>
