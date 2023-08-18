//每日推荐
//v_shelf[0]为 每日30首，新歌推荐，百万收藏(没用)，杜比专区(没用)等信息
//v_shelf[1] 为推荐歌单
interface DailyRecommend {
  code: number;
  req: {
    code: number;
    data: {
      v_shelf: ShelfRecommend[];
    };
  };
}
//模块介绍
interface ShelfRecommend {
  title_content: string;
  title_template: string;
  v_niche: VNiche[];
}
//具体内容
interface VNiche {
  v_card: VCard[];
}

interface VCard {
  //歌单名称
  title?: string;
  //海报地址
  cover?: string;
  type?: number;
  //歌单id
  id?: number | string;
  src?: string;
  //歌单歌曲数
  cnt?: number;
  miscellany?: {
    //悬浮在海报上的遮罩图片
    layer_url: string;
  };
}
