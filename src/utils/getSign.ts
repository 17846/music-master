const crypto = require("crypto");
const seedrandom = require("seedrandom");
//获取api请求的sign参数

const encNonce = "CJBPACrRuNy7";
const signPrxfix = "zza";
const dir = "0234567890abcdefghijklmnopqrstuvwxyz";

function uuidGenerate() {
  const minLen = 10;
  const maxLen = 16;
  const currentTime = new Date().getTime();
  const ran = new seedrandom(currentTime.toString());
  const ranLen = Math.floor(ran() * (maxLen - minLen)) + minLen;
  const sb = [];
  for (let i = 0; i < ranLen; i++) {
    sb.push(dir[Math.floor(ran() * dir.length)]);
  }
  return sb.join("");
}

function convertToMd5(plainText: string) {
  try {
    const secretBytes = crypto
      .createHash("md5")
      .update(plainText, "utf-8")
      .digest();
    let md5code = secretBytes.toString("hex");
    while (md5code.length < 32) {
      md5code = "0" + md5code;
    }
    return md5code;
  } catch (error) {
    throw new Error("error");
  }
}

export const getSign = (data: string): string => {
  return signPrxfix + uuidGenerate() + convertToMd5(encNonce + data);
};
