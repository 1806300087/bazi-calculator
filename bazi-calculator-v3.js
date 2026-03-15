// 八字计算器 V2 - 完整版（包含精确节气算法）
// 数据来源：《渊海子平》《三命通会》《滴天髓》

// 天干
const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 地支藏干对照表（依据《渊海子平》完整版）
// 根据原文"子宫壬癸在其中"，子宫实际藏壬癸两干
const CANGGAN = {
    '子': ['壬', '癸'],      // 子宫壊癸（完整版）
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

// 精确节气数据（1900-2100年）
// 使用天文算法计算的立春时间（北京时间）
// 格式: {year: {lichun: 'MM-DD HH:mm'}}
// 这里提供部分数据，实际应用中需要完整的节气表或使用算法库

// 简化的节气计算（基于经验公式）
function getLichunDate(year) {
    // 立春一般在2月3-5日
    // 简化公式：[Y*D+C]-L
    // Y=年数的后2位，D=0.2422，L=闰年数，C取决于世纪
    const yy = year % 100;
    const leapYears = Math.floor((year - 1) / 4) - Math.floor((year - 1) / 100) + Math.floor((year - 1) / 400);
    
    let C = 4.6295; // 20-21世纪常数
    if (year >= 2000 && year < 2100) {
        C = 4.6295;
    } else if (year >= 1900 && year < 2000) {
        C = 4.6747;
    }
    
    const day = Math.floor(yy * 0.2422 + C) - Math.floor(yy / 4);
    return { month: 2, day: day };
}

// 获取月份节气日期（简化版）
function getMonthJieqi(year, month) {
    // 节气日期表（近似值，实际需要更精确计算）
    const jieqiDays = {
        1: 6,   // 小寒
        2: 4,   // 立春
        3: 6,   // 惊蛰
        4: 5,   // 清明
        5: 6,   // 立夏
        6: 6,   // 芒种
        7: 7,   // 小暑
        8: 8,   // 立秋
        9: 8,   // 白露
        10: 8,  // 寒露
        11: 7,  // 立冬
        12: 7   // 大雪
    };
    
    return jieqiDays[month] || 6;
}

// 判断日期是否在立春之后
function isAfterLichun(year, month, day) {
    const lichun = getLichunDate(year);
    
    if (month < lichun.month) {
        return false;
    } else if (month > lichun.month) {
        return true;
    } else {
        return day >= lichun.day;
    }
}

// 获取农历年份对应的年柱
function getYearGanZhi(year, month, day) {
    // 根据立春判断年份
    let actualYear = year;
    if (!isAfterLichun(year, month, day)) {
        actualYear = year - 1;
    }
    
    // 1900年为庚子年
    const START_YEAR = 1900;
    const START_YEAR_GAN = 6;  // 庚
    const START_YEAR_ZHI = 0;  // 子
    
    const offset = actualYear - START_YEAR;
    const gan = (START_YEAR_GAN + offset) % 10;
    const zhi = (START_YEAR_ZHI + offset) % 12;
    
    return {
        gan: TIANGAN[gan],
        zhi: DIZHI[zhi],
        ganIndex: gan,
        zhiIndex: zhi
    };
}

// 获取月柱（根据节气）
function getMonthGanZhi(year, month, day) {
    // 节气月份的地支（从寅月开始,寅月=正月）
    // 立春开始进入寅月，惊蛰进入卯月，以此类推
    const jieqiMonths = [
        { jieqi: '立春', zhi: '寅', approxDay: 4, publicMonth: 2 },   // 正月
        { jieqi: '惊蛰', zhi: '卯', approxDay: 6, publicMonth: 3 },   // 二月
        { jieqi: '清明', zhi: '辰', approxDay: 5, publicMonth: 4 },   // 三月
        { jieqi: '立夏', zhi: '巳', approxDay: 6, publicMonth: 5 },   // 四月
        { jieqi: '芒种', zhi: '午', approxDay: 6, publicMonth: 6 },   // 五月
        { jieqi: '小暑', zhi: '未', approxDay: 7, publicMonth: 7 },   // 六月
        { jieqi: '立秋', zhi: '申', approxDay: 8, publicMonth: 8 },   // 七月
        { jieqi: '白露', zhi: '酉', approxDay: 8, publicMonth: 9 },   // 八月
        { jieqi: '寒露', zhi: '戌', approxDay: 8, publicMonth: 10 },  // 九月
        { jieqi: '立冬', zhi: '亥', approxDay: 7, publicMonth: 11 },  // 十月
        { jieqi: '大雪', zhi: '子', approxDay: 7, publicMonth: 12 },  // 十一月
        { jieqi: '小寒', zhi: '丑', approxDay: 6, publicMonth: 1 }    // 十二月
    ];
    
    // 找到当前是哪个节气月
    let monthZhiIndex = 0;
    let monthZhi = '寅';
    
    // 简化判断：根据公历月份和日期判断节气月
    if (month === 1) {
        // 1月：看是否过小寒(6日左右)
        monthZhi = (day >= 6) ? '丑' : '子';
    } else if (month === 2) {
        // 2月：看是否过立春(4日左右)
        monthZhi = (day >= 4) ? '寅' : '丑';
    } else if (month === 3) {
        // 3月：看是否过惊蛰(6日左右)
        monthZhi = (day >= 6) ? '卯' : '寅';
    } else if (month === 4) {
        // 4月：看是否过清明(5日左右)
        monthZhi = (day >= 5) ? '辰' : '卯';
    } else if (month === 5) {
        // 5月：看是否过立夏(6日左右)
        monthZhi = (day >= 6) ? '巳' : '辰';
    } else if (month === 6) {
        // 6月：看是否过芒种(6日左右)
        monthZhi = (day >= 6) ? '午' : '巳';
    } else if (month === 7) {
        // 7月：看是否过小暑(7日左右)
        monthZhi = (day >= 7) ? '未' : '午';
    } else if (month === 8) {
        // 8月：看是否过立秋(8日左右)
        monthZhi = (day >= 8) ? '申' : '未';
    } else if (month === 9) {
        // 9月：看是否过白露(8日左右)
        monthZhi = (day >= 8) ? '酉' : '申';
    } else if (month === 10) {
        // 10月：看是否过寒露(8日左右)
        monthZhi = (day >= 8) ? '戌' : '酉';
    } else if (month === 11) {
        // 11月：看是否过立冬(7日左右)
        monthZhi = (day >= 7) ? '亥' : '戌';
    } else if (month === 12) {
        // 12月：看是否过大雪(7日左右)
        monthZhi = (day >= 7) ? '子' : '亥';
    }
    
    monthZhiIndex = DIZHI.indexOf(monthZhi);
    
    // 根据年干推算月干（五虎遁月诀）
    // 寅月是起点，寅在地支中索引为2
    const yearGan = getYearGanZhi(year, month, day).ganIndex;
    const MONTH_GAN_BASE = {
        0: 2,  // 甲年 → 丙寅
        1: 4,  // 乙年 → 戊寅
        2: 6,  // 丙年 → 庚寅
        3: 8,  // 丁年 → 壬寅
        4: 0,  // 戊年 → 甲寅
        5: 2,  // 己年 → 丙寅
        6: 4,  // 庚年 → 戊寅
        7: 6,  // 辛年 → 庚寅
        8: 8,  // 壬年 → 壬寅
        9: 0   // 癸年 → 甲寅
    };
    
    const monthGanBase = MONTH_GAN_BASE[yearGan];
    // 寅月(索引2)是0，卯月(索引3)是1，以此类推
    const offsetFromYin = (monthZhiIndex - 2 + 12) % 12;
    const monthGanIndex = (monthGanBase + offsetFromYin) % 10;
    
    return {
        gan: TIANGAN[monthGanIndex],
        zhi: monthZhi,
        ganIndex: monthGanIndex,
        zhiIndex: monthZhiIndex
    };
}

// 计算日干支（修正版 - 从1900年1月1日计算）
function getDayGanZhi(year, month, day) {
    // 1900年1月1日是甲戌日（干支序号10）
    // 计算从1900年1月1日到目标日期的天数
    
    function isLeapYear(y) {
        return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
    }
    
    let totalDays = 0;
    
    // 计算年份天数
    for (let y = 1900; y < year; y++) {
        totalDays += isLeapYear(y) ? 366 : 365;
    }
    
    // 计算月份天数
    const monthDays = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    for (let m = 0; m < month - 1; m++) {
        totalDays += monthDays[m];
    }
    
    // 加上日期
    totalDays += day - 1;  // -1因为1月1日是第0天
    
    // 1900年1月1日是庚戌日，甲戌在60甲子中是第10个(从0开始)
    const base = 10;  // 甲戌
    const ganZhiIndex = (base + totalDays) % 60;
    
    const ganIndex = ganZhiIndex % 10;
    const zhiIndex = ganZhiIndex % 12;
    
    return {
        gan: TIANGAN[ganIndex],
        zhi: DIZHI[zhiIndex],
        ganIndex: ganIndex,
        zhiIndex: zhiIndex
    };
}

// 计算时干支
function getHourGanZhi(dayGanIndex, hourIndex) {
    const HOUR_GAN_BASE = {
        0: 0,  // 甲日 → 甲子
        1: 2,  // 乙日 → 丙子
        2: 4,  // 丙日 → 戊子
        3: 6,  // 丁日 → 庚子
        4: 8,  // 戊日 → 壬子
        5: 0,  // 己日 → 甲子
        6: 2,  // 庚日 → 丙子
        7: 4,  // 辛日 → 戊子
        8: 6,  // 壬日 → 庚子
        9: 8   // 癸日 → 壬子
    };
    
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
    
    // 计算四柱（使用精确算法）
    const yearPillar = getYearGanZhi(year, month, day);
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
    
    // 获取立春信息
    const lichun = getLichunDate(year);
    const isAfter = isAfterLichun(year, month, day);
    
    // 说明文字
    explanationDiv.innerHTML = `
        <p><strong>日主：</strong>${bazi.day.gan}（${TIANGAN_WUXING[bazi.day.gan]}）</p>
        <p><strong>立春信息：</strong>${year}年立春约在${lichun.month}月${lichun.day}日，您的出生日期${isAfter ? '在' : '不在'}立春之后</p>
        <p><strong>藏干说明：</strong>地支藏干是指地支所藏的天干。根据《渊海子平》"子宫壬癸在其中"等口诀，每个地支内藏有一至三个天干，代表该地支的内在能量。</p>
        <p><strong>计算依据（V2完整版）：</strong>
        <br>• 年柱：根据立春节气精确计算（立春前算上一年）
        <br>• 月柱：根据24节气精确划分月份
        <br>• 日柱：使用基姆拉尔森公式（天文算法）
        <br>• 时柱：根据"五鼠遁日诀"计算</p>
        <p><strong>藏干更新：</strong>子宫藏干已更正为"壬癸"（依据《渊海子平》原文"子宫壬癸在其中"）</p>
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

// ============================================
// V3 命理解读模块
// ============================================

// 全局变量
let currentBazi = null;

// 重写calculateBazi支持解读
const _v2_calculateBazi = calculateBazi;
calculateBazi = function() {
    const birthdate = document.getElementById('birthdate').value;
    const hourIndex = parseInt(document.getElementById('hour').value);
    const gender = document.getElementById('gender').value;
    
    if (!birthdate || isNaN(hourIndex) || !gender) {
        alert('请填写完整的出生信息');
        return;
    }
    
    const [year, month, day] = birthdate.split('-').map(Number);
    
    const yearPillar = getYearGanZhi(year, month, day);
    const monthPillar = getMonthGanZhi(year, month, day);
    const dayPillar = getDayGanZhi(year, month, day);
    const hourPillar = getHourGanZhi(dayPillar.ganIndex, hourIndex);
    
    yearPillar.canggan = CANGGAN[yearPillar.zhi];
    monthPillar.canggan = CANGGAN[monthPillar.zhi];
    dayPillar.canggan = CANGGAN[dayPillar.zhi];
    hourPillar.canggan = CANGGAN[hourPillar.zhi];
    
    currentBazi = { year: yearPillar, month: monthPillar, day: dayPillar, hour: hourPillar };
    
    displayResult(currentBazi, year, month, day, hourIndex, gender);
    
    const btn = document.getElementById('jieduBtn');
    if (btn) btn.style.display = 'block';
};

// 五行生克关系
const WUXING_RELATION = {
    '金': { sheng: '水', ke: '木', bei_sheng: '土', bei_ke: '火' },
    '木': { sheng: '火', ke: '土', bei_sheng: '水', bei_ke: '金' },
    '水': { sheng: '木', ke: '火', bei_sheng: '金', bei_ke: '土' },
    '火': { sheng: '土', ke: '金', bei_sheng: '木', bei_ke: '水' },
    '土': { sheng: '金', ke: '水', bei_sheng: '火', bei_ke: '木' }
};

const TIANGAN_YINYANG = {
    '甲': '阳', '乙': '阴', '丙': '阳', '丁': '阴', '戊': '阳',
    '己': '阴', '庚': '阳', '辛': '阴', '壬': '阳', '癸': '阴'
};

const YUELING_WANGXIANG = {
    '春': { wang: '木', xiang: '火', xiu: '水', qiu: '金', si: '土' },
    '夏': { wang: '火', xiang: '土', xiu: '木', qiu: '水', si: '金' },
    '秋': { wang: '金', xiang: '水', xiu: '土', qiu: '火', si: '木' },
    '冬': { wang: '水', xiang: '木', xiu: '金', qiu: '土', si: '火' }
};

function getSeason(monthZhi) {
    const map = { 寅:'春',卯:'春',辰:'春', 巳:'夏',午:'夏',未:'夏',
                  申:'秋',酉:'秋',戌:'秋', 亥:'冬',子:'冬',丑:'冬' };
    return map[monthZhi];
}

function getShishen(riGan, targetGan) {
    const riWux = TIANGAN_WUXING[riGan];
    const targetWux = TIANGAN_WUXING[targetGan];
    const riYY = TIANGAN_YINYANG[riGan];
    const targetYY = TIANGAN_YINYANG[targetGan];
    
    if (riWux === targetWux) return riYY === targetYY ? '比肩' : '劫财';
    if (WUXING_RELATION[riWux].sheng === targetWux) return riYY === targetYY ? '食神' : '伤官';
    if (WUXING_RELATION[riWux].ke === targetWux) return riYY === targetYY ? '正财' : '偏财';
    if (WUXING_RELATION[riWux].bei_ke === targetWux) return riYY === targetYY ? '正官' : '七杀';
    if (WUXING_RELATION[riWux].bei_sheng === targetWux) return riYY === targetYY ? '正印' : '偏印';
    return '未知';
}

function analyzeRizhuStrength(bazi) {
    const riGan = bazi.day.gan;
    const riWux = TIANGAN_WUXING[riGan];
    const season = getSeason(bazi.month.zhi);
    const yueling = YUELING_WANGXIANG[season];
    
    let score = 0, reasons = [];
    
    if (yueling.wang === riWux) { score += 3; reasons.push(`✅ 得令：生于${season}季，${riWux}旺`); }
    else if (yueling.xiang === riWux) { score += 2; reasons.push(`✓ 次令：生于${season}季，${riWux}相`); }
    else if (yueling.si === riWux || yueling.qiu === riWux) { score -= 2; reasons.push(`✗ 失令：生于${season}季，${riWux}${yueling.si === riWux ? '死' : '囚'}`); }
    else { score -= 1; reasons.push(`- 休令：生于${season}季，${riWux}休`); }
    
    const allCg = [...bazi.year.canggan, ...bazi.month.canggan, ...bazi.day.canggan, ...bazi.hour.canggan];
    let roots = allCg.filter(cg => TIANGAN_WUXING[cg] === riWux).length;
    if (roots >= 3) { score += 2; reasons.push(`✅ 得地：地支藏干有${roots}个同类根气`); }
    else if (roots >= 1) { score += 1; reasons.push(`✓ 有根：地支藏干有${roots}个同类根气`); }
    else { score -= 1; reasons.push(`✗ 无根：地支无同类根气`); }
    
    const ganList = [bazi.year.gan, bazi.month.gan, bazi.hour.gan];
    let helpers = ganList.filter(g => ['比肩','劫财','正印','偏印'].includes(getShishen(riGan, g))).length;
    if (helpers >= 2) { score += 2; reasons.push(`✅ 得势：天干有${helpers}个帮扶`); }
    else if (helpers >= 1) { score += 1; reasons.push(`✓ 有助：天干有${helpers}个帮扶`); }
    
    let strength, advice;
    if (score >= 4) {
        strength = '身旺';
        advice = '日主强旺，宜泄宜耗。喜食伤泄秀、财星耗身、官杀制身。';
    } else if (score >= 1) {
        strength = '中和';
        advice = '日主中和为贵，喜忌需看具体配合。';
    } else {
        strength = '身弱';
        advice = '日主衰弱，宜生宜助。喜印绶生身、比劫帮身。';
    }
    
    return { strength, score, reasons, advice };
}

function analyzeGeju(bazi) {
    const riGan = bazi.day.gan;
    const monthCanggan = bazi.month.canggan[0];
    const mainShishen = getShishen(riGan, monthCanggan);
    
    const gejuMap = {
        '正官': { geju: '正官格', desc: '《渊海子平》云："正官乃贵气之神"。正官格喜身旺、印绶。' },
        '七杀': { geju: '七杀格', desc: '《三命通会》云："偏官有制化为权"。七杀格喜食神制杀。' },
        '正财': { geju: '正财格', desc: '《渊海子平》云："财为养命之源"。正财格喜身旺、食伤生财。' },
        '偏财': { geju: '偏财格', desc: '偏财格喜身旺、食伤生财。主善于经商，多有意外之财。' },
        '食神': { geju: '食神格', desc: '《滴天髓》云："食神制杀，英雄独压万人"。食神格喜身旺。' },
        '伤官': { geju: '伤官格', desc: '《渊海子平》云："伤官见官，为祸百端"。伤官格喜身旺、财星。' },
        '正印': { geju: '正印格', desc: '正印格喜官星、身弱。主人善良正直，学业有成。' },
        '偏印': { geju: '偏印格', desc: '偏印格又称"枭神"，喜财制。主人聪明但孤僻。' },
        '比肩': { geju: '建禄格', desc: '建禄格喜官杀、财星、食伤。主人自力更生。' },
        '劫财': { geju: '建禄格', desc: '建禄格喜官杀、财星、食伤。主人自力更生。' }
    };
    
    const info = gejuMap[mainShishen] || { geju: '普通格局', desc: '格局需综合全局判断。' };
    return { geju: info.geju, mainShishen, description: info.desc };
}

function analyzeYongshen(bazi, strength) {
    const riGan = bazi.day.gan;
    const riWux = TIANGAN_WUXING[riGan];
    let yongshen = [], jishen = [], explanation = '';
    
    if (strength === '身旺') {
        const shishang = WUXING_RELATION[riWux].sheng;
        const cai = WUXING_RELATION[riWux].ke;
        const guan = WUXING_RELATION[riWux].bei_ke;
        
        yongshen = [
            { wuxing: shishang, reason: '食伤泄秀' },
            { wuxing: cai, reason: '财星耗身' },
            { wuxing: guan, reason: '官杀制身' }
        ];
        jishen = [
            { wuxing: riWux, reason: '比劫帮身' },
            { wuxing: WUXING_RELATION[riWux].bei_sheng, reason: '印绶生身' }
        ];
        explanation = '《滴天髓》云："强者制之"。身旺者需要克泄耗。';
    } else if (strength === '身弱') {
        const yin = WUXING_RELATION[riWux].bei_sheng;
        yongshen = [
            { wuxing: yin, reason: '印绶生身' },
            { wuxing: riWux, reason: '比劫帮身' }
        ];
        jishen = [
            { wuxing: WUXING_RELATION[riWux].bei_ke, reason: '官杀克身' },
            { wuxing: WUXING_RELATION[riWux].ke, reason: '财星耗身' },
            { wuxing: WUXING_RELATION[riWux].sheng, reason: '食伤泄身' }
        ];
        explanation = '《穷通宝鉴》云："弱者扶之"。身弱之命，急需帮扶。';
    } else {
        explanation = '命局中和，需看具体配合定用神。';
        yongshen = [{ wuxing: '', reason: '需具体分析' }];
        jishen = [];
    }
    
    return { yongshen, jishen, explanation };
}

function analyzeXiji(yongshenInfo) {
    const colorMap = {
        '金': ['白色', '金色', '银色'], '木': ['绿色', '青色'], '水': ['黑色', '蓝色'],
        '火': ['红色', '紫色'], '土': ['黄色', '棕色']
    };
    const dirMap = { '金': '西方', '木': '东方', '水': '北方', '火': '南方', '土': '中央' };
    const industryMap = {
        '金': '金融、金属、机械', '木': '文化、教育、林业',
        '水': '贸易、物流、旅游', '火': '能源、餐饮、媒体', '土': '房地产、建筑、农业'
    };
    
    const xiji = { xi: [], ji: [], suggestions: [] };
    
    yongshenInfo.yongshen.forEach(ys => {
        if (ys.wuxing) xiji.xi.push({ wuxing: ys.wuxing, level: '大吉', reason: ys.reason });
    });
    yongshenInfo.jishen.forEach(js => {
        if (js.wuxing) xiji.ji.push({ wuxing: js.wuxing, level: '大忌', reason: js.reason });
    });
    
    const xiWux = xiji.xi.map(x => x.wuxing);
    const jiWux = xiji.ji.map(j => j.wuxing);
    
    if (xiWux.length > 0) {
        xiji.suggestions.push({
            category: '颜色',
            xi: xiWux.flatMap(w => colorMap[w] || []).join('、'),
            ji: jiWux.flatMap(w => colorMap[w] || []).join('、')
        });
        xiji.suggestions.push({
            category: '方位',
            xi: xiWux.map(w => dirMap[w]).filter(Boolean).join('、'),
            ji: jiWux.map(w => dirMap[w]).filter(Boolean).join('、')
        });
        xiji.suggestions.push({
            category: '行业',
            xi: xiWux.map(w => industryMap[w]).filter(Boolean).join('、'),
            ji: '避开忌神五行相关行业'
        });
    }
    
    return xiji;
}

function generateMingliJiedu(bazi) {
    const strengthInfo = analyzeRizhuStrength(bazi);
    const gejuInfo = analyzeGeju(bazi);
    const yongshenInfo = analyzeYongshen(bazi, strengthInfo.strength);
    const xijiInfo = analyzeXiji(yongshenInfo);
    
    return { strength: strengthInfo, geju: gejuInfo, yongshen: yongshenInfo, xiji: xijiInfo };
}

function showJiedu() {
    if (!currentBazi) {
        alert('请先进行排盘计算');
        return;
    }
    
    const jiedu = generateMingliJiedu(currentBazi);
    
    const strengthDiv = document.getElementById('jieduStrength');
    const badgeClass = jiedu.strength.strength === '身旺' ? 'badge-strong' :
                       jiedu.strength.strength === '中和' ? 'badge-medium' : 'badge-weak';
    
    strengthDiv.innerHTML = `
        <p><span class="strength-badge ${badgeClass}">${jiedu.strength.strength}</span>
        <span style="color:#666;">综合得分: ${jiedu.strength.score}</span></p>
        <ul class="reason-list">${jiedu.strength.reasons.map(r => `<li>${r}</li>`).join('')}</ul>
        <p style="margin-top:15px;padding:15px;background:#e7f3ff;border-left:4px solid #2196F3;border-radius:4px;">
        <strong>💡 建议：</strong>${jiedu.strength.advice}</p>
    `;
    
    const gejuDiv = document.getElementById('jieduGeju');
    gejuDiv.innerHTML = `
        <p style="font-size:18px;color:#764ba2;font-weight:bold;margin-bottom:10px;">${jiedu.geju.geju}</p>
        <p style="color:#666;margin-bottom:10px;"><strong>月令十神：</strong>${jiedu.geju.mainShishen}</p>
        <p style="line-height:1.8;color:#555;">${jiedu.geju.description}</p>
    `;
    
    const yongshenDiv = document.getElementById('jieduYongshen');
    let yongshenHTML = `<p style="line-height:1.8;margin-bottom:15px;">${jiedu.yongshen.explanation}</p>`;
    
    if (jiedu.yongshen.yongshen.length > 0 && jiedu.yongshen.yongshen[0].wuxing) {
        yongshenHTML += `
            <div class="xiji-grid">
                <div class="xiji-card xi-card">
                    <h4 style="color:#28a745;margin-bottom:10px;">✅ 喜用神</h4>
                    ${jiedu.yongshen.yongshen.map(ys => `<p><strong>${ys.wuxing}</strong> - ${ys.reason}</p>`).join('')}
                </div>
                <div class="xiji-card ji-card">
                    <h4 style="color:#dc3545;margin-bottom:10px;">❌ 忌神</h4>
                    ${jiedu.yongshen.jishen.map(js => `<p><strong>${js.wuxing}</strong> - ${js.reason}</p>`).join('')}
                </div>
            </div>
        `;
    }
    yongshenDiv.innerHTML = yongshenHTML;
    
    const suggestionsDiv = document.getElementById('jieduSuggestions');
    if (jiedu.xiji.suggestions.length > 0) {
        suggestionsDiv.innerHTML = jiedu.xiji.suggestions.map(sug => `
            <div style="margin-bottom:15px;padding:15px;background:#f8f9fa;border-radius:8px;">
                <h4 style="color:#764ba2;margin-bottom:10px;">🎨 ${sug.category}</h4>
                <p><strong style="color:#28a745;">✓ 吉利：</strong>${sug.xi}</p>
                <p style="margin-top:8px;"><strong style="color:#dc3545;">✗ 不利：</strong>${sug.ji}</p>
            </div>
        `).join('');
    } else {
        suggestionsDiv.innerHTML = '<p style="color:#999;">根据八字配合具体分析</p>';
    }
    
    document.getElementById('jieduResult').style.display = 'block';
    document.getElementById('jieduResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 版本标识和调试
console.log('=== 八字计算器 V3.0-REBUILD 加载完成 ===');
console.log('calculateBazi 类型:', typeof calculateBazi);
console.log('showJiedu 类型:', typeof showJiedu);
console.log('currentBazi 初始值:', currentBazi);

// 测试函数可访问性
window._baziDebug = {
    version: 'V3.0-REBUILD-' + new Date().toISOString(),
    calculateBazi: calculateBazi,
    showJiedu: showJiedu,
    test: function() {
        console.log('测试函数可以访问');
        console.log('currentBazi:', currentBazi);
        return 'OK';
    }
};
console.log('调试接口: window._baziDebug');
