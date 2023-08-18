const fs = require("fs");
const http = require("http");
const https = require("https");

// 下载缓存方法
function downloadFile(url: string, filePath: string) {
  const fileStream = fs.createWriteStream(filePath);

  const request = url.startsWith("https") ? https : http;
  request
    .get(url, (response) => {
      if (response.statusCode !== 200) {
        console.error("下载文件时出错:", response.statusMessage);
        return;
      }

      response.pipe(fileStream).on("close", () => {
        console.log("download success");
      });
    })
    .on("error", (err) => {
      console.error("download error", err);
    });
}

/**
 * 检测文件夹是否存在，不存在则创建
 * @param path 文件夹路径
 */
const checkDir = (path: string) => {
  if (!fs.existsSync(path)) {
    // 不存在则创建文件夹
    fs.mkdirSync(path, { recursive: true });
    console.log("make dir success");
  } else {
    console.log("dir is exist");
  }
};

export { downloadFile, checkDir };
