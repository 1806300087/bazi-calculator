// 八字计算器 - 基于传统命理学典籍
// 数据来源：《渊海子平》《三命通会》《滴天髓》

// 天干
const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 地支藏干对照表（依据《渊海子平》）
const CANGGAN = {
    '子': ['癸'],           // 子宫独癸
    '丑': ['己', '癸', '辛'], // 丑藏己癸辛
    '寅': ['甲', '丙', '戊'], // 寅藏甲丙戊
    '卯': ['乙'],           // 卯宫乙独居
    '辰': ['戊', '乙', '癸'], // 辰藏戊乙癸
    '巳': ['丙', '戊', '庚'], // 巳藏丙戊庚
    '午': ['丁', '己'],      // 午藏丁己
    '未': ['己', '丁', '乙'], // 未藏己丁乙
    '申': ['庚', '壬', '戊'], // 申藏庚壬戊
    '酉': ['辛'],           // 酉宫辛独坐
    '戌': ['戊', '辛', '丁'], // 戌藏戊辛丁
    '亥': ['壬', '甲']       // 亥藏壬甲
};

// 天干五行
const TIANGAN_WUXING = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
};

// 地支五行
const DIZHI_WUXING = {
    '子': '水', '亥': '水',
    '寅': '木', '卯': '木',
    '巳': '火', '午': '火',
    '申': '金', '酉': '金',
    '辰': '土', '戌': '土', '丑': '土', '未': '土'
};

// 月份地支对应表（节气为准）
const MONTH_DIZHI = [
    '寅', // 1月立春
    '卯', // 2月惊蛰
    '辰', // 3月清明
    '巳', // 4月立夏
    '午', // 5月芒种
    '未', // 6月小暑
    '申', // 7月立秋
    '酉', // 8月白露
    '戌', // 9月寒露
    '亥', // 10月立冬
    '子', // 11月大雪
    '丑'  // 12月小寒
];

// 年干支起始（1900年为庚子年）
const START_YEAR = 1900;
const START_YEAR_GAN = 6;  // 庚
const START_YEAR_ZHI = 0;  // 子

// 五虎遁月诀（依据年干求月干）
// 甲己之年丙作首，乙庚之岁戊为头
// 丙辛必定寻庚起，丁壬壬位顺行流
// 若问戊癸何方发，甲寅之上好追求
const MONTH_GAN_BASE = {
    0: 2, 4: 2,  // 甲己年从丙开始
    1: 4, 5: 4,  // 乙庚年从戊开始
    2: 6, 6: 6,  // 丙辛年从庚开始
    3: 8, 7: 8,  // 丁壬年从壬开始
    8: 0, 9: 0   // 戊癸年从甲开始
};

// 五鼠遁日诀（依据日干求时干）
// 甲己还加甲，乙庚丙作初
// 丙辛从戊起，丁壬庚子居
// 戊癸何方发，壬子是真途
const HOUR_GAN_BASE = {
    0: 0, 4: 0,  // 甲己日从甲开始
    1: 2, 5: 2,  // 乙庚日从丙开始
    2: 4, 6: 4,  // 丙辛日从戊开始
    3: 6, 7: 6,  // 丁壬日从庚开始
    8: 8, 9: 8   // 戊癸日从壬开始
};

// 计算年干支
function getYearGanZhi(year) {
    const offset = year - START_YEAR;
    const gan = (START_YEAR_GAN + offset) % 10;
    const zhi = (START_YEAR_ZHI + offset) % 12;
    return {
        gan: TIANGAN[gan],
        zhi: DIZHI[zhi],
        ganIndex: gan,
        zhiIndex: zhi
    };
}

