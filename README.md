# 🎨 AI 拍照亭 (Photo Booth)

> 拍照 → AI 卡通化 → 打印贴纸/钥匙扣

一个便携桌面 Photo Booth。手机/平板当屏幕，AI 帮你把照片变成卡通贴纸，一键打印。

---

## 项目结构

```
zmt/
├── photobooth-frontend/    # PWA 前端（React + Vite + Tailwind）
│   ├── src/pages/
│   │   ├── Home.jsx        # 首页，风格选择
│   │   ├── Capture.jsx     # 拍照页面
│   │   ├── Preview.jsx     # AI 生成预览 + 打印
│   │   ├── Gallery.jsx     # 历史相册
│   │   └── Styles.jsx      # 风格提示词管理
│   └── src/services/
│       └── api.js          # API 请求封装
│
├── photobooth-backend/     # 后端 API（Node.js + Express）
│   ├── routes/
│   │   ├── generate.js     # AI 生成接口
│   │   ├── styles.js       # 风格管理 CRUD
│   │   ├── gallery.js      # 相册
│   │   ├── print.js        # 打印任务
│   │   └── share.js        # 分享链接
│   └── services/
│       ├── openai.js       # OpenAI API 封装
│       └── supabase.js     # 数据库（含内存回退）
│
└── pc-print-relay/         # PC 打印中继（Python）
    └── main.py             # WebSocket 客户端 + 打印
```

---

## 快速开始

### 1. 准备工作

注册以下免费服务：

- [OpenAI](https://platform.openai.com) — 获取 API Key，充值 $5
- [Render](https://render.com) — 部署后端（免费）
- [Vercel](https://vercel.com) — 部署前端（免费）
- [Supabase](https://supabase.com) — 数据库（可选，不用也能跑）

### 2. 后端

```bash
cd photobooth-backend
cp .env.example .env
# 编辑 .env，填入 OPENAI_API_KEY

npm install
npm run dev    # 开发模式
# npm start    # 生产模式
```

### 3. 前端

```bash
cd photobooth-frontend
npm install
npm run dev    # 访问 http://localhost:5173
```

### 4. PC 打印中继

```bash
cd pc-print-relay
pip install -r requirements.txt
python main.py
```

### 5. 部署

**前端 → Vercel：**
```bash
cd photobooth-frontend
npm run build
# 把 dist/ 部署到 Vercel（或用 GitHub 自动部署）
```

**后端 → Render：**
- 创建 Web Service，指向 photobooth-backend/
- 设置环境变量 OPENAI_API_KEY
- Build: `npm install`  Start: `npm start`

---

## 支持的打印尺寸

| 尺寸 | 规格 | 适合 |
|------|------|------|
| 小贴纸 | 57×57mm | 笔记本贴纸 |
| 钥匙扣 | 30mm 圆形 | 钥匙扣挂件 |
| 大贴纸 | 76×76mm | 行李箱贴纸 |
| 明信片 | 100×148mm | 卡片/明信片 |

---

## 预设风格

| 风格 | 效果 |
|------|------|
| 🌸 日系动漫 | 柔和动漫风 |
| 💥 美式漫画 | 粗线条漫画风 |
| 👾 像素复古 | 16位游戏风 |
| 🐾 Q版萌宠 | 超可爱宠物 |
| 🎨 水彩手绘 | 手绘水彩 |
| 💝 治愈鼓励 | 暖心文字插画 |

可以在「风格管理」页面自定义提示词，调出你独特的配方。

---

## Phase 2（未来升级）

- 蓝牙热敏打印机直连（去掉 PC 依赖）
- 3D 打印外壳建模
- 完全便携版
