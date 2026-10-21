# XUYU · 下载页（分发仓库根目录）

这个文件夹就是 GitHub 分发仓库 `XUYU` 的全部内容，直接上传即可用 Pages 托管。
纯静态、无依赖、无构建步骤，双击 `index.html` 就能本地预览。

```
XUYU/
├─ index.html                 页面本体
├─ assets/
│  ├─ css/site.css            样式（设计系统都在这里）
│  ├─ js/site.js              交互脚本（顶部 CONFIG 是唯一要改的地方）
│  ├─ img/                    展示图、图标、分享封面
│  ├─ video/                  首屏视频放这里（可选，见下文）
│  └─ src/                    原始素材（不需要上传也可以留着）
└─ README.md
```

## 一、上线（三步）

1. 新建一个 **public** 仓库，名字填 `XUYU`。
2. 把本文件夹里的全部文件上传到仓库根目录（`index.html` 必须在根目录）。
3. 仓库 → Settings → Pages → Source 选 `Deploy from a branch` → 分支 `main`、目录 `/ (root)` → Save。
   一两分钟后访问 `https://<你的用户名>.github.io/XUYU/`。

## 二、唯一要改的地方

打开 `assets/js/site.js`，最上面的 `CONFIG`：

```js
const CONFIG = {
  githubUser: 'yhx3425376776',   // 已填好
  repo: 'XUYU',                  // 分发仓库名
  assetName: 'XUYU-Setup.exe',   // Release 附件文件名（不要带版本号）
  version: 'v1.0.0',             // 仅作读取失败时的兜底显示
  size: '约 80 MB',              // 同上
  liveReleaseInfo: true          // 自动读取最新 Release 的版本号与体积
};
```

下载按钮会指向：

```
https://github.com/<用户名>/XUYU/releases/latest/download/XUYU-Setup.exe
```

`releases/latest/download/` 是 GitHub 的固定直链——**只要附件一直叫 `XUYU-Setup.exe`，
以后每次发版覆盖同名附件，链接永远有效，页面一行都不用改。**

## 三、与安装包对接

1. 打包产出的安装包重命名为 `XUYU-Setup.exe`。
2. 在 `XUYU` 仓库 → Releases → `Draft a new release` → 填 tag（如 `v1.0.0`）→ 把安装包拖进附件 → Publish。
3. 点页面上的「下载 PC 版」就会直接下载。

如果开了 `liveReleaseInfo: true`，版本号与体积会自动显示最新 Release 的真实值
（不填也不影响下载，只是文案是写死的）。

## 四、替换素材（都不用改代码）

| 想换什么 | 放到哪 | 说明 |
|---|---|---|
| 首屏视频 | `assets/video/hero.mp4` | H.264、无声、建议 1920×1080，循环播放；放进去就自动播放 |
| 首屏动图 | `assets/img/hero.gif` | 没有 mp4 时优先用它（原始 gif 即可） |
| 首屏静态帧 | `assets/img/hero.webp` | 前两者都没有时用它；已在 CSS 里做模糊，当作环境光 |
| 三张展示图 | `assets/img/showcase-island.webp`、`showcase-themes.webp`、`showcase-desk.webp` | 建议 2000×1125，或用 `assets/src/` 里的原图重新导出 |
| 应用图标 | `assets/img/icon-256.png`（及 128 / 512） | 白底方形，圆角由 CSS 处理 |
| 分享封面 | `assets/img/og-cover.jpg` | 1200×630，微信/Twitter 分享卡片用 |

素材放大用的脚本留在项目里：`../.build-tmp/build-assets.py`（Pillow）。

## 五、注意事项

- **安装包不要提交进 git**（仓库单文件上限 100 MB），只作为 Release 附件上传。
- 页面完全离线可用，不请求任何外部字体、图标库或 CDN；唯一的网络请求是
  `liveReleaseInfo` 打开时的 GitHub API。
- 未做代码签名，Windows 会提示「未知发布者」，页面里已经写了引导文案。
- 想本地起服务预览：`python -m http.server 8000`（或任意静态服务器），然后开
  `http://localhost:8000/`。
