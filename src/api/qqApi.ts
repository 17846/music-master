import request from "../utils/request";
import type { AxiosRequestConfig } from "axios";
import { getSign } from "../utils/getSign";

//重命名AxiosRequestConfig
type Config = AxiosRequestConfig;

/**
 * 获取热门搜索
 * @returns
 */
export function hotSearch(uni: string | number): Promise<HotSearchDataItem[]> {
  const data = {
    req: {
      method: "GetHotkeyForQQMusicPC",
      module: "tencent_musicsoso_hotkey.HotkeyService",
      param: {
        search_id: "",
        uin: uni,
      },
    },
  };
  return new Promise((resolve) => {
    request<Config, HotSearchDataItem[]>({
      url:
        "https://u.y.qq.com/cgi-bin/musicu.fcg?pcachetime=" +
        new Date().getTime(),
      method: "post",
      data,
    }).then((res) => {
      const list: HotSearchDataItem[] =
        (res as HotSearch)?.req?.data?.vec_hotkey ?? [];
      resolve(list);
    });
  });
}

/**
 * 根据输入关键词返回对应匹配内容
 * @param word 输入搜索关键词
 * @returns
 */
export function keyWord(word: string) {
  const params = {
    _: new Date().getTime(),
    cv: 4747474,
    ct: 24,
    format: "json",
    inCharset: "utf-8",
    outCharset: "utf-8",
    notice: 0,
    platform: "yqq.json",
    needNewCode: 1,
    g_tk_new_20200303: 918730434,
    g_tk: 918730434,
    hostUin: 0,
    is_xml: 0,
    key: word,
  };
  return request<Config, KeyWord>({
    url: "https://c.y.qq.com/splcloud/fcgi-bin/smartbox_new.fcg",
    params,
  });
}

/**
 * 搜索
 * @param key 搜索关键词
 * @param page 页码
 * @returns
 */
export function search(key: string, page: number) {
  const data = {
    comm: {
      ct: 11,
      cv: "1003006",
      v: "1003006",
      QIMEI36: "",
      QIMEI: "f797e55957555716e4d16c0d07a5faa76150",
      os_ver: "12",
      phonetype: "Redmi K30 Pro",
      devicelevel: "31",
      tmeAppID: "qqmusiclight",
      nettype: "NETWORK_WIFI",
    },
    req: {
      module: "music.search.SearchCgiService",
      method: "DoSearchForQQMusicLite",
      param: {
        query: key,
        search_type: 0,
        num_per_page: 50,
        page_num: page,
        highlight: 1,
        nqc_flag: 0,
        page_id: 1,
        grp: 1,
      },
    },
  };
  return request<Config, SearchResult>({
    url: "http://lite.y.qq.com/cgi-bin/musicu.fcg",
    method: "post",
    data,
  });
}

/**
 *获取歌词
 * @param mid 歌曲mid
 * @returns
 */
export function getLyric(mid: string, id: number): Promise<string> {
  const data = {
    comm: {
      cv: 4747474,
      ct: 24,
      format: "json",
      inCharset: "utf-8",
      outCharset: "utf-8",
      notice: 0,
      platform: "yqq.json",
      needNewCode: 1,
      uin: 0,
      g_tk: 1502777370,
    },
    req_0: {
      module: "music.musichallSong.PlayLyricInfo",
      method: "GetPlayLyricInfo",
      param: {
        songMID: mid,
        songID: id,
      },
    },
  };
  return new Promise((resolve) => {
    request<Config, Lyric>({
      url: `https://u.y.qq.com/cgi-bin/musics.fcg?_=${new Date().getTime()}&sign=${getSign(
        JSON.stringify(data)
      )}`,
      data,
      method: "post",
    }).then((res) => {
      const lyric = res.req_0.data.lyric;
      const buffer = Buffer.from(lyric, "base64");
      resolve(buffer.toString());
    });
  });
}

/**
 *  获取歌手列表
 * @param page 当前页
 * @param sin 获取歌手的起始位置
 * @returns
 */
