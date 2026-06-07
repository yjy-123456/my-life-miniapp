<template>
  <view class="home-page">
    <CustomNavbar transparent />

    <!-- 封面 -->
    <view class="hero-section">
      <swiper class="hero-swiper" :autoplay="true" :interval="4000" :duration="800" circular
        indicator-dots indicator-color="rgba(255,255,255,0.4)" indicator-active-color="#fff">
        <swiper-item v-for="(img, idx) in coverImages" :key="idx">
          <image class="hero-image" :src="img" mode="aspectFill" />
        </swiper-item>
      </swiper>
      <view class="hero-overlay">
        <text class="hero-quote">{{ heroQuote }}</text>
      </view>
    </view>

    <!-- 入口卡片 -->
    <view class="entry-cards">
      <view class="entry-card" @click="goToDogs">
        <text class="entry-emoji">🐶</text>
        <text class="entry-label">狗狗相册</text>
      </view>
    </view>

    <!-- 最新动态 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">最新动态</text>
      </view>
      <view class="post-list">
        <view v-for="post in posts" :key="post._id" class="card post-card" @click="goToDetail(post._id)">
          <view v-if="post.images && post.images.length" class="post-images">
            <image v-for="(img, i) in post.images.slice(0, 3)" :key="i"
              class="post-image" :class="'img-count-' + Math.min(post.images.length, 3)"
              :src="img" mode="aspectFill" />
          </view>
          <view class="post-body">
            <text class="post-content">{{ post.content }}</text>
          </view>
          <view class="post-meta">
            <text class="post-date">{{ formatDate(post.createdAt) }}</text>
            <text v-if="post.mood" class="post-mood">{{ moodIcon(post.mood) }}</text>
          </view>
        </view>
        <view v-if="hasMore" class="load-more" @click="loadMore">
          <text class="load-more-text">查看更多</text>
        </view>
        <view v-else-if="posts.length > 0" class="load-end">
          <text class="load-end-text">— 已经到底啦 —</text>
        </view>
        <view v-if="loading" class="empty-state">
          <SkeletonCard /><SkeletonCard />
        </view>
        <view v-else-if="posts.length === 0 && !loading" class="empty-state">
          <text class="empty-text">还没有动态</text>
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
      loading: true
    }
  },
  onLoad() { this.loadConfig(); this.loadPosts() },
  onPullDownRefresh() {
    this.posts = []; this.lastCreatedAt = null; this.hasMore = true
    Promise.all([this.loadConfig(), this.loadPosts()]).finally(() => uni.stopPullDownRefresh())
  },
  onReachBottom() { this.loadMore() },
  methods: {
    async loadConfig() {
      try {
        const config = await getSiteConfig(['cover_images', 'hero_quote'])
        if (config.cover_images?.length) {
          const urls = await getTempFileUrls(config.cover_images)
          this.coverImages = urls.filter(Boolean)
        }
        if (config.hero_quote) this.heroQuote = config.hero_quote
      } catch (e) { console.log('配置加载失败', e) }
    },
    async loadPosts() {
      this.loading = true
      try {
        const data = await getPosts(this.pageSize, this.lastCreatedAt)
        if (data.length < this.pageSize) this.hasMore = false
        for (const post of data) {
          if (post.images?.length) post.images = await getTempFileUrls(post.images)
        }
        this.posts = this.posts.concat(data)
        if (data.length) this.lastCreatedAt = data[data.length - 1].createdAt
      } catch (e) { console.error('加载失败', e) }
      this.loading = false
    },
    async loadMore() { if (this.hasMore && !this.loading) await this.loadPosts() },
    formatDate(d) { if (!d) return ''; const dt = new Date(d); return `${dt.getFullYear()}.${String(dt.getMonth()+1).padStart(2,'0')}.${String(dt.getDate()).padStart(2,'0')}` },
    moodIcon(m) { const map = { happy:'😊', calm:'😌', excited:'🎉', grateful:'🙏' }; return map[m] || '' },
    goToDetail(id) { uni.navigateTo({ url: `/pages/daily/detail?id=${id}` }) },
    goToDogs() { uni.switchTab({ url: '/pages/dogs/album' }) }
  }
}
</script>

<style lang="scss" scoped>
.home-page { min-height: 100vh; background: $color-bg-page; }
.hero-section { width: 100%; height: 70vh; position: relative; }
.hero-swiper { width: 100%; height: 100%; }
.hero-image { width: 100%; height: 100%; }
.hero-overlay { position: absolute; bottom: 80rpx; left: 0; right: 0; text-align: center; }
.hero-quote { font-size: 36rpx; font-weight: 600; color: #fff; text-shadow: 0 2rpx 12rpx rgba(0,0,0,0.3); }
.entry-cards { display: flex; justify-content: center; margin-top: -40rpx; position: relative; z-index: 10; }
.entry-card { display: flex; align-items: center; gap: 12rpx; background: rgba(255,255,255,0.85);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border-radius: $radius-lg; padding: 20rpx 40rpx; box-shadow: $shadow-float;
  &:active { transform: scale(0.97); transition: transform 0.15s ease; } }
.entry-emoji { font-size: 40rpx; } .entry-label { font-size: $font-h3; font-weight: 500; color: $color-text-primary; }
.section { padding: $spacing-lg; }
.section-header { margin-bottom: $spacing-md; }
.section-title { font-size: $font-h2; font-weight: 600; color: $color-text-primary; }
.post-card { &:active { transform: scale(0.98); transition: transform 0.15s ease; } }
.post-images { display: flex; gap: 8rpx; margin-bottom: $spacing-sm; border-radius: $radius-sm; overflow: hidden;
  .post-image { object-fit: cover; &.img-count-1 { width: 100%; height: 360rpx; } &.img-count-2 { width: 50%; height: 260rpx; } &.img-count-3 { width: 33.33%; height: 220rpx; } } }
.post-body { margin-bottom: $spacing-sm; }
.post-content { font-size: $font-body; color: $color-text-primary; line-height: 1.6;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.post-meta { display: flex; align-items: center; gap: 8rpx; }
.post-date { font-size: $font-caption; color: $color-text-hint; }
.post-mood { font-size: 24rpx; }
.load-more, .load-end { text-align: center; padding: $spacing-lg; }
.load-more-text { font-size: $font-caption; color: $color-primary; }
.load-end-text { font-size: $font-caption; color: $color-text-hint; }
.empty-state { padding: 80rpx 0; text-align: center; }
.empty-text { font-size: $font-caption; color: $color-text-hint; }
</style>
