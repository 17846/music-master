// 热搜
interface HotSearchReq {
  code?: number;
  data?: HotSearchData;
}
interface HotSearchDataItem {
  query?: string;
  score?: number;
}
interface HotSearchData {
  vec_hotkey?: HotSearchDataItem[];
}
interface HotSearch {
  code?: number;
  req?: HotSearchReq;
}

// 提词
interface KeyWord {
  code?: number;
  data?: KeyWordData;
}
interface KeyWordData {
  singer?: KeyWordInner;
  song?: KeyWordInner;
}
interface KeyWordInner {
  count?: number;
  itemlist?: KeyWordItem[];
}
interface KeyWordItem {
  name?: string;
  singer?: string;
  mid?: string;
  pic?: string;
}
