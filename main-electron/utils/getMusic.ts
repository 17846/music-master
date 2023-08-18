import { getUrl } from "../../src/api/getUrl";
import { checkDir, downloadFile } from "./download";
import * as fs from "fs";
import * as crypto from "crypto";
/**
 * 检查本地是否存在
 * @param path 本地地址
 * @returns 歌曲链接或false
 */
const checkLocal = (path: string) => {
  if (path) {
    //判断文件是否存在
    if (fs.existsSync(path)) {
      return true;
    }
  }
  return false;
};

interface FileCache {
  cache: Map<string, DownloadMusic>;
  maxSize: number;
  usageQueue: string[];
  deleteByMid: (path: string) => void;
  addFile: (key: string, cache: { path: string; info: SongItem }) => void;
}

export const getMisic = async function (info: SongItem & { quality: Quality }) {
  const mid = info.mid;
  const hashMap: Map<string, DownloadItem> = global.localMusic;

  if (hashMap.has(mid)) {
    const localMusic: Map<string, DownloadMusic> = global.localMusic;
    const path = localMusic.get(mid).path;
    if (checkLocal(path)) {
      return path;
    }
    //本地下载文件不存在，则从下载列表删除
    localMusic.delete(mid);
  }
  const fileCache: FileCache = global.fileCache;
  //判断歌曲是否缓存
  if (fileCache.cache.has(mid)) {
    if (checkLocal(fileCache.cache.get(mid).path)) {
      return fileCache.cache.get(mid).path;
    }
    //存在缓存队列中但是不存在缓存文件，从缓存队列移出
    fileCache.deleteByMid(mid);
  }
  const url: string = await getUrl(mid, info.quality);
  if (url == "fail request") {
    throw new Error();
  }
  const path = global.cachePath + crypto.randomUUID().toString().toUpperCase();
  downloadFile(url, path);
  checkDir(global.cachePath);
  fileCache.addFile(info.mid, {
    path,
    info,
  });
  return url;
};
