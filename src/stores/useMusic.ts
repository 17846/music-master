import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { localSetting } from "@/utils/userSetting";
import { useResponse } from "@/utils/correspond";
import { playQuality, deepClone, formatSongInfo } from "@/utils/common";
import { dynamicLoadList } from "@/utils/dynamicLoadList";

import type { Ref } from "vue";

// 歌曲播放相关
export const useMusicStore = defineStore("music-store", () => {
  //播放音效
  const quality = ref<Quality>("320kmp3");

  //播放方式
  const playType = ref<PlayType>("sequence");

  //设置播放音效
  const setQuality = (q: Quality) => {
    quality.value = q;
    localSetting({ quality: q });
  };

  type SongList = SongItem & { path?: string };
  //原始歌曲列表
  const songList = ref<SongList[]>([]);
  //随机播放队列
  const randomList = ref<SongList[]>([]);

  //根据当前播放模式返回播放列表
  const playList = computed<SongList[]>(() => {
    if (playType.value === "random") return randomList.value;
    return songList.value;
  });

  //当前歌曲
  const currentMusic = computed(() => {
    console.log(current.value);
    if (playType.value === "random") {
      if (randomList.value.length > 0) return randomList.value[current.value];
    } else {
      if (songList.value.length > 0) return songList.value[current.value];
    }
    return null;
  });

  //当前播放
  const current = ref(0);

  //设置当前播放
  const setCurrent = (index: number) => {
    current.value = index;
  };

  //当前播放改变时缓存当前播放
  watch(current, (newVal) => {
    //随机播放需要从songList找到所在位置
    if (songList.value.length === 0) return;
    if (playType.value === "random") {
      const mid = currentMusic.value.mid;
      const index = songList.value.findIndex((item) => item.mid === mid);
      localSetting({ current: index });
    } else {
      localSetting({ current: current.value });
    }
  });

  //audio dom
  const audio = document.getElementById("audio") as HTMLMediaElement;

  //播放状态 播放 true 暂停 false
  const isPlay = ref(false);
  //音频时长
  const duration = ref<number>();
  //当前播放进度
  const currentTime = ref<number>();

  //使用雷达播放时的id
  const radioId = ref<number | null>(null);

  //设置猜你喜欢
  const setRadioId = (id: number | null) => {
    radioId.value = id;
  };

  //暂停
  function pause() {
    isPlay.value = false;
    audio.pause();
  }

  //播放
  function play() {
    if (currentMusic.value) {
      console.log(audio.src);
      if (audio.src) {
        audio.play();
      } else {
        handlePlay(currentMusic.value);
      }
    }
  }

  //音频加载完成时获取音频的总时长
  audio.addEventListener("canplay", (e) => {
    duration.value = (e.target as HTMLMediaElement).duration;
  });

  //播放速度
  const playRate = ref(1);
  const setPlayRate = (rate: number) => {
    audio.playbackRate = rate;
    playRate.value = rate;
    localSetting({ rate: rate });
  };

  //audio每加载一首歌曲会重置播放速度
  audio.addEventListener("play", () => {
    audio.playbackRate = playRate.value;
    isPlay.value = true;
  });

  //音频播放进度改变时获取当前进度
  audio.addEventListener("timeupdate", (e) => {
    currentTime.value = (e.target as HTMLMediaElement).currentTime;
  });

  //中断播放时播放下一首
  audio.addEventListener("error", () => handleNext());

  //监听播放完成
  audio.addEventListener(
    "ended",
    () => {
      handleNext();
    },
    false
  );

  /**
   * 进度跳转
   * @param percent 跳转后百分比
   */
  function seeking(percent: number) {
    let time = duration.value || 0;
    audio.currentTime = percent * time;
  }

  /**
   * 设置播放类型
   * @param name 播放类型 sequence random single
   */
  const setPlayType = (name: PlayType) => {
    localSetting({ playType: name });
    const mid = currentMusic.value?.mid;
    playType.value = name;
    if (name !== "random" && songList.value.length > 0) {
      const index = songList.value.findIndex((item) => item.mid === mid);
      current.value = index;
    }
    switch (name) {
      case "single":
        audio.loop = true;
        break;
      case "random":
        audio.loop = false;
        if (mid) {
          const newList: SongList[] = deepClone(songList.value);
          randomList.value = newList.sort(() => Number(Math.random() - 0.5));
          const randomIndex = randomList.value.findIndex(
            (item) => item.mid === mid
          );
          current.value = randomIndex;
        }
        break;
      default:
        audio.loop = false;
        break;
    }
  };

  //声音相关设置
  const volume = ref(audio.volume);
  const setVolume = (percent: number) => {
    localSetting({ voice: percent });
    volume.value = percent;
    audio.volume = percent;
  };

  //静音
  const isMuted = ref(audio.muted);
  const setMuted = (muted: boolean) => {
    isMuted.value = muted;
    audio.muted = muted;
  };

  //上一首
  const handlePre = () => {
    if (songList.value.length === 0 || playType.value === "single") return;
    if (current.value === 0) {
      current.value = songList.value.length - 1;
    } else {
      current.value -= 1;
    }
    handlePlay(currentMusic.value);
  };

  //下一首
  const handleNext = () => {
    if (songList.value.length === 0 || playType.value === "single") return;
    if (current.value === songList.value.length - 1) {
      current.value = 0;
    } else {
      current.value += 1;
    }
    handlePlay(currentMusic.value);
    if (radioId.value && songList.value.length - current.value < 3) {
      dynamicLoadList(radioId.value).then((res) => {
        songList.value.push(...res);
      });
    }
  };

  /**
   * 非随机播放添加一首歌曲到播放队列
   * @param song 歌曲信息
   * @param playNow 1 现在播放 2 下一首播放 3 添加到队尾
   */
  const handleAddToList = (
    song: SongItem,
    playNow: 1 | 2 | 3,
    playList: Ref<SongItem[]>
  ) => {
    //flag 标识是否有current前面的歌曲被删除
    //flag2标识播放列队是否含义该歌曲
    let flag = false,
      flag2 = false;
    // 将原列表上包含歌曲删除
    playList.value = playList.value.filter((item, index) => {
      if (song.mid === item.mid) {
        flag2 = true;
        index < current.value && (flag = true);
        return false;
      }
      return true;
    });

    //如果在当前播放之前的歌曲被删除，则将current前移删除歌曲数
    flag && (current.value -= 1);
    song = Object.assign(song, {
      quality: playQuality(quality.value, song.file),
    });

    //随机播放时原播放队列不包含则将歌曲插入
    if (playType.value === "random" && !flag2) {
      songList.value.push(song);
    }

    if (playNow === 3) {
      //将新添加歌曲插入到播放列表后面
      playList.value.push(song);
    } else {
      //将新添加歌曲插入到当前播放歌曲后面
      playList.value.splice(current.value + 1, 0, song);
    }

    if (playNow === 1) {
      //原来播放列表有歌曲需要将当前指针加一再播放
      playList.value.length > 1 && current.value++;
      handlePlay(playList.value[current.value]);
    }
  };

  /**
   * 将歌曲添加到播放队列
   * @param list 播放队列
   * @param quality 播放音质
   * @param playNow 1 现在播放 2 下一首播放 3 添加到队尾
   */
  const addToList = (song: SongItem, playNow: 1 | 2 | 3) => {
    song = formatSongInfo(song);
    handleAddToList(
      song,
      playNow,
      playType.value === "random" ? randomList : songList
    );
  };

  /**
   * 播放全部，会清除当前播放列表再加载传入列队
   * @param list 播放队列
   * @param id 保存的雷达播放id
   * @param playNow 是否立即播放
   * @param setIndex 启动时恢复上次关闭的current
   */
  const playAll = (
    list: SongItem[],
    id: number | null,
    playNow = true,
    setIndex = -1
  ) => {
    try {
      //将列表转去除无效部分，因为会将播放列表本地缓存
      list = list.map((item) => formatSongInfo(item));
      radioId.value = id;

      //如果id非空则将playType 改为sequence，雷达播放不支持random
      if (id && playType.value === "random") {
        setPlayType("sequence");
      }

      //启动雷达播放时更新本地存储
      localSetting({ radioId: id });

      //根据当前设置的quality设置quality
      const newList = list.map((item) =>
        Object.assign(item, { quality: playQuality(quality.value, item.file) })
      );

      songList.value = newList;

      //随机播放生成随机队列
      if (playType.value === "random") {
        const clone = deepClone(newList);
        randomList.value = clone.sort(() => Math.random() - 0.5);
      }

      if (setIndex !== -1) {
        //从随机队列找到上次结束的current所在位置并设置
        if (playType.value === "random") {
          const cur = songList.value[setIndex];
          const index = randomList.value.findIndex(
            (item) => item.mid === cur.mid
          );
          current.value = index;
        } else {
          current.value = setIndex;
        }
      }
      if (playNow) {
        console.log(currentMusic, "playnow");
        current.value = 0;
        handlePlay(currentMusic.value);
      }
    } catch (error) {
      console.log("palyerr", error);
    }
  };

  /**
   * 播放处理，包括获取src和调用audio dom
   * @param item 播放歌曲info
   */
  const handlePlay = (item: SongItem & { path?: string }) => {
    pause();
    //虽然item可能会有path，但是由于可能文件会被删除，所以统一走getUrl，会判断路径文件是否存在
    return new Promise<void>((resolve) => {
      getUrl(item).then((res) => {
        item.path = res;
        audio.src = res;
        isPlay.value = true;
        audio.play();
        resolve();
      });
    });
  };

  /**
   * 将getUrl放到渲染线程是为了将歌曲本地缓存
   * @param item 歌曲info
   * @returns Promise<url>
   */
  const getUrl = (item: SongItem) => {
    return new Promise<string>((resolve, reject) => {
      useResponse<string>("music-url", {
        info: deepClone(item),
      }).then((res) => {
        resolve(res);
      });
    });
  };

  /**
   * 通过mid将歌曲从播放列表移除
   * @param mid
   */
  const deleteMusic = (mid: string) => {
    const flag = currentMusic.value.mid === mid;

    if (playType.value === "random") {
      songList.value = songList.value.filter((item) => item.mid !== mid);
      randomList.value = randomList.value.filter((item, index) => {
        if (mid === item.mid) {
          if (index < current.value) {
            current.value--;
          }
        }
        return item.mid !== mid;
      });
    } else {
      songList.value = songList.value.filter((item, index) => {
        if (mid === item.mid) {
          if (index < current.value) {
            current.value--;
          }
        }
        return item.mid !== mid;
      });
    }
    if (flag) {
      handlePlay(currentMusic.value);
    }
  };

  //删除播放列表所有歌曲
  const deleteAll = () => {
    songList.value = [];
    randomList.value = [];
    current.value = 0;
    duration.value = 0;
    pause();
    audio.src = null;
  };

  //指定current播放
  const playSongItem = (item: SongItem) => {
    if (playType.value !== "random") {
      if (item.mid === currentMusic.value.mid) return;
      const index = songList.value.findIndex((song) => song.mid === item.mid);
      current.value = index;
      //猜你喜欢播放时选择后两首歌曲触发扩容
      if (radioId.value && songList.value.length - index < 3) {
        dynamicLoadList(radioId.value).then((res) => {
          songList.value.push(...res);
        });
      }
    } else {
      const mid = item.mid;
      const newIndex = randomList.value.findIndex((item) => item.mid === mid);
      if (current.value === newIndex) return;
      current.value = newIndex;
    }
    handlePlay(currentMusic.value);
  };

  //播放列表长度发送变化时保存播放列队
  const musicListLength = computed(() => {
    return songList.value.length;
  });
  watch(musicListLength, () => {
    const raw: SongList[] = deepClone(songList.value);
    useResponse<void>("store-play-list", raw, false);
  });

  return {
    quality,
    songList,
    current,
    audio,
    isPlay,
    duration,
    currentTime,
    volume,
    isMuted,
    playRate,
    playType,
    currentMusic,
    radioId,
    setQuality,
    seeking,
    setVolume,
    setMuted,
    setPlayRate,
    pause,
    play,
    handlePre,
    handleNext,
    addToList,
    playAll,
    setPlayType,
    deleteMusic,
    deleteAll,
    playSongItem,
    setCurrent,
    setRadioId,
  };
});
