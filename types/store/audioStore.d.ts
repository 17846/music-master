type Acoustics = {
  [key: string]: number[];
};
//useWebAudioStore 类型
//主要是web audio api相关
interface WebAudioStore {
  //播放音效
  acoustics?: string;
  //播放音效对应的均衡器值
  ACOUSTICS_LIST?: Acoustics;
  //   音频频率采集
  analyser?: AnalyserNode;
  // 开启均衡器
  openEqualizer?: (type: string) => void;
  //   关闭均衡器
  closeEqualizer?: () => void;
  //   自定义音效
  customEqualizer?: (val: number, index: number) => void;
  //将music store放到这是因为两者都需要使用audio,需要在mounted里面进行初始化
  //而且很多组件需要两个store的功能
  musicStore?: MusicStore;
}
