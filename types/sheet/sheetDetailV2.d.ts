//新版本 歌单详情V2
interface SheetDetailV2 {
  req_0: {
    code: number;
    data?: {
      dirinfo: {
        picurl: string;
        title: string;
        desc: string;
        songnum: number;
        listennum: number;
        id: string;
      };
      songlist: SongItem[];
    };
  };
}
