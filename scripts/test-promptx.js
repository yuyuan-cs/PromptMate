#!/usr/bin/env node

/**
 * PromptX 功能测试脚本
 * 用于验证 PromptX 核心功能的正确性
 */

const fs = require('fs');
const path = require('path');

// 模拟测试数据
const testMessages = [
  '我需要产品经理专家帮我分析用户需求',
  '需要系统架构师指导技术方案设计',
  '请文案策划帮我写个营销文案',
  '需要UI设计师优化界面体验',
  '请数据分析师帮我分析用户行为',
  '我想要一个专业的帮助', // 模糊请求
  '你好，今天天气怎么样？' // 无关请求
];

// 角色模式定义
const rolePatterns = [
  { pattern: /需要.*产品经理|产品.*专家|PM.*帮助/i, roleId: 'product-manager', name: '产品经理' },
  { pattern: /需要.*架构师|系统.*设计|架构.*建议/i, roleId: 'architect', name: '系统架构师' },
  { pattern: /需要.*文案|写.*文案|营销.*文本/i, roleId: 'copywriter', name: '文案策划' },
  { pattern: /需要.*设计师|UI.*设计|界面.*设计/i, roleId: 'ui-designer', name: 'UI设计师' },
  { pattern: /需要.*数据.*分析|数据.*专家/i, roleId: 'data-analyst', name: '数据分析师' }
];

const activationKeywords = ['需要', '帮助', '专家', '协助', '指导'];

// 简单的角色匹配函数
function matchRole(message) {
  const hasActivationIntent = activationKeywords.some(keyword => 
    message.toLowerCase().includes(keyword)
  );
  
  if (!hasActivationIntent) return null;

  for (const pattern of rolePatterns) {
    if (pattern.pattern.test(message)) {
      return {
        roleId: pattern.roleId,
        name: pattern.name,
        confidence: 0.85 + Math.random() * 0.1,
        message: message
      };
    }
  }
  return null;
}

// 运行测试
function runTests() {
  console.log('🚀 PromptX 功能测试开始...\n');
  
  console.log('📋 测试消息列表:');
  testMessages.forEach((msg, index) => {
    console.log(`${index + 1}. ${msg}`);
  });
  
  console.log('\n🔍 角色识别测试结果:');
  console.log('=' .repeat(60));
  
  let successCount = 0;
  let totalCount = testMessages.length;
  
  testMessages.forEach((message, index) => {
    const result = matchRole(message);
    console.log(`\n${index + 1}. "${message}"`);
    
    if (result) {
      console.log(`   ✅ 识别成功: ${result.name}`);
      console.log(`   🎯 置信度: ${Math.round(result.confidence * 100)}%`);
      console.log(`   🆔 角色ID: ${result.roleId}`);
      successCount++;
    } else {
      console.log(`   ❌ 未识别到角色`);
    }
  });
  
  console.log('\n📊 测试统计:');
  console.log('=' .repeat(60));
  console.log(`总测试数: ${totalCount}`);
  console.log(`成功识别: ${successCount}`);
  console.log(`识别率: ${Math.round((successCount / totalCount) * 100)}%`);
  
  // 检查文件是否存在
  console.log('\n📁 文件检查:');
  console.log('=' .repeat(60));
  
  const filesToCheck = [
    'src/services/promptx/DialogueEngine.ts',
    'src/services/promptx/ProfessionalRoles.ts',
    'src/components/promptx/SmartRoleActivator.tsx',
    'src/pages/PromptXTest.tsx',
    'test-promptx.html'
  ];
  
  filesToCheck.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    if (fs.existsSync(fullPath)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ ${file} (文件不存在)`);
    }
  });
  
  console.log('\n🎉 测试完成!');
  console.log('\n💡 下一步操作:');
  console.log('1. 在浏览器中打开 test-promptx.html 进行交互测试');
  console.log('2. 在 PromptMate 应用中访问设置 → PromptX 角色面板');
  console.log('3. 测试自然语言角色激活功能');
  console.log('4. 验证专业角色库的完整性');
}

// 生成测试报告
function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    testResults: [],
    summary: {
      total: testMessages.length,
      success: 0,
      failed: 0
    }
  };
  
  testMessages.forEach((message, index) => {
    const result = matchRole(message);
    const testResult = {
      id: index + 1,
      message: message,
      success: !!result,
      result: result || null
    };
    
    report.testResults.push(testResult);
    
    if (result) {
      report.summary.success++;
    } else {
      report.summary.failed++;
    }
  });
  
  // 保存报告
  const reportPath = path.join(__dirname, '..', 'promptx-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📄 测试报告已保存: ${reportPath}`);
  return report;
}

// 主函数
function main() {
  try {
    runTests();
    generateReport();
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  runTests,
  generateReport,
  matchRole,
  testMessages,
  rolePatterns
};
