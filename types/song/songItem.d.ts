//歌曲信息
//一般为搜索结果和新版获取歌单详情返回
//播放海报地址
//https://y.qq.com/music/photo_new/T002R300x300M000 ${pmid} _1.jpg?max_age=2592000
//https://y.qq.com/music/photo_new/T001R300x300M000 ${sing.mid}.jpg?max_age=2592000
//单首歌曲信息
//默认歌曲信息存放模式，本地保存格式
interface SongItem {
  //专辑
  album?: {
    name?: string;
    mid?: string;
    pmid?: string;
  };
  file?: QualityFile;
  //歌曲id
  id?: number;
  //歌曲mid
  mid?: string;
  //歌曲名称
  name?: string;
  //歌曲时长
  interval?: number;
  singer?: Singer[];
  //大概tag=11标识原唱
  tag?: number;
  //子标题
  subtitle?: string;
  //标识是否下载  (没用)
  isDownload?: boolean | undefined;
}

//file 标识文件大小 同时也是用来判断是否有对应品质音频是否存在
interface QualityFile {
  //320k mp3
  size_128mp3?: number;
  //hq
  size_320mp3?: number;
  //sq
  size_flac?: number;
}

//歌手信息
interface Singer {
  id?: number;
  mid?: string;
  name?: string;
}

//搜索结果描述(没用)
interface ZhiDa {
  desciption: string;
  pic: string;
  custom_info: {
    mid: string;
  };
}
