# MWITools-Lite 模块化架构

## 改造背景

原始脚本是约 7,200 行、500 KB 的单文件 IIFE，包含以下不同职责：

- userscript 元数据与启动逻辑；
- 设置、语言字典和市场离线数据；
- WebSocket 拦截及全部消息分发；
- 市场价格服务；
- 二十余项游戏 UI 功能；
- 战斗模拟器和 Mooneycalc 集成。

主要问题是功能边界只依赖注释、初始化副作用散落在文件中，并且所有 WebSocket 消息集中在一个大型 `if/else` 中。修改一个功能时容易影响其他功能，也难以单独定位代码。

## 当前结构

```text
src/
├─ userscript.meta.txt      # Tampermonkey 元数据（构建时注入）
├─ preamble.txt             # 安装和排错说明（构建时注入）
├─ manifest.json            # 模块顺序（唯一构建清单）
├─ vite-entry.ts            # Vite 实体入口，加载虚拟 userscript 模块
├─ entry.ts                 # 站点路由及统一启动
├─ types/
│  └─ userscript-globals.d.ts # GM_*、Chart、DOM 增强声明
├─ core/
│  ├─ settings.ts           # 设置、语言、配色、数字格式化
│  ├─ utils.ts              # 时长格式化、战斗技能提取等公共工具
│  ├─ runtime.ts            # 共享状态、WebSocket 拦截、消息总线
│  └─ dom-translation.ts    # 汉化 DOM 文本兼容
├─ i18n/
│  ├─ items.ts              # 物品名称字典
│  ├─ actions.ts            # 动作名称字典
│  ├─ others.ts             # 怪物、技能等字典
│  └─ mappings.ts           # 反向索引与名称查询
├─ features/                # 每项游戏功能一个文件
└─ integrations/
   ├─ profile-export.ts     # 人物缓存与通用导出结构
   └─ combat-simulator.ts   # 战斗模拟器导入和结果辅助

scripts/
└─ vite-userscript-plugin.mjs # manifest、元数据注入和单文件输出插件

package.json                # Vite/TypeScript 命令与 Node.js 版本约束
tsconfig.json               # 仅类型检查（noEmit）
vite.config.mjs             # Vite/Rolldown userscript 构建配置
MWITools-Lite.user.js       # 生成后的可安装 userscript
```

## 运行模型

### 构建时模块

Tampermonkey/Steam 需要一个可直接安装的经典 userscript，因此业务源码采用 TypeScript 编写，但仍为共享作用域的构建时模块（不引入浏览器原生 ESM）。`src/vite-entry.ts` 引用一个虚拟入口，`scripts/vite-userscript-plugin.mjs` 按 `src/manifest.json` 读取 `.ts` 模块，Vite/Rolldown 将其转译并输出为严格模式 IIFE。

插件在产物顶部注入 userscript 元数据和说明，并把最终文件同步到根目录 `MWITools-Lite.user.js`。这保留了单文件安装体验，同时由 Vite 统一负责转译、监听和打包，由 TypeScript 负责静态类型检查。`MWITools-Lite.user.js` 是构建产物，不应手工编辑；由于它与源码一起提交，修改源码后需重新构建并提交，避免仓库产物过期。

构建时插件会校验 `manifest.json`：`core/runtime` 必须位于第一个 feature/integration 模块之前（共享作用域依赖顺序），且模块名不得重复。

### 类型检查

`npm run typecheck` 基于 `tsconfig.json` 执行 `tsc --noEmit`，只做检查不产出文件。已开启 `strictNullChecks`，DOM 查询与游戏数据访问尽量使用可选链/守卫，避免运行时空指针。由于片段间共享作用域，函数签名的注释与 `src/types/userscript-globals.d.ts` 中的全局声明（GM_* API、Math、Chart、DOM 增强）提供类型来源。

### 统一启动

`src/entry.ts` 是唯一的 DOM/网络启动入口：

1. 判断当前页面是游戏还是第三方工具；
2. 第三方页面只启动对应集成；
3. 游戏页面启动 WebSocket runtime；
4. 再统一安装样式、Observer 和定时 UI 功能。

功能模块不再在加载时自行启动 DOM Observer 或定时器。

### WebSocket 消息总线

`src/core/runtime.ts` 提供：

```js
registerMessageHandler(messageType, handler);
```

runtime 先更新共享游戏状态，功能模块再注册自己关心的消息。例如：

- `battle_unit_fetched` → 战斗总结；
- `new_battle` / `battle_updated` → 伤害统计；
- `profile_shared` → 人物缓存、导出和打造分；
- `actions_updated` → 装备检查、空闲通知和伤害状态重置。

同一消息的处理顺序为 `manifest.json` 中的模块顺序；核心状态模块必须排在功能模块之前。

## 开发流程

安装开发依赖并生成 userscript：

```bash
npm install
npm run build
```

监听源码并持续重新构建：

```bash
npm run dev
```

执行静态类型检查和完整构建：

```bash
npm run typecheck
npm run check
```

Vite 的中间产物写入 `temp/vite-build/`，可直接安装的文件仍为根目录 `MWITools-Lite.user.js`。

## 新增功能

1. 在 `src/features/` 新建职责单一的 `.ts` 文件；
2. 如需响应游戏消息，调用 `registerMessageHandler`；
3. 如需启动 Observer/定时器，导出一个具名初始化函数，并在 `src/entry.ts` 的 `initializeGameFeatures()` 调用；
4. 将文件加入 `src/manifest.json`；
5. 执行 `npm run check`，重新生成并检查 `MWITools-Lite.user.js`。
