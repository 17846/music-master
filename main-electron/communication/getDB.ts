import type { JsonDB } from "node-json-db";
import { db, sheetDb, playListDb } from "../utils/jsondb";
import { WINDOW } from "../window";
import { ipcMain } from "electron";
type DBMap = { db: JsonDB; sheetDb: JsonDB; playListDb: JsonDB };
const dbMap: DBMap = { db, sheetDb, playListDb };

//渲染进程获取jsdb数据
ipcMain.on("db-data", (e, data: Correspond) => {
  const dbname = data.data.db as keyof DBMap;
  const key = data.data.key;

  dbMap[dbname]
    .getData(key)
    .then((res) => {
      // 判断当前窗口
      if (WINDOW.mainWindow !== null) {
        WINDOW.mainWindow?.webContents.send(data.responseEvent, res);
      } else {
        WINDOW.loginWindow?.webContents.send(data.responseEvent, res);
      }
    })
    .catch((e) => {
      global.logger.info(`get db data： ${e}`);

      if (WINDOW.mainWindow !== null) {
        WINDOW.mainWindow?.webContents.send(data.responseEvent, data.data.raw);
      } else {
        WINDOW.loginWindow?.webContents.send(data.responseEvent, data.data.raw);
      }
    });
});
