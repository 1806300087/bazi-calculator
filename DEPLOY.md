# 八字排盘网站 - 部署指南

## 🚀 一键部署

### 方法1: 使用部署脚本（推荐）

```bash
cd /root/.openclaw/workspace/bazi-calculator
bash deploy.sh "你的提交信息"
```

**示例**:
```bash
# 更新算法
bash deploy.sh "修复月柱计算bug"

# 更新UI
bash deploy.sh "优化移动端显示"

# 默认消息（如果不指定）
bash deploy.sh
```

### 方法2: 手动部署

```bash
cd /root/.openclaw/workspace/bazi-calculator
git add -A
git commit -m "你的提交信息"
git push origin main
```

## 📝 修改后部署流程

1. **修改代码**
   - 编辑 `index.html`, `bazi-calculator-v2.js` 等文件

2. **本地测试**（可选）
   - 用浏览器打开 `index.html` 测试

3. **一键部署**
   ```bash
   bash deploy.sh "修改说明"
   ```

4. **等待生效**
   - GitHub Pages通常需要1-3分钟更新
   - 访问 https://1806300087.github.io/bazi-calculator/
   - 如果看到旧版本，强制刷新 (Ctrl+F5)

## 🔧 常用命令

### 查看部署状态
```bash
cd /root/.openclaw/workspace/bazi-calculator
git status
git log --oneline -5
```

### 查看网站状态
```bash
curl -I https://1806300087.github.io/bazi-calculator/
```

### 回滚到上一个版本
```bash
git reset --hard HEAD~1
git push -f origin main
```

## 📂 项目结构

```
bazi-calculator/
├── index.html              # 网页主文件
├── bazi-calculator-v2.js   # 计算逻辑(V2.2)
├── README.md              # 项目说明
├── deploy.sh              # 一键部署脚本
├── DEPLOY.md             # 本文件
└── package.json          # npm配置
```

## 🌐 访问地址

- **线上地址**: https://1806300087.github.io/bazi-calculator/
- **GitHub仓库**: https://github.com/1806300087/bazi-calculator
- **可微信分享**: ✅ 直接打开

## 📊 版本历史

- **V2.2** (2026-03-07): 修复月柱时柱算法，四柱全部准确
- **V2.1** (2026-03-07): 修复日柱计算基准日期
- **V2.0** (2026-03-07): 加入精确节气算法
- **V1.0** (2026-03-07): 初始版本

## 💡 注意事项

1. **不要修改**:
   - `.git/` 目录
   - `node_modules/` 目录（如果有）

2. **每次修改后记得部署**:
   - 本地修改不会自动同步到线上
   - 必须运行 `deploy.sh` 或手动 `git push`

3. **GitHub Pages延迟**:
   - 代码push后不会立即生效
   - 通常需要1-3分钟
   - 最长可能需要10分钟

4. **浏览器缓存**:
   - 如果看到旧版本，尝试强制刷新
   - Chrome/Edge: `Ctrl + F5`
   - Safari: `Cmd + Shift + R`

## 🆘 问题排查

### 部署成功但网站显示旧版本
```bash
# 等待3分钟后再访问
sleep 180
curl https://1806300087.github.io/bazi-calculator/

# 或者清除浏览器缓存
```

### Push被拒绝（包含敏感信息）
```bash
# 检查package.json等文件，移除token
# 修改后重新commit
git add package.json
git commit --amend
git push -f origin main
```

### 网站显示404
```bash
# 检查GitHub Pages设置
# 访问: https://github.com/1806300087/bazi-calculator/settings/pages
# 确保Source设置为: main分支 / root目录
```

## 🎓 学习资源

- [GitHub Pages文档](https://docs.github.com/pages)
- [Git基础教程](https://git-scm.com/book/zh/v2)
- [Bash脚本教程](https://www.shellscript.sh/)
