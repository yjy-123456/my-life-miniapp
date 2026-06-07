<template>
  <view class="detail-page">
    <CustomNavbar title="详情" show-back />

    <!-- 加载态 -->
    <view v-if="loading" class="loading-state">
      <SkeletonCard variant="detail" />
    </view>

    <!-- 错误态 -->
    <view v-else-if="error" class="error-state">
      <text class="error-emoji">😿</text>
      <text class="error-text">加载失败了</text>
      <view class="retry-btn" @click="retry">
        <text class="retry-text">重新加载</text>
      </view>
    </view>

    <!-- 内容 -->
    <view v-else-if="post" class="detail-body">
      <!-- 图片轮播 -->
      <swiper
        v-if="images.length"
        class="detail-swiper"
        :style="{ height: swiperHeight + 'px' }"
        indicator-dots
        indicator-color="rgba(255,255,255,0.4)"
        indicator-active-color="#fff"
        circular
      >
        <swiper-item v-for="(img, i) in images" :key="i">
          <image
            class="detail-image"
            :src="img"
            mode="aspectFill"
            lazy-load
            @error="onImageError"
            @click="previewImage(i)"
          />
        </swiper-item>
      </swiper>

      <!-- 文字内容卡片 -->
      <view class="card detail-card">
        <!-- 标题 -->
        <text v-if="post.title" class="post-title">{{ post.title }}</text>

        <!-- 正文 -->
        <text class="post-content">{{ post.content }}</text>

        <!-- 标签 -->
        <view v-if="post.tags && post.tags.length" class="post-tags">
          <text v-for="t in post.tags" :key="t" class="post-tag">#{{ t }}</text>
        </view>

        <!-- 分隔线 -->
        <view class="divider" />

        <!-- 元信息 -->
        <view class="info-grid">
          <view class="info-item" v-if="post.createdAt">
            <text class="info-icon">📅</text>
            <text class="info-text">{{ formatFullDate(post.createdAt) }}</text>
          </view>
          <view class="info-item" v-if="post.location">
            <text class="info-icon">📍</text>
            <text class="info-text">{{ post.location }}</text>
          </view>
          <view class="info-item" v-if="post.weather">
            <text class="info-icon">{{ weatherIcon(post.weather) }}</text>
            <text class="info-text">{{ weatherLabel(post.weather) }}</text>
          </view>
          <view class="info-item" v-if="post.mood">
            <text class="info-icon">{{ moodIcon(post.mood) }}</text>
            <text class="info-text">{{ moodLabel(post.mood) }}</text>
          </view>
        </view>
      </view>

      <!-- 上一篇 / 下一篇 -->
      <view class="nav-posts">
        <view
          v-if="prevPost"
          class="nav-item card"
          @click="navigateTo(prevPost._id)"
        >
          <text class="nav-label">← 上一篇</text>
          <text class="nav-title">{{ truncate(prevPost.content, 30) }}</text>
        </view>
        <view v-else class="nav-item card disabled">
          <text class="nav-label">← 上一篇</text>
          <text class="nav-title">没有啦</text>
        </view>

        <view
          v-if="nextPost"
          class="nav-item card"
          @click="navigateTo(nextPost._id)"
        >
          <text class="nav-label">下一篇 →</text>
          <text class="nav-title">{{ truncate(nextPost.content, 30) }}</text>
        </view>
        <view v-else class="nav-item card disabled">
          <text class="nav-label">下一篇 →</text>
          <text class="nav-title">没有啦</text>
        </view>
      </view>
    </view>

    <!-- 未找到 -->
    <view v-else class="empty-state">
      <text class="empty-emoji">🔍</text>
      <text class="empty-text">动态不存在</text>
    </view>
  </view>
</template>

<script>
import CustomNavbar from '@/components/CustomNavbar.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import { getPostById, getPosts, getTempFileUrls } from '@/common/cloud.js'

