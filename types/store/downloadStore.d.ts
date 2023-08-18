//downloadStore
interface DownloadStore {
  //已下载列表
  downloaded?: Map<string, DownloadItem>;
  //待下载列表
  downloading?: Downloading;
  //缓存和下载信息
  path?: PathManage;
  //下载歌曲
  handleDownload?: (
    list: SongItem[],
    quality: Quality,
    isRetry?: boolean
  ) => void;
  //更新下载进度
  handleRenewProgress?: ({ mid, progress, path }: RenewProgress) => void;
  //不正经的setPath
  setPath?: (
    key: "downloadPath" | "cachePath" | "cacheSize" | "maxSize",
    value: string
  ) => void;
  //暂停下载或取消下载
  handlePause?: (item: DownloadItem, flag?: boolean) => void;
  //批量暂停或取消
  pauseAll?: (flag?: boolean) => void;
}

type RenewProgress = { mid: string; progress: number; path: string };
type PathManage = {
  //下载路径
  downloadPath: string | number;
  //缓存路径
  cachePath: string | number;
  //当前缓存占用空间
  cacheSize: string | number;
  //最大缓存数量(首)
  maxSize: string | number;
};

//下载完成保存的内容
interface DownloadItem {
  path: string;
  info: SongItem;
}

//待下载
type Downloading = SongItem & {
  quality?: Quality;
  progress?: number;
  state?: string;
};
