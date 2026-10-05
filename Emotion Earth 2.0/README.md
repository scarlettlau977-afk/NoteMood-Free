已完成可运行的 **Emotion Earth 2.0｜心情小纸条**：
- 记录心情与文字感受
- 选择是否匿名公开到感受墙
- 本地保存私人记录
- 配置 GitHub 后，公开记录会同步到仓库的 data/feelings.json
- 其他人点击“同步 GitHub”即可看见最新内容
- 适配手机与电脑浏览

## 项目文件

当前首页使用 Three.js 和原生 JavaScript，情绪演示数据在 `data/emotion-data.js`，场景、城市探索与同步逻辑在 `emotion-earth.js`，视觉样式在 `emotion-earth.css`。旧版页面保存在 `index-previous.html`，继续使用 `app.js` 和 `style.css`。

### 本地预览

可直接打开 `index.html`。Three.js 从 CDN 加载，城市粗略定位使用 ipapi.co，所以预览时需要联网。也可以在项目目录运行 `python -m http.server 8000`，再打开 `http://localhost:8000`。

### 部署

将项目推送到 GitHub，在仓库 **Settings → Pages** 选择 `main` 分支和根目录即可发布。不要把访问令牌写进源码或提交到仓库。

地球上的初始星点和纸条都是合成演示数据，不代表真实地区心理状况。用户新写的纸条默认只保存在当前浏览器；勾选公开并连接有 Contents 读写权限的 GitHub 仓库后才会同步。IP 定位由第三方服务按访问 IP 粗略估算，可定位失败时继续使用上海示例位置。

地球表面贴图来自 [Solar System Scope](https://www.solarsystemscope.com/textures/)，按 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权，可商用；已在页面保留署名。

## Emotion Earth 3.0 更新
- 城市基础数据独立放在 `data/city-data.js`，包含需求文档列出的中国主要城市。
- `emotion-cloud.js` 只根据真实情绪记录生成城市粒子云；没有真实数据时显示“暂无情绪数据”，不会生成演示用户数据。
- 缩放层级：远距离只显示地球；中距离显示城市点位和名称；近距离显示已接入城市的 Emotion Cloud。
- 双击地球恢复默认视角，并限制垂直拖动范围，避免地球翻转。
- 保留直接双击 `index.html` 运行的方式；未来可将 AI 情绪分析结果写入真实记录后接入城市情绪云。
