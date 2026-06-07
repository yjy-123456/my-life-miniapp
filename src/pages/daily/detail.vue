<template>
  <view class="detail-page">
    <CustomNavbar title="详情" show-back />
    <view v-if="post" class="detail-body">
      <swiper v-if="images.length" class="detail-swiper" indicator-dots circular>
        <swiper-item v-for="(img, i) in images" :key="i">
          <image class="detail-image" :src="img" mode="aspectFill" />
        </swiper-item>
      </swiper>
      <view class="card detail-text">
        <text class="content">{{ post.content }}</text>
        <view class="tags" v-if="post.tags && post.tags.length">
          <text v-for="t in post.tags" :key="t" class="tag">#{{ t }}</text>
        </view>
        <view class="info-line">
          <text class="info-item">{{ formatDate(post.createdAt) }}</text>
          <text v-if="post.location" class="info-item">📍 {{ post.location }}</text>
          <text v-if="post.weather" class="info-item">{{ weatherIcon(post.weather) }}</text>
          <text v-if="post.mood" class="info-item">{{ moodIcon(post.mood) }}</text>
        </view>
      </view>
    </view>
    <view v-else class="empty-state"><text class="empty-text">加载中...</text></view>
  </view>
</template>

<script>
import CustomNavbar from '@/components/CustomNavbar.vue'
import { getPostById, getTempFileUrls } from '@/common/cloud.js'

export default {
  components: { CustomNavbar },
  data() { return { post: null, images: [] } },
  async onLoad(options) {
    if (!options.id) return
    try {
      const post = await getPostById(options.id)
      this.post = post
      if (post?.images?.length) {
        this.images = await getTempFileUrls(post.images)
      }
    } catch (e) { console.error(e) }
  },
  methods: {
    formatDate(d) { if (!d) return ''; const dt = new Date(d); return `${dt.getFullYear()}.${String(dt.getMonth()+1).padStart(2,'0')}.${String(dt.getDate()).padStart(2,'0')}` },
    weatherIcon(w) { const m = { sunny:'☀️', cloudy:'☁️', rainy:'🌧️' }; return m[w] || '' },
    moodIcon(m) { const map = { happy:'😊', calm:'😌', excited:'🎉', grateful:'🙏' }; return map[m] || '' }
  }
}
</script>

<style lang="scss" scoped>
.detail-page { min-height: 100vh; background: $color-bg-page; }
.detail-swiper { width: 100%; height: 560rpx; }
.detail-image { width: 100%; height: 100%; }
.detail-text { margin: $spacing-lg; }
.content { font-size: $font-body; color: $color-text-primary; line-height: 1.8; white-space: pre-wrap; }
.tags { display: flex; flex-wrap: wrap; gap: 12rpx; margin-top: $spacing-md; }
.tag { font-size: $font-small; color: $color-primary; }
.info-line { display: flex; gap: 16rpx; margin-top: $spacing-md; }
.info-item { font-size: $font-caption; color: $color-text-hint; }
.empty-state { padding: 200rpx 0; text-align: center; }
.empty-text { font-size: $font-caption; color: $color-text-hint; }
</style>
