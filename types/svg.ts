export enum SvgName {
  //添加到
  "AddTo" = "AddTo",
  //批量操作
  "BatchOperation" = "BatchOperation",
  // 下载(未使用,找不到对应的已下载图标)
  "Download" = "Download",
  // 下载
  "Download2" = "Download2",
  // 已下载
  "Downloaded" = "Downloaded",
  //HQ 高音质
  "HighQuality" = "HighQuality",
  //本地
  "Location" = "Location",
  //爱心
  "Love" = "Love",
  //更多
  "More" = "More",
  //歌曲
  "Music" = "Music",
  //歌曲列表
  "MusicList" = "MusicList",
  //下一首
  "NextIcon" = "NextIcon",
  //下一首
  "NextPlay" = "NextPlay",
  // 暂停
  "PauseIcon" = "PauseIcon",
  // 更瘦一点的暂停
  "PauseThin" = "PauseThin",
  // 空心的播放
  "PlayPlain" = "PlayPlain",
  // 实心的播放
  "PlayIcon" = "PlayIcon",
  // 上一首
  "PreviousIcon" = "PreviousIcon",
  // 随机播放
  "RandomIcon" = "RandomIcon",
  // 最近播放(时钟)
  "Recently" = "Recently",
  // SQ 超高品质
  "SuperQuality" = "SuperQuality",
  // 音量
  "Voice" = "Voice",
  // 静音
  "VoiceMuteIcon" = "VoiceMuteIcon",
  // 顺序播放
  "Sequence" = "Sequence",
  // 单曲循环
  "Single" = "Single",
  // 头戴式耳机样式听歌
  "Listen" = "Listen",
}

export type IconProps = {
  //图标颜色
  color?: string;
  //图标宽度
  width?: string | number;
  //图标高度
  height?: string | number;
  //图标鼠标悬浮色
  hoverColor?: string;
  //图标top值，需上级容器relative
  top?: number | string;
  //图标left值
  left?: number | string;
  //文件夹中的svg图标文件名称
  name: SvgName;
};
