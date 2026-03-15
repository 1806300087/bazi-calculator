#!/bin/bash
# 完全重建V3 - 从V2.2开始,干净地添加解读功能

echo "开始重建V3..."

# 1. 复制V2.2完整代码作为基础
cp bazi-calculator-v2.js bazi-calculator-v3-clean.js

# 2. 在文件末尾添加命理解读模块
cat >> bazi-calculator-v3-clean.js << 'EOFJSX'

// ============================================
// 命理解读模块（V3新增）
// ============================================

// 全局变量存储当前八字
let currentBazi = null;

// 五行生克关系
const WUXING_RELATION = {
    '金': { sheng: '水', ke: '木', bei_sheng: '土', bei_ke: '火' },
    '木': { sheng: '火', ke: '土', bei_sheng: '水', bei_ke: '金' },
    '水': { sheng: '木', ke: '火', bei_sheng: '金', bei_ke: '土' },
    '火': { sheng: '土', ke: '金', bei_sheng: '木', bei_ke: '水' },
    '土': { sheng: '金', ke: '水', bei_sheng: '火', bei_ke: '木' }
};

// 天干阴阳
const TIANGAN_YINYANG = {
    '甲': '阳', '乙': '阴', '丙': '阳', '丁': '阴', '戊': '阳',
    '己': '阴', '庚': '阳', '辛': '阴', '壬': '阳', '癸': '阴'
};

// 月令旺相休囚死
const YUELING_WANGXIANG = {
    '春': { wang: '木', xiang: '火', xiu: '水', qiu: '金', si: '土' },
    '夏': { wang: '火', xiang: '土', xiu: '木', qiu: '水', si: '金' },
    '秋': { wang: '金', xiang: '水', xiu: '土', qiu: '火', si: '木' },
    '冬': { wang: '水', xiang: '木', xiu: '金', qiu: '土', si: '火' }
};
EOFJSX

# 3. 添加解读函数（从mingli-jiedu.js复制核心逻辑，跳过重复定义）
sed -n '140,$p' mingli-jiedu.js >> bazi-calculator-v3-clean.js

# 4. 修改calculateBazi函数以支持解读
cat >> bazi-calculator-v3-clean.js << 'EOFJS2'

// 重写calculateBazi以支持命理解读
// 保存原函数引用
const _originalCalculateBazi = calculateBazi;

calculateBazi = function() {
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
    const jieduBtn = document.getElementById('jieduBtn');
    if (jieduBtn) {
        jieduBtn.style.display = 'block';
    }
};
EOFJS2

# 5. 添加showJiedu函数
cat mingli-jiedu.js中没有的showJiedu代码...

echo "✅ V3 Clean版本创建完成"
wc -l bazi-calculator-v3-clean.js
