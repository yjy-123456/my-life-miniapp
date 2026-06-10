<template>
  <view class="home-page">
    <CustomNavbar transparent />

    <!-- ===== 封面区 ===== -->
    <view class="hero-section">
      <swiper
        class="hero-swiper"
        :autoplay="true"
        :interval="4000"
        :duration="800"
        circular
        indicator-dots
        indicator-color="rgba(255,255,255,0.4)"
        indicator-active-color="#fff"
      >
        <swiper-item v-for="(img, idx) in coverImages" :key="idx">
          <image class="hero-image" :src="img" mode="aspectFill" lazy-load @error="onCoverError(idx)" />
        </swiper-item>
      </swiper>
      <!-- 底部渐变遮罩 -->
      <view class="hero-gradient" />
      <!-- 封面配文 -->
      <view class="hero-overlay">
        <text class="hero-quote">{{ heroQuote }}</text>
        <view class="hero-scroll-hint" v-if="posts.length">
          <text class="scroll-arrow">↓</text>
          <text class="scroll-text">下滑探索</text>
        </view>
      </view>
    </view>

    <!-- ===== 双入口卡片 ===== -->
    <view class="entry-cards">
      <view class="entry-card" @click="goToDaily">
        <view class="entry-icon-wrap">
          <text class="entry-emoji">📝</text>
        </view>
        <text class="entry-label">日常记录</text>
        <text class="entry-desc">生活的点滴</text>
      </view>
      <view class="entry-card" @click="goToDogs">
        <view class="entry-icon-wrap dog-icon">
          <text class="entry-emoji">🐶</text>
        </view>
        <text class="entry-label">狗狗相册</text>
        <text class="entry-desc">豆豆的瞬间</text>
      </view>
    </view>

    <!-- ===== 最新动态 ===== -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">最新动态</text>
        <text class="section-subtitle">Recently</text>
      </view>

      <view class="post-list">
        <view
          v-for="post in posts"
          :key="post._id"
          class="card post-card"
          @click="goToDetail(post._id)"
        >
          <!-- 图片区 -->
          <view v-if="post.images && post.images.length" class="post-images">
            <image
              v-for="(img, i) in post.images.slice(0, 3)"
              :key="i"
              class="post-image"
              :class="'img-count-' + Math.min(post.images.length, 3)"
              :src="img"
              mode="aspectFill"
              lazy-load
            />
            <view v-if="post.images.length > 3" class="image-more">
              <text>+{{ post.images.length - 3 }}</text>
            </view>
          </view>

          <!-- 正文 -->
          <view class="post-body">
            <text class="post-content">{{ post.content }}</text>
          </view>

          <!-- 底部元信息 -->
          <view class="post-footer">
            <view class="post-meta">
              <text class="post-date">{{ formatDate(post.createdAt) }}</text>
              <text v-if="post.weather" class="post-weather">{{ weatherIcon(post.weather) }}</text>
              <text v-if="post.mood" class="post-mood">{{ moodIcon(post.mood) }}</text>
              <text v-if="post.location" class="post-location">📍 {{ post.location }}</text>
            </view>
            <view v-if="post.tags && post.tags.length" class="post-tags">
              <text v-for="t in post.tags.slice(0, 3)" :key="t" class="post-tag">#{{ t }}</text>
            </view>
          </view>
        </view>

        <!-- 加载态 -->
        <view v-if="loading" class="loading-state">
          <SkeletonCard />
          <SkeletonCard />
        </view>

        <!-- 错误态 -->
        <view v-else-if="error" class="error-state">
          <text class="error-emoji">😿</text>
          <text class="error-text">加载失败了</text>
          <text class="error-hint">请检查网络后重试</text>
          <view class="retry-btn" @click="retry">
            <text class="retry-text">重新加载</text>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-else-if="posts.length === 0" class="empty-state">
          <text class="empty-emoji">📭</text>
          <text class="empty-text">还没有动态</text>
          <text class="empty-hint">美好的事情即将发生</text>
        </view>

        <!-- 已到底 -->
        <view v-else-if="!hasMore" class="load-end">
          <view class="end-line" />
          <text class="load-end-text">已经到底啦</text>
          <view class="end-line" />
        </view>

        <!-- 加载更多 -->
        <view v-else-if="hasMore" class="load-more" @click="loadMore">
          <text class="load-more-text">查看更多</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import CustomNavbar from '@/components/CustomNavbar.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import { getPosts, getSiteConfig, getTempFileUrls } from '@/common/cloud.js'

