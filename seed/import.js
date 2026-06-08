/**
 * 测试数据批量导入脚本 (v2 — 跳过清空，避免权限问题)
 *
 * 使用方法:
 *   1. 在微信开发者工具中打开本项目
 *   2. 打开调试器 → Console 面板
 *   3. 复制粘贴本文件全部内容到 Console 中
 *   4. 回车执行，等待完成
 *
 * 注意: 数据库权限设为「所有用户可读，仅创建者可写」即可
 *       如果集合中已有旧数据，需要手动在云控制台清空
 */

// ============================================================
// 1. 导入站点配置 (site_config)
// ============================================================
async function importSiteConfig() {
  console.log('📝 开始导入站点配置...')
  const db = wx.cloud.database()
  const coll = db.collection('site_config')

  const configs = [
    { key: 'cover_images', value: [] },
    { key: 'hero_quote', value: '记录我们的每一个瞬间 💕' },
    { key: 'dog_name', value: '豆豆' },
    { key: 'dog_bio', value: '豆豆是一只可爱的柯基犬，2023年来到我们身边。它有着标志性的大耳朵和短短的腿，每天最开心的事情就是出去玩和吃零食。虽然有时候调皮捣蛋，但看到它天真的大眼睛，所有的气都消了。' },
    { key: 'dog_birthday', value: new Date('2023-03-15') },
    { key: 'about_title', value: '关于我们' },
    { key: 'about_content', value: '这里记录的是我们和豆豆的日常。\n\n生活不总是波澜壮阔，更多的是平凡日子里的小确幸——一起做饭的周末、带豆豆去公园的午后、窝在沙发上看电影的夜晚。\n\n每一个瞬间都值得被记住，每一个平凡的日子都闪着光。\n\n感谢你出现在我的生命里，让普通的日子变得不再普通。' },
    { key: 'about_images', value: [] },
    { key: 'anniversary', value: '我们在一起的每一天都是纪念日 💝' },
    { key: 'footer_quote', value: '感谢你出现在我的生命里 💕' },
  ]

  let count = 0
  for (const c of configs) {
    try {
      await coll.add({ data: { ...c, updatedAt: new Date() } })
      count++
    } catch (e) {
      console.warn(`  ⚠️ 跳过 "${c.key}": ${e.message}`)
    }
  }
  console.log(`  ✅ 已导入 ${count} 条配置`)
}