export default {
  components: { CustomNavbar, SkeletonCard },
  data() {
    return {
      post: null,
      postId: '',
      images: [],
      prevPost: null,
      nextPost: null,
      loading: true,
      error: false,
      swiperHeight: 560,
    }
  },
  async onLoad(options) {
    if (!options.id) {
      this.loading = false
      return
    }
    this.postId = options.id
    await this.fetchDetail(options.id)
  },
  methods: {
    async fetchDetail(id) {
      this.loading = true
      this.error = false
      try {
        const sysInfo = uni.getSystemInfoSync()
        this.swiperHeight = Math.round(sysInfo.screenWidth * 0.75)

        const post = await getPostById(id)
        if (!post) {
          this.loading = false
          return
        }
        this.post = post
        if (post.images && post.images.length) {
          this.images = await getTempFileUrls(post.images)
        }

        this.loadAdjacent(post.createdAt, id)
      } catch (e) {
        console.error('加载详情失败', e)
        this.error = !this.post
        if (!this.error) {
          uni.showToast({ title: '加载失败', icon: 'none' })
        }
      } finally {
        this.loading = false
      }
    },

    retry() {
      if (this.postId) this.fetchDetail(this.postId)
    },

    async loadAdjacent(createdAt, currentId) {
      try {
        // 加载前一条（更早的）
        const older = await getPosts(1, createdAt)
        if (older.length && older[0]._id !== currentId) {
          this.prevPost = older[0]
        } else if (older.length > 1) {
          this.prevPost = older[1]
        }

        // 加载后一条（更新的）—— 获取最近2条，找到紧挨着的下一条
        const newer = await getPosts(2, null)
        const currentIdx = newer.findIndex((p) => p._id === currentId)
        if (currentIdx > 0) {
          this.nextPost = newer[currentIdx - 1]
        } else if (currentIdx === -1 && newer.length) {
          // 当前文章不在最新几条中，尝试找到比它更新的
          const nextIdx = newer.findIndex(
            (p) => new Date(p.createdAt) > new Date(createdAt)
          )
          if (nextIdx >= 0) {
            this.nextPost = newer[nextIdx]
          }
        }
      } catch (e) {
        console.log('加载相邻文章失败', e)
      }
    },

    previewImage(current) {
      uni.previewImage({
        urls: this.images,
        current: current,
      })
    },

    formatFullDate(d) {
      if (!d) return ''
      const dt = new Date(d)
      const weekDays = ['日', '一', '二', '三', '四', '五', '六']
      const weekDay = weekDays[dt.getDay()]
      return `${dt.getFullYear()}年${dt.getMonth() + 1}月${dt.getDate()}日 星期${weekDay}`
    },

    weatherIcon(w) {
      const map = { sunny: '☀️', cloudy: '☁️', rainy: '🌧️', snowy: '❄️', windy: '💨' }
      return map[w] || ''
    },
    weatherLabel(w) {
      const map = { sunny: '晴天', cloudy: '多云', rainy: '雨天', snowy: '下雪', windy: '大风' }
      return map[w] || w
    },
    moodIcon(m) {
      const map = { happy: '😊', calm: '😌', excited: '🎉', grateful: '🙏', love: '💕', sad: '😢' }
      return map[m] || ''
    },
    moodLabel(m) {
      const map = { happy: '开心', calm: '平静', excited: '兴奋', grateful: '感恩', love: '幸福', sad: '难过' }
      return map[m] || m
    },

    navigateTo(id) {
      // 替换当前页面，避免堆叠太多
      uni.redirectTo({ url: `/pages/daily/detail?id=${id}` })
    },

    truncate(text, len) {
      if (!text) return ''
      return text.length > len ? text.slice(0, len) + '...' : text
    },

    onImageError() {
      // 图片加载失败，忽略（已有 aspectFill 兜底）
    },
  },
}
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background: $color-bg-page;
  padding-bottom: env(safe-area-inset-bottom);
}

/* 图片轮播 */
.detail-swiper {
  width: 100%;
  background: #000;
}

.detail-image {
  width: 100%;
  height: 100%;
}

/* 内容卡片 */
.detail-card {
  margin: $spacing-lg;
}

.post-title {
  display: block;
  font-size: $font-h1;
  font-weight: 700;
  color: $color-text-primary;
  margin-bottom: $spacing-md;
  line-height: 1.4;
}

.post-content {
  font-size: $font-body;
  color: $color-text-primary;
  line-height: 2;
  white-space: pre-wrap;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: $spacing-lg;
}

.post-tag {
  font-size: $font-caption;
  color: $color-primary;
  background: $color-primary-light;
  padding: 6rpx 20rpx;
  border-radius: $radius-round;
}

/* 分隔线 */
.divider {
  height: 1rpx;
  background: $color-border;
  margin: $spacing-lg 0;
}

/* 元信息网格 */
.info-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx 32rpx;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.info-icon {
  font-size: 28rpx;
}

.info-text {
  font-size: $font-caption;
  color: $color-text-secondary;
}

/* 上一篇 / 下一篇 */
.nav-posts {
  display: flex;
  gap: 16rpx;
  padding: 0 $spacing-lg;
  margin-bottom: $spacing-xl;
}

.nav-item {
  flex: 1;
  padding: $spacing-md;

  &.disabled {
    opacity: 0.4;
  }

  &:active:not(.disabled) {
    transform: scale(0.97);
    transition: transform 0.15s ease;
  }
}

.nav-label {
  display: block;
  font-size: $font-small;
  color: $color-text-hint;
  margin-bottom: 8rpx;
}

.nav-title {
  font-size: $font-caption;
  color: $color-text-primary;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 加载态 */
.loading-state {
  padding: $spacing-lg;
}

.skeleton-image {
  width: 100%;
  height: 420rpx;
  border-radius: $radius-md;
  margin-bottom: $spacing-md;
}

.skeleton-lines {
  background: $color-bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.skeleton-line {
  height: 24rpx;
  border-radius: 4rpx;
  &.w-80 { width: 80%; }
  &.w-60 { width: 60%; }
  &.w-40 { width: 40%; }
}

.shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 200rpx 0;
  gap: 12rpx;
}

.empty-emoji {
  font-size: 64rpx;
}

.empty-text {
  font-size: $font-body;
  color: $color-text-secondary;
}

/* 错误态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 200rpx 0;
  gap: 12rpx;
}
.error-emoji { font-size: 64rpx; }
.error-text { font-size: $font-body; color: $color-text-secondary; }
.retry-btn {
  padding: 16rpx 48rpx;
  background: $color-primary;
  border-radius: $radius-round;
  margin-top: 8rpx;
  &:active { opacity: 0.8; }
}
.retry-text { font-size: $font-caption; color: #fff; }
</style>
