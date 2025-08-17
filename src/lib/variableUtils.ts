/**
 * 变量识别和管理工具函数
 * 用于智能识别提示词中的变量占位符，生成变量表单，并提供自动补全功能
 */

// 变量占位符的正则表达式模式
const VARIABLE_PATTERNS = [
  /\{([^}]+)\}/g,           // {variable} 格式
  /\{\{([^}]+)\}\}/g,       // {{variable}} 格式
  /\[([^\]]+)\]/g,          // [variable] 格式
  /\$([a-zA-Z_][a-zA-Z0-9_]*)/g, // $variable 格式
];

// 常用变量建议
export const COMMON_VARIABLES = [
  // 通用变量
  'title', 'topic', 'subject', 'theme', 'content', 'text', 'description',
  'name', 'author', 'user', 'target', 'audience', 'purpose', 'goal',
  
  // 时间相关
  'date', 'time', 'year', 'month', 'day', 'hour', 'minute',
  
  // 数量相关
  'count', 'number', 'amount', 'quantity', 'size', 'length', 'width', 'height',
  
  // 风格相关
  'style', 'tone', 'mood', 'format', 'language', 'locale',
  
  // 业务相关
  'company', 'brand', 'product', 'service', 'industry', 'sector',
  'customer', 'client', 'partner', 'competitor',
  
  // 技术相关
  'technology', 'platform', 'framework', 'language', 'database', 'api',
  'version', 'environment', 'configuration', 'setting',
];

// 变量类型定义
export interface VariableInfo {
  name: string;           // 变量名
  originalText: string;   // 原始文本（如 {title}）
  startIndex: number;     // 在文本中的开始位置
  endIndex: number;       // 在文本中的结束位置
  pattern: string;        // 匹配的模式类型
  suggestions?: string[]; // 建议值
}

// 变量值存储接口
export interface VariableValues {
  [key: string]: string;
}

// 变量历史记录接口
export interface VariableHistory {
  [key: string]: string[];
}

/**
 * 从文本中提取所有变量占位符
 */
export function extractVariables(text: string): VariableInfo[] {
  const variables: VariableInfo[] = [];
  
  VARIABLE_PATTERNS.forEach((pattern, patternIndex) => {
    const patternType = ['curly', 'double_curly', 'bracket', 'dollar'][patternIndex];
    let match;
    
    while ((match = pattern.exec(text)) !== null) {
      const variableName = match[1] || match[0];
      const originalText = match[0];
      
      // 跳过空变量名
      if (!variableName.trim()) continue;
      
      variables.push({
        name: variableName.trim(),
        originalText,
        startIndex: match.index,
        endIndex: match.index + originalText.length,
        pattern: patternType,
        suggestions: generateVariableSuggestions(variableName.trim()),
      });
    }
  });
  
  // 按位置排序，避免重叠
  return variables.sort((a, b) => a.startIndex - b.startIndex);
}

/**
 * 为变量生成建议值
 */
function generateVariableSuggestions(variableName: string): string[] {
  const suggestions: string[] = [];
  const lowerName = variableName.toLowerCase();
  
  // 基于变量名生成相关建议
  if (lowerName.includes('title') || lowerName.includes('name')) {
    suggestions.push('示例标题', '产品名称', '文章标题');
  } else if (lowerName.includes('topic') || lowerName.includes('subject')) {
    suggestions.push('技术讨论', '产品介绍', '市场分析');
  } else if (lowerName.includes('audience') || lowerName.includes('target')) {
    suggestions.push('开发者', '产品经理', '最终用户');
  } else if (lowerName.includes('style') || lowerName.includes('tone')) {
    suggestions.push('正式', '友好', '专业', '轻松');
  } else if (lowerName.includes('language') || lowerName.includes('locale')) {
    suggestions.push('中文', 'English', '日本語');
  } else if (lowerName.includes('format')) {
    suggestions.push('Markdown', 'HTML', '纯文本', 'JSON');
  }
  
  // 添加通用建议
  suggestions.push('请根据具体情况填写', '自定义内容');
  
  return suggestions;
}

/**
 * 将变量值应用到文本中，替换所有占位符
 */
export function applyVariableValues(text: string, values: VariableValues): string {
  let result = text;
  
  // 按位置倒序替换，避免索引变化
  const variables = extractVariables(text);
  for (let i = variables.length - 1; i >= 0; i--) {
    const variable = variables[i];
    const value = values[variable.name] || `[${variable.name}]`;
    result = result.substring(0, variable.startIndex) + 
             value + 
             result.substring(variable.endIndex);
  }
  
  return result;
}

