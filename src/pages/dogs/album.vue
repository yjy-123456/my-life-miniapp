<template>
  <view class="album-page">
    <CustomNavbar title="狗狗相册" />
    <!-- 标签筛选 -->
    <scroll-view class="tag-bar" scroll-x enable-flex>
      <view v-for="tag in tags" :key="tag"
        class="tag-item" :class="{ active: activeTag === tag }"
        @click="filterByTag(tag)">{{ tag }}</view>
    </scroll-view>

    <!-- 拍立得瀑布流 -->
    <view class="waterfall">
      <view class="col">
        <view v-for="item in leftList" :key="item._id" class="polaroid-item" @click="openViewer(item._id)">
          <image class="polaroid-img" :src="item.image" mode="widthFix" />
          <view class="polaroid-caption">{{ item.caption || '' }}</view>
        </view>
      </view>
      <view class="col">
        <view v-for="item in rightList" :key="item._id" class="polaroid-item" @click="openViewer(item._id)">
          <image class="polaroid-img" :src="item.image" mode="widthFix" />
          <view class="polaroid-caption">{{ item.caption || '' }}</view>
        </view>
      </view>
    </view>
    <view v-if="hasMore" class="load-more" @click="loadMore">
      <text class="load-more-text">加载更多</text>
    </view>
  </view>
</template>

<script>
import CustomNavbar from '@/components/CustomNavbar.vue'
import { getDogPhotos, getDogPhotoTags, getTempFileUrls } from '@/common/cloud.js'

export default {
  components: { CustomNavbar },
  data() {
    return { tags: ['全部'], activeTag: '全部', leftList: [], rightList: [],
      allPhotos: [], skip: 0, pageSize: 20, hasMore: true, loading: false }
  },
  onLoad() { this.loadTags(); this.loadPhotos() },
  onReachBottom() { this.loadMore() },
  methods: {
    async loadTags() {
      try { const tags = await getDogPhotoTags(); if (tags.length) this.tags = tags } catch (e) {}
    },
    async loadPhotos() {
      if (this.loading) return; this.loading = true
      try {
        const tags = this.activeTag === '全部' ? [] : [this.activeTag]
        const photos = await getDogPhotos(this.pageSize, tags, this.skip)
        if (photos.length < this.pageSize) this.hasMore = false
        for (const p of photos) {
          if (p.image) {
            const urls = await getTempFileUrls([p.image])
            p.image = urls[0] || ''
          }
        }
        this.distributeToColumns(photos)
        this.skip += photos.length
      } catch (e) { console.error('加载照片失败', e) }
      this.loading = false
    },
    distributeToColumns(photos) {
      photos.forEach(p => {
        // 模拟高度计算，实际应从图片宽高计算
        if (this.leftList.length <= this.rightList.length) {
          this.leftList.push(p)
        } else {
          this.rightList.push(p)
        }
      })
    },
    async loadMore() { if (this.hasMore) await this.loadPhotos() },
    filterByTag(tag) {
      if (this.activeTag === tag) return
      this.activeTag = tag; this.leftList = []; this.rightList = []; this.skip = 0; this.hasMore = true
      this.loadPhotos()
    },
    openViewer(id) {
      const ids = [...this.leftList, ...this.rightList].map(p => p._id)
      uni.navigateTo({ url: `/pages-sub/viewer/index?id=${id}&ids=${ids.join(',')}` })
    }
  }
}
</script>

<style lang="scss" scoped>
.album-page { min-height: 100vh; background: $color-bg-page; }
.tag-bar { white-space: nowrap; padding: $spacing-sm $spacing-md; display: flex; gap: 12rpx; }
.tag-item { display: inline-block; padding: 10rpx 28rpx; font-size: $font-caption;
  color: $color-text-secondary; background: $color-bg-card; border-radius: $radius-round;
  border: 1rpx solid $color-border; flex-shrink: 0;
  &.active { color: #fff; background: $color-primary; border-color: $color-primary; } }
.waterfall { display: flex; gap: 12rpx; padding: 0 $spacing-md; }
.col { flex: 1; display: flex; flex-direction: column; gap: 12rpx; }
.polaroid-item { background: #fff; padding: 10rpx 10rpx 36rpx 10rpx;
  box-shadow: 2rpx 4rpx 16rpx rgba(0,0,0,0.06); border-radius: 4rpx;
  &:nth-child(odd) { transform: rotate(-1deg); } &:nth-child(even) { transform: rotate(1deg); }
  &:active { transform: scale(0.97); transition: transform 0.15s ease; } }
.polaroid-img { width: 100%; display: block; border-radius: 2rpx; }
.polaroid-caption { text-align: center; font-size: 20rpx; color: #B0A0A0;
  font-style: italic; margin-top: 8rpx; }
.load-more { text-align: center; padding: $spacing-xl; }
.load-more-text { font-size: $font-caption; color: $color-primary; }
</style>