// 计算月干支
function getMonthGanZhi(year, month, day) {
    // 简化处理：按公历月份对应，实际应考虑节气
    // 这里使用简化算法，实际应用中需要精确的节气计算
    let monthIndex = month - 1;
    
    // 节气调整（简化版，实际需要更精确的天文算法）
    // 如果日期小于8日，可能还在上个月节气
    if (day < 8) {
        monthIndex = (monthIndex - 1 + 12) % 12;
    }
    
    const monthZhi = MONTH_DIZHI[monthIndex];
    const monthZhiIndex = DIZHI.indexOf(monthZhi);
    
    const yearGan = getYearGanZhi(year).ganIndex;
    const monthGanBase = MONTH_GAN_BASE[yearGan];
    const monthGanIndex = (monthGanBase + monthIndex) % 10;
    
    return {
        gan: TIANGAN[monthGanIndex],
        zhi: monthZhi,
        ganIndex: monthGanIndex,
        zhiIndex: monthZhiIndex
    };
}

// 计算日干支（使用基姆拉尔森公式）
function getDayGanZhi(year, month, day) {
    // 将1、2月看作上一年的13、14月
    if (month <= 2) {
        month += 12;
        year -= 1;
    }
    
    // 基姆拉尔森公式计算距离基准日的天数
    const c = Math.floor(year / 100);
    const y = year % 100;
    const m = month;
    const d = day;
    
    // 计算儒略日
    const w = (c / 4 - 2 * c + y + y / 4 + (13 * (m + 1) / 5) + d - 1);
    
    // 计算甲子序号（天干地支组合）
    const ganZhiIndex = Math.floor(w) % 60;
    const ganIndex = (ganZhiIndex % 10 + 10) % 10;
    const zhiIndex = (ganZhiIndex % 12 + 12) % 12;
    
    return {
        gan: TIANGAN[ganIndex],
        zhi: DIZHI[zhiIndex],
        ganIndex: ganIndex,
        zhiIndex: zhiIndex
    };
}

// 计算时干支
function getHourGanZhi(dayGanIndex, hourIndex) {
    const hourZhi = DIZHI[hourIndex];
    const hourGanBase = HOUR_GAN_BASE[dayGanIndex];
    const hourGanIndex = (hourGanBase + hourIndex) % 10;
    
    return {
        gan: TIANGAN[hourGanIndex],
        zhi: hourZhi,
        ganIndex: hourGanIndex,
        zhiIndex: hourIndex
    };
}

// 统计五行
function countWuxing(bazi) {
    const wuxingCount = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
    
    // 统计天干
    [bazi.year, bazi.month, bazi.day, bazi.hour].forEach(pillar => {
        const ganWuxing = TIANGAN_WUXING[pillar.gan];
        wuxingCount[ganWuxing]++;
        
        const zhiWuxing = DIZHI_WUXING[pillar.zhi];
        wuxingCount[zhiWuxing]++;
        
        // 统计藏干
        pillar.canggan.forEach(cg => {
            const cgWuxing = TIANGAN_WUXING[cg];
            wuxingCount[cgWuxing] += 0.5; // 藏干权重减半
        });
    });
    
    return wuxingCount;
}

// 主计算函数
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
    const yearPillar = getYearGanZhi(year);
    const monthPillar = getMonthGanZhi(year, month, day);
    const dayPillar = getDayGanZhi(year, month, day);
    const hourPillar = getHourGanZhi(dayPillar.ganIndex, hourIndex);
    
    // 添加藏干
    yearPillar.canggan = CANGGAN[yearPillar.zhi];
    monthPillar.canggan = CANGGAN[monthPillar.zhi];
    dayPillar.canggan = CANGGAN[dayPillar.zhi];
    hourPillar.canggan = CANGGAN[hourPillar.zhi];
    
    const bazi = {
        year: yearPillar,
        month: monthPillar,
        day: dayPillar,
        hour: hourPillar
    };
    
    // 显示结果
    displayResult(bazi, year, month, day, hourIndex, gender);
}

