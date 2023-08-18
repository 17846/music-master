//窗体
import { app, BrowserWindow, Tray, Menu } from "electron";
const path = require("path");

class Window {
  mainWindow: BrowserWindow | null = null;
  loginWindow: BrowserWindow | null = null;
  tray: Tray | null = null;

  /**
   * 主窗体
   */
  createWindow = () => {
    global.logger.info("mainWindow create");
    const mainWindow = new BrowserWindow({
      width: 1000,
      height: 680,
      resizable: false,
      fullscreen: false,
      show: false,
      icon: "public/favicon.ico",
      webPreferences: {
        contextIsolation: false, // 是否开启隔离上下文
        nodeIntegration: true, // 渲染进程使用Node API
        webSecurity: false,
      },
      titleBarStyle: "hidden",
    });
    setTimeout(() => {
      this.mainWindow.show();
    }, 1500);
    this.mainWindow = mainWindow;
    // 禁用右键菜单
    mainWindow.hookWindowMessage(278, function (e) {
      mainWindow.setEnabled(false); //窗口禁用
      setTimeout(() => {
        mainWindow.setEnabled(true);
      }, 100);
      return true;
    });

    try {
      this.createTray();
    } catch (e) {
      global.logger.error(e);
    }

    // 如果打包了，渲染index.html
    if (app.isPackaged) {
      this.mainWindow.loadFile(path.join(__dirname, "./index.html"));
    } else {
      this.mainWindow.webContents.openDevTools({ mode: "undocked" });

      let url = "http://localhost:5173"; // 本地启动的vue项目路径
      this.mainWindow.loadURL(url);
    }
  };

  //创建托盘
  createTray = () => {
    this.tray = new Tray(path.join(__dirname, "./favicon.ico"));
    this.tray.on("click", () => {
      if (this.mainWindow.isVisible()) {
        this.mainWindow.hide();
      } else {
        this.mainWindow.show();
      }
    });
    const contextMenu = Menu.buildFromTemplate([
      {
        label: "退出",
        role: "quit",
        click: () => {
          this.mainWindow.close();
        },
      },
    ]);
    this.tray.on("right-click", () => {
      this.tray.popUpContextMenu(contextMenu);
    });
    this.tray.setToolTip("音乐大师");
    global.logger.info("tray create");
  };

  /**
   * 登录窗体
   */
  createLoginWindow = () => {
    global.logger.info("loginWindow create");
    const loginWindow = new BrowserWindow({
      width: 400,
      height: 300,
      resizable: false,
      fullscreen: false,
      icon: "public/favicon.ico",
      webPreferences: {
        contextIsolation: false, // 是否开启隔离上下文
        nodeIntegration: true, // 渲染进程使用Node API
        webSecurity: false,
      },
      titleBarStyle: "hidden",
      show: false,
    });
    setTimeout(() => {
      this.loginWindow.show();
    }, 1500);
    this.loginWindow = loginWindow;
    loginWindow.hookWindowMessage(278, function (e) {
      loginWindow.setEnabled(false); //窗口禁用
      setTimeout(() => {
        loginWindow.setEnabled(true);
      }, 100);
      return true;
    });
    if (app.isPackaged) {
      this.loginWindow.loadFile(path.join(__dirname, "./index.html"));
    } else {
      this.loginWindow.webContents.openDevTools({ mode: "undocked" });

      let url = "http://localhost:5173"; // 本地启动的vue项目路径
      this.loginWindow.loadURL(url);
    }
  };

  // 销毁登录窗体
  destroyLoginWindow = () => {
    this.loginWindow?.destroy();
  };
}

export const WINDOW = new Window();