export function singerList(page: number, sin: number) {
  const params = {
    req_1: {
      method: "GetSingerListIndex",
      module: "music.musichallSinger.SingerList",
      param: {
        area: -100,
        sex: -100,
        genre: -100,
        index: -100,
        sin: sin,
        cur_page: page,
      },
    },
    comm: {
      ct: "1",
      v: "90",
      cv: "101805",
      gzip: "0",
    },
  };
  const data = encodeURIComponent(JSON.stringify(params));
  return request<Config, SingerList>({
    url: "http://u6.y.qq.com/cgi-bin/musicu.fcg?data=" + data,
  });
}

/**
 * 获取歌手歌曲信息
 * @param start 开始的位置
 * @param mid 歌手mid
 * @returns
 */
export function singerDetail(start: number, mid: string) {
  const params = {
    req_1: {
      method: "GetSingerSongList",
      module: "musichall.song_list_server",
      param: {
        singerMid: mid,
        begin: start,
        num: 20,
        order: 1,
      },
    },
    comm: {
      ct: "1",
      v: "90",
      cv: "101805",
      gzip: "0",
    },
  };
  const data = encodeURIComponent(JSON.stringify(params));
  return request<Config, SingerDetail>({
    url: "http://u6.y.qq.com/cgi-bin/musicu.fcg?data=" + data,
  });
}

/**
 *获取歌单
 * @param categoryId 歌单id
 * @param caller 🐧账号
 * @param lastId 加载更多时的之前内容的最后一个的categoryId
 * @returns
 */
export function songSheet(
  categoryId: number,
  caller: string | number,
  lastId?: number
) {
  const params = {
    comm: {
      cv: 4747474,
      ct: 24,
      format: "json",
      inCharset: "utf-8",
      outCharset: "utf-8",
      notice: 0,
      platform: "yqq.json",
      needNewCode: 1,
      uin: caller,
    },
    songSheet: {
      param: {
        caller: caller,
        category_id: categoryId,
        size: 20,
        last_id: lastId,
      },
      method: "get_category_content",
      module: "music.playlist.PlayListCategory",
    },
  };
  const data = encodeURIComponent(JSON.stringify(params));
  return request<Config, SongSheet>({
    url: "https://u.y.qq.com/cgi-bin/musicu.fcg?data=" + data,
  });
}

/**
 * 获取歌单详情，响应速度慢，经常超时(已替换v2版本)
 * @param tid 歌单id
 * @returns
 */
export function sheetDetail(tid: string | number, userId: string | number) {
  const url = `https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg?type=1&json=1&utf8=1&onlysong=0&format=json&g_tk=5381&loginUin=${userId}&hostUin=${userId}&inCharset=utf8&platform=yqq&needNewCode=0&disstid=${tid}`;
  return request<Config, SheetDetail>({
    url,
    headers: {
      Referer: "https://y.qq.com/",
    },
  });
}

/**
 * 获取取歌单详情v2版本，来自手机端分享歌单，需要知道歌单歌曲数量，将song_num设为5000可以满足基本需要
 * 这个tid getSign 需要是number ！！！
 * @param tid 歌单id
 * @returns
 */
export function sheetDetailV2(tid: string | number) {
  const data = {
    req_0: {
      module: "music.srfDissInfo.aiDissInfo",
      method: "uniform_get_Dissinfo",
      param: {
        disstid: Number(tid),
        enc_host_uin: "",
        tag: 1,
        userinfo: 1,
        song_begin: 0,
        song_num: 5000,
      },
    },
    comm: { g_tk: 5381, uin: 0, format: "json", platform: "h5" },
  };
  const sign = getSign(JSON.stringify(data));
  const url = `https://u6.y.qq.com/cgi-bin/musics.fcg?sign=${sign}&_=${new Date().getTime()}`;
  return request<Config, SheetDetailV2>({
    url,
    data,
    method: "post",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/115.0.0.0",
    },
  });
}

/**
 * 根据账号获取账号下的所有歌单
 * @param userId 账号
 * @returns
 */
