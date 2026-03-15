// 八字计算器 V3 - 包含命理解读功能
// 数据来源：《渊海子平》《三命通会》《滴天髓》《穷通宝鉴》

// 基础数据定义
const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const CANGGAN = {
    '子': ['壬', '癸'], '丑': ['己', '癸', '辛'], '寅': ['甲', '丙', '戊'], '卯': ['乙'],
    '辰': ['戊', '乙', '癸'], '巳': ['丙', '戊', '庚'], '午': ['丁', '己'], '未': ['己', '丁', '乙'],
    '申': ['庚', '壬', '戊'], '酉': ['辛'], '戌': ['戊', '辛', '丁'], '亥': ['壬', '甲']
};

const TIANGAN_WUXING = {
    '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
    '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
};

const DIZHI_WUXING = {
    '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
    '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

const TIANGAN_YINYANG = {
    '甲': '阳', '乙': '阴', '丙': '阳', '丁': '阴', '戊': '阳',
    '己': '阴', '庚': '阳', '辛': '阴', '壬': '阳', '癸': '阴'
};

const WUXING_RELATION = {
    '金': { sheng: '水', ke: '木', bei_sheng: '土', bei_ke: '火' },
    '木': { sheng: '火', ke: '土', bei_sheng: '水', bei_ke: '金' },
    '水': { sheng: '木', ke: '火', bei_sheng: '金', bei_ke: '土' },
    '火': { sheng: '土', ke: '金', bei_sheng: '木', bei_ke: '水' },
    '土': { sheng: '金', ke: '水', bei_sheng: '火', bei_ke: '木' }
};

const YUELING_WANGXIANG = {
    '春': { wang: '木', xiang: '火', xiu: '水', qiu: '金', si: '土' },
    '夏': { wang: '火', xiang: '土', xiu: '木', qiu: '水', si: '金' },
    '秋': { wang: '金', xiang: '水', xiu: '土', qiu: '火', si: '木' },
    '冬': { wang: '水', xiang: '木', xiu: '金', qiu: '土', si: '火' }
};
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
    
// === 命理解读模块 ===
const YUELING_WANGXIANG = {
    '春': { wang: '木', xiang: '火', xiu: '水', qiu: '金', si: '土' },
    '夏': { wang: '火', xiang: '土', xiu: '木', qiu: '水', si: '金' },
    '秋': { wang: '金', xiang: '水', xiu: '土', qiu: '火', si: '木' },
    '冬': { wang: '水', xiang: '木', xiu: '金', qiu: '土', si: '火' }
};

// 判断季节
function getSeason(monthZhi) {
    const chun = ['寅', '卯', '辰'];
    const xia = ['巳', '午', '未'];
    const qiu = ['申', '酉', '戌'];
    const dong = ['亥', '子', '丑'];
    
    if (chun.includes(monthZhi)) return '春';
    if (xia.includes(monthZhi)) return '夏';
    if (qiu.includes(monthZhi)) return '秋';
    if (dong.includes(monthZhi)) return '冬';
}

// 计算十神
function getShishen(riGan, targetGan) {
    const riWuxing = TIANGAN_WUXING[riGan];
    const targetWuxing = TIANGAN_WUXING[targetGan];
    const riYinyang = TIANGAN_YINYANG[riGan];
    const targetYinyang = TIANGAN_YINYANG[targetGan];
    
    // 比劫
    if (riWuxing === targetWuxing) {
        if (riGan === targetGan) return '比肩';
        return riYinyang === targetYinyang ? '比肩' : '劫财';
    }
    
    // 我生（食伤）
    if (WUXING_RELATION[riWuxing].sheng === targetWuxing) {
        return riYinyang === targetYinyang ? '食神' : '伤官';
    }
    
    // 我克（财）
    if (WUXING_RELATION[riWuxing].ke === targetWuxing) {
        return riYinyang === targetYinyang ? '正财' : '偏财';
    }
    
    // 克我（官杀）
    if (WUXING_RELATION[riWuxing].bei_ke === targetWuxing) {
        return riYinyang === targetYinyang ? '正官' : '七杀';
    }
    
    // 生我（印）
    if (WUXING_RELATION[riWuxing].bei_sheng === targetWuxing) {
        return riYinyang === targetYinyang ? '正印' : '偏印';
    }
    
    return '未知';
}

// 分析日主强弱
function analyzeRizhuStrength(bazi) {
    const riGan = bazi.day.gan;
    const riWuxing = TIANGAN_WUXING[riGan];
    const season = getSeason(bazi.month.zhi);
    const yueling = YUELING_WANGXIANG[season];
    
    let score = 0;
    let reasons = [];
    
    // 1. 得令（月令）
    if (yueling.wang === riWuxing) {
        score += 3;
        reasons.push(`✅ 得令：生于${season}季，${riWuxing}旺`);
    } else if (yueling.xiang === riWuxing) {
        score += 2;
        reasons.push(`✓ 次令：生于${season}季，${riWuxing}相`);
    } else if (yueling.si === riWuxing || yueling.qiu === riWuxing) {
        score -= 2;
        reasons.push(`✗ 失令：生于${season}季，${riWuxing}${yueling.si === riWuxing ? '死' : '囚'}`);
    } else {
        score -= 1;
        reasons.push(`- 休令：生于${season}季，${riWuxing}休`);
    }
    
    // 2. 得地（地支根气）
    const zhiList = [bazi.year.zhi, bazi.month.zhi, bazi.day.zhi, bazi.hour.zhi];
    const cangganList = [
        ...bazi.year.canggan,
        ...bazi.month.canggan,
        ...bazi.day.canggan,
        ...bazi.hour.canggan
    ];
    
    let roots = 0;
    cangganList.forEach(cg => {
        if (TIANGAN_WUXING[cg] === riWuxing) {
            roots++;
        }
    });
    
    if (roots >= 3) {
        score += 2;
        reasons.push(`✅ 得地：地支藏干有${roots}个同类根气，根基深厚`);
    } else if (roots >= 1) {
        score += 1;
        reasons.push(`✓ 有根：地支藏干有${roots}个同类根气`);
    } else {
        score -= 1;
        reasons.push(`✗ 无根：地支无同类根气，为浮萍之木`);
    }
    
    // 3. 得势（天干帮扶）
    const ganList = [bazi.year.gan, bazi.month.gan, bazi.hour.gan];
    let helpers = 0;
    
    ganList.forEach(gan => {
        const shishen = getShishen(riGan, gan);
        if (shishen === '比肩' || shishen === '劫财') {
            helpers++;
        }
        // 印生身
        if (shishen === '正印' || shishen === '偏印') {
            helpers++;
        }
    });
    
    if (helpers >= 2) {
        score += 2;
        reasons.push(`✅ 得势：天干有${helpers}个帮扶，兄弟朋友多助`);
    } else if (helpers >= 1) {
        score += 1;
        reasons.push(`✓ 有助：天干有${helpers}个帮扶`);
    } else {
        reasons.push(`- 孤立：天干无帮扶`);
    }
    
    // 判断强弱
    let strength, advice;
    if (score >= 4) {
        strength = '身旺';
        advice = '日主强旺，宜泄宜耗。喜食伤泄秀、财星耗身、官杀制身。忌比劫帮身、印绶生身。';
    } else if (score >= 1) {
        strength = '中和';
        advice = '日主中和为贵，喜忌需看具体配合。一般喜印比帮扶，忌官杀克身。';
    } else {
        strength = '身弱';
        advice = '日主衰弱，宜生宜助。喜印绶生身、比劫帮身。忌财星耗身、食伤泄身、官杀克身。';
    }
    
    return {
        strength,
        score,
        reasons,
        advice
    };
}

// 分析格局
function analyzeGeju(bazi) {
    const riGan = bazi.day.gan;
    const monthGan = bazi.month.gan;
    const monthZhi = bazi.month.zhi;
    const monthShishen = getShishen(riGan, monthGan);
    
    // 月令取格（以月令十神定格局）
    let geju = '';
    let description = '';
    
    // 检查月令藏干主气
    const monthCanggan = bazi.month.canggan[0]; // 主气
    const mainShishen = getShishen(riGan, monthCanggan);
    
    switch(mainShishen) {
        case '正官':
            geju = '正官格';
            description = '《渊海子平》云："正官乃贵气之神"。正官格喜身旺、印绶，忌伤官、七杀。主人品行端正，易得贵人提拔。';
            break;
        case '七杀':
            geju = '七杀格';
            description = '《三命通会》云："偏官有制化为权"。七杀格喜食神制杀、印绶化杀，忌财生杀。主人果敢刚毅，有权威。';
            break;
        case '正财':
            geju = '正财格';
            description = '《渊海子平》云："财为养命之源"。正财格喜身旺、食伤生财，忌比劫夺财、印绶坏财。主财运稳定，勤俭持家。';
            break;
        case '偏财':
            geju = '偏财格';
            description = '偏财格喜身旺、食伤生财，忌比劫劫财。主善于经商，多有意外之财，父缘深厚。';
            break;
        case '食神':
            geju = '食神格';
            description = '《滴天髓》云："食神制杀，英雄独压万人"。食神格喜身旺、财星，忌枭神夺食。主人温和有福，才华横溢。';
            break;
        case '伤官':
            geju = '伤官格';
            description = '《渊海子平》云："伤官见官，为祸百端"。伤官格喜身旺、财星、印绶，最忌见正官。主人聪明但傲气，才华出众。';
            break;
        case '正印':
            geju = '正印格';
            description = '正印格喜官星、身弱，忌财星坏印。主人善良正直，学业有成，得母亲或贵人之助。';
            break;
        case '偏印':
            geju = '偏印格';
            description = '偏印格又称"枭神"，喜财制、劫合，忌食神。主人聪明但孤僻，善于偏门学问。';
            break;
        case '比肩':
        case '劫财':
            geju = '建禄格';
            description = '建禄格喜官杀、财星、食伤，忌比劫重重。主人自力更生，兄弟朋友多助。';
            break;
        default:
            geju = '普通格局';
            description = '格局需综合全局判断，不可一概而论。';
    }
    
    return {
        geju,
        mainShishen,
        description
    };
}

// 分析用神
function analyzeYongshen(bazi, strength) {
    const riGan = bazi.day.gan;
    const riWuxing = TIANGAN_WUXING[riGan];
    
    let yongshen = [];
    let jishen = [];
    let explanation = '';
    
    if (strength === '身旺') {
        // 身旺用财官食伤
        const cai = WUXING_RELATION[riWuxing].ke;
        const guan = WUXING_RELATION[riWuxing].bei_ke;
        const shishang = WUXING_RELATION[riWuxing].sheng;
        
        yongshen = [
            { wuxing: shishang, reason: '食伤泄秀，发挥才华' },
            { wuxing: cai, reason: '财星耗身，求财有道' },
            { wuxing: guan, reason: '官杀制身，建立权威' }
        ];
        
        const bi = riWuxing;
        const yin = WUXING_RELATION[riWuxing].bei_sheng;
        
        jishen = [
            { wuxing: bi, reason: '比劫帮身，争财夺利' },
            { wuxing: yin, reason: '印绶生身，过旺无制' }
        ];
        
        explanation = '《滴天髓》云："强者制之，弱者扶之"。身旺者需要克泄耗，方能中和。食伤为才华表达，财为求财之道，官为建功立业，皆为美用。';
        
    } else if (strength === '身弱') {
        // 身弱用印比
        const yin = WUXING_RELATION[riWuxing].bei_sheng;
        const bi = riWuxing;
        
        yongshen = [
            { wuxing: yin, reason: '印绶生身，贵人相助' },
            { wuxing: bi, reason: '比劫帮身，兄友之力' }
        ];
        
        const cai = WUXING_RELATION[riWuxing].ke;
        const shishang = WUXING_RELATION[riWuxing].sheng;
        const guan = WUXING_RELATION[riWuxing].bei_ke;
        
        jishen = [
            { wuxing: guan, reason: '官杀克身，灾病缠身' },
            { wuxing: cai, reason: '财星耗身，求财辛苦' },
            { wuxing: shishang, reason: '食伤泄身，才华难显' }
        ];
        
        explanation = '《穷通宝鉴》云："弱者扶之，衰者生之"。身弱之命，急需帮扶。印为生身之源，比为助身之力，二者皆为救命之神。';
        
    } else {
        // 中和
        explanation = '命局中和，需看具体配合定用神。一般喜印比护身，调候为用。';
        yongshen = [
            { wuxing: '', reason: '需具体分析' }
        ];
    }
    
    return {
        yongshen,
        jishen,
        explanation
    };
}

// 分析五行喜忌
function analyzeXiji(bazi, strengthInfo, yongshenInfo) {
    const xiji = {
        xi: [],  // 喜
        ji: [],  // 忌
        suggestions: []
    };
    
    // 根据用神确定喜忌
    yongshenInfo.yongshen.forEach(ys => {
        if (ys.wuxing) {
            xiji.xi.push({
                wuxing: ys.wuxing,
                level: '大吉',
                reason: ys.reason
            });
        }
    });
    
    yongshenInfo.jishen.forEach(js => {
        if (js.wuxing) {
            xiji.ji.push({
                wuxing: js.wuxing,
                level: '大忌',
                reason: js.reason
            });
        }
    });
    
    // 生活建议
    const xiWuxing = xiji.xi.map(x => x.wuxing);
    const jiWuxing = xiji.ji.map(j => j.wuxing);
    
    // 颜色建议
    const colorMap = {
        '金': ['白色', '金色', '银色'],
        '木': ['绿色', '青色', '碧色'],
        '水': ['黑色', '蓝色', '灰色'],
        '火': ['红色', '紫色', '粉色'],
        '土': ['黄色', '棕色', '米色']
    };
    
    let xiColors = [];
    let jiColors = [];
    xiWuxing.forEach(wx => {
        if (colorMap[wx]) xiColors.push(...colorMap[wx]);
    });
    jiWuxing.forEach(wx => {
        if (colorMap[wx]) jiColors.push(...colorMap[wx]);
    });
    
    if (xiColors.length > 0) {
        xiji.suggestions.push({
            category: '颜色',
            xi: xiColors.join('、'),
            ji: jiColors.join('、')
        });
    }
    
    // 方位建议
    const directionMap = {
        '金': '西方',
        '木': '东方',
        '水': '北方',
        '火': '南方',
        '土': '中央'
    };
    
    let xiDir = xiWuxing.map(wx => directionMap[wx]).filter(Boolean);
    let jiDir = jiWuxing.map(wx => directionMap[wx]).filter(Boolean);
    
    if (xiDir.length > 0) {
        xiji.suggestions.push({
            category: '方位',
            xi: xiDir.join('、'),
            ji: jiDir.join('、')
        });
    }
    
    // 行业建议
    const industryMap = {
        '金': '金融、金属、机械、汽车、五金',
        '木': '文化、教育、林业、木材、家具',
        '水': '贸易、物流、旅游、水产、饮料',
        '火': '能源、电力、餐饮、娱乐、媒体',
        '土': '房地产、建筑、农业、陶瓷、矿产'
    };
    
    let xiIndustry = xiWuxing.map(wx => industryMap[wx]).filter(Boolean);
    
    if (xiIndustry.length > 0) {
        xiji.suggestions.push({
            category: '行业',
            xi: xiIndustry.join('、'),
            ji: '避开忌神五行相关行业'
        });
    }
    
    return xiji;
}

// 主解读函数
function generateMingliJiedu(bazi) {
    // 1. 日主强弱分析
    const strengthInfo = analyzeRizhuStrength(bazi);
    
    // 2. 格局分析
    const gejuInfo = analyzeGeju(bazi);
    
    // 3. 用神分析
    const yongshenInfo = analyzeYongshen(bazi, strengthInfo.strength);
    
    // 4. 喜忌分析
    const xijiInfo = analyzeXiji(bazi, strengthInfo, yongshenInfo);
    
    return {
        strength: strengthInfo,
        geju: gejuInfo,
        yongshen: yongshenInfo,
        xiji: xijiInfo
    };
}

// 全局变量存储当前八字
let currentBazi = null;

// 修改displayResult函数,保存bazi到全局变量
const originalCalculateBazi = calculateBazi;
function calculateBazi() {
    // 调用原始计算
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

// 页面加载时设置默认日期
window.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    document.getElementById('birthdate').value = dateStr;
});
