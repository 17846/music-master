//歌手列表(暂未使用)
interface SingerList {
  code: number;
  req_1: {
    code: number;
    data: {
      total: number;
      singerlist: SingerItem[];
    };
  };
}

// 单个歌手信息
interface SingerItem {
  singer_id: number;
  singer_name: string;
  singer_mid: string;
  singer_pic: string;
}

//歌手详情
interface SingerDetail {
  code: number;
  req_1: {
    data: {
      singerMid: string;
      totalNum: number;
      songList: SongInfo[];
    };
  };
}
interface SongInfo {
  songInfo: SongItem;
}
