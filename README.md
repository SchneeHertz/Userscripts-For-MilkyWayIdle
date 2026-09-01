# MWITools-Lite

Tools for the game MilkyWayIdle. 本插件是中文的（也可切换到英文显示）。

## 安装与更新

[点击安装 MWITools-Lite](https://raw.githubusercontent.com/SchneeHertz/Userscripts-For-MilkyWayIdle/main/MWITools-Lite.user.js)

安装后，Tampermonkey 会通过 GitHub 自动检查并获取脚本更新。

功能列表：

- 左上角显示当前动作预计总耗时与预计完成时间
- 动作面板显示：总耗时、快捷次数输入（按小时/按次数）、到目标技能等级还需做的次数与时间、每小时经验
- 动作队列面板显示：每个排队动作的预计完成时间与队列总时间
- 左侧栏显示技能经验百分比
- 战斗总结面板（点击玩家头像）：每小时战斗次数、金币/经验收益
- 战斗伤害统计：DPS、伤害占比、命中率表与图表（依赖 Chart.js）
- 装备图标右上角显示装备等级；钥匙/钥匙碎片显示对应地图序号
- 任务卡片与战斗地图选择页显示地图序号
- 左侧菜单栏添加第三方工具链接（战斗模拟器、战斗榜、强化模拟等）与插件设置入口
- 动作队列为空时弹窗通知（可关闭）
- 发布市场订单时自动填入最小压价
- 人物资料页一键导出人物到剪贴板；组队时缓存队友资料
- 在第三方战斗模拟器网站上提供"单人/组队导入"按钮，并显示练级目标计算

依赖 CDN（Chart.js 与 datalabels 插件，用于伤害统计图表）：若 CDN 不可用，请关闭"伤害统计图表"设置。

# Development

可安装的 userscript 为根目录 [`MWITools-Lite.user.js`](./MWITools-Lite.user.js)，由 `src/` 下的模块构建生成，**不要直接编辑生成文件**。修改源码后请运行 `npm run check` 重新生成并提交，保持仓库内生成文件与源码一致。

```bash
npm install
npm run dev        # Vite watch build
npm run typecheck  # tsc --noEmit
npm run build
npm run check      # typecheck + build + syntax check
```

源码为 TypeScript，Vite 按 [`src/manifest.json`](./src/manifest.json) 中声明的顺序将模块编译进单个可安装的 `MWITools-Lite.user.js`。模块边界、启动流程与新增功能的方式见 [`ARCHITECTURE.md`](./ARCHITECTURE.md)。
