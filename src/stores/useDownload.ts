import { defineStore } from "pinia";
import { computed, ref, toRaw, watch } from "vue";
import { ElNotification } from "element-plus";
import { useIpcRenderer } from "@vueuse/electron";
import { useResponse } from "@/utils/correspond";
import { deepClone, formatSongInfo, playQuality } from "@/utils/common";

// 下载
export const useDownloadStore = defineStore("download-store", () => {
  const path = ref<PathManage>({
    downloadPath: "",
    cachePath: "",
    cacheSize: 0,
    maxSize: 0,
  });
  //和渲染进程通信
  const render = useIpcRenderer();
  //下载列表
  const downloading = ref<Downloading[]>([]);
  //已下载列表
  const downloaded = ref<Map<string, DownloadItem>>(new Map());

  //获取已下载
  useResponse<Map<string, DownloadItem>>("local-music", null).then((res) => {
    downloaded.value = res;
  });

  //获取未下载列表
  useResponse<Downloading[]>("db-data", {
    db: "db",
    raw: [],
    key: "/waitDownload",
  }).then((res) => {
    res.forEach((item) => (item.state = "继续"));
    downloading.value = res;
  });

  //获取下载和缓存路径
  useResponse<PathManage>("path-manage", null).then((res) => {
    for (let key in res) {
      if (typeof res[key] !== "number")
        res[key] = res[key].replace("\\\\", "\\");
    }
    path.value = res;
  });

  //设置下载地址
  const setPath = (
    key: "downloadPath" | "cachePath" | "cacheSize" | "maxSize",
    value: string | number
  ) => {
    path.value[key] = value;
  };

  //下载处理函数
  const handleDownload = (
    list: SongItem[],
    quality: Quality,
    isRetry?: boolean
  ) => {
    if (!isRetry) {
      //格式化和去除已下载
      list = list
        .map((item) => {
          const formatItem: Downloading = formatSongInfo(item);
          formatItem.state = "暂停";
          if (quality !== null) {
            formatItem.quality = playQuality(quality, formatItem.file);
          }
          return formatItem;
        })
        .filter((item) => !downloaded.value.has(item.mid));
    }
    //下载失败重新下载则不添加进队列
    if (!isRetry) {
      downloading.value.push(...list);
    }
    list = deepClone(list);
    render.send("music-download", { list, quality });
  };

  /**
   * 暂停或取消全部
   * @param flag flag为true代表取消
   */
  const pauseAll = (flag = false) => {
    useResponse<boolean>("cancel-all-task", flag).then((res) => {
      if (res) {
        if (flag) {
          downloading.value = [];
        } else {
          downloading.value.forEach((item) => (item.state = "继续"));
          saveWaitList();
        }
      }
    });
  };

  /**
   * 暂停或取消下载任务
   * @param item 下载任务信息
   * @param flag 为true表示取消
   */
  const handlePause = (item: Downloading, flag = false) => {
    useResponse<boolean>("cancel-download-task", { mid: item.mid, flag }).then(
      (res) => {
        console.log(res);
        if (res) {
          if (flag) {
            downloading.value = downloading.value.filter(
              (task) => task.mid !== item.mid
            );
          }
          const task = downloading.value.find((task) => task.mid === item.mid);
          task.state = "继续";
          saveWaitList();
        }
      }
    );
  };

  /**
   * 下载进度处理函数
   * @param param0 歌曲mid、进度、下载路径
   */
  const handleRenewProgress = ({ mid, progress, path }: RenewProgress) => {
    for (let i = 0; i < downloading.value.length; i++) {
      if (downloading.value[i].mid === mid) {
        downloading.value[i].progress = progress;

        if (progress === 100) {
          const item = downloading.value.splice(i, 1)[0];
          item.isDownload = true;
          ElNotification({
            title: "歌曲下载",
            message: item.name + "下载完成",
            type: "success",
            position: "bottom-right",
            showClose: false,
            offset: 60,
          });
          downloaded.value.set(item.mid, {
            info: item,
            path,
          });
        } else if (progress === -1) {
          downloading.value[i].state = "重试";
          ElNotification({
            title: "歌曲下载",
            message: downloading.value[i].name + "下载失败",
            type: "error",
            position: "bottom-right",
            showClose: false,
            offset: 60,
          });
        }
        break;
      }
    }
  };

  //保存未下载队列
  const saveWaitList = () => {
    render.send("save-wait-download", toRaw(downloading.value));
  };

  /**
   * 待下载队列长度发生变化时，保存待下载队列
   */
  const listLength = computed(() => {
    return downloading.value.length;
  });
  watch(listLength, () => {
    saveWaitList();
  });

  /**
   * 监听下载进度更新
   */
  render.on("download-progress", (e, msg: RenewProgress) => {
    handleRenewProgress(msg);
  });

  return {
    downloaded,
    downloading,
    path,
    handleRenewProgress,
    handleDownload,
    setPath,
    handlePause,
    pauseAll,
  };
});
