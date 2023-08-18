//通信专用
import "./getDB";
import { ipcMain, dialog, app } from "electron";
import { userSheet, sheetDetailV2 } from "../../src/api/qqApi";
import { db, sheetDb, playListDb } from "../utils/jsondb";
import { loadOldData, initSheet, clearAllFile } from "../utils/common";
import { WINDOW } from "../window";
import { getMisic } from "../utils/getMusic";
import { shell } from "electron";
import type { Cache } from "../utils/fileCache";
const fs = require("fs");

/**
 * 获取用户歌单，由于接口需要使用Referer，需要node代理发送请求
 */
ipcMain.on("user-sheet", (e, data: Correspond) => {
  const info: InfoDetail = data.data;
  userSheet(info.uin)
    .then((res) => {
      const list = res?.data?.disslist ?? [];
      loadOldData("/user-sheet", []).then((res: DissList[]) => {
        res.forEach((item) => {
          let flag = true;
          for (let i = 0; i < list.length; i++) {
            const element = list[i];
            if (item.tid === element.tid) {
              flag = false;
              break;
            }
          }
          if (flag) {
            list.push(item);
          }
        });
        //保存歌单
        db.push("/user-info", info);
        db.push("/userId", data.data.uin);
        db.push("/user-sheet", list);
        if (app.isPackaged) {
          setTimeout(() => {
            app.relaunch();
            app.quit();
          }, 500);
        } else {
          // 创建主窗体;
          WINDOW.loginWindow.hide();
          WINDOW.createWindow();
          //主窗体加载完成后销毁登录窗体
          WINDOW.mainWindow?.on("ready-to-show", () => {
            WINDOW.destroyLoginWindow();
          });
        }
      });
    })
    .catch((e) => {
      global.logger.error(`user-sheet ${e}`);
      WINDOW.loginWindow?.webContents.send(data.responseEvent, "fail request");
    });
});

/**
 * 获取歌曲
 */
ipcMain.on("music-url", (e, data: Correspond) => {
  const { info } = data.data;
  getMisic(info)
    .then((res) => {
      WINDOW.mainWindow.webContents.send(data.responseEvent, res);
    })
    .catch((e) => {
      global.logger.error(`music-url ${e}`);
      WINDOW.mainWindow.webContents.send(data.responseEvent, "fail request");
    });
});

/**
 * 保存未下载队列
 */
ipcMain.on("save-wait-download", (e, data: SongItem[]) => {
  db.push("/waitDownload", data);
});

/**
 * 下载
 */
type Download = {
  list: SongItem[];
  quality: Quality;
};
ipcMain.on("music-download", (e, { list, quality }: Download) => {
  global.downloader.add(list, quality);
});

/**
 * 获取已下载队列
 */
ipcMain.on("local-music", (e, data: Correspond) => {
  WINDOW.mainWindow.webContents.send(data.responseEvent, global.localMusic);
});

//获取缓存和下载路径
ipcMain.on("path-manage", (e, data: Correspond) => {
  const cachePath = global.cachePath;
  const map: Map<string, Cache> = global.fileCache.cache;
  let size = 0;
  map.forEach((item) => {
    try {
      const stat = fs.statSync(item.path);
      size += stat.size;
    } catch (e) {
      global.logger.error(`path-manage ${e}`);
    }
  });
  const path = {
    downloadPath: global.downloadPath,
    cachePath,
    maxSize: global.fileCache.maxSize,
    cacheSize: size,
  };
  WINDOW.mainWindow.webContents.send(data.responseEvent, path);
});

//保存音乐播放列队
ipcMain.on("store-play-list", (e, data: Correspond) => {
  playListDb.push("/songList", data.data);
});

/**
 * 获取歌单详情
 * v1 版本需要Referer 所以主线程请求，已废弃
ipcMain.on("sheet-detail", (e, data: Correspond) => {
  const { disstId, userId } = data.data;
  sheetDetail(disstId, userId)
    .then((res) => {
      WINDOW.mainWindow.webContents.send(data.responseEvent, res);
    })
    .catch(() => {
      WINDOW.mainWindow.webContents.send(data.responseEvent, "fail request");
    });
});
*/

/**
 * 获取歌单详情 v2版本
 * 由于该接口需要设置user-agent 所以渲染线程代理请求
 */
ipcMain.on("sheet-detail", (e, data: Correspond) => {
  sheetDetailV2(data.data)
    .then((res) => {
      console.log(res);
      WINDOW.mainWindow.webContents.send(data.responseEvent, res);
    })
    .catch((e) => {
      global.logger.error(`sheet-detail ${e}`);
      WINDOW.mainWindow.webContents.send(data.responseEvent, "fail request");
    });
});

type SheetAdd = { item: SongItem; sheet: DissList };

