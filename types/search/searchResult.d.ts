// 搜索结果
interface SearchResult {
  code?: number;
  req?: Songlist;
}
interface Songlist {
  code?: number;
  data?: SonglistData;
}
interface SonglistData {
  body?: {
    item_song?: SongItem[];
  };
  meta?: SearchMeta;
}
//分页信息
interface SearchMeta {
  sum?: number;
  nextpage?: number;
  perpage?: number;
}
