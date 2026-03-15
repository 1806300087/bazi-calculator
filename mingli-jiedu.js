// 八字命理解读模块
// 依据：《渊海子平》《三命通会》《滴天髓》《穷通宝鉴》

// 天干
const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 地支藏干
const CANGGAN = {
    '子': ['壬', '癸'],
    '丑': ['己', '癸', '辛'],
    '寅': ['甲', '丙', '戊'],
    '卯': ['乙'],
    '辰': ['戊', '乙', '癸'],
    '巳': ['丙', '戊', '庚'],
    '午': ['丁', '己'],
    '未': ['己', '丁', '乙'],
    '申': ['庚', '壬', '戊'],
    '酉': ['辛'],
    '戌': ['戊', '辛', '丁'],
    '亥': ['壬', '甲']
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

// 十神关系表
const SHISHEN = {
    // 相同为比劫
    same: { name: '比肩', description: '兄弟朋友，竞争合作' },
    same_diff: { name: '劫财', description: '争夺财物，竞争对手' },
    
    // 我生为食伤
    shengwo_yang: { name: '食神', description: '才华表达，衣食丰足' },
    shengwo_yin: { name: '伤官', description: '才华锋芒，克制官星' },
    
    // 我克为财
    woke_yang: { name: '正财', description: '正当收入，妻子' },
    woke_yin: { name: '偏财', description: '意外之财，父亲' },
    
    // 克我为官杀
    kewwo_yang: { name: '正官', description: '正当权力，丈夫' },
    kewwo_yin: { name: '七杀', description: '压力挑战，权威' },
    
    // 生我为印
    shengwwo_yang: { name: '正印', description: '学业贵人，母亲' },
    shengwwo_yin: { name: '偏印', description: '偏门学问，继母' }
};

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
    '甲': '阳', '乙': '阴',
    '丙': '阳', '丁': '阴',
    '戊': '阳', '己': '阴',
    '庚': '阳', '辛': '阴',
    '壬': '阳', '癸': '阴'
};

// 月令旺相休囚死表（按季节）
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
