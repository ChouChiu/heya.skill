# 贡献指南

感谢你对本项目的关注！我们欢迎各种形式的贡献，包括但不限于：代码、文档、问题报告、功能建议等。

## 行为准则

本项目采用 [贡献者公约](CODE_OF_CONDUCT.md)。参与本项目即表示你同意遵守该准则。

## 如何贡献

### 报告问题

如果你发现了 bug 或有改进建议，请通过以下方式提交：

1. 在 GitHub 上创建 Issue
2. 使用清晰的标题描述问题
3. 在描述中提供：
   - 问题的详细描述
   - 复现步骤
   - 期望的行为
   - 实际的行为
   - 环境信息（操作系统、Bun 版本等）
   - 相关的日志或截图

### 提交代码

1. Fork 本仓库
   ```bash
   # 在 GitHub 上点击 Fork 按钮
   ```

2. 克隆你的 Fork
   ```bash
   git clone https://github.com/你的用户名/heya.skill.git
   cd heya.skill
   ```

3. 创建特性分支
   ```bash
   git checkout -b feature/你的特性名称
   ```

4. 进行修改
   - 遵循项目的代码规范
   - 添加必要的测试
   - 更新相关文档

5. 提交更改
   ```bash
   git add .
   git commit -m "feat: 添加某功能"
   ```

6. 推送到你的 Fork
   ```bash
   git push origin feature/你的特性名称
   ```

7. 创建 Pull Request
   - 在 GitHub 上创建 PR
   - 填写 PR 模板
   - 等待代码审查

## 开发环境

### 前置要求

- [Bun](https://bun.sh) ≥ 1.0
- Git

### 设置步骤

```bash
# 1. 克隆项目
git clone https://github.com/ChouChiu/heya.skill.git
cd heya.skill

# 2. 安装依赖
bun install

# 3. 配置环境变量（可选）
cp .env.example .env
# 编辑 .env 文件，填入 B站 Cookie

# 4. 运行项目
bun pipeline
```

## 代码规范

### 语言和工具

- 运行时：Bun
- 语言：TypeScript
- 代码风格：Biome
- 包管理：Bun

### 代码风格

- 使用 2 空格缩进
- 使用单引号
- 使用分号
- 遵循 Biome 的默认配置

### 检查代码

```bash
# 代码检查
bun run lint

# 自动修复
bun run format

# 完整检查
bun run check
```

## 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<类型>[可选的作用域]: <描述>

[可选的正文]

[可选的脚注]
```

### 类型

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行的变动）
- `refactor`: 重构（既不是新增功能，也不是修改 bug 的代码变动）
- `perf`: 性能优化
- `test`: 增加测试
- `chore`: 构建过程或辅助工具的变动
- `ci`: CI 配置变更
- `revert`: 回滚

### 示例

```
feat: 添加新的标题生成算法

修复了情感强度计算的问题

Closes #123
```

## Pull Request 规范

### PR 标题

使用与提交信息相同的格式：

```
feat: 添加新的标题生成算法
```

### PR 描述

请包含以下内容：

1. 变更说明：描述这个 PR 做了什么
2. 相关 Issue：关联相关的 Issue
3. 测试说明：描述如何测试这些变更
4. 截图：如果有 UI 变更，请提供截图

### PR 模板

```markdown
## 变更说明

<!-- 描述这个 PR 做了什么 -->

## 相关 Issue

<!-- 关联相关的 Issue，例如：Closes #123 -->

## 测试说明

<!-- 描述如何测试这些变更 -->

## 截图

<!-- 如果有 UI 变更，请提供截图 -->

## 检查清单

- [ ] 代码遵循项目的代码规范
- [ ] 已添加必要的测试
- [ ] 已更新相关文档
- [ ] 所有测试通过
- [ ] 代码已通过 lint 检查
```

## 项目结构

```
heya.skill/
├── SKILL.md                 # 生成产物：Agent Skills 入口
├── SKILL.example.md         # 模板源文件
├── scripts/
│   ├── pipeline.ts          # 全流程编排
│   ├── fetch-bilibili-titles.ts  # 采集脚本
│   ├── analyze-titles.ts    # 分析脚本
│   ├── update-skill.ts      # 生成脚本
│   └── lib/                 # 共享模块
├── references/
│   └── research/            # 分析数据
├── website/                 # Astro 落地页
└── .github/
    └── workflows/           # CI 配置
```

## 发布流程

项目维护者负责发布新版本：

1. 更新版本号
2. 创建 Git 标签
3. 推送到 GitHub
4. CI 自动更新分析数据

## 获取帮助

如果你在贡献过程中遇到问题，可以通过以下方式获取帮助：

- 创建 GitHub Issue
- 查看项目文档
- 联系项目维护者

## 致谢

感谢所有为本项目做出贡献的人！

## 许可证

本项目采用 [MIT 许可证](LICENSE)。贡献代码即表示你同意你的贡献将在同一许可证下发布。
