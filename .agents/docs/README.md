# Di AI 文档索引

受众是分析、实现和验证本仓库的 AI agent。源码是行为的唯一权威；本文档用于快速定位事实和源码。

## 阅读路径

1. 从本索引选择一个主题，不要默认通读全部文档。
2. 阅读目标文档中给出的仓库根相对源码路径与关键符号。
3. 打开源码核实；文档过时或缺失时，同一改动中修正它。

## 主题

- [`architecture.md`](architecture.md)：workspace 边界、依赖方向和一次交互的数据流。
- [`cli.md`](cli.md)：CLI 参数、模式、输出、退出码和恢复行为。
- [`di-home.md`](di-home.md)：`~/.di`、配置与数据目录。
- [`interrupt.md`](interrupt.md)：回合软停止、取消和退出。
- [`tui.md`](tui.md) / [`tui-rpc.md`](tui-rpc.md)：TUI 结构与 RPC wire 协议。
- [`context-compression.md`](context-compression.md)：上下文预算和压缩。
- [`roadmap.md`](roadmap.md)：功能范围和后续工作。
- [`modules/README.md`](modules/README.md)：模块职责、源码入口和细化文档。
- [`typescript-validation.md`](typescript-validation.md)：验证证据和未完成的发布门槛。

## 约定

- 所有源码路径均相对仓库根目录。
- 本目录是 agent 文档；面向用户的安装与使用说明保留在根 [`README.md`](../../README.md)。
- 编写和重组文档前，遵循 [`.agents/docs/standards/documentation.md`](standards/documentation.md)。
