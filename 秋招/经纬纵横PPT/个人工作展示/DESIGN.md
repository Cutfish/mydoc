# DESIGN.md — 企业应用网关（面试版 · v5）

## 全局

- 1280×720，padding 60，内容区 1160×600（y 60–660）
- 内容页页尾绝对定位 bottom 30；封面 / 目录 / 章节页 / 封底不加页尾
- 主色 `#1B3C6E` / 强调 `#E1582F` / 辅 `#8B95A5` / 底 `#F6F7F9` / 深底 `#0E1117` / 正文 `#12161F` / 线 `#DCE0E6`
- 字体：全篇 `Microsoft YaHei`，阶梯 68 / 96 / 54 / 32 / 22 / 18 / 17 / 14
- 母题：右上角章节定位 + 标题下 1px 贯通细线 + 右下角 `NN / 21`

## 配图

| 文件 | 来源 | 内容 | 使用页 |
|---|---|---|---|
| `assets/gateway-arch-v4.png` | draw.io 导出（`assets/gateway-arch.drawio` 可编辑） | 七个节点 + 七条连线的网关架构（物理机与容器云分列，无容器回流虚线） | P8 |
| `assets/radix-tree.png` | draw.io 导出（`assets/radix-tree.drawio` 可编辑） | 基数树前缀匹配示例：/api/user/profile 高亮路径 + 灰色兄弟节点 | P15 |
| `assets/seq-dirty-redis-v2.png` | draw.io 时序图 | T1 脚本读旧版本 → T2 控制面写新版本（MySQL+Redis）→ T3 脚本写回旧值覆盖 | P16 |
| `assets/latency-p99-v2.png` | draw.io 延迟对比 | 常态 0.3s vs 缓存过期时 6.0s，橙色段为回源加载全量配置 | P16 |

drawio 画布：网关架构 1400×610（导出 2595×1095，PPT 内 1090×460）；时序图 2129×945、延迟图 2066×919（PPT 内均 560×249）；前缀树 660×250（导出 1262×422，PPT 内 620×207）。均为透明 PNG。

## 页面清单（21 页 / 3 章 / 约 18 分钟）

| # | 页面 | 角色 |
|---|---|---|
| 1 | 封面 · 企业应用网关 | hero |
| 2 | 目录 | supporting |
| 3 | §01 个人介绍 | transition |
| 4 | 教育背景与个人档案 | hero |
| 5 | §02 实习经历 | transition |
| 6 | 两段实习：AI / 业务 / 性能 | supporting |
| 7 | §03 产品与项目 | transition |
| 8 | 架构：控制面 + 网关引擎（drawio 图） | hero |
| 9 | 我在这个产品上做的四类事 | supporting |
| 10 | 开放接口：收敛成一个入口 | supporting |
| 11 | 权限治理 + Agent 访问边界 | supporting |
| 12 | AI 提效：先能度量，才谈得上推广 | supporting |
| 13 | 网关引擎：三个待解的瓶颈 | supporting |
| 14 | 日志打点：同步 → 异步批量 | hero |
| 15 | 路由匹配：O(N) → O(K) | hero |
| 16 | 配置重构：没有版本号时的两个问题 | supporting |
| 17 | 加上版本号之后：两个问题各自收敛 | hero |
| 18 | 迁移：六个环节与四条控制 | supporting |
| 19 | 结果与复盘 | hero |
| 20 | 能力沉淀与岗位匹配 | supporting |
| 21 | 封底 Thanks | hero |

## 15 分钟版压缩顺序

砍 P10（开放接口）→ P12（AI 度量）→ P9（四类事总览），P18（迁移）只讲并发兼容那一条。
