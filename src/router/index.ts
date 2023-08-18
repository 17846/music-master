import { createRouter, createWebHistory } from "vue-router";
import { defineComponent } from "vue";

import Layout from "@/views/layout/Layout.vue";
import Login from "@/views/Login.vue";
import SearchPage from "@/views/centers/SearchPage.vue";
import MusicHall from "@/views/centers/MusicHall.vue";
import SheetDetail from "@/views/centers/SheetDetail.vue";
import RecentlyPlay from "@/views/centers/RecentlyPlay.vue";
import Download from "@/views/centers/Download.vue";
import SheetSquare from "@/views/centers/SheetSquare.vue";
import SingerMusic from "@/views/centers/SingerMusic.vue";
import Album from "@/views/centers/Album.vue";

//空白页面,在刚开始时要判断是否登录,若未登录则创建的登录窗口
//作为一个刚打开app的过渡页面
const Loading = defineComponent({
  template: "",
});

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: Loading,
    },
    {
      path: "/login",
      component: Login,
      name: "login",
    },
    {
      path: "/index",
      component: Layout,
      name: "index",
      meta: {
        keepAlive: true,
      },
      children: [
        //音乐馆
        {
          path: "main",
          name: "main",
          component: MusicHall,
          meta: {
            keepAlive: true,
          },
        },
        //搜索结果
        {
          path: "search",
          name: "search",
          component: SearchPage,
        },
        //歌单详情
        {
          path: "sheet",
          name: "sheet",
          component: SheetDetail,
        },
        //最近播放
        {
          path: "recently",
          name: "recently",
          component: RecentlyPlay,
        },
        //下载
        {
          path: "download",
          name: "download",
          component: Download,
        },
        //歌单广场
        {
          path: "square",
          name: "square",
          component: SheetSquare,
        },
        //歌手详情
        {
          path: "singer",
          name: "singer",
          component: SingerMusic,
        },
        //专辑
        {
          path: "album",
          name: "album",
          component: Album,
        },
      ],
    },
  ],
});

export default router;
