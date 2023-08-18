//排行榜(赞未使用)
interface TheCharts {
  code: number;
  Songlist: {
    code: number;
    data: {
      data: {
        //排行榜名称包含时间
        titleDetail: string;
        //排行榜名称
        title: string;
        //排行榜id
        topId: number;
        //排行榜播放人数
        listenNum: number;
        // 歌曲总数
        totalNum: number;
        //排行信息
        song: RankList[];
        //排行榜对应的歌曲信息
        songInfoList: SongItem[];
      };
    };
  };
}
interface RankList {
  //当前排名
  rank: number;
  //相比上一期rank变化
  rankValue: string;
  //歌曲id
  songId: number;
  //歌曲名称
  title: string;
  singerName: string;
  singerMid: string;
}