export default {
  components: { CustomNavbar, SkeletonCard },
  data() {
    return {
      coverImages: [],
      heroQuote: '我们的故事',
      posts: [],
      pageSize: 10,
      lastCreatedAt: null,
      hasMore: true,
      loading: true,
      error: false,
    }
  },
  onLoad() {
    this.loadConfig()
    this.loadPosts()
  },
  onPullDownRefresh() {
    this.posts = []
    this.lastCreatedAt = null
    this.hasMore = true
    Promise.all([this.loadConfig(), this.loadPosts()]).finally(() => {
      uni.stopPullDownRefresh()
    })
  },
  onReachBottom() {
    this.loadMore()
  },
  methods: {
    async loadConfig() {
      try {
        console.log('🔍 [loadConfig] 开始加载配置...')
        const config = await getSiteConfig(['cover_images', 'hero_quote'])
        console.log('🔍 [loadConfig] 配置获取成功, cover_images:', JSON.stringify(config.cover_images))

        let coverList = config.cover_images
        if (typeof coverList === 'string') {
          coverList = [coverList]
        }

        if (Array.isArray(coverList) && coverList.length) {
          console.log('🔍 [loadConfig] 调用 getTempFileUrls, 数量:', coverList.length)
          const urls = await getTempFileUrls(coverList.filter(Boolean))
          console.log('🔍 [loadConfig] getTempFileUrls 返回:', JSON.stringify(urls))
          this.coverImages = urls.filter(Boolean)
          console.log('🔍 [loadConfig] coverImages 设置完成, 有效:', this.coverImages.length)
        } else {
          console.log('🔍 [loadConfig] 无封面图片配置')
        }

        if (config.hero_quote) {
          this.heroQuote = config.hero_quote
        }
      } catch (e) {
        console.error('❌ [loadConfig] 失败:', e.message || e)
      }
    },

    async loadPosts() {
      this.loading = true
      this.error = false
      try {
        const data = await getPosts(this.pageSize, this.lastCreatedAt)
        if (data.length < this.pageSize) {
          this.hasMore = false
        }
        for (const post of data) {
          if (post.images && post.images.length) {
            post.images = await getTempFileUrls(post.images)
          }
        }
        this.posts = this.posts.concat(data)
        if (data.length) {
          this.lastCreatedAt = data[data.length - 1].createdAt
        }
      } catch (e) {
        console.error('加载动态失败', e)
        this.error = this.posts.length === 0
        if (this.error) return
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    retry() {
      this.error = false
      this.loading = true
      this.loadPosts()
    },

    async loadMore() {
      if (this.hasMore && !this.loading) {
        await this.loadPosts()
      }
    },

    formatDate(d) {
      if (!d) return ''
      const dt = new Date(d)
      const now = new Date()
      const diff = now - dt
      const oneDay = 86400000
      if (diff < oneDay) {
        const h = dt.getHours().toString().padStart(2, '0')
        const m = dt.getMinutes().toString().padStart(2, '0')
        return `今天 ${h}:${m}`
      }
      if (diff < 2 * oneDay) {
        const h = dt.getHours().toString().padStart(2, '0')
        const m = dt.getMinutes().toString().padStart(2, '0')
        return `昨天 ${h}:${m}`
      }
      return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, '0')}.${String(dt.getDate()).padStart(2, '0')}`
    },

    weatherIcon(w) {
      const map = { sunny: '☀️', cloudy: '☁️', rainy: '🌧️', snowy: '❄️', windy: '💨' }
      return map[w] || ''
    },

    moodIcon(m) {
      const map = { happy: '😊', calm: '😌', excited: '🎉', grateful: '🙏', love: '💕', sad: '😢' }
      return map[m] || ''
    },

    goToDetail(id) {
      uni.navigateTo({ url: `/pages/daily/detail?id=${id}` })
    },

    goToDaily() {
      uni.navigateTo({ url: '/pages/daily/list' })
    },

    goToDogs() {
      uni.switchTab({ url: '/pages/dogs/album' })
    },

    onCoverError(idx) {
      // 封面图片加载失败，移除该张
      this.coverImages.splice(idx, 1)
    },
  },
}
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  background: $color-bg-page;
  padding-bottom: env(safe-area-inset-bottom);
}

/* ========== 封面区 ========== */
.hero-section {
  width: 100%;
  height: 75vh;
  position: relative;
  overflow: hidden;
}

.hero-swiper {
  width: 100%;
  height: 100%;
}

.hero-image {
  width: 100%;
  height: 100%;
}

/* 底部渐变遮罩 — 图片淡入背景色 */
.hero-gradient {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 200rpx;
  background: linear-gradient(to bottom, transparent, $color-bg-page);
  pointer-events: none;
}

.hero-overlay {
  position: absolute;
  bottom: 80rpx;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.hero-quote {
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.25);
  letter-spacing: 4rpx;
}

.hero-scroll-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  opacity: 0.7;
}

.scroll-arrow {
  font-size: 28rpx;
  color: #fff;
  animation: bounce 2s infinite;
}

.scroll-text {
  font-size: $font-small;
  color: rgba(255, 255, 255, 0.8);
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(8rpx); }
}

/* ========== 双入口卡片 ========== */
.entry-cards {
  display: flex;
  justify-content: center;
  gap: 24rpx;
  margin-top: -50rpx;
  padding: 0 $spacing-lg;
  position: relative;
  z-index: 10;
}

.entry-card {
  flex: 1;
  max-width: 340rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 32rpx 24rpx;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: $radius-lg;
  box-shadow: $shadow-float;
  border: 1rpx solid rgba(255, 255, 255, 0.6);

  &:active {
    transform: scale(0.96);
    transition: transform 0.15s ease;
  }
}

.entry-icon-wrap {
  width: 80rpx;
  height: 80rpx;
  border-radius: $radius-round;
  background: $color-primary-light;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4rpx;
}

.dog-icon {
  background: #FDF0D5;
}

.entry-emoji {
  font-size: 40rpx;
  line-height: 1;
}

.entry-label {
  font-size: $font-h3;
  font-weight: 600;
  color: $color-text-primary;
}

.entry-desc {
  font-size: $font-small;
  color: $color-text-hint;
}

/* ========== 最新动态区域 ========== */
.section {
  padding: $spacing-xl $spacing-lg $spacing-lg;
}

.section-header {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  margin-bottom: $spacing-lg;
}

.section-title {
  font-size: $font-h2;
  font-weight: 700;
  color: $color-text-primary;
}

.section-subtitle {
  font-size: $font-small;
  color: $color-text-hint;
  text-transform: uppercase;
  letter-spacing: 2rpx;
}

/* ========== 动态卡片 ========== */
.post-list {
  display: flex;
  flex-direction: column;
}

.post-card {
  &:active {
    transform: scale(0.98);
    transition: transform 0.15s ease;
  }
}

/* 图片区 */
.post-images {
  display: flex;
  gap: 6rpx;
  margin-bottom: $spacing-sm;
  border-radius: $radius-sm;
  overflow: hidden;
  position: relative;

  .post-image {
    object-fit: cover;
    &.img-count-1 { width: 100%; height: 360rpx; }
    &.img-count-2 { width: 50%; height: 260rpx; }
    &.img-count-3 { width: 33.33%; height: 220rpx; }
  }
}

.image-more {
  position: absolute;
  right: 8rpx;
  bottom: 8rpx;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: $font-small;
  padding: 4rpx 12rpx;
  border-radius: $radius-sm;
}

/* 正文 */
.post-body {
  margin-bottom: $spacing-sm;
}

.post-content {
  font-size: $font-body;
  color: $color-text-primary;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 底部 */
.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8rpx;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.post-date {
  font-size: $font-caption;
  color: $color-text-hint;
}

.post-weather,
.post-mood,
.post-location {
  font-size: 22rpx;
}

.post-tags {
  display: flex;
  gap: 8rpx;
  flex-wrap: wrap;
}

.post-tag {
  font-size: $font-small;
  color: $color-primary;
}

/* 加载态 */
.loading-state {
  padding: 0;
}

/* 加载更多 / 已到底 */
.load-more {
  text-align: center;
  padding: $spacing-lg;
}

.load-more-text {
  font-size: $font-caption;
  color: $color-primary;
}

.load-end {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: $spacing-lg;
}

.end-line {
  width: 60rpx;
  height: 1rpx;
  background: $color-border;
}

.load-end-text {
  font-size: $font-caption;
  color: $color-text-hint;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
  gap: 12rpx;
}

.empty-emoji {
  font-size: 64rpx;
}

.empty-text {
  font-size: $font-body;
  color: $color-text-secondary;
}

.empty-hint {
  font-size: $font-caption;
  color: $color-text-hint;
}

/* 错误态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
  gap: 12rpx;
}

.error-emoji {
  font-size: 64rpx;
}

.error-text {
  font-size: $font-body;
  color: $color-text-secondary;
}

.error-hint {
  font-size: $font-caption;
  color: $color-text-hint;
  margin-bottom: 16rpx;
}

.retry-btn {
  padding: 16rpx 48rpx;
  background: $color-primary;
  border-radius: $radius-round;
  &:active { opacity: 0.8; }
}

.retry-text {
  font-size: $font-caption;
  color: #fff;
}
</style>
