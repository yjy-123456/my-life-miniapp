<template>
  <view class="daily-page">
    <CustomNavbar title="日常记录" show-back />
    <view class="post-list">
      <view v-for="post in posts" :key="post._id" class="card post-card" @click="goToDetail(post._id)">
        <view v-if="post.images && post.images.length" class="post-images">
          <image v-for="(img, i) in post.images.slice(0, 3)" :key="i"
            class="post-image" :class="'img-count-' + Math.min(post.images.length, 3)"
            :src="img" mode="aspectFill" />
        </view>
        <text class="post-content">{{ post.content }}</text>
        <view class="post-meta">
          <text class="post-date">{{ post.createdAt }}</text>
          <text v-if="post.mood">{{ moodIcon(post.mood) }}</text>
        </view>
      </view>
      <view v-if="loading" class="empty-state"><SkeletonCard /><SkeletonCard /></view>
    </view>
  </view>
</template>

<script>
import CustomNavbar from '@/components/CustomNavbar.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import { getPosts, getTempFileUrls } from '@/common/cloud.js'

export default {
  components: { CustomNavbar, SkeletonCard },
  data() {
    return { posts: [], loading: true, pageSize: 10, hasMore: true, lastCreatedAt: null }
  },
  onLoad() { this.loadPosts() },
  onReachBottom() { this.loadMore() },
  methods: {
    async loadPosts() {
      this.loading = true
      try {
        const data = await getPosts(this.pageSize, this.lastCreatedAt)
        if (data.length < this.pageSize) this.hasMore = false
        for (const p of data) { if (p.images?.length) p.images = await getTempFileUrls(p.images) }
        this.posts = this.posts.concat(data)
        if (data.length) this.lastCreatedAt = data[data.length - 1].createdAt
      } catch (e) { console.error(e) }
      this.loading = false
    },
    async loadMore() { if (this.hasMore && !this.loading) await this.loadPosts() },
    moodIcon(m) { const map = { happy:'😊', calm:'😌', excited:'🎉', grateful:'🙏' }; return map[m] || '' },
    goToDetail(id) { uni.navigateTo({ url: `/pages/daily/detail?id=${id}` }) }
  }
}
</script>

<style lang="scss" scoped>
.daily-page { min-height: 100vh; background: $color-bg-page; }
.post-list { padding: $spacing-lg; }
.post-card { margin-bottom: $spacing-md;
  &:active { transform: scale(0.98); transition: transform 0.15s ease; } }
.post-images { display: flex; gap: 8rpx; margin-bottom: $spacing-sm; border-radius: $radius-sm; overflow: hidden;
  .post-image { object-fit: cover; &.img-count-1 { width: 100%; height: 360rpx; } &.img-count-2 { width: 50%; height: 260rpx; } &.img-count-3 { width: 33.33%; height: 220rpx; } } }
.post-content { font-size: $font-body; color: $color-text-primary; line-height: 1.6;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: $spacing-sm; }
.post-meta { display: flex; gap: 8rpx; }
.post-date { font-size: $font-caption; color: $color-text-hint; }
.empty-state { padding: 80rpx 0; }
</style>
