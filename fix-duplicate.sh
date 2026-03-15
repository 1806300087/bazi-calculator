#!/bin/bash
# 删除V2的calculateBazi函数(314-345行),只保留V3版本

# 1. 保留1-313行
sed -n '1,313p' bazi-calculator-v3.js > temp.js

# 2. 跳过314-345行(V2的calculateBazi)

# 3. 保留346行到文件结尾
sed -n '346,$p' bazi-calculator-v3.js >> temp.js

# 4. 替换
mv temp.js bazi-calculator-v3.js

echo "✅ 已删除重复的calculateBazi函数"
wc -l bazi-calculator-v3.js
