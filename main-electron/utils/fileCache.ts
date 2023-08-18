const fs = require("fs");

interface Cache {
  path: string;
  info: SongItem;
}

/**
 * 本地缓存，使用最近最久未使用替换策略
 * @param maxSize 缓存大小 歌曲数
 * @param cache 缓存
 * @param usageQueue 使用队列
 */
function FileCache(
  maxSize: number,
  cache: Map<string, Cache>,
  usageQueue: string[]
) {
  this.maxSize = maxSize;
  this.cache = cache;
  this.usageQueue = usageQueue;
}

//获取文件地址
FileCache.prototype.getFile = function (key: string): string | null {
  if (this.cache.has(key)) {
    // 更新文件在使用队列中的位置
    this.updateUsageQueue(key);
    return this.cache.get(key).path;
  }
  return null;
};

//添加新文件到缓存中
FileCache.prototype.addFile = function (key: string, cache: Cache) {
  // 检查缓存是否已满
  if (this.usageQueue.length >= this.maxSize) {
    // 执行最近最久未使用策略，删除最久未使用的文件
    const oldestFileKey = this.usageQueue.shift();
    if (oldestFileKey) {
      const path = this.cache.get(oldestFileKey).path;
      this.deleteFile(path);
      this.cache.delete(oldestFileKey);
    }
  }
  // 添加新文件到缓存中
  this.cache.set(key, cache);
  // 更新文件在使用队列中的位置
  this.updateUsageQueue(key);
};

//更新文件在使用队列中的位置
FileCache.prototype.updateUsageQueue = function (key: string): void {
  // 检查文件是否已经存在于使用队列中，若存在则移除旧位置
  if (this.usageQueue.includes(key)) {
    this.usageQueue = this.usageQueue.filter((item) => item !== key);
  }
  // 将文件添加到队列末尾，表示最新使用
  this.usageQueue.push(key);
};

//根据key删除文件
FileCache.prototype.deleteByMid = function (mid: string) {
  // 检查文件是否已经存在于使用队列中
  if (!this.usageQueue.includes(mid)) return;
  this.usageQueue = this.usageQueue.filter((item: string) => item !== mid);

  const path = this.cache.get(mid).path;
  //删除缓存列表
  this.cache.delete(mid);
  //删除文件
  if (!!path) {
    this.deleteFile(path);
  }
};

//删除最近最久未使用文件
FileCache.prototype.deleteFile = function (path: string) {
  //判断文件是否存在
  fs.access(path, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("文件不存在");
    } else {
      // 删除文件
      fs.unlink(path, (err) => {
        if (err) {
          console.error("删除文件时发生错误:", err);
        } else {
          console.log("文件删除成功");
        }
      });
    }
  });
};

//设置缓存大小
FileCache.prototype.setMaxSize = function (max: number) {
  global.logger.info("设置缓存大小" + max);
  this.maxSize = max;

  const length = this.usageQueue.length;
  if (length < max) return;
  //如果超出则将超出的删除
  const overflow = length - max;
  const overflowQueue = this.usageQueue.splice(0, overflow + 1);
  overflowQueue.forEach((item: string) => {
    const song: Cache = this.cache.get(item);
    this.cache.delete(item);
    this.deleteFile(song.path);
  });
};

//清空缓存
FileCache.prototype.clearCache = function () {
  global.logger.info("清除缓存");
  this.cache.clear();
  this.usageQueue = [];
};

export default FileCache;
export type { Cache };
