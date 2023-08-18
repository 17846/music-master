const log4js = require("log4js");
log4js.configure({
  appenders: {
    production: {
      type: "dateFile", // 日志输出类型,dateFile表示输出到文件
      filename: "./logs/log.log", // 输出到文件的文件路径
      alwaysIncludePattern: true, // 日志文件是否展示预设的模式
      keepFileExt: true, // 日志文件是否始终保持后缀
      daysToKeep: 10, // 日志保存时间，默认值为0，表示一直保存
    },
  },
  categories: {
    default: { appenders: ["production"], level: "info" },
  },
});
export const logger = log4js.getLogger();
