//猜你喜欢
interface GuessYouLike {
  code: number;
  req_1: {
    data: {
      track_list: SongItem[];
    };
  };
}

//电台列表
interface RadioList {
  req_1: {
    data: {
      radio_list: RadioClassItem[];
    };
  };
}
//电台大类
interface RadioClassItem {
  id: number;
  //电台名称
  title: string;
  //子类
  list: RadioItem[];
}

interface RadioItem {
  id: number;
  title: string;
  listenNum: string;
  pic_url: string;
}