// ============================================================
// 2. 导入日常动态 (posts)
// ============================================================
async function importPosts() {
  console.log('📝 开始导入日常动态...')
  const db = wx.cloud.database()
  const coll = db.collection('posts')

  const posts = [
    {
      type: 'daily',
      title: '豆豆第一次去海边 🌊',
      content: '今天天气超好，开车带豆豆去了海边！\n\n它第一次看到海浪的时候，先是愣了一下，然后就兴奋地在沙滩上跑来跑去，完全停不下来。沙子软软的，小短腿陷进去好多次，样子可滑稽了。\n\n在沙滩上遇到了一只金毛，两只狗狗玩得超开心。豆豆虽然腿短，但气势一点不输，追着金毛满沙滩跑。\n\n回来的路上它直接在车上睡着了，还打小呼噜，看来是真的玩累了。\n\n完美的一天！',
      images: [],
      tags: ['出游', '海边', '豆豆'],
      mood: 'happy',
      weather: 'sunny',
      location: '深圳湾公园',
      createdAt: new Date('2026-06-06T14:30:00'),
      updatedAt: new Date(),
      isPublished: true,
      viewCount: 0,
    },
    {
      type: 'daily',
      title: '周末烘焙日 🍰',
      content: '周末窝在家里，决定试试做抹茶千层蛋糕！\n\n说实话步骤真的好多——煎饼皮一张一张的，手快残了。但看着她期待的眼神，感觉再累也值得。\n\n成品虽然卖相一般（饼皮厚薄不一哈哈），但味道意外地好。抹茶的微苦配奶油的甜，刚刚好。\n\n豆豆在旁边眼巴巴地看着，趁着我们不注意偷偷舔了一口掉在地上的奶油，被发现了还装无辜。\n\n下次挑战提拉米苏！',
      images: [],
      tags: ['烘焙', '周末', '美食'],
      mood: 'calm',
      weather: 'cloudy',
      location: '家',
      createdAt: new Date('2026-06-01T18:00:00'),
      updatedAt: new Date(),
      isPublished: true,
      viewCount: 0,
    },
    {
      type: 'daily',
      title: '豆豆的新衣服 👔',
      content: '在网上给豆豆买了一件小恐龙造型的衣服，今天到货了！\n\n给它穿上的时候超级配合（可能是因为知道穿完有零食吃）。穿上之后整个狗狗变成了绿色的小恐龙，尾巴的地方还有一个可爱的尖角。\n\n穿出去遛弯的时候路人都笑疯了，还有小朋友跑过来问是不是真的恐龙。豆豆还挺骄傲的，抬头挺胸走得特别神气。\n\n不过回家之后就开始用嘴扯衣服了，看来帅气也是有代价的哈哈。',
      images: [],
      tags: ['豆豆', '日常', '萌宠'],
      mood: 'excited',
      weather: 'sunny',
      location: '家',
      createdAt: new Date('2026-05-28T20:00:00'),
      updatedAt: new Date(),
      isPublished: true,
      viewCount: 0,
    },
    {
      type: 'daily',
      title: '雨天的午后 🌧️',
      content: '窗外下着小雨，我们窝在沙发上看了三部电影。\n\n豆豆趴在脚边睡得四仰八叉的，偶尔爪子抽动一下，大概是在梦里追着什么吧。\n\n点了外卖炸鸡配啤酒，她喝奶茶我喝啤酒。没有特别的安排，就是简简单单地待在一起。\n\n但有时候觉得，这样的时刻才是最珍贵的。不用去很远的地方，不用做什么惊天动地的事。只要你在身边，豆豆在脚下，就很好。',
      images: [],
      tags: ['日常', '雨天', '感悟'],
      mood: 'grateful',
      weather: 'rainy',
      location: '家',
      createdAt: new Date('2026-05-20T16:00:00'),
      updatedAt: new Date(),
      isPublished: true,
      viewCount: 0,
    },
    {
      type: 'daily',
      title: '豆豆学会新技能 🎾',
      content: '花了两周时间教会了豆豆一个新技能——把玩具球叼回来放在指定的小篮子里！\n\n刚开始的时候它完全不明白要干嘛，只会把球叼着到处跑。后来用零食一步步引导，先让它叼球、再让它走到篮子边、最后松口放进去。\n\n今天终于连贯地完成了整套动作！它完成之后还自己跑过来要奖励，那小表情得意得不得了。\n\n下次打算教它按铃铛，不知道要花多久。',
      images: [],
      tags: ['豆豆', '训练', '日常'],
      mood: 'excited',
      weather: 'sunny',
      location: '家',
      createdAt: new Date('2026-05-15T12:00:00'),
      updatedAt: new Date(),
      isPublished: true,
      viewCount: 0,
    },
    {
      type: 'daily',
      title: '一起去逛花市 🌸',
      content: '周末起了个大早去逛花市，买了一大束向日葵和几盆多肉。\n\n她挑花的时候超认真，每一盆都要仔细看半天。最后选了拼色的康乃馨和一些尤加利叶，说回去搭在一起好看。\n\n豆豆在花市里也超开心，对每一朵花都要凑上去闻一闻，被花粉呛到打了个喷嚏，旁边的花摊老板都被逗笑了。\n\n回到家她把花插好摆在餐桌上，整个房间一下子有了生气。生活中的小美好，大概就是这样吧。',
      images: [],
      tags: ['出游', '花市', '周末'],
      mood: 'happy',
      weather: 'sunny',
      location: '南山花卉市场',
      createdAt: new Date('2026-05-08T10:00:00'),
      updatedAt: new Date(),
      isPublished: true,
      viewCount: 0,
    },
    {
      type: 'daily',
      title: '520 特别的一天 💝',
      content: '5月20号，提前下班去买了花和蛋糕。\n\n把家里简单布置了一下——一些小灯串、一张手写的卡片、还有她最爱的草莓蛋糕。虽然不算什么大惊喜，但看到她进门时眼睛亮起来的样子，觉得一切都值了。\n\n豆豆也收到了它的礼物：一个新的发声玩具。它叼着玩具在屋子里跑来跑去，完全停不下来。\n\n晚上一起做了顿饭，聊了很多有的没的。\n\n爱一个人，大概就是想把每一件小事都变成仪式感吧。',
      images: [],
      tags: ['节日', '520', '仪式感'],
      mood: 'love',
      weather: 'sunny',
      location: '家',
      createdAt: new Date('2026-05-20T22:00:00'),
      updatedAt: new Date(),
      isPublished: true,
      viewCount: 0,
    },
  ]

  let count = 0
  for (const p of posts) {
    try {
      await coll.add({ data: p })
      count++
    } catch (e) {
      console.warn(`  ⚠️ 跳过 "${p.title}": ${e.message}`)
    }
  }
  console.log(`  ✅ 已导入 ${count} 条动态`)
}

