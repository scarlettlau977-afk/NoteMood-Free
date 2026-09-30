/* Emotion Earth 的演示数据。所有点位与文字都是合成示例，不代表真实人群调查。 */
window.EMOTION_CONFIG = {
  moods: {
    joy:     { label: '开心', color: '#eacb79', messages: ['今天收到了期待很久的消息。','和喜欢的人散步，风刚刚好。','完成了一个拖了很久的小目标。','下班路上看到晚霞，心情亮了一点。'] },
    calm:    { label: '平静', color: '#83c4d2', messages: ['泡了一杯茶，慢慢把今天过完。','窗边的雨声让人安心。','今天没有特别的事，也很好。','给自己留了一段安静的时间。'] },
    sad:     { label: '难过', color: '#6f89ba', messages: ['有些话想了很久，还是没能说出口。','今天有一点想念从前。','心里像下了一场很轻的雨。','我需要一点时间整理自己。'] },
    anxiety: { label: '焦虑', color: '#a88be0', messages: ['最近事情挤在一起，有点喘不过气。','总担心还没发生的事。','想把每件事都做好，结果有些累。','希望明天能比今天清楚一点。'] },
    angry:   { label: '愤怒', color: '#df7779', messages: ['今天遇到一些不公平的事。','我需要先离开一会儿，冷静下来。','有些边界，希望能被认真对待。'] },
    lonely:  { label: '孤独', color: '#777aa9', messages: ['周围很热闹，还是觉得有点远。','想找个人说说话，又不知道从哪里开始。','今晚想有人记得问一句还好吗。'] },
    hope:    { label: '希望', color: '#89b99d', messages: ['事情还没有答案，但我愿意再试一次。','一点点往前，也算在前进。','我相信会遇到新的可能。'] },
    tired:   { label: '疲惫', color: '#c6b985', messages: ['今天先到这里吧，剩下的明天再说。','只是有点累，想好好睡一觉。','努力了很久，现在想停一停。'] }
  },
  /* 每个城市的权重和情绪比例共同决定合成星点的数量与颜色。 */
  cities: [
    {country:'中国',region:'中国东部',city:'Beijing',lat:39.9042,lon:116.4074,count:88,weights:{anxiety:48,joy:15,calm:10,sad:10,angry:5,lonely:5,hope:4,tired:3}},
    {country:'中国',region:'中国东部',city:'Shanghai',lat:31.2304,lon:121.4737,count:92,weights:{anxiety:43,joy:18,calm:12,sad:8,angry:5,lonely:5,hope:5,tired:4}},
    {country:'中国',region:'中国东部',city:'Guangzhou',lat:23.1291,lon:113.2644,count:58,weights:{anxiety:37,joy:20,calm:15,sad:8,angry:5,lonely:4,hope:7,tired:4}},
    {country:'中国',region:'中国东部',city:'Shenzhen',lat:22.5431,lon:114.0579,count:65,weights:{anxiety:42,joy:18,calm:12,sad:8,angry:6,lonely:5,hope:5,tired:4}},
    {country:'中国',region:'中国东部',city:'Hangzhou',lat:30.2741,lon:120.1551,count:44,weights:{anxiety:34,joy:19,calm:17,sad:8,angry:4,lonely:5,hope:8,tired:5}},
    {country:'中国',region:'中国东部',city:'Nanjing',lat:32.0603,lon:118.7969,count:36,weights:{anxiety:32,joy:18,calm:18,sad:9,angry:5,lonely:5,hope:8,tired:5}},
    {country:'中国',region:'中国东部',city:'Qingdao',lat:36.0671,lon:120.3826,count:28,weights:{anxiety:28,joy:19,calm:21,sad:8,angry:4,lonely:5,hope:10,tired:5}},
    {country:'中国',region:'中国中部',city:'Wuhan',lat:30.5928,lon:114.3055,count:39,weights:{anxiety:27,joy:17,calm:22,sad:9,angry:5,lonely:5,hope:10,tired:5}},
    {country:'中国',region:'中国中部',city:'Changsha',lat:28.2282,lon:112.9388,count:30,weights:{anxiety:24,joy:18,calm:24,sad:8,angry:4,lonely:5,hope:12,tired:5}},
    {country:'中国',region:'中国中部',city:'Chengdu',lat:30.5728,lon:104.0668,count:47,weights:{anxiety:21,joy:21,calm:25,sad:8,angry:4,lonely:5,hope:11,tired:5}},
    {country:'中国',region:'中国西部',city:'Xi’an',lat:34.3416,lon:108.9398,count:33,weights:{anxiety:20,joy:19,calm:27,sad:8,angry:4,lonely:5,hope:12,tired:5}},
    {country:'中国',region:'中国西部',city:'Lhasa',lat:29.652,lon:91.1721,count:17,weights:{anxiety:12,joy:19,calm:31,sad:7,angry:3,lonely:5,hope:17,tired:6}},
    {country:'中国',region:'中国西部',city:'Urumqi',lat:43.8256,lon:87.6168,count:19,weights:{anxiety:15,joy:18,calm:29,sad:7,angry:4,lonely:5,hope:16,tired:6}},
    {country:'中国',region:'中国西部',city:'Kunming',lat:25.0389,lon:102.7183,count:23,weights:{anxiety:14,joy:22,calm:29,sad:7,angry:3,lonely:4,hope:16,tired:5}},
    {country:'United States',region:'North America',city:'New York',lat:40.7128,lon:-74.006,count:51,weights:{anxiety:25,joy:20,calm:16,sad:10,angry:6,lonely:9,hope:9,tired:5}},
    {country:'United States',region:'North America',city:'San Francisco',lat:37.7749,lon:-122.4194,count:36,weights:{anxiety:22,joy:20,calm:20,sad:9,angry:5,lonely:8,hope:11,tired:5}},
    {country:'Canada',region:'North America',city:'Toronto',lat:43.6532,lon:-79.3832,count:31,weights:{anxiety:19,joy:21,calm:21,sad:9,angry:4,lonely:8,hope:12,tired:6}},
    {country:'United Kingdom',region:'Europe',city:'London',lat:51.5072,lon:-.1276,count:46,weights:{anxiety:24,joy:19,calm:19,sad:10,angry:5,lonely:8,hope:10,tired:5}},
    {country:'France',region:'Europe',city:'Paris',lat:48.8566,lon:2.3522,count:33,weights:{anxiety:20,joy:23,calm:20,sad:9,angry:5,lonely:7,hope:11,tired:5}},
    {country:'Germany',region:'Europe',city:'Berlin',lat:52.52,lon:13.405,count:29,weights:{anxiety:19,joy:20,calm:23,sad:9,angry:5,lonely:7,hope:12,tired:5}},
    {country:'Japan',region:'East Asia',city:'Tokyo',lat:35.6762,lon:139.6503,count:48,weights:{anxiety:28,joy:17,calm:18,sad:11,angry:4,lonely:10,hope:7,tired:5}},
    {country:'South Korea',region:'East Asia',city:'Seoul',lat:37.5665,lon:126.978,count:37,weights:{anxiety:29,joy:18,calm:17,sad:10,angry:5,lonely:9,hope:7,tired:5}},
    {country:'Thailand',region:'Southeast Asia',city:'Bangkok',lat:13.7563,lon:100.5018,count:27,weights:{anxiety:16,joy:25,calm:24,sad:7,angry:4,lonely:5,hope:14,tired:5}},
    {country:'Singapore',region:'Southeast Asia',city:'Singapore',lat:1.3521,lon:103.8198,count:24,weights:{anxiety:25,joy:20,calm:19,sad:8,angry:5,lonely:7,hope:10,tired:6}},
    {country:'India',region:'South Asia',city:'Mumbai',lat:19.076,lon:72.8777,count:34,weights:{anxiety:22,joy:23,calm:18,sad:9,angry:5,lonely:6,hope:12,tired:5}},
    {country:'Australia',region:'Oceania',city:'Sydney',lat:-33.8688,lon:151.2093,count:30,weights:{anxiety:17,joy:23,calm:25,sad:8,angry:4,lonely:6,hope:12,tired:5}},
    {country:'Brazil',region:'South America',city:'São Paulo',lat:-23.5505,lon:-46.6333,count:31,weights:{anxiety:19,joy:25,calm:19,sad:8,angry:5,lonely:6,hope:13,tired:5}},
    {country:'Argentina',region:'South America',city:'Buenos Aires',lat:-34.6037,lon:-58.3816,count:23,weights:{anxiety:18,joy:24,calm:20,sad:10,angry:5,lonely:7,hope:11,tired:5}},
    {country:'Kenya',region:'Africa',city:'Nairobi',lat:-1.2921,lon:36.8219,count:22,weights:{anxiety:16,joy:24,calm:20,sad:8,angry:4,lonely:6,hope:17,tired:5}},
    {country:'South Africa',region:'Africa',city:'Cape Town',lat:-33.9249,lon:18.4241,count:20,weights:{anxiety:17,joy:22,calm:22,sad:9,angry:5,lonely:7,hope:13,tired:5}},
    {country:'United Arab Emirates',region:'Middle East',city:'Dubai',lat:25.2048,lon:55.2708,count:21,weights:{anxiety:19,joy:22,calm:20,sad:8,angry:4,lonely:7,hope:14,tired:6}}
  ],
  cityMessages: {
    Shanghai:['最近工作压力有点大，想找个安静的晚上。','终于周末了，想好好睡一天。','今天见到了很久没见的朋友。','路过江边，风把脑子吹清醒了一点。','正在学习允许自己慢一点。'],
    Beijing:['事情排得很满，我想先完成眼前这一件。','走回家时看到一盏很暖的灯。','最近有一点迷茫，不过我还在寻找方向。','今天认真吃了一顿饭，感觉不错。'],
    Guangzhou:['下班后吃到喜欢的东西，心情回来一点。','有些疲惫，但有人惦记着我。','想给自己放一个不安排计划的假期。'],
    Shenzhen:['最近总觉得时间不够用。','新的开始有点紧张，也有点期待。','今晚想早点回去休息。'],
    default:['今天正在练习照顾自己的感受。','有一点累，也有一点期待。','希望你路过这里时，能感觉没那么孤单。','不用立刻想明白所有事情。','愿今天的你对自己温柔一点。']
  }
};

