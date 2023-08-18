//歌单详情
interface SheetDetail {
  cdlist: SheetDetailItem[];
}

interface SheetDetailItem {
  disstid?: string;
  dissname?: string;
  //海报
  logo?: string;
  total_song_num?: number;
  //歌单被访问次数
  visitnum?: number;
  songlist?: SheetSongItem[];
  desc?: string;
}
