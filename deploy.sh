#!/bin/bash

# 八字排盘网站 - 一键部署脚本
# 使用方法: bash deploy.sh [commit消息]

set -e  # 遇到错误立即退出

echo "======================================"
echo "八字排盘网站 - 一键部署"
echo "======================================"
echo ""

# 进入项目目录
cd /root/.openclaw/workspace/bazi-calculator

# 检查是否有未提交的改动
if [[ -n $(git status -s) ]]; then
    echo "📝 发现未提交的改动，准备提交..."
    
    # 显示改动
    git status -s
    echo ""
    
    # 添加所有改动
    git add -A
    
    # 获取commit消息（参数或默认值）
    COMMIT_MSG="${1:-更新网站内容}"
    
    # 提交
    git commit -m "$COMMIT_MSG"
    echo "✅ 代码已提交"
else
    echo "✅ 没有未提交的改动"
fi

# 推送到GitHub
echo ""
echo "📤 推送到GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ 推送成功!"
else
    echo "❌ 推送失败!"
    exit 1
fi

# 等待GitHub Pages构建
echo ""
echo "⏳ 等待GitHub Pages部署（预计30-60秒）..."
sleep 30

# 检查部署状态
echo ""
echo "🔍 检查部署状态..."
RESPONSE=$(curl -s -I https://1806300087.github.io/bazi-calculator/)
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP" | awk '{print $2}')
LAST_MODIFIED=$(echo "$RESPONSE" | grep -i "last-modified" | cut -d' ' -f2-)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ 网站正常运行"
    echo "📅 最后更新: $LAST_MODIFIED"
else
    echo "⚠️  网站状态: $HTTP_CODE"
fi

# 显示访问地址
echo ""
echo "======================================"
echo "🎉 部署完成!"
echo "======================================"
echo ""
echo "🌐 访问地址:"
echo "   https://1806300087.github.io/bazi-calculator/"
echo ""
echo "📱 可直接在微信中打开分享"
echo ""
echo "💡 提示: GitHub Pages可能需要1-3分钟才能完全更新"
echo "        如果看到旧版本，请等待或强制刷新(Ctrl+F5)"
echo ""
