const fs = require('fs');

// --- 配置 ---
// 【重要】请将路径指向你的原始文件
const FLAT_SOURCE_PATH = './zh-CN-desktop.json';    // 桌面版文件 (扁平结构, common_confirm)
const NESTED_SOURCE_PATH = './zh-CN-plugin.json';  // 插件版文件 (嵌套结构, success: {...})
const FINAL_OUTPUT_PATH = './zh-CN-final-nested.json'; // 最终输出的、完全嵌套的文件

/**
 * 将扁平的、以下划线分隔的对象，反向转换为嵌套的 JSON 对象。
 * @param {object} obj - 扁平的对象
 * @returns {object} - 嵌套的对象
 */
function unflattenObject(obj) {
  const result = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const keys = key.split('_');
      keys.reduce((acc, currentKey, index) => {
        // 如果是路径的最后一部分，就赋值
        if (index === keys.length - 1) {
          acc[currentKey] = obj[key];
        } else {
          // 如果不是最后一部分，确保路径存在
          acc[currentKey] = acc[currentKey] || {};
        }
        return acc[currentKey];
      }, result);
    }
  }
  return result;
}

/**
 * 深度合并两个对象。
 * @param {object} target - 目标对象
 * @param {object} source - 源对象
 * @returns {object} - 合并后的对象
 */
function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
  }
  Object.assign(target || {}, source);
  return target;
}


try {
  // 1. 读取文件
  console.log(`[1/4] 读取扁平文件: ${FLAT_SOURCE_PATH}`);
  const flatContent = fs.readFileSync(FLAT_SOURCE_PATH, 'utf8');
  const flatJson = JSON.parse(flatContent);

  console.log(`[2/4] 读取嵌套文件: ${NESTED_SOURCE_PATH}`);
  const nestedContent = fs.readFileSync(NESTED_SOURCE_PATH, 'utf8');
  const nestedJson = JSON.parse(nestedContent);

  // 2. 将扁平文件“反向转化”为嵌套结构
  console.log('[3/4] 正在将扁平结构 (common_confirm) 转化为嵌套结构 (common: { confirm: ... })...');
  const unflattenedJson = unflattenObject(flatJson);
  console.log('✅ 转化完成!');
  
  // 3. 深度合并两个嵌套对象
  console.log('[4/4] 正在深度合并两个文件...');
  const finalMergedJson = deepMerge(nestedJson, unflattenedJson);
  console.log('✅ 合并完成!');

  // 4. 写入最终文件
  fs.writeFileSync(FINAL_OUTPUT_PATH, JSON.stringify(finalMergedJson, null, 2), 'utf8');

  console.log(`\n🎉🎉🎉 操作成功！`);
  console.log(`最终的、完全嵌套的文件已保存到: ${FINAL_OUTPUT_PATH}`);

} catch (error) {
  console.error('\n❌ 处理文件时发生错误:', error.message);
}
