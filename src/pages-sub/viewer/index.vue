<template>
  <view class="viewer-page">
    <!-- 顶部栏 -->
    <view class="viewer-top-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="top-bar-content">
        <!-- 返回按钮 -->
        <view class="back-btn" @click="goBack">
          <text class="back-icon">‹</text>
        </view>
        <!-- 计数 -->
        <text class="counter-text">{{ currentIndex + 1 }} / {{ photoList.length }}</text>
        <!-- 占位 -->
        <view class="top-spacer" />
      </view>
    </view>

    <!-- 图片轮播 -->
    <swiper
      class="viewer-swiper"
      :current="currentIndex"
      :circular="true"
      @change="onSwipeChange"
      @animationfinish="onSwipeFinish"
    >
      <swiper-item v-for="(photo, idx) in photoList" :key="photo._id || idx">
        <view class="swiper-item-content">
          <!-- 加载态 -->
          <view v-if="!photo.image" class="photo-loading">
            <text class="loading-spinner">⏳</text>
          </view>
          <!-- 图片 -->
          <image
            v-else
            class="viewer-image"
            :src="photo.image"
            mode="aspectFit"
            @error="photo.image = ''"
            @click="toggleInfo"
          />
        </view>
      </swiper-item>
    </swiper>

    <!-- 底部信息栏 -->
    <view class="viewer-bottom-bar" :class="{ hidden: !showInfo }">
      <view class="bottom-info">
        <text v-if="currentPhoto.caption" class="photo-caption">{{ currentPhoto.caption }}</text>
        <text class="photo-date">{{ formatDate(currentPhoto.takenAt) }}</text>
      </view>

      <!-- 导航按钮 -->
      <view class="bottom-nav">
        <view class="nav-btn" @click="prevPhoto">
          <text class="nav-arrow">‹</text>
          <text class="nav-label">上一张</text>
        </view>
        <view class="nav-divider" />
        <view class="nav-btn" @click="nextPhoto">
          <text class="nav-label">下一张</text>
          <text class="nav-arrow">›</text>
        </view>
      </view>

      <!-- 缩略图指示器 -->
      <view class="thumbnail-indicator">
        <view
          v-for="(_, idx) in photoList"
          :key="idx"
          class="indicator-dot"
          :class="{ active: idx === currentIndex }"
          @click="jumpTo(idx)"
        />
      </view>
    </view>

    <!-- 点击提示 -->
    <view v-if="showInfoHint" class="tap-hint">
      <text class="tap-hint-text">点击图片显示/隐藏信息</text>
    </view>
  </view>
</template>

<script>
import { getTempFileUrls } from '@/common/cloud.js'

export default {
  data() {
    return {
      photoList: [],
      currentIndex: 0,
      showInfo: true,
      showInfoHint: false,
      statusBarHeight: 0,
      loading: true,
    }
  },
  computed: {
    currentPhoto() {
      return this.photoList[this.currentIndex] || {}
    },
  },
  async onLoad(options) {
    // 获取状态栏高度
    const sysInfo = uni.getSystemInfoSync()
    this.statusBarHeight = sysInfo.statusBarHeight || 0

    if (options.ids) {
      const idList = options.ids.split(',').filter(Boolean)
      this.photoList = idList.map((id) => ({ _id: id }))
      this.currentIndex = Math.max(0, idList.indexOf(options.id))

      // 加载图片 URL
      await this.loadPhotoUrls(idList)

      // 加载相邻照片的详细信息
      this.preloadAdjacent()
    }

    this.loading = false

    // 3秒后显示点击提示
    setTimeout(() => {
      this.showInfoHint = true
      setTimeout(() => {
        this.showInfoHint = false
      }, 3000)
    }, 1000)
  },
  methods: {
    /**
     * 批量加载图片 URL
     * 云存储 fileID 需要转为临时链接才能在小程序中显示
     */
    async loadPhotoUrls(idList) {
      // 从云数据库加载照片的 fileID
      try {
        // #ifdef MP-WEIXIN
        const db = wx.cloud.database()
        const res = await db
          .collection('dog_photos')
          .where({
            _id: db.command.in(idList.slice(0, 50)), // 限制最多 50 条
          })
          .field({ image: true, caption: true, takenAt: true })
          .get()

        if (res.data && res.data.length) {
          // 构建 id → data 映射
          const dataMap = {}
          res.data.forEach((item) => {
            dataMap[item._id] = item
          })

          // 收集所有 fileID
          const fileIds = res.data.map((item) => item.image).filter(Boolean)
          const urlMap = {}

          if (fileIds.length) {
            const urls = await getTempFileUrls(fileIds)
            fileIds.forEach((fid, i) => {
              urlMap[fid] = urls[i] || ''
            })
          }

          // 更新 photoList
          this.photoList = this.photoList.map((photo) => {
            const data = dataMap[photo._id]
            if (data) {
              return {
                ...photo,
                image: urlMap[data.image] || '',
                caption: data.caption,
                takenAt: data.takenAt,
              }
            }
            return photo
          })
        }
        // #endif
      } catch (e) {
        console.error('加载照片详情失败', e)
      }
    },

    /** 预加载相邻照片 */
    preloadAdjacent() {
      const idx = this.currentIndex
      const adjacent = [idx - 1, idx + 1, idx - 2, idx + 2].filter(
        (i) => i >= 0 && i < this.photoList.length
      )
      // 标记需要加载的相邻照片
      adjacent.forEach((i) => {
        if (!this.photoList[i].image) {
          // 在微信小程序中，image 组件的 lazy-load 不适用于 swiper
          // 这里可以额外调用加载逻辑
        }
      })
    },

    onSwipeChange(e) {
      this.currentIndex = e.detail.current
    },

    onSwipeFinish(e) {
      // 切换完成后预加载相邻
      this.preloadAdjacent()
    },

    prevPhoto() {
      if (this.currentIndex > 0) {
        this.currentIndex--
      } else {
        this.currentIndex = this.photoList.length - 1
      }
    },

    nextPhoto() {
      if (this.currentIndex < this.photoList.length - 1) {
        this.currentIndex++
      } else {
        this.currentIndex = 0
      }
    },

    jumpTo(idx) {
      this.currentIndex = idx
    },

    toggleInfo() {
      this.showInfo = !this.showInfo
    },

    formatDate(d) {
      if (!d) return ''
      const dt = new Date(d)
      return `${dt.getFullYear()}年${dt.getMonth() + 1}月${dt.getDate()}日`
    },

    goBack() {
      uni.navigateBack()
    },
  },
}
</script>

