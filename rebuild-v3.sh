#!/bin/bash
# 重建V3 - 确保所有函数完整

cat > bazi-calculator-v3-fixed.js << 'EOF'
// 八字计算器 V3.0 - 完整版（包含精确节气算法 + 命理解读）
// 数据来源：《渊海子平》《三命通会》《滴天髓》《穷通宝鉴》

EOF

# 1. 从V2复制完整的计算模块（1-345行，所有基础数据+计算函数）
sed -n '1,345p' bazi-calculator-v2.js >> bazi-calculator-v3-fixed.js

# 2. 从V2复制displayResult函数（347-445行）
sed -n '347,445p' bazi-calculator-v2.js >> bazi-calculator-v3-fixed.js

# 3. 添加命理解读模块标记
echo "" >> bazi-calculator-v3-fixed.js
echo "// ============================================" >> bazi-calculator-v3-fixed.js
echo "// 命理解读模块" >> bazi-calculator-v3-fixed.js
echo "// ============================================" >> bazi-calculator-v3-fixed.js
echo "" >> bazi-calculator-v3-fixed.js

# 4. 从mingli-jiedu.js复制解读函数（跳过重复的基础数据定义）
sed -n '86,$p' mingli-jiedu.js >> bazi-calculator-v3-fixed.js

# 5. 添加V3特有的集成函数
cat >> bazi-calculator-v3-fixed.js << 'EOFJS'

// ============================================
// V3 集成函数
// ============================================

// 全局变量存储当前八字
let currentBazi = null;

// 重写calculateBazi以支持命理解读
function calculateBazi() {
    const birthdate = document.getElementById('birthdate').value;
    const hourIndex = parseInt(document.getElementById('hour').value);
    const gender = document.getElementById('gender').value;
    
    if (!birthdate || isNaN(hourIndex) || !gender) {
        alert('请填写完整的出生信息');
        return;
    }
    
    const [year, month, day] = birthdate.split('-').map(Number);
    
    // 计算四柱
    const yearPillar = getYearGanZhi(year, month, day);
    const monthPillar = getMonthGanZhi(year, month, day);
    const dayPillar = getDayGanZhi(year, month, day);
    const hourPillar = getHourGanZhi(dayPillar.ganIndex, hourIndex);
    
    // 添加藏干
    yearPillar.canggan = CANGGAN[yearPillar.zhi];
    monthPillar.canggan = CANGGAN[monthPillar.zhi];
    dayPillar.canggan = CANGGAN[dayPillar.zhi];
    hourPillar.canggan = CANGGAN[hourPillar.zhi];
    
    currentBazi = {
        year: yearPillar,
        month: monthPillar,
        day: dayPillar,
        hour: hourPillar
    };
    
    // 显示结果
    displayResult(currentBazi, year, month, day, hourIndex, gender);
    
    // 显示命理解读按钮
    document.getElementById('jieduBtn').style.display = 'block';
}

// 显示命理解读
function showJiedu() {
    if (!currentBazi) {
        alert('请先进行排盘计算');
        return;
    }
    
    // 生成解读
    const jiedu = generateMingliJiedu(currentBazi);
    
    // 显示日主强弱
    const strengthDiv = document.getElementById('jieduStrength');
    const strengthBadgeClass = jiedu.strength.strength === '身旺' ? 'badge-strong' :
                                jiedu.strength.strength === '中和' ? 'badge-medium' : 'badge-weak';
    
    strengthDiv.innerHTML = `
        <p>
            <span class="strength-badge ${strengthBadgeClass}">${jiedu.strength.strength}</span>
            <span style="color:#666;">综合得分: ${jiedu.strength.score}</span>
        </p>
        <ul class="reason-list">
            ${jiedu.strength.reasons.map(r => `<li>${r}</li>`).join('')}
        </ul>
        <p style="margin-top:15px; padding:15px; background:#e7f3ff; border-left:4px solid #2196F3; border-radius:4px;">
            <strong>💡 建议：</strong>${jiedu.strength.advice}
        </p>
    `;
    
    // 显示格局
    const gejuDiv = document.getElementById('jieduGeju');
    gejuDiv.innerHTML = `
        <p style="font-size:18px; color:#764ba2; font-weight:bold; margin-bottom:10px;">
            ${jiedu.geju.geju}
        </p>
        <p style="color:#666; margin-bottom:10px;">
            <strong>月令十神：</strong>${jiedu.geju.mainShishen}
        </p>
        <p style="line-height:1.8; color:#555;">
            ${jiedu.geju.description}
        </p>
    `;
    
    // 显示用神
    const yongshenDiv = document.getElementById('jieduYongshen');
    let yongshenHTML = `<p style="line-height:1.8; margin-bottom:15px;">${jiedu.yongshen.explanation}</p>`;
    
    if (jiedu.yongshen.yongshen.length > 0 && jiedu.yongshen.yongshen[0].wuxing) {
        yongshenHTML += `
            <div class="xiji-grid">
                <div class="xiji-card xi-card">
                    <h4 style="color:#28a745; margin-bottom:10px;">✅ 喜用神</h4>
                    ${jiedu.yongshen.yongshen.map(ys => `
                        <p><strong>${ys.wuxing}</strong> - ${ys.reason}</p>
                    `).join('')}
                </div>
                <div class="xiji-card ji-card">
                    <h4 style="color:#dc3545; margin-bottom:10px;">❌ 忌神</h4>
                    ${jiedu.yongshen.jishen.map(js => `
                        <p><strong>${js.wuxing}</strong> - ${js.reason}</p>
                    `).join('')}
                </div>
            </div>
        `;
    }
    yongshenDiv.innerHTML = yongshenHTML;
    
    // 显示生活建议
    const suggestionsDiv = document.getElementById('jieduSuggestions');
    if (jiedu.xiji.suggestions.length > 0) {
        suggestionsDiv.innerHTML = jiedu.xiji.suggestions.map(sug => `
            <div style="margin-bottom:15px; padding:15px; background:#f8f9fa; border-radius:8px;">
                <h4 style="color:#764ba2; margin-bottom:10px;">🎨 ${sug.category}</h4>
                <p><strong style="color:#28a745;">✓ 吉利：</strong>${sug.xi}</p>
                <p style="margin-top:8px;"><strong style="color:#dc3545;">✗ 不利：</strong>${sug.ji}</p>
            </div>
        `).join('');
    } else {
        suggestionsDiv.innerHTML = '<p style="color:#999;">根据八字配合具体分析</p>';
    }
    
    // 显示解读区域
    document.getElementById('jieduResult').style.display = 'block';
    
    // 滚动到解读区域
    document.getElementById('jieduResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
EOFJS

echo "V3 Fixed version created!"