export function userSheet(userId: string | number) {
  const time = new Date().getTime();
  const url = `https://c.y.qq.com/rsc/fcgi-bin/fcg_user_created_diss?r=${time}&_=${time}&cv=4747474&ct=24&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=yqq.json&needNewCode=1&uin=${userId}&g_tk_new_20200303=2051121073&g_tk=2051121073&hostuin=${userId}&sin=0&size=11`;
  return request<Config, UserSheet>({
    url,
    headers: {
      Referer: "https://y.qq.com/",
    },
  });
}

/**
 * 获取头像和用户名
 * @param userId 账号
 * @returns
 */
export function userInfo(userId: string | number) {
  const params = {
    comm: {
      cv: 4747474,
      ct: 24,
      format: "json",
      inCharset: "utf-8",
      outCharset: "utf-8",
      notice: 0,
      platform: "yqq.json",
      needNewCode: 1,
    },
    req: {
      module: "userInfo.BaseUserInfoServer",
      method: "get_user_baseinfo_v2",
      param: { vec_uin: [userId.toString()] },
    },
  };
  const data = encodeURIComponent(JSON.stringify(params));
  return request<Config, UserInfo>({
    url: "http://u6.y.qq.com/cgi-bin/musicu.fcg?data=" + data,
  });
}

/**
 * 获取排行榜
 * @param cid 排行榜id
 * @param offset 返回内容的起始位置
 * @returns
 */
export function charts(cid: string | number, offset: number) {
  const date = new Date();
  const localString = `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()}`;
  const params = {
    Songlist: {
      module: "musicToplist.ToplistInfoServer",
      method: "GetDetail",
      param: { topid: cid, offset: offset, num: 20, period: localString },
    },
    comm: { ct: "1", v: "90", cv: "101805", gzip: "0" },
  };
  const data = encodeURIComponent(JSON.stringify(params));
  return request<Config, TheCharts>({
    url: "http://u6.y.qq.com/cgi-bin/musicu.fcg?data=" + data,
  });
}

/**
 * 每日推荐
 * @param userId id
 * @returns
 */
export function dailyRecommend(userId: string | number) {
  const params = {
    req: {
      module: "music.recommend.RecommendFeed",
      method: "get_recommend_feed",
      param: { direction: 0, page: 1, v_cache: [], v_uniq: [], s_num: 0 },
    },
    comm: {
      g_tk: 1443800719,
      uin: userId.toString(),
      format: "json",
      ct: 20,
      cv: 1906,
      platform: "wk_v17",
      uid: "",
      mesh_devops: "DevopsBase",
    },
  };
  const data = encodeURIComponent(JSON.stringify(params));
  return request<Config, DailyRecommend>({
    url: "http://u6.y.qq.com/cgi-bin/musicu.fcg?data=" + data,
  });
}

/**
 * 电台列表
 * @param userId 用户id
 * @returns
 */
export function getRadioList(userId: string | number) {
  const data = {
    comm: {
      cv: 4747474,
      ct: "24",
      format: "json",
      inCharset: "utf-8",
      outCharset: "utf-8",
      notice: 0,
      platform: "yqq.json",
      needNewCode: 1,
      uin: userId,
      g_tk_new_20200303: 275790333,
      g_tk: 275790333,
    },
    req_1: {
      module: "pf.radiosvr",
      method: "GetRadiolist",
      param: { ct: "24" },
    },
  };
  const time = new Date().getTime();
  const sign = getSign(JSON.stringify(data));
  const url = `https://u.y.qq.com/cgi-bin/musics.fcg?_=${time}&sign=${sign}`;
  return request<RadioList>({
    url,
    data,
    method: "post",
  });
}

/**
 * 获取电台音乐
 * @param userId 用户id
 * @param id 电台id
 * @returns
 */
