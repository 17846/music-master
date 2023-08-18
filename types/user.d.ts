//用户信息
interface UserInfo {
  code: number;
  req?: {
    data?: {
      map_userinfo?: {
        [key: string]: InfoDetail;
      };
    };
  };
}

interface InfoDetail {
  //qq号码
  uin?: number;
  //头像地址
  headurl?: string;
  //昵称
  nick?: string;
}

//用户下载歌曲
interface DownloadMusic {
  path: string;
  info: SongItem;
}
