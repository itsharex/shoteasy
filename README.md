# RicoScreenshot

![preview](preview.jpg)

**在线使用：<https://shot.ricoui.com/>**（导入的图片在浏览器端处理；内置 Unsplash 背景需要联网获取）

纯前端（无后端）的截图 / 图片美化编辑器：图片读取、编辑、标注、导出全部在浏览器端完成。既可以作为独立网站运行，也可以打包成 React 组件库供第三方集成。

## 功能特性

- 导入与编辑：点击、拖拽或粘贴图片，也可通过浏览器权限截取屏幕 / 窗口；支持裁剪、翻转、缩放、留白、圆角、阴影与九宫格对齐。
- 背景图库：纯色、渐变、[Gradientshub](https://gradientshub.com) 本地精选和 Unsplash 图片；「城市自然」包含草原、城市、雪地、风景、海边、夜景与沙漠，「桌面」提供 10 张不同风格的壁纸。列表显示缩略图，选中后加载较大图片；还可上传本地背景并调整模糊、遮罩、噪点与渐变角度。
- 外框：基础 / 创意外框、Safari / Chrome / Arc 浏览器框，以及 MacBook、iMac、iPad、iPhone 设备框。浏览器框支持自定义展示用 URL 和顶部栏尺寸，不会访问该 URL。
- 针织外框：8 种预设直接展示在外框面板；使用本地透明 PNG 作卡片预览，实际针织纹理由 SVG 动态绘制。边框厚度可调至 12–48px，支持针脚密度与独立圆角调整；圆角默认 36px，可调到 0。
- 标注与效果：矩形、实心矩形、圆圈、直线、箭头、画笔、放大镜、步骤序号、文字、模糊、马赛克、聚光和 Emoji；支持撤销 / 重做、文字水印及 HDR 风格效果。
- 尺寸与视图：默认自动生成 4:3 画布，也可自定义尺寸或使用社交平台预设；编辑视图支持缩放、拖拽和适应画布，深色 / 浅色主题可切换。
- 导出：PNG、JPG、WebP 及 1x / 2x / 3x 倍率；PNG 可保留透明背景，JPG / WebP 使用白底。可通过顶栏下载按钮，或在格式 / 倍率弹窗中选择后直接导出；支持 PNG 剪贴板复制与快捷键。
- 草稿：独立站使用 IndexedDB 自动保存并恢复；作为组件库嵌入时默认关闭，可按需开启。

## 快速开始

### 环境要求

- Node.js 18+
- pnpm 9 / 10（仓库声明 `packageManager: pnpm@10.12.1`，推荐用 [corepack](https://nodejs.org/api/corepack.html) 自动匹配版本）

### 安装与启动

```bash
# 启用 corepack 以使用仓库指定的 pnpm 版本（可选）
corepack enable

# 安装依赖
pnpm install --frozen-lockfile

# 启动开发服务器（Vite）
pnpm dev
```

启动后浏览器打开 Vite 输出的地址（默认 <http://localhost:5173>）即可看到编辑器。

### 作为 React 组件使用

```jsx
import { ImageBeautifier } from 'rico-screenshot';
import 'rico-screenshot/lib/style.css';

export default function Page() {
  return <ImageBeautifier />;
}
```

组件库默认不保存草稿；需要时可传入 `persistence={{ key: 'my-editor' }}`。组件仅适用于浏览器环境，详细属性与集成限制见 [组件 API](DOCS/component-api.md)。

### 常用命令

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 启动 Vite 开发服务器 |
| `pnpm build` | 构建独立站点，产物在 `dist/` |
| `pnpm build:lib` | 构建 npm ES 模块组件库，产物在 `lib/` |
| `pnpm preview` | 本地预览 `dist/` 构建结果 |
| `pnpm lint` | ESLint 检查 `.js` / `.jsx` |

项目没有后端服务、环境变量和数据库迁移；也没有自动化测试，改动后请至少运行 `pnpm lint` 和对应构建，并做浏览器手工验证（回归清单见 [DOCS/development.md](DOCS/development.md)）。

屏幕捕获和剪贴板功能需要浏览器支持、HTTPS 或 localhost 环境及相应权限；远程背景加载还取决于网络与图片服务的跨域设置。文本 / 代码美化和 GIF 动画导出目前未实现。

## 文档

详细文档在 [`DOCS/`](DOCS/README.md) 目录：

- [项目概览](DOCS/project-overview.md)：功能边界、技术栈、目录职责
- [架构与数据流](DOCS/architecture.md)：MobX 状态、LeaferJS 画布、图层与导出链路
- [用户功能](DOCS/user-guide.md)：导入、画布、标注、边框、水印与导出
- [开发指南](DOCS/development.md)：环境、命令、开发约定、回归清单
- [组件 API](DOCS/component-api.md)：`ImageBeautifier` 属性与集成限制

## 技术栈

- [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- [LeaferJS](https://github.com/leaferjs/ui)：画布渲染引擎
- [MobX](https://mobx.js.org/)：状态管理
- [Ant Design 5](https://ant.design/) + [Tailwind CSS](https://tailwindcss.cn/)：UI

## 关于作者

我是 [Rico](https://ricoui.com)，网页/UI 设计师，热衷于做些有趣和创意的作品。拥有 UI/UX 设计工作经验，目前专注于网页设计和视觉落地，以及开发项目探索。

- 博客：[Rico's Blog](https://ricoui.com)
- X（Twitter）：[@ricouii](https://x.com/ricouii)
- 小红书：@Rico的设计漫想
- 微信公众号：Rico的设计漫想

## 致谢与协议

本项目基于开源项目 [image-beautifier](https://github.com/CH563/image-beautifier)（ShotEasy 截图插件内核）二次开发，感谢上游作者 [Chenliwen](https://github.com/CH563) 的工作；上游用于谷歌截图插件 [ShotEasy](https://chromewebstore.google.com/detail/nmppkehciohcgcehlnifgeokgioidknh)。

[MIT License](LICENSE) © Chenliwen（上游）· 二次开发 © [Rico](https://ricoui.com)
