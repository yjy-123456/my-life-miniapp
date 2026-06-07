<template>
  <view class="about-page">
    <CustomNavbar title="关于我们" />
    <view class="about-content">
      <image v-if="mainImage" class="about-hero" :src="mainImage" mode="aspectFill" />
      <view class="about-body card">
        <text class="about-title">{{ config.about_title || '关于我们' }}</text>
        <text class="about-text">{{ config.about_content || '这里记录的是我们的故事。' }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import CustomNavbar from '@/components/CustomNavbar.vue'
import { getSiteConfig, getTempFileUrls } from '@/common/cloud.js'

export default {
  components: { CustomNavbar },
  data() {
    return { config: {}, mainImage: '' }
  },
  async onLoad() {
    try {
      const config = await getSiteConfig(['about_title', 'about_content', 'about_images'])
      this.config = config
      if (config.about_images?.length) {
        const urls = await getTempFileUrls([config.about_images[0]])
        this.mainImage = urls[0] || ''
      }
    } catch (e) {}
  }
}
</script>

<style lang="scss" scoped>
.about-page { min-height: 100vh; background: $color-bg-page; }
.about-hero { width: 100%; height: 500rpx; }
.about-body { margin: $spacing-lg; }
.about-title { display: block; font-size: $font-h1; font-weight: 700; color: $color-text-primary; margin-bottom: $spacing-lg; text-align: center; }
.about-text { font-size: $font-body; color: $color-text-secondary; line-height: 2; white-space: pre-wrap; }
</style>
