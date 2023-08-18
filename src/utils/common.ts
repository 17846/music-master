/**
 * 将json转为 url字符串参数
 * @param params
 * @returns url字符串
 */
export const tansParams = (params: any) => {
  let result = "";
  for (const propName of Object.keys(params)) {
    const value = params[propName];
    var part = encodeURIComponent(propName) + "=";
    if (value !== null && value !== "" && typeof value !== "undefined") {
      if (typeof value === "object") {
        for (const key of Object.keys(value)) {
          if (
            value[key] !== null &&
            value[key] !== "" &&
            typeof value[key] !== "undefined"
          ) {
            let params = propName + "[" + key + "]";
            var subPart = encodeURIComponent(params) + "=";
            result += subPart + encodeURIComponent(value[key]) + "&";
          }
        }
      } else {
        result += part + encodeURIComponent(value) + "&";
      }
    }
  }
  return result;
};

/**
 * 将秒数转为 00:00 格式
 * @param time 秒数
 * @returns 00:00 格式时间
 */
export const secondToStr = (time: number) => {
  if (time === undefined) {
    return "00:00";
  }
  let str = "";
  const minute = Math.floor(time / 60);
  if (minute < 10) {
    str += "0" + minute;
  } else {
    str += minute;
  }
  str += ":";
  const second = Math.ceil(time % 60);
  if (second < 10) {
    str += "0" + second;
  } else {
    str += second;
  }
  return str;
};

/**
 * 将 00:00转为秒数
 * @param str
 * @returns
 */
export const strToSecond = (str: string) => {
  const split = str.split(":");
  return Number(split[0]) * 60 + Number(split[1]);
};

/**
 * 将数字转为 number + 百/千/万 格式
 * @param value 数字
 * @returns
 */
export const numChangeUnit = (value: number) => {
  let newValue = ["", "", ""];
  let fr = 1000;
  const ad = 1;
  let num = 3;
  const fm = 1;
  while (value / fr >= 1) {
    fr *= 10;
    num += 1;
  }
  if (num <= 4) {
    // 千
    newValue[1] = "千";
    newValue[0] = Math.floor(value / 1000) + "";
  } else if (num <= 8) {
    // 万
    const text1 = Math.floor(num - 4) / 3 > 1 ? "千万" : "万";
    const fm = "万" === text1 ? 10000 : 10000000;
    newValue[1] = text1;
    newValue[0] = Math.floor(value / fm) + "";
  } else if (num <= 16) {
    // 亿
    let text1 = (num - 8) / 3 > 1 ? "千亿" : "亿";
    text1 = (num - 8) / 4 > 1 ? "万亿" : text1;
    text1 = (num - 8) / 7 > 1 ? "千万亿" : text1;
    let fm = 1;
    if ("亿" === text1) {
      fm = 100000000;
    } else if ("千亿" === text1) {
      fm = 100000000000;
    } else if ("万亿" === text1) {
      fm = 1000000000000;
    } else if ("千万亿" === text1) {
      fm = 1000000000000000;
    }
    newValue[1] = text1;
    newValue[0] = Math.floor(value / fm) + "";
  }
  if (value < 1000) {
    newValue[1] = "";
    newValue[0] = value + "";
  }
  return newValue.join("");
};

/**
 * 根据歌曲所包含音质和用户选择音质返回能播放的最高音质
 * @param quality 用户设置音质
 * @param file 歌曲音质
 * @returns
 */
export const playQuality = (quality: Quality, file: QualityFile) => {
  const map = {
    "320kmp3": "size_128mp3",
    hq: "size_320mp3",
    sq: "size_flac",
  };
  const indexs = ["320kmp3", "hq", "sq"];
  let currentIndex = indexs.findIndex((value) => quality === value);
  while (!file[map[indexs[currentIndex]]]) {
    currentIndex--;
  }
  return indexs[currentIndex] as Quality;
};

/**
 * 获取歌曲信息中的有用部分
 * @param info 歌曲信息
 * @returns
 */
export const formatSongInfo = (info: SongItem) => {
  const {
    album,
    file,
    mid,
    name,
    interval,
    singer,
    tag,
    subtitle,
    isDownload,
    id,
  } = info;
  const temp: SongItem = {
    id,
    album: {
      name: album.name,
      mid: album.mid,
      pmid: album.pmid,
    },
    file: {
      size_128mp3: file.size_128mp3,
      size_320mp3: file.size_320mp3,
      size_flac: file.size_flac,
    },
    mid,
    name,
    interval,
    singer,
    tag,
    subtitle,
    isDownload: !!isDownload,
  };
  return temp;
};

/**
 * SheetSongItem数据形式转为SongItem
 * @param item
 * @returns
 */
export const formatToNormal = (item: SheetSongItem): SongItem => {
  const song: SongItem = {
    album: {
      name: item.albumname,
      mid: item.albummid,
    },
    interval: item.interval,
    file: {
      size_128mp3: item.size128,
      size_320mp3: item.size320,
      size_flac: item.sizeflac,
    },
    mid: item.songmid,
    name: item.songname,
    singer: item.singer,
    isDownload: !!item.isDownload,
    tag: item.alertid,
    id: item.songid,
  };
  return song;
};

/**
 * 深拷贝
 * @param obj 需要拷贝的数组或对象
 * @returns
 */
export const deepClone = (obj: any) => {
  if (obj === null || typeof obj !== "object") return obj;
  const clone = Array.isArray(obj) ? [] : {};
  for (let key in obj) {
    if (Object.hasOwn(obj, key)) {
      clone[key] = deepClone(obj[key]);
    }
  }
  return clone;
};

/**
 * 将歌手数组转为字符串拼接
 * @param list 歌手数组
 * @returns
 */
export const toSingerString = (list: Singer[]) => {
  const singers: string[] = [];
  list.forEach((item) =>
    singers.push(
      `<span class="singer" data-mid="${item.mid}">${item.name}</span>`
    )
  );
  return singers.join(" / ");
};
