<template>
  <view class="album-page">
    <CustomNavbar title="狗狗相册" />

    <!-- 标签筛选栏 -->
    <scroll-view class="tag-bar" scroll-x show-scrollbar="false" enable-flex>
      <view class="tag-bar-inner">
        <view
          v-for="tag in tags"
          :key="tag"
          class="tag-item"
          :class="{ active: activeTag === tag }"
          @click="filterByTag(tag)"
        >
          {{ tag }}
        </view>
      </view>
    </scroll-view>

    <!-- 拍立得瀑布流 -->
    <view class="waterfall-container">
      <view class="waterfall-col">
        <view
          v-for="item in leftList"
          :key="item._id"
          class="polaroid-item"
          @click="openViewer(item._id)"
        >
          <view class="polaroid-photo">
            <image
              class="polaroid-img"
              :src="item.image"
              :style="{ height: item.displayHeight + 'px' }"
              mode="widthFix"
              lazy-load
            />
          </view>
          <view class="polaroid-bottom">
            <text class="polaroid-caption">{{ item.caption || ' ' }}</text>
            <text class="polaroid-date">{{ formatShortDate(item.takenAt) }}</text>
          </view>
        </view>
      </view>
      <view class="waterfall-col">
        <view
          v-for="item in rightList"
          :key="item._id"
          class="polaroid-item"
          @click="openViewer(item._id)"
        >
          <view class="polaroid-photo">
            <image
              class="polaroid-img"
              :src="item.image"
              :style="{ height: item.displayHeight + 'px' }"
              mode="widthFix"
              lazy-load
            />
          </view>
          <view class="polaroid-bottom">
            <text class="polaroid-caption">{{ item.caption || ' ' }}</text>
            <text class="polaroid-date">{{ formatShortDate(item.takenAt) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载态 — 拍立得骨架 -->
    <view v-if="loading && allPhotos.length === 0" class="loading-state waterfall-container">
      <view class="waterfall-col">
        <SkeletonCard variant="polaroid" :height="280" />
        <SkeletonCard variant="polaroid" :height="360" />
      </view>
      <view class="waterfall-col">
        <SkeletonCard variant="polaroid" :height="320" />
        <SkeletonCard variant="polaroid" :height="260" />
      </view>
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
    <view v-else-if="allPhotos.length === 0 && !loading" class="empty-state">
      <text class="empty-emoji">🐶</text>
      <text class="empty-text">还没有照片</text>
      <text class="empty-hint">豆豆的照片正在赶来的路上~</text>
    </view>

    <!-- 到底了 -->
    <view v-else-if="!hasMore && allPhotos.length > 0" class="load-end">
      <view class="end-line" />
      <text class="load-end-text">— 已经到底啦 —</text>
      <view class="end-line" />
    </view>

    <!-- 加载更多 -->
    <view v-else-if="hasMore" class="load-more" @click="loadMore">
      <text class="load-more-text">加载更多</text>
      <text v-if="loading" class="load-more-hint">加载中...</text>
    </view>

    <!-- 底部安全区 -->
    <view class="safe-bottom" />
  </view>
</template>

<script>
import CustomNavbar from '@/components/CustomNavbar.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import { getDogPhotos, getDogPhotoTags, getTempFileUrls } from '@/common/cloud.js'

/** 瀑布流列宽 (rpx → px 换算是动态的，这里记录比例) */
const COL_WIDTH_RPX = 340 // 大致的列宽 rpx

export default {
  components: { CustomNavbar, SkeletonCard },
  data() {
    return {
      tags: ['全部'],
      activeTag: '全部',
      leftList: [],
      rightList: [],
      allPhotos: [],
      skip: 0,
      pageSize: 20,
      hasMore: true,
      loading: false,
      error: false,
    }
  },
  onLoad() {
    this.loadTags()
    this.loadPhotos()
  },
  onPullDownRefresh() {
    this.leftList = []
    this.rightList = []
    this.allPhotos = []
    this.skip = 0
    this.hasMore = true
    this.loadPhotos().finally(() => {
      uni.stopPullDownRefresh()
    })
  },
  onReachBottom() {
    this.loadMore()
  },
  methods: {
    async loadTags() {
      try {
        const tags = await getDogPhotoTags()
        if (tags && tags.length) {
          this.tags = tags
        }
      } catch (e) {
        console.log('加载标签失败', e)
      }
    },

    async loadPhotos() {
      if (this.loading) return
      this.loading = true
      this.error = false

      try {
        const tags = this.activeTag === '全部' ? [] : [this.activeTag]
        const photos = await getDogPhotos(this.pageSize, tags, this.skip)

        if (photos.length < this.pageSize) {
          this.hasMore = false
        }

        for (const p of photos) {
          if (p.image) {
            const urls = await getTempFileUrls([p.image])
            p.image = urls[0] || ''
          }
        }

        this.allPhotos = this.allPhotos.concat(photos)
        this.distributeToColumns(photos)
        this.skip += photos.length
      } catch (e) {
        console.error('加载照片失败', e)
        this.error = this.allPhotos.length === 0
        if (this.error) return
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    retry() {
      this.error = false
      this.loading = true
      this.loadPhotos()
    },

    /**
     * 瀑布流列分配算法
     * 根据图片宽高比计算在固定列宽下的显示高度，放入较矮的列
     */
    distributeToColumns(photos) {
      photos.forEach((p) => {
        // 根据宽高计算实际显示高度
        // 列宽 = COL_WIDTH_RPX (实际 px 由系统换算)
        // 显示高度 = (colWidth / width) * height
        let displayHeight = 300 // 默认高度
        if (p.width && p.height && p.width > 0) {
          displayHeight = Math.round((COL_WIDTH_RPX / p.width) * p.height)
        }

        p.displayHeight = displayHeight

        // 放入较矮的列
        const leftHeight = this.getColumnHeight(this.leftList)
        const rightHeight = this.getColumnHeight(this.rightList)

        if (leftHeight <= rightHeight) {
          this.leftList.push(p)
        } else {
          this.rightList.push(p)
        }
      })
    },

    /** 计算列的累计高度 */
    getColumnHeight(list) {
      return list.reduce((sum, item) => {
        return sum + (item.displayHeight || 300) + 70
        // +70 是拍立得底部留白 + 间距的估计值
      }, 0)
    },

    async loadMore() {
      if (this.hasMore && !this.loading) {
        await this.loadPhotos()
      }
    },

    filterByTag(tag) {
      if (this.activeTag === tag) return
      this.activeTag = tag
      this.leftList = []
      this.rightList = []
      this.allPhotos = []
      this.skip = 0
      this.hasMore = true
      this.loadPhotos()
    },

    openViewer(id) {
      const allIds = this.allPhotos.map((p) => p._id)
      uni.navigateTo({
        url: `/pages-sub/viewer/index?id=${id}&ids=${allIds.join(',')}`,
      })
    },

    formatShortDate(d) {
      if (!d) return ''
      const dt = new Date(d)
      return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, '0')}`
    },
  },
}
</script>

<style lang="scss" scoped>
.album-page {
  min-height: 100vh;
  background: $color-bg-page;
  padding-bottom: env(safe-area-inset-bottom);
}

/* ========== 标签筛选栏 ========== */
.tag-bar {
  padding: $spacing-sm 0;
  background: $color-bg-page;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tag-bar-inner {
  display: flex;
  gap: 12rpx;
  padding: 0 $spacing-md;
  white-space: nowrap;
}

.tag-item {
  display: inline-block;
  padding: 10rpx 28rpx;
  font-size: $font-caption;
  color: $color-text-secondary;
  background: $color-bg-card;
  border-radius: $radius-round;
  border: 1rpx solid $color-border;
  flex-shrink: 0;
  transition: all 0.2s ease;

  &.active {
    color: #fff;
    background: $color-primary;
    border-color: $color-primary;
  }
}

/* ========== 瀑布流 ========== */
.waterfall-container {
  display: flex;
  gap: 16rpx;
  padding: $spacing-sm $spacing-md;
}

.waterfall-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

/* ========== 拍立得卡片 ========== */
.polaroid-item {
  background: #fff;
  box-shadow: 2rpx 4rpx 20rpx rgba(0, 0, 0, 0.06);
  border-radius: 4rpx;
  overflow: hidden;
  transition: transform 0.2s ease;

  &:nth-child(odd) {
    transform: rotate(-0.8deg);
  }
  &:nth-child(even) {
    transform: rotate(1.2deg);
  }

  &:active {
    transform: scale(0.96) !important;
  }
}

.polaroid-photo {
  padding: 10rpx 10rpx 0 10rpx;
}

.polaroid-img {
  width: 100%;
  display: block;
  border-radius: 2rpx;
}

.polaroid-bottom {
  padding: 10rpx 16rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rpx;
}

.polaroid-caption {
  font-size: 20rpx;
  color: #B0A0A0;
  font-style: italic;
  text-align: center;
  line-height: 1.4;
}

.polaroid-date {
  font-size: 18rpx;
  color: #C4BABA;
}

/* ========== 加载态 ========== */
.loading-state {
  padding: $spacing-md;
}

/* ========== 加载更多 ========== */
.load-more {
  text-align: center;
  padding: $spacing-xl;
}

.load-more-text {
  font-size: $font-caption;
  color: $color-primary;
}

/* ========== 到底了 ========== */
.load-end {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: $spacing-xl;
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

/* ========== 空状态 ========== */
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

.empty-hint {
  font-size: $font-caption;
  color: $color-text-hint;
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
.error-text { font-size: $font-body; color: $color-text-secondary; }
.error-hint { font-size: $font-caption; color: $color-text-hint; margin-bottom: 16rpx; }
.retry-btn {
  padding: 16rpx 48rpx;
  background: $color-primary;
  border-radius: $radius-round;
  &:active { opacity: 0.8; }
}
.retry-text { font-size: $font-caption; color: #fff; }

.load-more-hint {
  display: block;
  font-size: $font-small;
  color: $color-text-hint;
  margin-top: 4rpx;
}

/* ========== 底部安全 ========== */
.safe-bottom {
  height: 40rpx;
}
</style>
