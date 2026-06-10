/**
 * 云函数：获取云存储临时链接
 * 以管理员权限调用 getTempFileURL，不受客户端存储权限限制
 */
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const { fileList = [] } = event

  if (!fileList.length) {
    return { code: 0, data: [] }
  }

  try {
    const res = await cloud.getTempFileURL({ fileList })
    const urls = res.fileList.map(f => f.tempFileURL || '')
    return { code: 0, data: urls }
  } catch (e) {
    console.error('getTempFileURL 失败', e)
    return { code: -1, message: e.message, data: [] }
  }
}
