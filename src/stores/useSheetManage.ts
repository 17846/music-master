import { defineStore } from "pinia";
import { ref } from "vue";
import { deepClone } from "@/utils/common";
import { useResponse } from "@/utils/correspond";
import { useInfoStore } from "./user";
import { ElMessage } from "element-plus";
const crypto = require("crypto");

// 歌单管理
const useSheetManageStore = defineStore("sheet-manage", () => {
  const info = useInfoStore();

  //用户创建的歌单
  const createdSheet = ref<DissList[]>([]);
  //收藏的歌单
  const collectionSheet = ref<DissList[]>([]);

  //记录访问歌单详情页时的歌单id，用于页面返回时不重复刷新
  const disstid = ref<string | number>();

  //设置disstid
  const setDisstId = (id: string | number) => {
    disstid.value = id;
  };

  //歌单列表初始化
  const setSheet = ({ created, collect }: SetSheet) => {
    createdSheet.value = created;
    collectionSheet.value = collect;
  };

  /**
   * 给自建歌单添加歌曲
   * @param item 歌曲信息
   * @param disstId 歌单名称
   */
  const addMusicToSheet = (item: SongItem, playlist: DissList) => {
    const sheet = createdSheet.value.find((data) => data.tid === playlist.tid);
    useResponse<boolean>("sheet-add-music", {
      item: deepClone(item),
      sheet: deepClone(sheet),
      userId: info.userInfo.uin,
    }).then((res) => {
      if (res) {
        ElMessage({
          message: "已成功添加一首歌曲到歌单",
          type: "success",
          offset: 268,
        });
        sheet.isInit = true;
      } else {
        ElMessage({
          message: "添加失败，歌单初始化失败，请重试",
          type: "error",
          offset: 268,
        });
      }
    });
  };

  /**
   * 创建歌单
   * @param name 歌单名称
   */
  const createSheet = (name: string) => {
    const sheet: DissList = {
      tid: crypto.randomUUID().toString(),
      diss_name: name,
      song_cnt: 0,
      listen_num: 0,
      isInit: true,
      dir_show: 1,
    };
    createdSheet.value.push(sheet);
    useResponse("create-sheet", deepClone(sheet), false);
    ElMessage({
      type: "success",
      message: "创建歌单成功",
      offset: 268,
    });
  };

  /**
   * 收藏歌单
   * @param sheet
   */
  const markPlaylists = (sheet: DissList) => {
    collectionSheet.value.push(sheet);
    useResponse("mark-sheet", deepClone(sheet), false);
    ElMessage({
      type: "success",
      message: "收藏歌单成功",
      offset: 268,
    });
  };

  /**
   * 取消收藏歌单
   * @param sheet
   */
  const cancelMark = (sheet: DissList) => {
    useResponse<boolean>("cancel-mark", sheet.tid).then((res) => {
      if (res) {
        collectionSheet.value = collectionSheet.value.filter(
          (item) => item.tid != sheet.tid
        );
        ElMessage({
          type: "success",
          message: "取消收藏成功",
          offset: 268,
        });
      }
    });
  };

  return {
    createdSheet,
    collectionSheet,
    disstid,
    setDisstId,
    setSheet,
    addMusicToSheet,
    createSheet,
    markPlaylists,
    cancelMark,
  };
});

export { useSheetManageStore };