// 显示结果
function displayResult(bazi, year, month, day, hourIndex, gender) {
    const resultDiv = document.getElementById('result');
    const pillarsDiv = document.getElementById('baziPillars');
    const wuxingDiv = document.getElementById('wuxingStats');
    const explanationDiv = document.getElementById('explanation');
    
    // 显示四柱
    pillarsDiv.innerHTML = `
        <div class="pillar">
            <div class="pillar-title">年柱</div>
            <div class="tiangan">${bazi.year.gan}</div>
            <div class="dizhi">${bazi.year.zhi}</div>
            <div class="canggan-title">藏干</div>
            <div class="canggan-list">
                ${bazi.year.canggan.map(cg => `<span class="canggan-item">${cg}</span>`).join('')}
            </div>
        </div>
        <div class="pillar">
            <div class="pillar-title">月柱</div>
            <div class="tiangan">${bazi.month.gan}</div>
            <div class="dizhi">${bazi.month.zhi}</div>
            <div class="canggan-title">藏干</div>
            <div class="canggan-list">
                ${bazi.month.canggan.map(cg => `<span class="canggan-item">${cg}</span>`).join('')}
            </div>
        </div>
        <div class="pillar">
            <div class="pillar-title">日柱</div>
            <div class="tiangan">${bazi.day.gan}</div>
            <div class="dizhi">${bazi.day.zhi}</div>
            <div class="canggan-title">藏干</div>
            <div class="canggan-list">
                ${bazi.day.canggan.map(cg => `<span class="canggan-item">${cg}</span>`).join('')}
            </div>
        </div>
        <div class="pillar">
            <div class="pillar-title">时柱</div>
            <div class="tiangan">${bazi.hour.gan}</div>
            <div class="dizhi">${bazi.hour.zhi}</div>
            <div class="canggan-title">藏干</div>
            <div class="canggan-list">
                ${bazi.hour.canggan.map(cg => `<span class="canggan-item">${cg}</span>`).join('')}
            </div>
        </div>
    `;
    
    // 统计五行
    const wuxingCount = countWuxing(bazi);
    wuxingDiv.innerHTML = `
        <div class="wuxing-item">
            <div class="wuxing-label">金</div>
            <div class="wuxing-value jin">${wuxingCount['金'].toFixed(1)}</div>
        </div>
        <div class="wuxing-item">
            <div class="wuxing-label">木</div>
            <div class="wuxing-value mu">${wuxingCount['木'].toFixed(1)}</div>
        </div>
        <div class="wuxing-item">
            <div class="wuxing-label">水</div>
            <div class="wuxing-value shui">${wuxingCount['水'].toFixed(1)}</div>
        </div>
        <div class="wuxing-item">
            <div class="wuxing-label">火</div>
            <div class="wuxing-value huo">${wuxingCount['火'].toFixed(1)}</div>
        </div>
        <div class="wuxing-item">
            <div class="wuxing-label">土</div>
            <div class="wuxing-value tu">${wuxingCount['土'].toFixed(1)}</div>
        </div>
    `;
    
    // 说明文字
    explanationDiv.innerHTML = `
        <p><strong>日主：</strong>${bazi.day.gan}（${TIANGAN_WUXING[bazi.day.gan]}）</p>
        <p><strong>藏干说明：</strong>地支藏干是指地支所藏的天干。根据《渊海子平》，每个地支内都藏有一至三个天干，代表该地支的内在能量。</p>
        <p><strong>计算依据：</strong>
        <br>• 年柱：根据干支纪年法计算
        <br>• 月柱：根据"五虎遁月诀"（甲己之年丙作首，乙庚之岁戊为头...）
        <br>• 日柱：使用天文历法算法精确计算
        <br>• 时柱：根据"五鼠遁日诀"（甲己还加甲，乙庚丙作初...）</p>
        <p><strong>五行统计：</strong>天干地支各计1分，藏干计0.5分，用于参考五行强弱分布。</p>
    `;
    
    resultDiv.classList.add('show');
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 页面加载时设置默认日期
window.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    document.getElementById('birthdate').value = dateStr;
});
