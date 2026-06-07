<script>
import { initCloud } from './common/cloud.js'

export default {
  onLaunch: function () {
    console.log('App Launch')
    // 初始化微信云开发
    // #ifdef MP-WEIXIN
    initCloud()
    // #endif
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
}
</script>

<style lang="scss">
/* 全局公共样式 */
@import '@/uni.scss';

/* 页面过渡动画 */
page {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10rpx); }
  to   { opacity: 1; transform: translateY(0); }
}

/* 通用工具类 */
.text-center { text-align: center; }
.text-secondary { color: $color-text-secondary; }
.text-hint { color: $color-text-hint; }

/* 通用卡片样式 */
.card {
  background: $color-bg-card;
  border-radius: $radius-md;
  box-shadow: $shadow-card;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
}
</style>
