<template>
  <view class="daily-page">
    <CustomNavbar title="日常记录" show-back />

    <!-- 时间线列表 -->
    <view class="timeline">
      <view v-for="(group, gIdx) in groupedPosts" :key="group.label" class="month-group">
        <!-- 月份标题 -->
        <view class="month-header" :class="{ 'is-first': gIdx === 0 }">
          <view class="month-dot" />
          <text class="month-label">{{ group.label }}</text>
          <view class="month-line" />
        </view>

        <!-- 该月的动态卡片 -->
        <view class="month-posts">
          <view
            v-for="post in group.posts"
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

            <!-- 元信息 -->
            <view class="post-footer">
              <view class="post-meta">
                <text class="post-date">{{ formatDay(post.createdAt) }}</text>
                <text v-if="post.weather" class="post-weather">{{ weatherIcon(post.weather) }}</text>
                <text v-if="post.mood" class="post-mood">{{ moodIcon(post.mood) }}</text>
                <text v-if="post.location" class="post-location">📍 {{ post.location }}</text>
              </view>
              <view v-if="post.tags && post.tags.length" class="post-tags">
                <text v-for="t in post.tags.slice(0, 3)" :key="t" class="post-tag">#{{ t }}</text>
              </view>
            </view>
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
      <view v-else-if="allPosts.length === 0" class="empty-state">
        <text class="empty-emoji">📝</text>
        <text class="empty-text">还没有日常记录</text>
      </view>

      <!-- 到底了 -->
      <view v-else-if="!hasMore" class="load-end">
        <view class="end-line" />
        <text class="load-end-text">— 已经到底啦 —</text>
        <view class="end-line" />
      </view>

      <!-- 加载更多 -->
      <view v-else-if="hasMore" class="load-more" @click="loadMore">
        <text class="load-more-text">加载更多</text>
      </view>
    </view>
  </view>
</template>

<script>
import CustomNavbar from '@/components/CustomNavbar.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import { getPosts, getTempFileUrls } from '@/common/cloud.js'

const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月']

export default {
  components: { CustomNavbar, SkeletonCard },
  data() {
    return {
      allPosts: [],
      pageSize: 20,
      lastCreatedAt: null,
      hasMore: true,
      loading: true,
      error: false,
    }
  },
  computed: {
    groupedPosts() {
      const groups = []
      let currentLabel = ''
      let currentPosts = []

      this.allPosts.forEach((post) => {
        const d = new Date(post.createdAt)
        const label = `${d.getFullYear()}年${MONTH_NAMES[d.getMonth()]}`

        if (label !== currentLabel) {
          if (currentPosts.length) {
            groups.push({ label: currentLabel, posts: currentPosts })
          }
          currentLabel = label
          currentPosts = []
        }
        currentPosts.push(post)
      })

      if (currentPosts.length) {
        groups.push({ label: currentLabel, posts: currentPosts })
      }

      return groups
    },
  },
  onLoad() {
    this.loadPosts()
  },
  onPullDownRefresh() {
    this.allPosts = []
    this.lastCreatedAt = null
    this.hasMore = true
    this.loadPosts().finally(() => {
      uni.stopPullDownRefresh()
    })
  },
  onReachBottom() {
    this.loadMore()
  },
  methods: {
    async loadPosts() {
      this.loading = true
      this.error = false
      try {
        const data = await getPosts(this.pageSize, this.lastCreatedAt)
        if (data.length < this.pageSize) {
          this.hasMore = false
        }
        for (const p of data) {
          if (p.images && p.images.length) {
            p.images = await getTempFileUrls(p.images)
          }
        }
        this.allPosts = this.allPosts.concat(data)
        if (data.length) {
          this.lastCreatedAt = data[data.length - 1].createdAt
        }
      } catch (e) {
        console.error('加载动态失败', e)
        this.error = this.allPosts.length === 0
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

    formatDay(d) {
      if (!d) return ''
      const dt = new Date(d)
      return `${String(dt.getMonth() + 1).padStart(2, '0')}.${String(dt.getDate()).padStart(2, '0')}`
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
  },
}
</script>

<style lang="scss" scoped>
.daily-page {
  min-height: 100vh;
  background: $color-bg-page;
  padding-bottom: env(safe-area-inset-bottom);
}

/* ========== 时间线 ========== */
.timeline {
  padding: $spacing-lg;
}

/* 月份分组 */
.month-group {
  position: relative;
}

/* 月份标题 */
.month-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: $spacing-md;
  padding-top: $spacing-md;

  &.is-first {
    padding-top: 0;
  }
}

.month-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: $radius-round;
  background: $color-primary;
  flex-shrink: 0;
}

.month-label {
  font-size: $font-h2;
  font-weight: 700;
  color: $color-primary-dark;
  flex-shrink: 0;
  letter-spacing: 1rpx;
}

.month-line {
  flex: 1;
  height: 1rpx;
  background: $color-border;
}

/* 动态卡片 */
.month-posts {
  padding-left: 20rpx;
  border-left: 2rpx solid $color-border;
  margin-left: 6rpx;
}

.post-card {
  margin-bottom: $spacing-md;

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

/* 底部元信息 */
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
  padding: 0 20rpx;
}

/* 加载更多 / 已到底 */
.load-more {
  text-align: center;
  padding: $spacing-lg;
  padding-left: 20rpx;
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
  padding: 120rpx 0;
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
  padding: 120rpx 0;
  gap: 12rpx;
}

.error-emoji { font-size: 64rpx; }

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
