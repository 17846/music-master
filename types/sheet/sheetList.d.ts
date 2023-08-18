//歌单列表
interface SongSheet {
  code: number;
  songSheet: {
    data: {
      content: {
        total_cnt: number;
        v_item: SheetItem[];
      };
    };
  };
}

interface SheetItem {
  basic: {
    // 歌单图片
    cover: {
      big_url: string;
      default_url: string;
      medium_url: string;
      small_url: string;
    };
    // 歌单描述
    desc: string;
    title: string;
    // 播放数量
    play_cnt: number;
    tid: number;
  };
}
