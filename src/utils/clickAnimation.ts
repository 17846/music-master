//按钮点击下沉动画指令
interface ClickAnimation {
  mounted: (el: HTMLElement) => void;
}

export const clickAnim: ClickAnimation = {
  mounted(el: HTMLElement) {
    el.addEventListener("click", (e: MouseEvent) => {
      el.style.transform = "translate(1px,1px)";
      setTimeout(() => {
        el.style.transform = "translate(0px,0px)";
      }, 150);
    });
  },
};
