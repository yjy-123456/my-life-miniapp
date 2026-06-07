<template>
  <view class="custom-navbar" :style="navbarStyle">
    <view class="navbar-content" :style="contentStyle">
      <!-- 左侧: 返回按钮或自定义 -->
      <view class="navbar-left">
        <slot name="left">
          <view v-if="showBack" class="back-btn" @click="goBack">
            <text class="back-icon">‹</text>
          </view>
        </slot>
      </view>

      <!-- 中间: 标题 -->
      <view class="navbar-center">
        <text v-if="title" class="navbar-title">{{ title }}</text>
        <slot v-else name="title" />
      </view>

      <!-- 右侧: 自定义 -->
      <view class="navbar-right">
        <slot name="right" />
      </view>
    </view>
  </view>
  <!-- 占位元素，防止内容被导航栏遮挡 -->
  <view :style="placeholderStyle" />
</template>

<script>
export default {
  name: 'CustomNavbar',
  props: {
    title: {
      type: String,
      default: ''
    },
    showBack: {
      type: Boolean,
      default: false
    },
    /** 自定义背景色 */
    bgColor: {
      type: String,
      default: ''
    },
    /** 是否透明背景 (用于封面页) */
    transparent: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      statusBarHeight: 0,
      navBarHeight: 44,
      menuButtonInfo: null
    }
  },
  computed: {
    navbarStyle() {
      const style = {
        paddingTop: this.statusBarHeight + 'px'
      }
      if (this.transparent) {
        style.background = 'transparent'
        style.position = 'absolute'
        style.top = '0'
        style.left = '0'
        style.right = '0'
        style.zIndex = '100'
      } else if (this.bgColor) {
        style.background = this.bgColor
      }
      return style
    },
    contentStyle() {
      return {
        height: this.navBarHeight + 'px'
      }
    },
    placeholderStyle() {
      if (this.transparent) {
        return { height: '0' }
      }
      return {
        height: (this.statusBarHeight + this.navBarHeight) + 'px'
      }
    }
  },
  mounted() {
    this.initNavBar()
  },
  methods: {
    initNavBar() {
      const systemInfo = uni.getSystemInfoSync()
      this.statusBarHeight = systemInfo.statusBarHeight || 0

      // #ifdef MP-WEIXIN
      try {
        this.menuButtonInfo = uni.getMenuButtonBoundingClientRect()
        // 根据胶囊按钮位置计算导航栏高度
        // 导航栏高度 = (胶囊top - 状态栏高度) * 2 + 胶囊高度
        const capsuleTop = this.menuButtonInfo.top
        const capsuleHeight = this.menuButtonInfo.height
        this.navBarHeight = (capsuleTop - this.statusBarHeight) * 2 + capsuleHeight
      } catch (e) {
        // 降级: 使用默认值
        this.navBarHeight = 44
      }
      // #endif

      // #ifndef MP-WEIXIN
      this.navBarHeight = systemInfo.platform === 'ios' ? 44 : 48
      // #endif
    },
    goBack() {
      uni.navigateBack({
        delta: 1,
        fail: () => {
          // 无路可退时跳转首页
          uni.switchTab({ url: '/pages/index/index' })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background: rgba(250, 247, 244, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0 $spacing-md;
}

.navbar-left,
.navbar-right {
  display: flex;
  align-items: center;
  min-width: 80rpx;
}

.navbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.navbar-title {
  font-size: $font-h3;
  font-weight: 600;
  color: $color-text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400rpx;
}

.back-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-round;
  background: rgba(0, 0, 0, 0.03);

  &:active {
    background: rgba(0, 0, 0, 0.08);
  }
}

.back-icon {
  font-size: 48rpx;
  font-weight: 300;
  color: $color-text-primary;
  line-height: 1;
}
</style>
