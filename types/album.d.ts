//专辑详情

interface AlbumData {
  data: AlbumDetail;
}

interface AlbumDetail {
  //发布时间
  aDate?: string;
  //专辑名称
  name?: string;
  //专辑mid
  mid?: string;
  //专辑歌手名称
  singername?: string;
  //歌手mid
  singermid?: string;
  //专辑歌曲数
  total?: number;
  //专辑描述
  desc?: string;
  //歌曲列表
  list?: SheetSongItem[];
}
