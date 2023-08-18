import FileCache from "./fileCache";
import { app } from "electron";
import type { Cache } from "./fileCache";
import { db } from "./jsondb";
import Downloader from "./downloader";
import * as path from "path";

//加载cache、下载文件信息、下载地址
export const load = async () => {
  //加载cache
  let cache: { [key: string]: Cache } = {};
  try {
    cache = await db.getData("/cache/cacheData");
  } catch (e) {
    console.log("no cache");
  }

  let usageQueue: string[] = [];
  try {
    usageQueue = await db.getData("/cache/usageQueue");
  } catch (error) {
    console.log("no cache");
  }

  let maxSize = 300;
  try {
    maxSize = await db.getData("/cache/maxSize");
  } catch (error) {
    console.log("no maxSize");
  }

  global.fileCache = new FileCache(
    maxSize,
    new Map(Object.entries(cache)),
    usageQueue
  );

  //加载本地歌曲
  let localMusic = {};
  try {
    localMusic = await db.getData("/download");
  } catch (e) {
    console.log("no download");
  }
  global.localMusic = new Map(Object.entries(localMusic));

  //加载下载地址
  let downloadPath =
    path.parse(process.cwd()).root + "\\music master\\download\\music\\";
  try {
    downloadPath = await db.getData("/downloadPath");
  } catch (e) {
    console.log("no downloadPath");
  }
  global.downloadPath = downloadPath;

  //加载缓存地址
  let cachePath: string;

  if (app.isPackaged) {
    cachePath = path.resolve(__dirname, "..\\..\\..\\cache\\") + "\\";
  } else {
    cachePath = __dirname + "\\cache\\";
  }

  global.logger.info(cachePath);
  try {
    cachePath = await db.getData("/cachePath");
  } catch (e) {
    console.log("no cachePath");
  }
  global.cachePath = cachePath;

  //加载下载器
  global.downloader = new Downloader();
};

//保存内容到json-db
export const save = async () => {
  //缓存歌曲
  console.log("start");
  const fileCache = global.fileCache;
  await db.push(
    "/cache/cacheData",
    Object.fromEntries(fileCache.cache.entries())
  );
  console.log("center");
  //最近最久未使用队列
  await db.push("/cache/usageQueue", fileCache.usageQueue);
  //保存本地歌曲
  await db.push("/download", Object.fromEntries(global.localMusic.entries()));
  console.log("end");
  //执行下载器退出程序，等待下载器将当前正在下载文件下载完成
  await global.downloader.exit();
};
