// 测试八字计算准确性
// 使用已知案例：1990年1月1日子时（公历）

const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 1990年1月1日应该是：己巳年 丙子月 ?? 日

console.log("测试1990年1月1日：");

// 年干支计算
const START_YEAR = 1900;
const START_YEAR_GAN = 6;  // 庚
const START_YEAR_ZHI = 0;  // 子

const year = 1990;
const offset = year - START_YEAR; // 90
const ganIndex = (START_YEAR_GAN + offset) % 10; // (6 + 90) % 10 = 6
const zhiIndex = (START_YEAR_ZHI + offset) % 12; // (0 + 90) % 12 = 6

console.log(`年柱: ${TIANGAN[ganIndex]}${DIZHI[zhiIndex]}`);
console.log(`计算: gan=(6+90)%10=${ganIndex}, zhi=(0+90)%12=${zhiIndex}`);

// 1990年应该是庚午年，不是己巳年！
// 问题：农历年和公历年不一致
console.log("\n⚠️ 发现问题：1990年公历1月还在农历1989年（己巳年）");
console.log("需要考虑立春节气！");
