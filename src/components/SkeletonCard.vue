<template>
  <view class="skeleton-wrapper">
    <!-- 文章卡片骨架 (默认) -->
    <view v-if="variant === 'post'" class="skeleton-card">
      <view class="skeleton-image shimmer" />
      <view class="skeleton-lines">
        <view class="skeleton-line w-80 shimmer" />
        <view class="skeleton-line w-60 shimmer" />
        <view class="skeleton-line w-40 shimmer" />
      </view>
    </view>

    <!-- 拍立得骨架 — 用于瀑布流 -->
    <view v-else-if="variant === 'polaroid'" class="skeleton-polaroid">
      <view class="polaroid-photo shimmer" :style="{ height: height + 'rpx' }" />
      <view class="skeleton-line w-50 shimmer" style="margin: 12rpx auto 0" />
    </view>

    <!-- 详情页骨架 -->
    <view v-else-if="variant === 'detail'" class="skeleton-detail">
      <view class="skeleton-image-large shimmer" />
      <view class="skeleton-card" style="margin: 24rpx">
        <view class="skeleton-lines">
          <view class="skeleton-line w-90 shimmer" />
          <view class="skeleton-line w-100 shimmer" />
          <view class="skeleton-line w-70 shimmer" />
          <view class="skeleton-line w-50 shimmer" />
          <view class="skeleton-line w-80 shimmer" />
        </view>
      </view>
    </view>

    <!-- 列表项骨架 — 紧凑型 -->
    <view v-else-if="variant === 'list-item'" class="skeleton-list-item">
      <view class="list-left">
        <view class="skeleton-line w-90 shimmer" />
        <view class="skeleton-line w-50 shimmer" />
      </view>
      <view class="skeleton-thumb shimmer" />
    </view>
  </view>
</template>

<script>
export default {
  name: 'SkeletonCard',
  props: {
    /** 骨架变体: post | polaroid | detail | list-item */
    variant: {
      type: String,
      default: 'post',
    },
    /** polaroid 变体的模拟高度 (rpx) */
    height: {
      type: Number,
      default: 300,
    },
  },
}
</script>

<style lang="scss" scoped>
/* ========== 通用 ========== */
.skeleton-wrapper {
  width: 100%;
}

.skeleton-line {
  height: 20rpx;
  border-radius: 4rpx;
  &.w-100 { width: 100%; }
  &.w-90  { width: 90%; }
  &.w-80  { width: 80%; }
  &.w-70  { width: 70%; }
  &.w-60  { width: 60%; }
  &.w-50  { width: 50%; }
  &.w-40  { width: 40%; }
}

.skeleton-lines {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
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

/* ========== post 变体 ========== */
.skeleton-card {
  background: $color-bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
}

.skeleton-image {
  width: 100%;
  height: 220rpx;
  border-radius: $radius-sm;
  margin-bottom: $spacing-sm;
}

/* ========== polaroid 变体 ========== */
.skeleton-polaroid {
  background: #fff;
  border-radius: 4rpx;
  padding: 10rpx 10rpx 24rpx 10rpx;
  box-shadow: 2rpx 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.polaroid-photo {
  width: 100%;
  border-radius: 2rpx;
}

/* ========== detail 变体 ========== */
.skeleton-detail {
  width: 100%;
}

.skeleton-image-large {
  width: 100%;
  height: 560rpx;
}

/* ========== list-item 变体 ========== */
.skeleton-list-item {
  display: flex;
  gap: 16rpx;
  padding: $spacing-md;
  background: $color-bg-card;
  border-radius: $radius-md;
  margin-bottom: $spacing-sm;
}

.list-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  justify-content: center;
}

.skeleton-thumb {
  width: 120rpx;
  height: 120rpx;
  border-radius: $radius-sm;
  flex-shrink: 0;
}
</style>
