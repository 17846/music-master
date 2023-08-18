import { ref } from "vue";
import { defineStore } from "pinia";
import { useMusicStore } from "./useMusic";
import { localSetting } from "@/utils/userSetting";
import { useResponse } from "@/utils/correspond";

const ACOUSTICS_LIST = ref<Acoustics>({
  guanbi: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  rensheng: [-2, -1, -1, 0, 3, 4, 3, 0, 0, 1],
  landiao: [3, 6, 8, 3, -2, 0, 4, 7, 9, 10],
  liuxing: [4, 2, 0, -3, -6, -6, -3, 0, 1, 3],
  wuqu: [7, 6, 3, 0, 0, -4, -6, -6, 0, 0],
  gudian: [0, 0, 0, 0, 0, 0, -6, -6, -6, -8],
  jueshi: [0, 0, 1, 4, 4, 4, 0, 1, 3, 3],
  mange: [5, 4, 2, 0, -2, 0, 3, 6, 7, 8],
  dianziyue: [6, 5, 0, -5, -4, 0, 6, 8, 8, 7],
  yaogun: [7, 4, -4, 7, -2, 1, 5, 7, 9, 9],
  xiangcun: [5, 6, 2, -5, 1, 1, -5, 3, 8, 5],
  zidingyi: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
});

// web audio 相关
export const useWebAudioStore = defineStore("web-audio", () => {
  const musicStore = useMusicStore();

  //音效开关
  const acoustics = ref("guanbi");

  //AudioContext 实例
  const audioCtx = new AudioContext();

  //分析节点
  const analyser = audioCtx.createAnalyser();

  // 设置FFT（快速傅里叶变换）大小
  analyser.fftSize = 1024;
  //获取audio元素
  const audio = musicStore.audio;
  //获取元素的音频
  const source = audioCtx.createMediaElementSource(audio);
  source.connect(analyser);
  //将输入节点连接到AudioContext
  analyser.connect(audioCtx.destination);

  //十段均衡器频率
  const frequencys = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
  //用于存放均衡器滤波器
  const filterList: BiquadFilterNode[] = [];

  //初始化十段均衡器
  function equalizer() {
    frequencys.forEach((i, index) => {
      const filter = audioCtx.createBiquadFilter();
      if (index === 0) {
        filter.type = "lowshelf";
      } else if (index < 9) {
        filter.type = "peaking";
      } else {
        filter.type = "highshelf";
      }
      filter.Q.value = 1.41;

      filter.frequency.value = i;
      filter.gain.value = 0;
      const preFilter = filterList[filterList.length - 1];
      //使是个滤波器串联
      if (preFilter) {
        preFilter.connect(filter);
      }
      filterList.push(filter);
    });
  }
  equalizer();

  //输入增益节点
  const inputGainNode = audioCtx.createGain();
  //输出增益节点
  const outputGainNode = audioCtx.createGain();
  //输入节点连接首个滤波器
  inputGainNode.connect(filterList[0]);
  //创建压缩节点
  const compressor = audioCtx.createDynamicsCompressor();
  //高于标准值-24db将会被压缩
  compressor.threshold.value = -24;
  //超出threshold后，曲线在哪个点开始朝着 ratio 设置的部分平滑变换
  compressor.knee.value = 30;
  //输入增益变化多少来产生1db的输出
  compressor.ratio.value = 12;
  //降低10db的时间
  compressor.attack.value = 0.003;
  //提升10db的时间
  compressor.release.value = 0.25;
  //滤波器最后一个节点连接压缩节点，再连接输出节点
  filterList[filterList.length - 1].connect(compressor).connect(outputGainNode);

  /**
   * 启动音效设置
   * @param type 需要使用的音效名称
   */
  function openEqualizer(type: string) {
    localSetting({ acoustics: type });
    if (type === "guanbi") {
      if (acoustics.value !== "guanbi") {
        acoustics.value = "guanbi";
        closeEqualizer();
      }
      return;
    }
    //将输入节点和音源连接，输出节点和destination连接
    if (acoustics.value === "guanbi") {
      source.connect(inputGainNode);
      outputGainNode.connect(audioCtx.destination);
      console.log("均衡器已启动");
    }
    acoustics.value = type;
    //根据对应音效值设置滤波器gain值
    const values = ACOUSTICS_LIST.value[type];
    filterList.forEach((item, index) => {
      item.gain.value = values[index];
    });
  }

  //关闭音效，与音源断开连接
  function closeEqualizer() {
    source.disconnect(inputGainNode);
    outputGainNode.disconnect(audioCtx.destination);
    acoustics.value = "guanbi";
    console.log("均衡器已关闭");
  }

  //关闭均衡器
  function customEqualizer(val: number, index: number) {
    const value = ACOUSTICS_LIST.value["zidingyi"];
    value[index] = val;
    localSetting({ custom: value });
    filterList[index].gain.value = val;
  }

  //加载设置
  (function loadSetting() {
    useResponse<Setting>("user-setting", null).then((setting) => {
      musicStore.setVolume(setting.voice ?? 1);
      musicStore.setPlayRate(setting.rate ?? 1);
      musicStore.setQuality(setting.quality ?? "320kmp3");
      ACOUSTICS_LIST.value.zidingyi = setting.custom ?? [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ];
      openEqualizer(setting.acoustics ?? "guanbi");
    });
  })();

  return {
    acoustics,
    ACOUSTICS_LIST,
    musicStore,
    analyser,
    openEqualizer,
    closeEqualizer,
    customEqualizer,
  };
});
