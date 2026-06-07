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
 * @param {string[]} fileIds
 * @returns {Promise<string[]>} 临时链接数组
 */
export async function getTempFileUrls(fileIds) {
  if (!fileIds || fileIds.length === 0) return []
  const res = await wx.cloud.getTempFileURL({ fileList: fileIds })
  return res.fileList.map(f => f.tempFileURL || '')
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
export async function getDogPhotos() { return [] }
export async function getDogPhotoTags() { return ['全部'] }
export async function getSiteConfig() { return {} }
export async function getConfigValue() { return null }
export async function getTempFileUrls() { return [] }
// #endif
