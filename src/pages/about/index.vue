<template>
  <view class="about-page">
    <CustomNavbar title="关于我们" />

    <!-- 加载态 -->
    <template v-if="loading">
      <view class="about-hero">
        <view class="hero-placeholder"><text class="placeholder-emoji">💕</text></view>
        <view class="hero-gradient" />
      </view>
      <view class="about-header">
        <text class="about-title">关于我们</text>
      </view>
      <SkeletonCard variant="detail" />
    </template>

    <!-- 错误态 -->
    <view v-else-if="error" class="error-state">
      <text class="error-emoji">😿</text>
      <text class="error-text">加载失败了</text>
      <view class="retry-btn" @click="retry"><text class="retry-text">重新加载</text></view>
    </view>

    <!-- 内容 -->
    <template v-else>
    <view class="about-hero">
      <image
        v-if="mainImage"
        class="hero-image"
        :src="mainImage"
        mode="aspectFill"
        lazy-load
        @error="mainImage = ''"
      />
      <view v-else class="hero-placeholder">
        <text class="placeholder-emoji">💕</text>
      </view>
      <view class="hero-gradient" />
    </view>

    <!-- 标题区 -->
    <view class="about-header">
      <text class="about-title">{{ config.about_title || '关于我们' }}</text>
      <text class="about-subtitle">她和它的日常</text>
    </view>

    <!-- 关于我们 -->
    <view class="card about-card">
      <text class="card-title">我们的故事</text>
      <text class="about-text">{{ config.about_content || '这里记录的是我们的故事。\n\n每一天都值得被记住，每一个瞬间都是独一无二的。' }}</text>
    </view>

    <!-- 关于狗狗 -->
    <view v-if="config.dog_name" class="card dog-card">
      <view class="dog-header">
        <text class="paw-icon">🐾</text>
        <text class="card-title">{{ config.dog_name }}</text>
      </view>

      <view class="dog-info-grid">
        <view v-if="config.dog_bio" class="dog-bio">
          <text class="bio-text">{{ config.dog_bio }}</text>
        </view>

        <view class="dog-stats">
          <view v-if="dogAge" class="stat-item">
            <text class="stat-value">{{ dogAge }}</text>
            <text class="stat-label">年龄</text>
          </view>
          <view v-if="dogBirthday" class="stat-item">
            <text class="stat-value">{{ dogBirthday }}</text>
            <text class="stat-label">生日</text>
          </view>
          <view v-if="daysWithDog" class="stat-item">
            <text class="stat-value">{{ daysWithDog }}</text>
            <text class="stat-label">在一起(天)</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 纪念日 (如果有配置) -->
    <view v-if="config.anniversary" class="card anniversary-card">
      <text class="card-title">💝 纪念日</text>
      <text class="anniversary-text">{{ config.anniversary }}</text>
    </view>

    <!-- 底部语录 -->
    <view class="quote-section">
      <view class="quote-line" />
      <text class="quote-text">{{ footerQuote }}</text>
      <view class="quote-line" />
    </view>

    <!-- 底部安全区 -->
    <view class="safe-bottom" />
    </template>
  </view>
</template>

<script>
import CustomNavbar from '@/components/CustomNavbar.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import { getSiteConfig, getTempFileUrls } from '@/common/cloud.js'

