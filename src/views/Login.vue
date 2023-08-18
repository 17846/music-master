<template>
  <!-- 登录页面 -->

  <div class="w-400px h-300px">
    <!-- 上半部分 -->
    <div class="position-relative w-400px h-130px overflow-hidden">
      <!-- logo -->
      <div class="flex flex-items-center z-999 text-12px">
        <div class="logo"></div>
        <span class="p-t-6px m-l-5px color-white font-600">音乐大师</span>
      </div>
      <!-- 色彩模块 -->
      <div class="color"></div>
      <div class="color"></div>
      <div class="color"></div>
      <div class="color"></div>
      <div class="color"></div>
      <div class="color"></div>

      <!-- 页面控制模块 -->
      <div class="position-absolute top-10px right-13px z-9999 no-drag">
        <!-- 最小化按钮 -->
        <el-icon
          @click="handleControl(0)"
          class="z-999999 cursor-pointer hover:color-#00ffff"
          style="margin-right: 18px"
          color="#fff"
        >
          <SemiSelect />
        </el-icon>
        <!-- 关闭按钮 -->
        <el-icon
          @click="handleControl(1)"
          class="z-999999 cursor-pointer hover:color-#00ffff"
          color="#fff"
          size="18px"
        >
          <CloseBold />
        </el-icon>
      </div>
    </div>

    <!-- 表单部分 -->
    <div class="p-35-100 no-drag">
      <el-input v-model="userId" placeholder="QQ账号"></el-input>

      <el-button
        @click="handleLogin"
        class="w-200px m-t-25px"
        type="danger"
        :loading="isLogin"
        >{{ isLogin ? "登录中..." : "登 录" }}</el-button
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { useResponse } from "../utils/correspond";
import { userInfo } from "@/api/qqApi";
import { useInfoStore } from "../stores/user";
import { useRouter } from "vue-router";
//路由
const router = useRouter();
//用户信息store
const store = useInfoStore();
//qq号
const userId = ref<string>();
//按钮状态
const isLogin = ref(false);
//qq正则表达式
const reg = /[1-9][0-9]{2,9}/;

/**
 * 窗口控制
 * @param channel 0 最小化 1 退出
 */
const handleControl = (channel: number) => {
  useResponse<undefined>("login-control-window", channel, false);
};

/**
 * 用户登录
 */
const handleLogin = () => {
  if (reg.test(userId.value)) {
    isLogin.value = true;
    //获取账号信息
    userInfo(userId.value)
      .then((res) => {
        const data = res.req.data.map_userinfo[userId.value];

        if (data) {
          const temp: InfoDetail = {
            headurl: data.headurl,
            uin: data.uin,
            nick: data.nick,
          };
          //获取用户歌单
          //若获取成功直接重启app
          useResponse<boolean>("user-sheet", temp).catch(() => {
            ElMessage.error("请求超时，请重试");
            isLogin.value = false;
          });
        } else {
          isLogin.value = false;
          ElMessage.error("获取账号信息失败");
        }
      })
      .catch(() => {
        ElMessage.error("登录失败");
        isLogin.value = false;
      });
  }
};
</script>

<style lang="scss" scoped>
.logo {
  width: 35px;
  height: 35px;
  background-image: url("../assets/images/logo.svg");
  background-size: 120% 120%;
}

// 动态渐变色实现

.color {
  position: absolute;
  z-index: 1;
  filter: blur(200px);
}

.color:nth-child(1) {
  top: -350px;
  width: 600px;
  height: 600px;
  background: rgb(47, 102, 255);
  animation: colorOne 3s ease infinite alternate;
}

@keyframes colorOne {
  0% {
    background: rgb(47, 102, 255);
  }
  25% {
    background: rgb(47, 154, 255);
  }
  50% {
    background: rgb(47, 179, 255);
  }
  75% {
    background: rgb(47, 255, 238);
  }
  100% {
    background: rgb(47, 255, 203);
  }
}

.color:nth-child(2) {
  bottom: -150px;
  left: 100px;
  width: 500px;
  height: 500px;
  background: rgb(27, 178, 255);
  animation: colorTwo 3s ease infinite alternate;
}

@keyframes colorTwo {
  0% {
    background: rgb(27, 178, 255);
  }
  25% {
    background: rgb(47, 137, 255);
  }
  50% {
    background: rgb(47, 130, 255);
  }
  75% {
    background: rgb(47, 144, 255);
  }
  100% {
    background: rgb(47, 85, 255);
  }
}

.color:nth-child(3) {
  bottom: 50px;
  right: 100px;
  width: 500px;
  height: 500px;
  background: rgb(130, 225, 253);
  animation: colorThree 3s ease infinite alternate;
}

@keyframes colorThree {
  0% {
    background: rgb(130, 225, 253);
  }
  25% {
    background: rgb(130, 148, 253);
  }
  50% {
    background: rgb(50, 47, 255);
  }
  75% {
    background: rgb(78, 47, 255);
  }
  100% {
    background: rgb(137, 47, 255);
  }
}

.color:nth-child(4) {
  top: -300px;
  right: -20px;
  width: 600px;
  height: 600px;
  background: rgb(192, 132, 255);
  animation: colorFour 3s ease infinite alternate;
}

@keyframes colorFour {
  0% {
    background: rgb(192, 132, 255);
  }
  25% {
    background: rgb(251, 132, 255);
  }
  50% {
    background: rgb(255, 132, 214);
  }
  75% {
    background: rgb(255, 132, 183);
  }
  100% {
    background: rgb(231, 150, 157);
  }
}

.color:nth-child(5) {
  top: 20px;
  left: 40%;
  width: 400px;
  height: 300px;
  background-color: rgb(133, 169, 254);
  animation: colorFive 3s ease infinite alternate;
}

@keyframes colorFive {
  0% {
    background: rgb(133, 169, 254);
  }
  25% {
    background: rgb(133, 254, 187);
  }
  50% {
    background: rgb(171, 254, 133);
  }
  75% {
    background: rgb(242, 254, 133);
  }
  100% {
    background: rgb(254, 206, 133);
  }
}

.color:nth-child(6) {
  bottom: 20px;
  left: 50%;
  width: 300px;
  height: 300px;
  background-color: rgb(50, 230, 243);
  animation: colorSix 3s ease infinite alternate;
}

@keyframes colorSix {
  0% {
    background: rgb(50, 230, 243);
  }
  25% {
    background: rgb(50, 243, 98);
  }
  50% {
    background: rgb(243, 230, 50);
  }
  75% {
    background: rgb(243, 153, 50);
  }
  100% {
    background: rgb(243, 89, 50);
  }
}
</style>
