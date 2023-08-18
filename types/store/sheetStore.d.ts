type SetSheet = { created: DissList[]; collect: DissList[] };
// 歌单store
interface SheetManageStore {
  // 用户创建的歌单列表
  createdSheet: DissList[];
  // 用户收藏的歌单列表
  collectionSheet: DissList[];
  //记录访问歌单详情页时的歌单id，用于页面返回时不重复刷新
  disstid: string | number;
  // 初始化两个歌单列表
  setSheet: (data: SetSheet) => void;
  // 将歌曲添加到歌单列表
  addMusicToSheet: (item: SongItem, sheet: DissList) => void;
  // 创建歌单
  createSheet: (name: string) => void;
  // 收藏和取消收藏歌单
  markPlaylists: (sheet: DissList) => void;
  // 设置disstid
  setDisstId: (id: string | number) => void;
}