<style lang="scss" scoped>
.viewer-page {
  width: 100vw;
  height: 100vh;
  background: #0a0a0a;
  position: relative;
  overflow: hidden;
}

/* ========== 顶部栏 ========== */
.viewer-top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), transparent);
}

.top-bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 24rpx;
  height: 88rpx;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-round;
  background: rgba(255, 255, 255, 0.12);

  &:active {
    background: rgba(255, 255, 255, 0.25);
  }
}

.back-icon {
  font-size: 52rpx;
  color: #fff;
  font-weight: 200;
  line-height: 1;
  margin-top: -2rpx;
}

.counter-text {
  font-size: $font-caption;
  color: rgba(255, 255, 255, 0.7);
  font-variant-numeric: tabular-nums;
}

.top-spacer {
  width: 64rpx;
}

/* ========== 轮播 ========== */
.viewer-swiper {
  width: 100%;
  height: 100%;
}

.swiper-item-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.viewer-image {
  width: 100%;
  height: 100%;
}

/* 加载态 */
.photo-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  font-size: 48rpx;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ========== 底部信息栏 ========== */
.viewer-bottom-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  padding: 80rpx 32rpx 40rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
  transition: opacity 0.3s ease, transform 0.3s ease;

  &.hidden {
    opacity: 0;
    transform: translateY(40rpx);
    pointer-events: none;
  }
}

.bottom-info {
  text-align: center;
  margin-bottom: 24rpx;
}

.photo-caption {
  display: block;
  font-size: 32rpx;
  color: #fff;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.photo-date {
  display: block;
  font-size: $font-caption;
  color: rgba(255, 255, 255, 0.5);
}

/* 导航按钮 */
.bottom-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 48rpx;
  margin-bottom: 24rpx;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  border-radius: $radius-round;
  background: rgba(255, 255, 255, 0.1);

  &:active {
    background: rgba(255, 255, 255, 0.2);
  }
}

.nav-arrow {
  font-size: 36rpx;
  color: #fff;
  font-weight: 300;
  line-height: 1;
}

.nav-label {
  font-size: $font-caption;
  color: rgba(255, 255, 255, 0.8);
}

.nav-divider {
  width: 1rpx;
  height: 24rpx;
  background: rgba(255, 255, 255, 0.15);
}

/* 缩略图指示器 */
.thumbnail-indicator {
  display: flex;
  justify-content: center;
  gap: 8rpx;
  flex-wrap: wrap;
}

.indicator-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: $radius-round;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.2s ease;

  &.active {
    background: #fff;
    width: 24rpx;
    border-radius: 5rpx;
  }
}

/* ========== 点击提示 ========== */
.tap-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  padding: 16rpx 32rpx;
  border-radius: $radius-round;
  pointer-events: none;
  animation: fadeInOut 3s ease;
}

.tap-hint-text {
  font-size: $font-caption;
  color: #fff;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0; }
  15%, 70% { opacity: 1; }
}
</style>
