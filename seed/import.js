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
    { key: 'dog_name', value: '海巴' },
    { key: 'dog_bio', value: '海巴是一只可爱的柯基犬，2023年来到我们身边。它有着标志性的大耳朵和短短的腿，每天最开心的事情就是出去玩和吃零食。虽然有时候调皮捣蛋，但看到它天真的大眼睛，所有的气都消了。' },
    { key: 'dog_birthday', value: new Date('2023-03-15') },
    { key: 'about_title', value: '关于我们' },
    { key: 'about_content', value: '这里记录的是我们和海巴的日常。\n\n生活不总是波澜壮阔，更多的是平凡日子里的小确幸——一起做饭的周末、带海巴去公园的午后、窝在沙发上看电影的夜晚。\n\n每一个瞬间都值得被记住，每一个平凡的日子都闪着光。\n\n感谢你出现在我的生命里，让普通的日子变得不再普通。' },
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
      title: '第一次见面，昆明 Day 1 🎱',
      content: '2025年6月6日，我们两个第一次见面啦！\n\n下午飞到昆明，放下行李就直奔蓝花楹，结果扑了个空——花期已经过了，枝头只剩零星几朵。虽然有点遗憾，但和你一起走在昆明的街头，心情还是好得不行。\n\n找了个台球室打了一会儿球，你打得呆呆的，我在旁边看着就觉得很开心。\n\n晚上一起吃的小锅米线真的好好吃！铜锅端上来的时候还咕嘟咕嘟冒着热气，汤底鲜香，米线滑嫩，一口下去整个人都暖了。\n\n第一次见面，没有想象中的紧张，更像是久别重逢。昆明这座城市，从今天开始有了特别的意义。',
      images: [],
      tags: ['昆明', '第一次见面', '美食', '旅行'],
      mood: 'excited',
      weather: 'sunny',
      location: '昆明',
      createdAt: new Date('2025-06-06T22:00:00'),
      updatedAt: new Date(),
      isPublished: true,
      viewCount: 0,
    },
    {
      type: 'daily',
      title: '昆明 Day 2，博物馆与汽锅鸡 🏛️',
      content: '6月7日，第二天在昆明。\n\n上午去了云南省博物馆，从恐龙化石到青铜器，再到民族服饰，逛得很过瘾。你在我旁边认真看展品的样子，比展品还好看。\n\n中午在官渡古镇吃了李记小锅米线，真的好好吃！比昨天的更浓郁，配料也给得足，我们俩都吃撑了。看来小锅米线可以列入昆明必吃清单。\n\n下午去了斗南花卉市场，花多到像是在逛花的海洋。然后去了翠湖公园，湖边的柳树随风飘着，一群红嘴鸥在湖面上飞来飞去。我们沿着湖慢慢走，聊了很多有的没的。\n\n晚餐吃了汽锅鸡，蒸汽凝结的汤汁清亮鲜美，鸡肉嫩滑。这道菜很合你的胃口，我们俩都吃了好多，盘子扫得干干净净。\n\n这样一起慢慢逛、慢慢吃，就是最理想的旅行了。',
      images: [
        'cloud://cloud1-d3g36bqez5e042506.636c-cloud1-d3g36bqez5e042506-1441063178/MVIMG_20250607_123457.jpg',
        'cloud://cloud1-d3g36bqez5e042506.636c-cloud1-d3g36bqez5e042506-1441063178/MVIMG_20250607_132754.jpg',
        'cloud://cloud1-d3g36bqez5e042506.636c-cloud1-d3g36bqez5e042506-1441063178/MVIMG_20250607_190952.jpg',
        'cloud://cloud1-d3g36bqez5e042506.636c-cloud1-d3g36bqez5e042506-1441063178/MVIMG_20250607_191232.jpg',
        'cloud://cloud1-d3g36bqez5e042506.636c-cloud1-d3g36bqez5e042506-1441063178/MVIMG_20250607_193350.jpg',
        'cloud://cloud1-d3g36bqez5e042506.636c-cloud1-d3g36bqez5e042506-1441063178/MVIMG_20250607_194003.jpg',
        'cloud://cloud1-d3g36bqez5e042506.636c-cloud1-d3g36bqez5e042506-1441063178/MVIMG_20250607_203116.jpg',
      ],
      tags: ['昆明', '博物馆', '美食', '旅行', '翠湖'],
      mood: 'happy',
      weather: 'sunny',
      location: '昆明',
      createdAt: new Date('2025-06-07T22:00:00'),
      updatedAt: new Date(),
      isPublished: true,
      viewCount: 0,
    },
    {
      type: 'daily',
      title: '昆明 Day 3，菌汤火锅与告别 🍄',
      content: '6月8日，在昆明的最后一天。\n\n中午去商场吃了菌汤火锅，各种叫不出名字的菌子下锅，汤底鲜美到不行。每一口都是云南的味道，超级满足。\n\n下午在商场里看到娃娃机，心血来潮换了50块钱的币。本来只想随便抓抓，结果运气爆棚，一个接一个地抓上来，最后数了数居然抓了十几个！你抱着那堆娃娃的样子可爱极了，路人都忍不住回头看。\n\n然后就要回去了。\n\n在机场的时候心里特别不舍。三天的时间过得太快，快到来不及把所有想去的地方都走一遍，来不及把所有想说的话都说出来。\n\n但没关系。这只是我们的开始。第一次见面，以后还会有很多很多次。\n\n昆明，下次再见。',
      images: [],
      tags: ['昆明', '菌汤火锅', '娃娃机', '告别', '旅行'],
      mood: 'grateful',
      weather: 'sunny',
      location: '昆明',
      createdAt: new Date('2025-06-08T22:00:00'),
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
    { image: IMG, width: 800, height: 1000, caption: '海边奔跑的海巴 🌊', tags: ['出去玩', '海边'], takenAt: new Date('2026-06-06T14:00:00'), createdAt: new Date(), sortOrder: 10, isFavorite: true },
    { image: IMG, width: 800, height: 1200, caption: '睡成一只小猪 🐷', tags: ['睡觉', '日常'], takenAt: new Date('2026-06-03T22:00:00'), createdAt: new Date(), sortOrder: 9, isFavorite: true },
    { image: IMG, width: 1000, height: 800, caption: '穿新衣服啦 👔', tags: ['日常', '衣服'], takenAt: new Date('2026-05-28T18:00:00'), createdAt: new Date(), sortOrder: 8, isFavorite: false },
    { image: IMG, width: 800, height: 1100, caption: '公园玩球的海巴 🎾', tags: ['出去玩', '公园'], takenAt: new Date('2026-05-25T16:00:00'), createdAt: new Date(), sortOrder: 7, isFavorite: true },
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