// ============================================================
// 3. 导入狗狗照片 (dog_photos)
//    ⚠️ 照片 image 字段暂时为空，后续上传图片到云存储后填入 fileID
// ============================================================
async function importDogPhotos() {
  console.log('📝 开始导入狗狗照片...')
  const db = wx.cloud.database()
  const coll = db.collection('dog_photos')

  const IMG = ''

  const photos = [
    { image: IMG, width: 800, height: 1000, caption: '海边奔跑的豆豆 🌊', tags: ['出去玩', '海边'], takenAt: new Date('2026-06-06T14:00:00'), createdAt: new Date(), sortOrder: 10, isFavorite: true },
    { image: IMG, width: 800, height: 1200, caption: '睡成一只小猪 🐷', tags: ['睡觉', '日常'], takenAt: new Date('2026-06-03T22:00:00'), createdAt: new Date(), sortOrder: 9, isFavorite: true },
    { image: IMG, width: 1000, height: 800, caption: '穿新衣服啦 👔', tags: ['日常', '衣服'], takenAt: new Date('2026-05-28T18:00:00'), createdAt: new Date(), sortOrder: 8, isFavorite: false },
    { image: IMG, width: 800, height: 1100, caption: '公园玩球的豆豆 🎾', tags: ['出去玩', '公园'], takenAt: new Date('2026-05-25T16:00:00'), createdAt: new Date(), sortOrder: 7, isFavorite: true },
    { image: IMG, width: 900, height: 900, caption: '洗澡后的委屈脸 🛁', tags: ['洗澡', '日常'], takenAt: new Date('2026-05-18T19:00:00'), createdAt: new Date(), sortOrder: 6, isFavorite: false },
    { image: IMG, width: 800, height: 1050, caption: '花市里的小探险家 🌸', tags: ['出去玩', '花市'], takenAt: new Date('2026-05-08T11:00:00'), createdAt: new Date(), sortOrder: 5, isFavorite: true },
    { image: IMG, width: 1000, height: 750, caption: '收到新玩具超开心 🎁', tags: ['日常', '玩具'], takenAt: new Date('2026-05-20T20:00:00'), createdAt: new Date(), sortOrder: 4, isFavorite: false },
    { image: IMG, width: 800, height: 1150, caption: '沙发上发呆的午后 ☀️', tags: ['睡觉', '日常'], takenAt: new Date('2026-04-30T15:00:00'), createdAt: new Date(), sortOrder: 3, isFavorite: false },
  ]

  let count = 0
  for (const p of photos) {
    try {
      await coll.add({ data: p })
      count++
    } catch (e) {
      console.warn(`  ⚠️ 跳过 "${p.caption}": ${e.message}`)
    }
  }
  console.log(`  ✅ 已导入 ${count} 条照片记录`)
}

// ============================================================
// 执行导入
// ============================================================
async function run() {
  console.log('🚀 开始导入测试数据...\n')
  try {
    await importSiteConfig()
    console.log('')
    await importPosts()
    console.log('')
    await importDogPhotos()
    console.log('\n🎉 全部导入完成！')
    console.log('💡 提示: dog_photos 的 image 字段为空，上传照片到云存储后')
    console.log('   将 fileID 填入对应记录的 image 字段即可显示。')
  } catch (e) {
    console.error('❌ 导入失败:', e)
  }
}

run()
