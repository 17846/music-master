<template>
  <!-- 搜索框及上一页和下一页 -->

  <div class="flex-center">
    <!-- 上一页按钮 -->
    <el-icon
      class="cursor-pointer hover-color-emerald"
      :style="{
        color: hasPrePage ? '' : '#cacaca',
      }"
      @click="handleBack"
      ><ArrowLeft
    /></el-icon>

    <!-- 下一页按钮 -->
    <el-icon
      class="cursor-pointer hover-color-emerald m-0-15"
      :style="{
        color: hasNextPage ? '' : '#cacaca',
      }"
      @click="handleForward"
      ><ArrowRight
    /></el-icon>

    <!-- 搜索框 -->
    <el-popover
      ref="popoverRef"
      :show-arrow="false"
      :offset="2"
      :width="420"
      :visible="isVisible"
      trigger="focus"
      placement="bottom-start"
    >
      <div class="flex" @mousedown.prevent="" v-if="searchKey.length === 0">
        <!-- 热门搜索 -->
        <div class="w-50% b-r b-r-solid b-coolGray-2">
          <div :class="comClass">热门搜索</div>

          <!-- 热门搜索列表 -->
          <div class="h-306px pt10px">
            <div
              class="w-100% flex justify-between cursor-pointer hover-bg-gray-1 p-5-15"
              v-for="(item, index) in hotSearchData"
              :key="index"
              @click="handleQuicSearch({ name: item.query }, false)"
            >
              <!-- 关键词名称 -->
              <span class="w-120px text-truncate">{{ item.query }}</span>

              <!-- 搜索次数 -->
              <span class="w-40px">{{ numChangeUnit(item.score) }}</span>
            </div>
          </div>
        </div>

        <!-- 搜索历史 -->
        <div class="w-50%">
          <div :class="comClass">
            搜索历史
            <!-- 清空按钮 -->
            <span
              class="float-right color-gray hover-color-emerald cursor-pointer"
              @click="handleRemove"
              >清空</span
            >
          </div>
          <!-- 搜索记录为空 -->
          <div class="h-306px pt10px">
            <el-empty
              :image-size="80"
              description="暂无搜索记录"
              v-if="historyList.length === 0"
            >
            </el-empty>
            <div v-else>
              <div
                class="w-100% flex justify-between cursor-pointer hover-bg-gray-1 p-5-15"
                v-for="(item, index) in historyList"
                :key="index"
                @click="handleQuicSearch({ name: item }, false)"
              >
                <span class="w-100% text-truncate">{{ item }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 提词 -->
      <div v-else>
        <div>
          <div class="color-black mb5px">单曲</div>
          <el-empty
            :image-size="80"
            description="暂无搜索内容"
            v-if="(showWord?.song?.itemlist.length ?? 0) === 0"
          >
          </el-empty>

          <!-- 单曲 -->
          <div
            class="w-100% cursor-pointer hover-bg-gray-1 p-5-15"
            v-for="(item, index) in showWord?.song?.itemlist ?? []"
            :key="index"
            @click="handleQuicSearch(item, true)"
          >
            <span>{{ item.name }}</span> -
            <span>{{ item.singer }}</span>
          </div>
        </div>

        <!-- 歌手 -->
        <div v-if="showWord?.singer?.itemlist?.length > 0">
          <div class="color-black mb5px mt5px">歌手</div>
          <div
            class="w-100% flex justify-between cursor-pointer hover-bg-gray-1 p-5-15"
            v-for="(item, index) in showWord?.singer?.itemlist ?? []"
            :key="index"
            @click="handleQuicSearch(item, false)"
          >
            <span class="w-100% text-truncate flex items-center">
              <img :src="item.pic" class="w-36px h-36px rd-50% mr15px" alt="" />
              {{ item.singer }}</span
            >
          </div>
        </div>
      </div>

      <template #reference>
        <!-- 搜索输入框 -->
        <el-input
          @keyup.enter="handleSearch"
          v-model="searchKey"
          @focus="handleFocus"
          @blur="isVisible = false"
          @input="handleTick"
          class="w-50 m-2 search-input"
          placeholder="搜索音乐"
          ref="searchDom"
        >
          <template #suffix>
            <!-- 搜索图标 -->
            <el-icon
              @click.prevent.stop="handleSearch"
              class="cursor-pointer hover-color-emerald"
              ><Search
            /></el-icon>
          </template>
        </el-input>
      </template>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { hotSearch, keyWord } from "@/api/qqApi";
import { useInfoStore } from "@/stores/user";
import { deepClone, numChangeUnit } from "@/utils/common";
import { useResponse } from "@/utils/correspond";

//用户信息
const userinfo = useInfoStore();
//搜索弹框公用class
const comClass = "color-black b-b b-b-solid b-coolGray-2 p-3-15 text-14px";
//控制搜索弹框显示
const isVisible = ref(false);
//当前页面是否有上一页历史
const hasPrePage = ref(false);
//当前页面是否有下一页历史
const hasNextPage = ref(false);
//热搜列表
const hotSearchData = ref<HotSearchDataItem[]>([]);
//用户输入搜索内容
const searchKey = ref<string>("");
//路由信息
const router = useRouter();
//当前路由
const route = useRoute();
//历史搜索记录
const historyList = ref<string[]>([]);
//提词列表
const showWord = ref<KeyWordData>({});

//搜索框dom
const searchDom = ref(null);

//路由跳转后触发，用于跟新hasPrePage和hasNextPage
router.afterEach(() => {
  hasNextPage.value = router.options.history.state.forward !== null;
  hasPrePage.value = router.options.history.state.back !== null;
});

//搜索事件处理函数
const handleSearch = () => {
  if (!searchKey.value) return;

  for (let i = 0; i < historyList.value.length; i++) {
    if (historyList.value[i] === searchKey.value) {
      historyList.value.splice(i, 1);
      break;
    }
  }
  isVisible.value = false;
  // 更新搜索历史
  historyList.value.unshift(searchKey.value);
  historyList.value.length > 10 && (historyList.value.length = 10);
  useResponse<void>("search-history", deepClone(historyList.value), false);

  searchDom.value.blur();
  if (route.path === "/index/search")
    router.replace("/index/search?key=" + searchKey.value);
  else {
    router.push("/index/search?key=" + searchKey.value);
  }
};

//清空搜索历史
const handleRemove = () => {
  historyList.value = [];
  localStorage.setItem("search-history", "");
};

//返回上一页
const handleBack = () => {
  if (hasPrePage.value) {
    router.back();
  }
};

//前往下一页
const handleForward = () => {
  if (hasNextPage.value) {
    router.forward();
  }
};

//防抖
let timeout = null;
//搜索框提词器
const handleTick = (e: string) => {
  showWord.value = {};
  if (e.length > 0) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      keyWord(e).then((res) => {
        console.log(res);
        showWord.value = res.data;
      });
    }, 300);
  }
};

/**
 * 快捷搜索
 * @param item 搜索内容
 * @param isMusic 是否是单曲(为true会拼接singer)
 */
const handleQuicSearch = (
  item: { name?: string; singer?: string },
  isMusic: boolean
) => {
  if (isMusic) {
    searchKey.value = item.name + " " + item.singer;
  } else {
    searchKey.value = item.name;
  }
  handleSearch();
};

/**
 * 搜索框聚焦时重置提示词
 */
const handleFocus = () => {
  isVisible.value = true;
  if (searchKey.value.length > 0) {
    handleTick(searchKey.value);
  }
};

onMounted(() => {
  //首次加载完成后获取热搜
  hotSearch(userinfo.userInfo.uin).then((res) => {
    res.length = 10;
    console.log(res);
    hotSearchData.value = res;
  });

  //从本地存储获取搜索历史记录
  useResponse<[]>("db-data", {
    key: "/search-history",
    db: "db",
    raw: [],
  }).then((res) => {
    historyList.value = res;
  });
});
</script>