//将歌曲加入自建歌单
ipcMain.on("sheet-add-music", async (e, data: Correspond) => {
  const { item, sheet }: SheetAdd = data.data;
  if (!sheet.isInit) {
    const result = await initSheet(sheet.tid);
    if (!result) {
      WINDOW.mainWindow.webContents.send(data.responseEvent, "fail request");
    }
  }
  const oldData = await loadOldData<SongItem[]>(
    "/sheet-list/" + sheet.tid,
    [],
    "sheetDb"
  );
  //若歌单已有该歌曲则删除
  const newData = oldData.filter((song) => song.mid !== item.mid);
  //插入到歌单前面
  newData.unshift(item);
  sheetDb.push("/sheet-list/" + sheet.tid, newData);
  WINDOW.mainWindow.webContents.send(data.responseEvent, true);
});

//获取自建歌单歌曲列表
ipcMain.on("sheet-music-list", async (e, data: Correspond) => {
  const sheet: DissList = data.data.sheet;
  if (!sheet.isInit) {
    const result = await initSheet(sheet.tid);
    if (!result)
      WINDOW.mainWindow.webContents.send(data.responseEvent, "fail request");
  }
  loadOldData<SongItem[]>("/sheet-list/" + sheet.tid, [], "sheetDb").then(
    (res) => {
      WINDOW.mainWindow.webContents.send(data.responseEvent, res);
    }
  );
});

//创建歌单
ipcMain.on("create-sheet", (e, data: Correspond) => {
  const sheet: DissList = data.data;
  loadOldData<DissList[]>("/user-sheet", []).then((res) => {
    res.push(sheet);
    db.push("/user-sheet", res);
    sheetDb.push("/sheet-list/" + sheet.tid, []);
  });
});

//收藏歌单
ipcMain.on("mark-sheet", (e, data: Correspond) => {
  const sheet: DissList = data.data;
  loadOldData<DissList[]>("/user-collect", []).then((res) => {
    res.push(sheet);
    db.push("/user-collect", res);
  });
});

//获取最近播放(FileCache)
ipcMain.on("recently-play", (e, data: Correspond) => {
  const fileCache = global.fileCache;
  WINDOW.mainWindow.webContents.send(data.responseEvent, {
    cache: fileCache.cache,
    usageQueue: fileCache.usageQueue,
  });
});

//打开下载目录
ipcMain.on("open-download-path", () => {
  const path: string = global.downloadPath;
  const dir = path.substring(0, path.length - 1).replace("\\\\", "\\");
  shell.openPath(dir);
});

//暂停或取消下载任务
ipcMain.on("cancel-download-task", (e, data: Correspond) => {
  const { mid, flag } = data.data;
  const result = global.downloader.cancel(mid, flag);
  WINDOW.mainWindow.webContents.send(data.responseEvent, result);
});

//暂停或取消全部
ipcMain.on("cancel-all-task", (e, data: Correspond) => {
  const result = global.downloader.pauseTask(data.data);
  WINDOW.mainWindow.webContents.send(data.responseEvent, result);
});

//取消收藏歌单
ipcMain.on("cancel-mark", (e, data: Correspond) => {
  loadOldData<DissList[]>("/user-collect", [], "db").then((res) => {
    const newData = res.filter((item) => item.tid != data.data);
    db.push("/user-collect", newData);
    WINDOW.mainWindow.webContents.send(data.responseEvent, true);
  });
});

// 打开选择文件夹对话框选择下载路径
ipcMain.on("choose-dir", (e, data: Correspond) => {
  dialog
    .showOpenDialog({
      properties: ["openDirectory"],
    })
    .then((res) => {
      if (!res.canceled) {
        const path = res.filePaths[0] + "\\";
        global.downloadPath = path;
        global.downloader.setDownloadPath(path);
        db.push("/downloadPath", path);
        WINDOW.mainWindow.webContents.send(data.responseEvent, path);
      } else {
        WINDOW.mainWindow.webContents.send(data.responseEvent, "canceled");
      }
    });
});

//缓存操作，清空缓存或者设置缓存大小，不带maxCache则代表清空缓存
ipcMain.on("cache-operation", (e, data: Correspond) => {
  if (data.data.maxCache) {
    global.fileCache.setMaxSize(data.data.maxCache);
    db.push("/cache/maxSize", data.data.maxCache);
  } else {
    global.fileCache.clearCache();
    clearAllFile(global.cachePath);
  }
});

//用户设置
ipcMain.on("user-setting", (e, data: Correspond) => {
  loadOldData<Setting>("/user-setting", {}, "db").then((res) => {
    if (data.data) {
      res = Object.assign(res, data.data);
      db.push("/user-setting", res);
    } else {
      WINDOW.mainWindow.webContents.send(data.responseEvent, res);
    }
  });
});

//设置搜索历史记录
ipcMain.on("search-history", (e, data: Correspond) => {
  db.push("/search-history", data.data);
});
