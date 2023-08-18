import { app, BrowserWindow, ipcMain } from "electron";
import { db } from "./utils/jsondb";
import { WINDOW } from "./window";
import { load, save } from "./utils/loader";
import { logger } from "./utils/logger";

import "./communication/index";

//全局注册logger
global.logger = logger;
/**
 * app启动后调用函数创建窗体
 */
app.whenReady().then(async () => {
  logger.info("app start");
  try {
    const userId = await db.getData("/userId");
    if (userId) {
      WINDOW.createWindow();
    } else {
      WINDOW.createLoginWindow();
    }
  } catch (e) {
    logger.error(e);
    WINDOW.createLoginWindow();
  }
  load();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) WINDOW.createWindow();
  });
});

// 关闭窗口
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

/**
 * 主窗体窗口控制
 */
ipcMain.on("control-window", (e: Event, data: number) => {
  if (data === 0) {
    (WINDOW.mainWindow as BrowserWindow).hide();
  } else if (data === 1) {
    WINDOW.mainWindow.close();
  } else {
    //退出登录
    db.push("/user-info", undefined);
    db.push("/userId", undefined).then(() => {
      app.relaunch();
      app.quit();
    });
  }
});

/**
 * 登录窗体窗口控制
 */
ipcMain.on("login-control-window", (e: Event, data: Correspond) => {
  const flag = data.data;
  if (flag === 0) {
    (WINDOW.loginWindow as BrowserWindow).minimize();
  } else if (flag === 1) {
    app.quit();
  }
});

//退出时保存
let saveFlag = false;
app.on("before-quit", async (e) => {
  console.log("before - quit", saveFlag);
  if (!saveFlag) {
    if (WINDOW.loginWindow && !WINDOW.loginWindow.isDestroyed())
      WINDOW.loginWindow.hide();
    if (WINDOW.mainWindow && !WINDOW.mainWindow.isDestroyed())
      WINDOW.mainWindow.hide();
    e.preventDefault();
    saveFlag = true;
    logger.info("app quit");
    try {
      await save();
    } catch (error) {
      logger.error(error);
    } finally {
      app.quit();
    }
  }
});
