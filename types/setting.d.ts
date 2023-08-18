//用户设置
//用于保存
interface Setting {
  // 音质
  quality?: Quality;
  //   音量
  voice?: number;
  //播放速度
  rate?: number;
  //自定义音效值
  custom?: number[];
  //播放方式
  playType?: string;
  // 是否显示桌面歌词(未做)
  showLry?: boolean;
  //播放音效
  acoustics?: string;
  //当前播放位置
  current?: number;
  //雷达播放id(现在只有猜你喜欢)
  radioId?: number | null;
}
