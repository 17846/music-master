import { db, sheetDb, playListDb } from "./jsondb";
import { sheetDetailV2 } from "../../src/api/qqApi";
import type { JsonDB } from "node-json-db";
import { formatSongInfo } from "../../src/utils/common";
const fs = require("fs");

/**
 * 加载已保存的数据，用于合并
 * @param path 保存路径
 * @param oldData 返回的数据格式，用于catch resolve
 * @dbname 需要操作的数据库名称
 * @returns
 */
export const loadOldData = async <T>(
  path: string,
  oldData: any,
  dbname = "db"
): Promise<T> => {
  let opDb: JsonDB;
  if (dbname === "db") {
    opDb = db;
  } else if (dbname === "sheetDb") {
    opDb = sheetDb;
  } else {
    opDb = playListDb;
  }
  return new Promise((resolve) => {
    opDb
      .getData(path)
      .then((res) => {
        resolve(res);
      })
      .catch(() => {
        resolve(oldData);
      });
  });
};

/**
 * 用户导入歌单初始化
 * @param tid 歌单id
 * @param userId 用户id V2版本无需此参数
 * @returns
 */
export const initSheet = (tid: string | number): Promise<boolean> => {
  return new Promise((resolve) => {
    loadOldData("/user-sheet", []).then((userSheet: DissList[]) => {
      sheetDetailV2(tid)
        .then((res) => {
          const sheet = res;
          const list = sheet?.req_0?.data?.songlist;
          //将对应歌单isInit设置为true
          if (list) {
            userSheet.forEach((item) => {
              if (item.tid === tid) {
                item.isInit = true;
              }
            });

            const formatList = list.map((item) => formatSongInfo(item));

            //更新usersheet
            db.push("/user-sheet", userSheet);

            sheetDb.push("/sheet-list/" + tid, formatList).then(() => {
              resolve(true);
            });
          } else {
            resolve(false);
          }
        })
        .catch(() => resolve(false));
    });
  });
};

/**
 * 清空文件夹下所有文件(非文件夹)
 * @param filePath 文件夹地址
 * @returns
 */
export function clearAllFile(filePath: string) {
  const list: string[] = fs.readdirSync(filePath);
  list.forEach((item) => {
    fs.unlink(filePath + item, (err: string) => {
      if (err) {
        console.log(err);
      }
    });
  });
}
