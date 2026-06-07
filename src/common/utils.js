/**
 * 公共工具函数 — 「她和它的日常」
 */

/**
 * 格式化日期 — 智能显示
 * @param {Date|string|number} d 日期
 * @param {string} fallback 无效日期时的回退文字
 */
export function formatDate(d, fallback = '') {
  if (!d) return fallback
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return fallback

  const now = new Date()
  const diff = now - dt
  const oneDay = 86400000
  const oneHour = 3600000

  if (diff < oneHour) {
    const mins = Math.floor(diff / 60000)
    return mins <= 1 ? '刚刚' : `${mins}分钟前`
  }
  if (diff < oneDay) {
    const h = dt.getHours().toString().padStart(2, '0')
    const m = dt.getMinutes().toString().padStart(2, '0')
    return `今天 ${h}:${m}`
  }
  if (diff < 2 * oneDay) {
    const h = dt.getHours().toString().padStart(2, '0')
    const m = dt.getMinutes().toString().padStart(2, '0')
    return `昨天 ${h}:${m}`
  }
  if (dt.getFullYear() === now.getFullYear()) {
    return `${dt.getMonth() + 1}月${dt.getDate()}日`
  }
  return `${dt.getFullYear()}年${dt.getMonth() + 1}月${dt.getDate()}日`
}

/**
 * 格式化完整日期
 */
export function formatFullDate(d, fallback = '') {
  if (!d) return fallback
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return fallback
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  return `${dt.getFullYear()}年${dt.getMonth() + 1}月${dt.getDate()}日 星期${weekDays[dt.getDay()]}`
}

/**
 * 格式化短日期 yyyy.mm
 */
export function formatShortMonth(d, fallback = '') {
  if (!d) return fallback
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return fallback
  return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, '0')}`
}

/**
 * 天气 icon 映射
 */
export function weatherIcon(w) {
  const map = { sunny: '☀️', cloudy: '☁️', rainy: '🌧️', snowy: '❄️', windy: '💨' }
  return map[w] || ''
}

/**
 * 天气文字
 */
export function weatherLabel(w) {
  const map = { sunny: '晴天', cloudy: '多云', rainy: '雨天', snowy: '下雪', windy: '大风' }
  return map[w] || w || ''
}

/**
 * 心情 icon 映射
 */
export function moodIcon(m) {
  const map = { happy: '😊', calm: '😌', excited: '🎉', grateful: '🙏', love: '💕', sad: '😢' }
  return map[m] || ''
}

/**
 * 心情文字
 */
export function moodLabel(m) {
  const map = { happy: '开心', calm: '平静', excited: '兴奋', grateful: '感恩', love: '幸福', sad: '难过' }
  return map[m] || m || ''
}

/**
 * 文本截断
 */
export function truncate(text, len = 50) {
  if (!text) return ''
  return text.length > len ? text.slice(0, len) + '...' : text
}

/**
 * Toast 错误提示 (统一封装)
 * @param {string} msg 错误消息
 * @param {Error|any} err 原始错误对象 (仅 console 输出)
 */
export function showError(msg = '加载失败', err = null) {
  if (err) console.error(msg, err)
  uni.showToast({ title: msg, icon: 'none', duration: 2000 })
}

/**
 * 检查网络状态
 * @returns {Promise<boolean>} 是否联网
 */
export function checkNetwork() {
  return new Promise((resolve) => {
    uni.getNetworkType({
      success: (res) => resolve(res.networkType !== 'none'),
      fail: () => resolve(true), // 获取失败默认认为有网
    })
  })
}

/**
 * 图片加载失败时的占位处理
 * 返回默认占位图的路径
 */
export function imagePlaceholder() {
  return '/static/logo.png'
}

/**
 * 图片加载错误处理 (用于 @error 事件)
 * @param {Event} e 错误事件
 * @param {string} placeholder 占位图路径
 */
export function onImageError(e, placeholder) {
  // 在小程序中，可以通过事件设置 src
  // 这需要在模板中配合使用
  console.warn('图片加载失败', e)
}

/**
 * 生成瀑布流显示高度
 * @param {number} width  图片原始宽度
 * @param {number} height 图片原始高度
 * @param {number} colWidth 列宽 (rpx)
 * @returns {number} displayHeight (rpx)
 */
export function calcDisplayHeight(width, height, colWidth = 340) {
  if (!width || !height || width <= 0) return 300
  return Math.round((colWidth / width) * height)
}
