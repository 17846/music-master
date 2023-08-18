//默认歌单形式，用于保存
//用户创建歌单
interface UserSheet {
  code: number;
  data: {
    hostname: string;
    total: number;
    disslist: DissList[];
  };
}
interface DissList {
  tid?: number | string;
  diss_name?: string;
  song_cnt?: number;
  diss_cover?: string;
  listen_num?: number;
  //自建歌单是否完成初始化(本地保存歌曲列表)
  isInit?: boolean;
  desc?: string;
  //歌单是否展示 0不展示(导入歌单如qq空间dir为0)
  dir_show?: 0 | 1;
}
