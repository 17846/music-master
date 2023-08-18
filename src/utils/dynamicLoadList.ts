import { guessYouLike } from "@/api/qqApi";

const userInfo = localStorage.getItem("userInfo");
const info: InfoDetail = JSON.parse(userInfo);
//猜你喜欢播放动态扩容
export const dynamicLoadList = (id: string | number) => {
  return new Promise<SongItem[]>((resolve) => {
    guessYouLike(info.uin, id)
      .then((res) => {
        const list = res?.req_1?.data.track_list ?? [];
        resolve(list);
      })
      .catch(() => {
        resolve([]);
      });
  });
};
