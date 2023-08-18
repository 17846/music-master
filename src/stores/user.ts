import { ref } from "vue";
import { defineStore } from "pinia";

// 用户信息
export const useInfoStore = defineStore("user-info", () => {
  const userInfo = ref<InfoDetail>();

  function setUserInfo(info: InfoDetail) {
    localStorage.setItem("userInfo", JSON.stringify(info));
    userInfo.value = info;
  }

  return { userInfo, setUserInfo };
});
