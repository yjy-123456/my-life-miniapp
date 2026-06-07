<template>
  <view class="skeleton-card">
    <view class="skeleton-image shimmer" />
    <view class="skeleton-lines">
      <view class="skeleton-line w-80 shimmer" />
      <view class="skeleton-line w-60 shimmer" />
      <view class="skeleton-line w-40 shimmer" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
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

.skeleton-lines {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.skeleton-line {
  height: 20rpx;
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
</style>
