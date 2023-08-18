//歌曲列表  旧版歌单详情返回
interface SheetSongItem {
  albumname: string;
  albummid: string;
  singer: Singer[];
  size128: number;
  size320: number;
  sizeflac: number;
  songname: string;
  songmid: string;
  songid: number;
  interval: number;
  isDownload?: boolean;
  //等同与songitem tag 值为11表示原唱
  alertid: number;
}
