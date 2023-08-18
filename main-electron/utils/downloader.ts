import { getUrl } from "../../src/api/getUrl";
import { playQuality } from "../../src/utils/common";
import { checkDir } from "./download";
import * as fs from "fs";
import axios, { CancelTokenSource } from "axios";
import type { AxiosResponse, ResponseType } from "axios";
import { WINDOW } from "../window";

type Info = SongItem & {
  quality?: Quality; //音质
  state?: string; //状态，待下载、已暂停
  progress?: number; //下载进度
};
interface DownloadTask {
  info: Info;
  cancelTokenSource?: CancelTokenSource;
  progress?: number;
  isCancel?: boolean;
}

interface DownloadItem {
  path: string;
  info: SongItem;
}

class Downloader {
  private queue: DownloadTask[] = []; // 下载队列
  private downloading = false; // 是否正在下载
  private currentTask?: DownloadTask; // 当前下载任务
  private downloadPath: string; //下载目录
  private isPause = false; //是否暂停下载
  private writer: fs.WriteStream; //文件写入流
  private filePath: string; //文件存放路径

  constructor() {
    this.downloadPath = global.downloadPath;
    checkDir(this.downloadPath);
  }

  // 添加下载任务
  public add(
    list: (SongItem & { quality?: Quality | undefined })[],
    quality: Quality | null
  ): void {
    for (let item of list) {
      this.queue.push({
        info: { ...item, quality: item.quality || quality },
        cancelTokenSource: undefined,
        progress: 0,
      });
    }
    console.log("queue load");
    // 如果当前没有任务在下载，则开始下载
    if (!this.downloading) {
      this.isPause = false;
      this.downloadNext();
    }
  }

  /**
   * 取消或暂停下载任务
   * @param mid 歌曲mid
   * @param flag  flag为true表示取消，false 为暂停
   * @returns
   */
  public cancel(mid: string, flag = false): boolean {
    // 从队列中移除指定文件路径的任务
    this.queue = this.queue.filter((task) => task.info.mid !== mid);
    // 如果取消的任务正在下载中，则停止当前的下载
    if (this.downloading && this.currentTask?.info.mid === mid) {
      this.cancelDownload(flag);
    }
    return true;
  }

  //暂停所有下载任务
  public pauseTask(flag = false) {
    this.isPause = true;
    this.queue = [];
    this.cancelDownload(flag);
    return true;
  }

  // 结束正在下载的任务
  private cancelDownload(flag = false): void {
    this.downloading = false;
    this.currentTask.isCancel = true;
    if (this.currentTask?.cancelTokenSource) {
      this.currentTask.cancelTokenSource.cancel("下载取消");
      this.writer.end();
      if (flag) {
        fs.unlinkSync(this.filePath);
      }
      this.downloadNext();
    }
  }

  private downloadError(name: string, mid: string): void {
    console.error(`download error: ${name}`);
    this.downloading = false;
    this.currentTask = undefined;
    //进度为-1代表下载失败
    this.sendProgerss(mid, -1, "");
    this.downloadNext();
  }

  // 开始下载下一个任务
  private downloadNext(): void {
    console.log("next start");
    if (!this.isPause && this.queue.length > 0) {
      this.currentTask = this.queue.shift();
      const info = this.currentTask.info;
      this.downloading = true;
      const quality = playQuality(info.quality, info.file);
      console.log("before url");
      getUrl(info.mid, quality).then((res: string) => {
        console.log("after url");
        if (res === "fail request") {
          this.downloadError(info.name, info.mid);
        } else {
          const singer = info.singer.map((item) => item.name).join("&");
          const filePath =
            this.downloadPath +
            info.name +
            "-" +
            singer +
            (quality === "sq" ? ".flac" : ".mp3");
          this.filePath = filePath;
          this.download(res, filePath, info)
            .then(() => {
              if (!this.currentTask.isCancel) {
                (global.localMusic as Map<string, DownloadItem>).set(info.mid, {
                  path: filePath,
                  info,
                });
                this.downloading = false;
                this.currentTask = undefined;
                //删除本地缓存
                global.fileCache.deleteByMid(info.mid);

                this.downloadNext();
              }
            })
            .catch((error) => {
              this.downloadError(info.name, info.mid);
            });
        }
      });
    }
  }

  // 下载方法
  private async download(
    url: string,
    filePath: string,
    info: Info
  ): Promise<void> {
    try {
      const source = axios.CancelToken.source();
      const requestConfig = {
        responseType: "stream" as ResponseType,
        cancelToken: source.token,
        headers: {},
        url,
      };
      let downloadedBytes = 0;
      if (info.progress && fs.existsSync(filePath)) {
        downloadedBytes = fs.statSync(filePath).size;
        requestConfig.headers = {
          Range: `bytes=${downloadedBytes}-`,
        };
      }
      this.currentTask.cancelTokenSource = source;
      this.currentTask.isCancel = false;

      const response = await axios<
        any,
        AxiosResponse<NodeJS.ReadableStream>,
        any
      >(requestConfig);

      const writer = fs.createWriteStream(filePath, { flags: "a" });
      this.writer = writer;
      const totalLength = parseInt(response.headers["content-length"], 10);
      const stream = response.data;

      stream.on("data", (chunk: Buffer) => {
        writer.write(chunk);
        downloadedBytes += chunk.length;
        const progress = Math.round((downloadedBytes / totalLength) * 100);
        this.currentTask.progress = progress;
        this.sendProgerss(this.currentTask.info.mid, progress, filePath);
      });

      await new Promise<void>((resolve, reject) => {
        stream.on("end", () => {
          console.log("download success!");
          // 关闭写入流
          writer.end();
          resolve();
        });
        stream.on("error", (err) => {
          console.error("文件下载出错:", err);
          // 关闭写入流
          writer.end();
          reject();
        });
      });
    } catch (error) {
      console.error(`下载失败：${filePath}`);
    }
  }

  //退出时等待当前下载任务完成
  public async exit(): Promise<void> {
    this.isPause = true;
    await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (!this.downloading) {
          clearInterval(interval);
          resolve();
        }
      }, 1000);
    });
  }

  //获取任务列表
  public get taskList(): DownloadTask[] {
    return this.queue;
  }

  //设置下载路径
  public setDownloadPath(path: string) {
    this.downloadPath = path;
  }

  //给渲染进程更新下载进度
  private sendProgerss(mid: string, progress: number, path: string) {
    if (!WINDOW.mainWindow.isDestroyed()) {
      WINDOW.mainWindow.webContents.send("download-progress", {
        mid,
        progress,
        path,
      });
    }
  }
}

export default Downloader;
