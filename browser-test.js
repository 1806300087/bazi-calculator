// 模拟浏览器环境测试
const fs = require('fs');

// 模拟DOM元素
global.document = {
    elements: {},
    getElementById: function(id) {
        if (!this.elements[id]) {
            this.elements[id] = {
                value: '',
                innerHTML: '',
                style: { display: 'none' },
                scrollIntoView: function() {}
            };
        }
        return this.elements[id];
    }
};

global.alert = function(msg) {
    console.log('[ALERT]', msg);
};

// 加载V3代码
const code = fs.readFileSync('bazi-calculator-v3.js', 'utf8');

try {
    eval(code);
    console.log('✅ 代码加载成功\n');
    
    // 模拟用户输入
    document.getElementById('birthdate').value = '1990-02-10';
    document.getElementById('hour').value = '0';
    document.getElementById('gender').value = 'male';
    
    console.log('=== 测试排盘计算 ===');
    console.log('输入日期:', document.getElementById('birthdate').value);
    console.log('输入时辰:', document.getElementById('hour').value);
    console.log('输入性别:', document.getElementById('gender').value);
    
    // 调用calculateBazi
    console.log('\n调用 calculateBazi()...');
    calculateBazi();
    
    console.log('\n✅ calculateBazi 执行完成');
    console.log('解读按钮显示状态:', document.getElementById('jieduBtn').style.display);
    
    // 检查currentBazi是否被赋值
    if (typeof currentBazi !== 'undefined' && currentBazi) {
        console.log('✅ currentBazi 已赋值');
        console.log('年柱:', currentBazi.year.gan + currentBazi.year.zhi);
        console.log('月柱:', currentBazi.month.gan + currentBazi.month.zhi);
        console.log('日柱:', currentBazi.day.gan + currentBazi.day.zhi);
        console.log('时柱:', currentBazi.hour.gan + currentBazi.hour.zhi);
    } else {
        console.log('❌ currentBazi 未被赋值');
    }
    
} catch(e) {
    console.error('❌ 错误:', e.message);
    console.error('堆栈:', e.stack);
}
