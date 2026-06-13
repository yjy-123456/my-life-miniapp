/**
 * 微信云开发 SDK 封装
 * 使用条件编译，仅在微信小程序环境下生效
 * 初期数据管理使用云开发控制台，此模块供小程序端读取数据
 */

// #ifdef MP-WEIXIN

/** 云环境 ID，需在微信云开发控制台获取后填入 */
const CLOUD_ENV_ID = 'cloud1-d3g36bqez5e042506'

/** 数据库集合名常量 */
const COLLECTIONS = {
  POSTS: 'posts',
  DOG_PHOTOS: 'dog_photos',
  SITE_CONFIG: 'site_config'
}

/**
 * 初始化云开发环境
 * 需在 App.vue onLaunch 中调用
 */
export function initCloud() {
  wx.cloud.init({
    env: CLOUD_ENV_ID,
    traceUser: true
  })
}

const db = () => wx.cloud.database()
const _ = () => db().command

// ============================================================
//  日常动态 (posts)
// ============================================================

/**
 * 获取动态列表 (分页)
 * @param {number} pageSize - 每页条数，默认 10
 * @param {Date}   after    - 游标: 上次最后一条的 createdAt
 */
export async function getPosts(pageSize = 10, after = null) {
  let query = db().collection(COLLECTIONS.POSTS)
    .where({ isPublished: true })
    .orderBy('createdAt', 'desc')
    .limit(pageSize)

  if (after) {
    query = query.where({
      isPublished: true,
      createdAt: _().lt(after)
    })
  }

  const res = await query.get()
  return res.data
}

/** 获取单条动态详情 */
export async function getPostById(id) {
  const res = await db().collection(COLLECTIONS.POSTS).doc(id).get()
  return res.data
}

/**
 * 获取比指定时间更新的紧挨着的一条动态（下一篇）
 * @param {Date} createdAt - 当前文章的 createdAt
 */
export async function getNewerPost(createdAt) {
  const res = await db().collection(COLLECTIONS.POSTS)
    .where({
      isPublished: true,
      createdAt: _().gt(createdAt)
    })
    .orderBy('createdAt', 'asc')
    .limit(1)
    .get()
  return res.data[0] || null
}

// ============================================================
//  狗狗照片 (dog_photos)
// ============================================================

/**
 * 获取狗狗照片列表 (瀑布流用)
 * @param {number}   pageSize - 每页条数
 * @param {string[]} tags     - 标签筛选 (可选)
 * @param {number}   skip     - 跳过的条数
 */
export async function getDogPhotos(pageSize = 20, tags = [], skip = 0) {
  let query = db().collection(COLLECTIONS.DOG_PHOTOS)

  if (tags.length > 0) {
    query = query.where({ tags: _().in(tags) })
  }

  const res = await query
    .orderBy('sortOrder', 'desc')
    .orderBy('takenAt', 'desc')
    .skip(skip)
    .limit(pageSize)
    .get()

  return res.data
}

/** 获取所有照片标签 (用于标签筛选栏) */
export async function getDogPhotoTags() {
  const res = await db().collection(COLLECTIONS.DOG_PHOTOS)
    .field({ tags: true })
    .get()

  // 合并去重所有标签
  const tagSet = new Set()
  res.data.forEach(item => {
    if (Array.isArray(item.tags)) {
      item.tags.forEach(t => tagSet.add(t))
    }
  })
  return ['全部', ...Array.from(tagSet)]
}

// ============================================================
//  站点配置 (site_config)
// ============================================================

/** 获取站点配置 (批量) */
export async function getSiteConfig(keys = []) {
  let query = db().collection(COLLECTIONS.SITE_CONFIG)
  if (keys.length > 0) {
    query = query.where({ key: _().in(keys) })
  }
  const res = await query.get()

  // 转成 { key: value } 格式
  const config = {}
  res.data.forEach(item => { config[item.key] = item.value })
  return config
}

/** 获取单个配置项 */
export async function getConfigValue(key) {
  const res = await db().collection(COLLECTIONS.SITE_CONFIG)
    .where({ key })
    .limit(1)
    .get()
  return res.data[0]?.value ?? null
}

// ============================================================
//  云存储
// ============================================================

/**
 * 获取临时文件链接 (云存储 fileID → 临时 URL)
 * 通过云函数中转，以管理员权限调用，不受客户端存储权限限制
 * @param {string[]} fileIds
 * @returns {Promise<string[]>} 临时链接数组
 */
export async function getTempFileUrls(fileIds) {
  if (!fileIds || fileIds.length === 0) return []

  // 过滤掉无效的 fileID：必须是 cloud:// 开头
  const validIds = fileIds.filter(id => {
    if (!id || typeof id !== 'string') return false
    if (!id.startsWith('cloud://')) {
      console.warn('⚠️ 无效的 fileID (不是 cloud:// 开头):', id)
      return false
    }
    return true
  })

  if (validIds.length === 0) return []

  try {
    // 分批调用云函数：每次最多 50 个
    const batchSize = 50
    const results = []

    for (let i = 0; i < validIds.length; i += batchSize) {
      const batch = validIds.slice(i, i + batchSize)
      const res = await wx.cloud.callFunction({
        name: 'getTempUrls',
        data: { fileList: batch }
      })

      if (res.result && res.result.code === 0) {
        results.push(...res.result.data)
      } else {
        console.warn('⚠️ 云函数返回异常:', res.result)
        // 补上对应数量的空字符串，保持索引对齐
        results.push(...batch.map(() => ''))
      }
    }

    // 为原始 fileIds 数组中的无效 ID 补上空字符串
    const resultMap = {}
    validIds.forEach((id, idx) => { resultMap[id] = results[idx] || '' })

    return fileIds.map(id => {
      if (resultMap.hasOwnProperty(id)) return resultMap[id]
      return '' // 无效 ID 返回空字符串
    })
  } catch (e) {
    console.error('❌ getTempFileUrls 调用失败:', e)
    // 返回空数组，调用方已有兜底处理
    return fileIds.map(() => '')
  }
}

// #endif

// ============================================================
//  H5 / 其他平台 兼容 (兜底)
// ============================================================

// #ifndef MP-WEIXIN
// H5 环境下使用静态数据或远程 HTTP API
export function initCloud() {
  console.log('非微信小程序环境，跳过云开发初始化')
}

export async function getPosts() { return [] }
export async function getPostById() { return null }
export async function getNewerPost() { return null }
export async function getDogPhotos() { return [] }
export async function getDogPhotoTags() { return ['全部'] }
export async function getSiteConfig() { return {} }
export async function getConfigValue() { return null }
export async function getTempFileUrls() { return [] }
// #endif