export function guessYouLike(userId: string | number, id: string | number) {
  const data = {
    comm: {
      cv: 0,
      ct: 24,
      format: "json",
      inCharset: "utf-8",
      outCharset: "utf-8",
      notice: 0,
      platform: "yqq.json",
      needNewCode: 1,
      uin: userId,
      g_tk_new_20200303: 275790333,
      g_tk: 275790333,
    },
    req_1: {
      module: "pf.radiosvr",
      method: "GetRadiosonglist",
      param: { id: id, firstplay: 0, num: 20 },
    },
  };
  const time = new Date().getTime();
  const sign = getSign(JSON.stringify(data));
  const url = `https://u.y.qq.com/cgi-bin/musics.fcg?_=${time}&sign=${sign}`;

  return request<Config, GuessYouLike>({
    url,
    data,
    method: "post",
  });
}

/**
 * 专辑详情
 * @param mid album id
 * @returns
 */
export function albumDetail(mid: string) {
  const params = {
    albummid: mid,
    g_tk: "1278911659",
    hostUin: 0,
    format: "json",
    inCharset: "utf8",
    outCharset: "utf-8¬ice=0",
    platform: "yqq",
    needNewCode: 0,
  };

  const url = "https://c.y.qq.com/v8/fcg-bin/fcg_v8_album_info_cp.fcg";

  return request<Config, AlbumData>({ url, params });
}

/**
 * 歌单分类和推荐
 * @returns
 */
export const sheetCategoryAndRec = () => {
  const data = {
    req_0: {
      method: "GetRecommendWhole",
      param: {
        IsReqHead: false,
        IsReqFeed: true,
        FeedReq: {
          From: 0,
          Size: 60,
        },
      },
      module: "music.playlist.PlaylistSquare",
    },
    req_1: {
      method: "GetSquareTab",
      module: "music.playlist.PlaylistSquare",
      param: {},
    },
    comm: {
      g_tk: 353218874,
      uin: "1411621262",
      format: "json",
      ct: 20,
      cv: 1942,
      platform: "wk_v17",
      uid: "5197693061",
      guid: "4F0BDA56DAA4A1A3B6A2D5C3656AACA4",
    },
  };
  const sign = getSign(JSON.stringify(data));
  return request({
    url: `https://u.y.qq.com/cgi-bin/musics.fcg?_=${new Date().getTime()}&sign=${sign}`,
    data,
    method: "post",
    headers: {
      Referer: "https://i.y.qq.com/n2/wk_v17/",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.47.134 Safari/537.36 QBCore/3.53.47.400 QQBrowser/9.0.2524.400 pcqqmusic/19.42.2219.0712 SkinId/10001|1ecc94|144|1|||1fd4af",
    },
  });
};

/**
 * 歌单分类下的列表
 * @returns
 */
export function sheetList() {
  const data: { req_0: object; req_1?: any; comm: object } = {
    req_0: {
      method: "get_category_basic",
      module: "playlist.PlayListCategoryServer",
      param: {
        caller: "1411621262",
        category_id: 3317,
      },
    },
    comm: {
      g_tk: 353218874,
      uin: "1411621262",
      format: "json",
      ct: 20,
      cv: 1942,
      platform: "wk_v17",
      uid: "5197693061",
      guid: "4F0BDA56DAA4A1A3B6A2D5C3656AACA4",
    },
  };
  if (true) {
    data.req_1 = {
      module: "playlist.PlayListCategoryServer",
      method: "get_category_content",
      param: {
        caller: "1411621262",
        category_id: 3317,
        page: 0,
        use_page: 1,
        size: 60,
      },
    };
  }
  const sign = getSign(JSON.stringify(data));
  return request({
    url: `https://u.y.qq.com/cgi-bin/musics.fcg?_=${new Date().getTime()}&sign=${sign}`,
    data,
    method: "post",
    headers: {
      Referer: "https://i.y.qq.com/n2/wk_v17/",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.47.134 Safari/537.36 QBCore/3.53.47.400 QQBrowser/9.0.2524.400 pcqqmusic/19.42.2219.0712 SkinId/10001|1ecc94|144|1|||1fd4af",
    },
  });
}
