import { JsonDB, Config } from "node-json-db";

//保存一般内容
export const db = new JsonDB(
  new Config("./jsondb/music-master.json", true, false, "/")
);

//保存用户歌单
export const sheetDb = new JsonDB(
  new Config("./jsondb/sheet-db.json", true, false, "/")
);

//保存播放列表
export const playListDb = new JsonDB(
  new Config("./jsondb/play-list-db.json", true, false, "/")
);