/**
 * 生成变量填写表单的数据结构
 */
export function generateVariableFormData(text: string): {
  variables: VariableInfo[];
  formFields: Array<{
    name: string;
    label: string;
    placeholder: string;
    suggestions: string[];
    required: boolean;
  }>;
} {
  const variables = extractVariables(text);
  
  // 去重变量
  const uniqueVariables = variables.filter((variable, index, self) => 
    index === self.findIndex(v => v.name === variable.name)
  );
  
  const formFields = uniqueVariables.map(variable => ({
    name: variable.name,
    label: generateVariableLabel(variable.name),
    placeholder: `请输入${generateVariableLabel(variable.name)}`,
    suggestions: variable.suggestions || [],
    required: true,
  }));
  
  return {
    variables: uniqueVariables,
    formFields,
  };
}

/**
 * 为变量生成友好的标签
 */
function generateVariableLabel(variableName: string): string {
  const labels: { [key: string]: string } = {
    'title': '标题',
    'topic': '主题',
    'subject': '主题',
    'theme': '主题',
    'content': '内容',
    'text': '文本',
    'description': '描述',
    'name': '名称',
    'author': '作者',
    'user': '用户',
    'target': '目标',
    'audience': '受众',
    'purpose': '目的',
    'goal': '目标',
    'date': '日期',
    'time': '时间',
    'year': '年份',
    'month': '月份',
    'day': '日期',
    'hour': '小时',
    'minute': '分钟',
    'count': '数量',
    'number': '数字',
    'amount': '数量',
    'quantity': '数量',
    'size': '大小',
    'length': '长度',
    'width': '宽度',
    'height': '高度',
    'style': '风格',
    'tone': '语调',
    'mood': '语气',
    'format': '格式',
    'language': '语言',
    'locale': '地区',
    'company': '公司',
    'brand': '品牌',
    'product': '产品',
    'service': '服务',
    'industry': '行业',
    'sector': '领域',
    'customer': '客户',
    'client': '客户',
    'partner': '合作伙伴',
    'competitor': '竞争对手',
    'technology': '技术',
    'platform': '平台',
    'framework': '框架',
    'database': '数据库',
    'api': 'API',
    'version': '版本',
    'environment': '环境',
    'configuration': '配置',
    'setting': '设置',
  };
  
  return labels[variableName] || variableName;
}

/**
 * 高亮显示文本中的变量
 */
export function highlightVariables(text: string): string {
  const variables = extractVariables(text);
  let result = text;
  
  // 按位置倒序替换，避免索引变化
  for (let i = variables.length - 1; i >= 0; i--) {
    const variable = variables[i];
    const highlightedVariable = `<span class="variable-highlight" data-variable="${variable.name}">${variable.originalText}</span>`;
    result = result.substring(0, variable.startIndex) + 
             highlightedVariable + 
             result.substring(variable.endIndex);
  }
  
  return result;
}

/**
 * 验证变量值是否完整
 */
export function validateVariableValues(text: string, values: VariableValues): {
  isValid: boolean;
  missingVariables: string[];
  filledVariables: string[];
} {
  const variables = extractVariables(text);
  const uniqueVariableNames = [...new Set(variables.map(v => v.name))];
  
  const missingVariables = uniqueVariableNames.filter(name => !values[name] || values[name].trim() === '');
  const filledVariables = uniqueVariableNames.filter(name => values[name] && values[name].trim() !== '');
  
  return {
    isValid: missingVariables.length === 0,
    missingVariables,
    filledVariables,
  };
}

/**
 * 获取变量的统计信息
 */
export function getVariableStats(text: string): {
  totalVariables: number;
  uniqueVariables: number;
  variableTypes: { [key: string]: number };
  mostUsedVariables: Array<{ name: string; count: number }>;
} {
  const variables = extractVariables(text);
  const uniqueVariables = [...new Set(variables.map(v => v.name))];
  
  // 统计变量类型
  const variableTypes: { [key: string]: number } = {};
  variables.forEach(v => {
    variableTypes[v.pattern] = (variableTypes[v.pattern] || 0) + 1;
  });
  
  // 统计变量使用频率
  const variableCounts: { [key: string]: number } = {};
  variables.forEach(v => {
    variableCounts[v.name] = (variableCounts[v.name] || 0) + 1;
  });
  
  const mostUsedVariables = Object.entries(variableCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  return {
    totalVariables: variables.length,
    uniqueVariables: uniqueVariables.length,
    variableTypes,
    mostUsedVariables,
  };
} 