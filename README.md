# Mac Web Vue Template

一个受 macOS 设计启发的现代优雅的 Vue.js Web 模板。

## 在线演示

访问在线演示：[WebAi](https://mac.moejue.cn/)

## 功能特点

- 🎨 macOS 风格的 UI 设计
- 📱 响应式布局
- ⚡ 基于 Vue.js 构建
- 🎯 现代简洁的界面
- 🖼️ 精美的动画和过渡效果
- 🎮 交互式组件

## 界面截图

![截图 1](https://github.com/iAJue/MacWeb/blob/main/images/1.jpg)
![截图 2](https://github.com/iAJue/MacWeb/blob/main/images/2.jpg)
![截图 3](https://github.com/iAJue/MacWeb/blob/main/images/3.jpg)
![截图 4](https://github.com/iAJue/MacWeb/blob/main/images/4.jpg)
![截图 5](https://github.com/iAJue/MacWeb/blob/main/images/5.jpg)

## 开始使用

### 环境要求

- Node.js (v22 或更高版本)
- npm 

### 安装步骤

1. 克隆仓库
```bash
git clone [仓库地址]
```

2. 安装依赖
```bash
npm install
```

3. 运行开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

## 项目结构

```
├── public/                    # 公共静态资源目录
│   └── index.html            # HTML 模板
│
├── src/                      # 源代码目录
│   ├── assets/              # 静态资源
│   │   ├── images/         # 图片资源
│   │   ├── styles/         # 样式文件
│   │   └── fonts/          # 字体文件
│   │
│   ├── components/          # Vue 组件
│   │   ├── common/         # 通用组件
│   │   ├── system/         # 系统组件
│   │   └── apps/          # 应用组件
│   │
│   ├── views/              # 页面视图组件
│   │   └── home/          # 首页相关
│   │
│   ├── router/             # 路由配置
│   │   └── index.js       # 路由主文件
│   │
│   ├── stores/             # Pinia 状态管理
│   │   └── index.js       # 状态管理主文件
│   │
│   ├── utils/              # 工具函数
│   │   └── request.js     # 请求封装
│   │
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
│
├── images/                  # 项目截图目录
├── dist/                    # 构建输出目录
├── .vscode/                # VSCode 配置
├── .gitignore              # Git 忽略文件
├── index.html              # 项目入口 HTML
├── jsconfig.json           # JavaScript 配置
├── package.json            # 项目依赖配置
├── package-lock.json       # 依赖版本锁定文件
├── README.md              # 项目说明文档
└── vite.config.js         # Vite 项目配置
```

## 技术栈

- Vue.js - 渐进式 JavaScript 框架
- Vite - 现代前端构建工具
- Pinia - Vue 状态管理
- Vue Router - 官方路由管理器
- SCSS - CSS 预处理器
- ES6+ - 现代 JavaScript 特性

## 目录说明

- `public/`: 存放静态资源，这些文件会被直接复制到构建目录
- `src/assets/`: 存放项目资源文件，如图片、样式、字体等
- `src/components/`: 存放 Vue 组件
  - `common/`: 通用组件，如按钮、输入框等
  - `system/`: 系统相关组件
  - `apps/`: 应用相关组件
- `src/views/`: 页面级组件，每个路由对应的页面
- `src/router/`: 路由配置，定义页面路由规则
- `src/stores/`: Pinia 状态管理，管理全局状态
- `src/utils/`: 工具函数，如请求封装、通用方法等
- `images/`: 项目截图和文档相关图片
- `dist/`: 构建后的文件目录
- `.vscode/`: VSCode 编辑器配置
- `vite.config.js`: Vite 构建工具配置

## 开发规范

1. 组件命名采用 PascalCase 命名规范
2. 文件命名采用 kebab-case 命名规范
3. 样式采用 SCSS 预处理器，遵循 BEM 命名规范
4. 代码提交前进行 ESLint 检查
5. 遵循 Vue 官方风格指南

## 许可证

本项目采用 MIT 许可证 - 详见 LICENSE 文件

## 联系方式

如有任何问题或建议，欢迎提交 Issue 或 Pull Request。
