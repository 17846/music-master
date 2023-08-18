//音质
type Quality = "320kmp3" | "hq" | "sq";

//播放方式，顺序，随机，单曲循环
type PlayType = "sequence" | "random" | "single";

//useMusicStore
interface MusicStore {
  // 音量
  volume?: number;
  //   是否静音
  isMuted?: boolean;
  //   播放速度
  playRate?: number;
  //   是否正在播放
  isPlay?: boolean;
  //   当前播放歌曲时长
  duration?: number;
  //   当前播放进度
  currentTime?: number;
  //   优先播放音质
  quality?: Quality;
  //   播放列队,默认的
  songList?: (SongItem & { path?: string })[];
  //   当前播放的位置
  current?: number;

  audio?: HTMLMediaElement;
  //播放方式
  playType?: PlayType;
  //   当前播放歌曲信息
  currentMusic?: SongItem;
  //   为电台播放的电台id
  radioId?: number | null;
  //   设置播放方式
  setPlayType?: (name: PlayType) => void;
  //   设置音质
  setQuality?: (q: Quality) => void;
  //   跳转到指定播放进度
  seeking?: (percent: number) => void;
  //   设置音量
  setVolume?: (percent: number) => void;
  //   设置静音,不静音
  setMuted?: (muted: boolean) => void;
  //   设置播放速度
  setPlayRate?: (rate: number) => void;
  //   暂停
  pause?: () => void;
  //   播放
  play?: () => void;
  //   上一首
  handlePre?: () => void;
  //   下一首
  handleNext?: () => void;
  //   将歌曲添加到播放列表
  addToList?: (list: SongItem, playNow: 1 | 2 | 3) => void; //1 现在播放 2 下一首播放 3 添加到队尾
  //   播放全部
  playAll?: (list: SongItem[], id: number | null, playNow?: boolean) => void;
  //   清空播放列表
  deleteAll?: () => void;
  //   通过mid从播放列表删除歌曲
  deleteMusic?: (mid: string) => void;
  //从播放队列播放歌曲
  playSongItem?: (item: SongItem) => void;
  //设置当前播放的位置
  setCurrent?: (index: number) => void;
  //设置雷达播放id
  setRadioId?: (id: number | null) => void;
}
