/**
 * 单独导入南京记录脚本
 *
 * 使用方法:
 *   1. 在微信开发者工具中打开本项目
 *   2. 打开调试器 → Console 面板
 *   3. 复制粘贴本文件全部内容到 Console 中
 *   4. 回车执行，等待完成
 *
 * 注意: 如果该记录已存在，需要先在云控制台手动删除
 */

async function importNanjing() {
  console.log('📝 开始导入南京记录...')
  const db = wx.cloud.database()
  const coll = db.collection('posts')

  const post = {
    type: 'daily',
    title: '第一次来南京，金陵五日 🏯',
    content: '2025年7月5日，第一次来你的城市。\n\n上午去了红山动物园，看到了好多可爱的小动物。红山的动物们都养得特别好，园区设计也很用心，我们俩逛得不亦乐乎。\n\n下午去了南京博物院，在历史馆里穿梭千年，每一件文物都让人惊叹。晚上还在里面看了苏超比赛，第一次在博物馆里看球，这种奇妙的反差感大概只有和你一起才会有了。还看到了那只网红马，拍了好多照片。\n\n之后去了鸡鸣寺，古老的寺庙在夕阳下格外静谧。路过了梧桐大道，两旁的梧桐枝叶繁茂，阳光透过树叶洒下来斑斑驳驳，走在下面特别浪漫。也去新街口看了中山像，人来人往中那座雕像静静矗立，见证了这座城市的变迁。\n\n最后在南京站玄武湖边，碰到了一只特别可爱的小狗！它在玩瓶子跑来跑去，毛茸茸的一团，我们蹲下来跟它玩了很久。湖风吹过来，很舒服。\n\n南京，因为有你，从一座城市变成了一个特别的地方。\n\n对不起，让你伤心的离开。',
    images: [
      'cloud://cloud1-d3g36bqez5e042506.636c-cloud1-d3g36bqez5e042506-1441063178/250705/1.jpg',
      'cloud://cloud1-d3g36bqez5e042506.636c-cloud1-d3g36bqez5e042506-1441063178/250705/4.jpg',
      'cloud://cloud1-d3g36bqez5e042506.636c-cloud1-d3g36bqez5e042506-1441063178/250705/5.jpg',
      'cloud://cloud1-d3g36bqez5e042506.636c-cloud1-d3g36bqez5e042506-1441063178/250705/6.jpg',
      'cloud://cloud1-d3g36bqez5e042506.636c-cloud1-d3g36bqez5e042506-1441063178/250705/7.jpg',
      'cloud://cloud1-d3g36bqez5e042506.636c-cloud1-d3g36bqez5e042506-1441063178/250705/8.jpg',
      'cloud://cloud1-d3g36bqez5e042506.636c-cloud1-d3g36bqez5e042506-1441063178/250705/9.jpg',
      'cloud://cloud1-d3g36bqez5e042506.636c-cloud1-d3g36bqez5e042506-1441063178/250705/10.jpg',
      'cloud://cloud1-d3g36bqez5e042506.636c-cloud1-d3g36bqez5e042506-1441063178/250705/11.jpg',
      'cloud://cloud1-d3g36bqez5e042506.636c-cloud1-d3g36bqez5e042506-1441063178/250705/12.jpg',
      'cloud://cloud1-d3g36bqez5e042506.636c-cloud1-d3g36bqez5e042506-1441063178/250705/13.jpg',
      'cloud://cloud1-d3g36bqez5e042506.636c-cloud1-d3g36bqez5e042506-1441063178/250705/2.jpg',
      'cloud://cloud1-d3g36bqez5e042506.636c-cloud1-d3g36bqez5e042506-1441063178/250705/14.jpg',
      'cloud://cloud1-d3g36bqez5e042506.636c-cloud1-d3g36bqez5e042506-1441063178/250705/15.jpg',
      'cloud://cloud1-d3g36bqez5e042506.636c-cloud1-d3g36bqez5e042506-1441063178/250705/3.jpg',
    ],
    tags: ['南京', '红山动物园', '南京博物院', '鸡鸣寺', '梧桐大道', '玄武湖', '旅行'],
    mood: 'happy',
    weather: 'sunny',
    location: '南京',
    createdAt: new Date('2025-07-05T22:00:00'),
    updatedAt: new Date(),
    isPublished: true,
    viewCount: 0,
  }

  try {
    const res = await coll.add({ data: post })
    console.log(`  ✅ 已导入: ${post.title}`)
    console.log(`  📋 记录 _id: ${res._id}`)
  } catch (e) {
    console.error(`  ❌ 导入失败: ${e.message}`)
  }
}

importNanjing()