export default {
  components: { CustomNavbar, SkeletonCard },
  data() {
    return {
      config: {},
      mainImage: '',
      dogAge: '',
      dogBirthday: '',
      daysWithDog: null,
      loading: true,
      error: false,
      footerQuote: '感谢你出现在我的生命里 💕',
    }
  },
  async onLoad() {
    await this.fetchConfig()
  },
  methods: {
    async fetchConfig() {
      this.loading = true
      this.error = false
      try {
        const config = await getSiteConfig([
          'about_title', 'about_content', 'about_images',
          'dog_name', 'dog_bio', 'dog_birthday',
          'anniversary', 'footer_quote',
        ])
        this.config = config

        if (config.about_images && config.about_images.length) {
          const urls = await getTempFileUrls(config.about_images.slice(0, 1))
          this.mainImage = urls[0] || ''
        }

        if (config.dog_birthday) {
          const birth = new Date(config.dog_birthday)
          const now = new Date()
          const totalMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
          if (totalMonths < 12) {
            this.dogAge = `${totalMonths}个月`
          } else if (totalMonths < 24) {
            this.dogAge = `${Math.floor(totalMonths / 12)}岁${totalMonths % 12}个月`
          } else {
            this.dogAge = `${Math.floor(totalMonths / 12)}岁`
          }
          this.dogBirthday = `${birth.getFullYear()}.${String(birth.getMonth() + 1).padStart(2, '0')}.${String(birth.getDate()).padStart(2, '0')}`
          this.daysWithDog = Math.floor((now - birth) / 86400000)
        }

        if (config.footer_quote) {
          this.footerQuote = config.footer_quote
        }
      } catch (e) {
        console.error('加载配置失败', e)
        this.error = true
      } finally {
        this.loading = false
      }
    },

    retry() {
      this.fetchConfig()
    },
  },
}
</script>

<style lang="scss" scoped>
.about-page {
  min-height: 100vh;
  background: $color-bg-page;
  padding-bottom: env(safe-area-inset-bottom);
}

/* ========== 顶部大图 ========== */
.about-hero {
  width: 100%;
  height: 520rpx;
  position: relative;
  overflow: hidden;
}

.hero-image {
  width: 100%;
  height: 100%;
}

.hero-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, $color-primary-light, #F5E6E6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-emoji {
  font-size: 80rpx;
}

.hero-gradient {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 120rpx;
  background: linear-gradient(to bottom, transparent, $color-bg-page);
  pointer-events: none;
}

/* ========== 标题区 ========== */
.about-header {
  text-align: center;
  padding: 0 $spacing-lg $spacing-lg;
  margin-top: -40rpx;
  position: relative;
  z-index: 10;
}

.about-title {
  display: block;
  font-size: $font-h1;
  font-weight: 700;
  color: $color-text-primary;
  margin-bottom: 8rpx;
  letter-spacing: 4rpx;
}

.about-subtitle {
  font-size: $font-caption;
  color: $color-text-hint;
  letter-spacing: 2rpx;
}

/* ========== 内容卡片 ========== */
.about-card,
.dog-card,
.anniversary-card {
  margin: 0 $spacing-lg $spacing-lg;
}

.card-title {
  display: block;
  font-size: $font-h2;
  font-weight: 600;
  color: $color-text-primary;
  margin-bottom: $spacing-md;
}

.about-text {
  font-size: $font-body;
  color: $color-text-secondary;
  line-height: 2;
  white-space: pre-wrap;
}

/* ========== 狗狗卡片 ========== */
.dog-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: $spacing-md;
}

.paw-icon {
  font-size: 32rpx;
}

.dog-bio {
  margin-bottom: $spacing-lg;
}

.bio-text {
  font-size: $font-body;
  color: $color-text-secondary;
  line-height: 1.8;
}

.dog-stats {
  display: flex;
  justify-content: space-around;
  padding: $spacing-md 0;
  border-top: 1rpx solid $color-border;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.stat-value {
  font-size: $font-h2;
  font-weight: 700;
  color: $color-dog-accent;
}

.stat-label {
  font-size: $font-small;
  color: $color-text-hint;
}

/* ========== 纪念日卡片 ========== */
.anniversary-text {
  font-size: $font-body;
  color: $color-text-secondary;
  line-height: 1.8;
}

/* ========== 底部语录 ========== */
.quote-section {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: $spacing-xl $spacing-lg;
}

.quote-line {
  flex: 1;
  height: 1rpx;
  background: $color-border;
}

.quote-text {
  font-size: $font-caption;
  color: $color-text-hint;
  text-align: center;
  flex-shrink: 0;
  max-width: 70%;
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

/* ========== 底部安全区 ========== */
.safe-bottom {
  height: 40rpx;
}
</style>
