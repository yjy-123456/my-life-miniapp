<template>
  <view class="viewer-page" :style="{ background: '#000' }">
    <swiper class="viewer-swiper" :current="currentIndex" @change="onSwipe" circular>
      <swiper-item v-for="photo in photoList" :key="photo._id">
        <image class="viewer-image" :src="photo.image" mode="aspectFit" />
      </swiper-item>
    </swiper>
    <view class="viewer-info">
      <text class="viewer-caption">{{ currentPhoto?.caption || '' }}</text>
      <text class="viewer-date">{{ formatDate(currentPhoto?.takenAt) }}</text>
    </view>
    <view class="viewer-counter">{{ currentIndex + 1 }} / {{ photoList.length }}</view>
    <!-- 返回按钮 -->
    <view class="viewer-back" @click="goBack">
      <text class="back-icon">‹</text>
    </view>
  </view>
</template>

<script>
import { getDogPhotos, getTempFileUrls } from '@/common/cloud.js'

export default {
  data() {
    return {
      photoList: [],
      currentIndex: 0,
      photoId: ''
    }
  },
  computed: {
    currentPhoto() { return this.photoList[this.currentIndex] || {} }
  },
  onLoad(options) {
    this.photoId = options.id
    // 简化处理：从 ids 参数构建列表
    if (options.ids) {
      const idList = options.ids.split(',')
      this.photoList = idList.map(id => ({ _id: id }))
      this.currentIndex = idList.indexOf(this.photoId)
      this.loadPhotos()
    }
  },
  methods: {
    async loadPhotos() {
      // 批量加载图片 URL
      const needLoad = this.photoList.filter(p => !p.image)
      // 这里简化：依赖父页面传来的数据
      // 实际应从缓存或重新查询
    },
    onSwipe(e) { this.currentIndex = e.detail.current },
    formatDate(d) { if (!d) return ''; const dt = new Date(d); return `${dt.getFullYear()}.${String(dt.getMonth()+1).padStart(2,'0')}.${String(dt.getDate()).padStart(2,'0')}` },
    goBack() { uni.navigateBack() }
  }
}
</script>

<style lang="scss" scoped>
.viewer-page { width: 100vw; height: 100vh; position: relative; }
.viewer-swiper { width: 100%; height: 100%; }
.viewer-image { width: 100%; height: 100%; }
.viewer-info { position: absolute; bottom: 100rpx; left: 0; right: 0; text-align: center; }
.viewer-caption { display: block; font-size: 30rpx; color: #fff; margin-bottom: 8rpx; }
.viewer-date { display: block; font-size: 24rpx; color: rgba(255,255,255,0.6); }
.viewer-counter { position: absolute; top: 80rpx; right: 32rpx;
  font-size: 24rpx; color: rgba(255,255,255,0.6); }
.viewer-back { position: absolute; top: 60rpx; left: 24rpx;
  width: 60rpx; height: 60rpx; display: flex; align-items: center; justify-content: center; }
.back-icon { font-size: 64rpx; color: #fff; font-weight: 200; }
</style>