/* 固定种子让演示星图每次打开都稳定，同时仍保留自然的空间扰动。 */
window.buildEmotionDemo = function(){
  let seed=20260930;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  const moodKeys=Object.keys(window.EMOTION_CONFIG.moods),rows=[];let serial=0;
  for(const city of window.EMOTION_CONFIG.cities){
    for(let i=0;i<city.count;i++){
      const roll=random()*100;let total=0,emotion=moodKeys[0];
      for(const key of moodKeys){total+=city.weights[key]||0;if(roll<=total){emotion=key;break}}
      const angle=random()*Math.PI*2,radius=Math.sqrt(random()),spread=city.country==='中国'?.72:1.25;
      const latitude=city.lat+Math.sin(angle)*radius*spread;
      const longitude=city.lon+Math.cos(angle)*radius*spread/Math.max(.35,Math.cos(city.lat*Math.PI/180));
      const messages=window.EMOTION_CONFIG.cityMessages[city.city]||window.EMOTION_CONFIG.cityMessages.default;
      rows.push({id:`demo_${String(++serial).padStart(4,'0')}`,country:city.country,region:city.region,city:city.city,latitude,longitude,emotion,message:messages[Math.floor(random()*messages.length)],timestamp:new Date(Date.now()-Math.floor(random()*7*86400000)).toISOString(),demo:true});
    }
  }
  return rows;
};
