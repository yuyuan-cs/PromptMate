// 变量相关的工具函数

export interface VariableInfo {
  name: string;
  originalText: string;
  startIndex: number;
  endIndex: number;
  suggestions?: string[];
}

export interface Variable {
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
  suggestions: string[];
}

export interface VariableValues {
  [key: string]: string;
}

// 从文本中提取变量信息（包含位置）
export function extractVariables(text: string): VariableInfo[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const variables: VariableInfo[] = [];
  
  let match;
  while ((match = regex.exec(text)) !== null) {
    const variableName = match[1].trim();
    variables.push({
      name: variableName,
      originalText: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      suggestions: []
    });
  }
  
  return variables;
}

// 检查文本是否包含变量
export function hasVariables(text: string): boolean {
  return /\{\{[^}]+\}\}/.test(text);
}

// 应用变量值到文本（按位置替换，避免索引变化问题）
export function applyVariableValues(text: string, values: VariableValues): string {
  const variables = extractVariables(text);
  if (variables.length === 0) return text;
  
  let result = text;
  
  // 从后往前替换，避免索引变化
  for (let i = variables.length - 1; i >= 0; i--) {
    const variable = variables[i];
    const value = values[variable.name] || variable.originalText;
    result = result.substring(0, variable.startIndex) + 
             value + 
             result.substring(variable.endIndex);
  }
  
  return result;
}

// 生成变量填写表单的数据结构
export function generateVariableFormData(text: string): {
  variables: VariableInfo[];
  formFields: Variable[];
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
    required: true,
    suggestions: getCommonSuggestions(variable.name)
  }));
  
  return {
    variables: uniqueVariables,
    formFields,
  };
}

// 为变量生成友好的中文标签
function generateVariableLabel(variableName: string): string {
  const labels: { [key: string]: string } = {
    // 基础信息
    'title': '标题',
    'name': '名称',
    'topic': '主题',
    'subject': '主题',
    'theme': '主题',
    'content': '内容',
    'description': '描述',
    'summary': '摘要',
    
    // 用户相关
    'user': '用户',
    'username': '用户名',
    'author': '作者',
    'audience': '目标受众',
    'target': '目标',
    'customer': '客户',
    'client': '客户',
    
    // 产品相关
    'product': '产品',
    'service': '服务',
    'brand': '品牌',
    'company': '公司',
    'organization': '组织',
    'project': '项目',
    
    // 时间相关
    'date': '日期',
    'time': '时间',
    'year': '年份',
    'month': '月份',
    'day': '日期',
    'deadline': '截止日期',
    'duration': '时长',
    
    // 地点相关
    'location': '地点',
    'place': '地点',
    'address': '地址',
    'city': '城市',
    'country': '国家',
    'region': '地区',
    
    // 风格相关
    'style': '风格',
    'tone': '语调',
    'voice': '语音',
    'format': '格式',
    'language': '语言',
    'level': '级别',
    
    // 数量相关
    'count': '数量',
    'number': '数字',
    'amount': '数量',
    'price': '价格',
    'cost': '成本',
    'budget': '预算',
    
    // 技术相关
    'version': '版本',
    'platform': '平台',
    'technology': '技术',
    'framework': '框架',
    'language': '编程语言',
    'database': '数据库',
    
    // 其他常用
    'goal': '目标',
    'objective': '目标',
    'requirement': '要求',
    'feature': '功能',
    'benefit': '优势',
    'advantage': '优势',
    'challenge': '挑战',
    'solution': '解决方案',
    'method': '方法',
    'approach': '方法',
    'strategy': '策略',
    'plan': '计划',
    'process': '过程',
    'step': '步骤',
    'stage': '阶段',
    'phase': '阶段',
    'category': '分类',
    'type': '类型',
    'kind': '种类',
    'example': '示例',
    'sample': '样本'
  };
  
  // 首先尝试精确匹配
  const exactMatch = labels[variableName.toLowerCase()];
  if (exactMatch) return exactMatch;
  
  // 然后尝试包含匹配
  for (const [key, label] of Object.entries(labels)) {
    if (variableName.toLowerCase().includes(key)) {
      return label;
    }
  }
  
  // 如果没有匹配，返回首字母大写的原变量名
  return variableName.charAt(0).toUpperCase() + variableName.slice(1);
}

// 获取常用建议值
function getCommonSuggestions(variableName: string): string[] {
  const suggestions: { [key: string]: string[] } = {
    'style': ['专业', '友好', '正式', '随意', '学术', '商务'],
    'tone': ['友好', '专业', '正式', '亲切', '严肃', '轻松'],
    'language': ['中文', '英文', '日文', '韩文', '法文', '德文'],
    'format': ['文章', '报告', '邮件', '演讲稿', '总结', '列表'],
    'audience': ['学生', '专业人士', '初学者', '专家', '客户', '同事'],
    'level': ['初级', '中级', '高级', '专业', '入门', '精通'],
    'count': ['100', '500', '1000', '1500', '2000', '3000'],
    'time': ['1小时', '2小时', '半天', '1天', '1周', '1个月']
  };
  
  const lowerName = variableName.toLowerCase();
  
  // 精确匹配
  if (suggestions[lowerName]) {
    return suggestions[lowerName];
  }
  
  // 包含匹配
  for (const [key, values] of Object.entries(suggestions)) {
    if (lowerName.includes(key)) {
      return values;
    }
  }
  
  return [];
}

// 验证所有变量都已填写
export function validateVariables(variables: Variable[], values: VariableValues): {
  valid: boolean;
  missing: string[];
} {
  const missing: string[] = [];
  
  for (const variable of variables) {
    if (!values[variable.name] || values[variable.name].trim() === '') {
      missing.push(variable.name);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
}

// 从历史记录中获取变量值建议
export function getVariableSuggestions(variableName: string, history: VariableValues[]): string[] {
  const suggestions = new Set<string>();
  
  for (const record of history) {
    if (record[variableName] && record[variableName].trim()) {
      suggestions.add(record[variableName]);
    }
  }
  
  return Array.from(suggestions).slice(0, 5); // 最多返回5个建议
}

// 保存变量值到历史记录
export function saveVariableHistory(values: VariableValues, history: VariableValues[], maxHistory = 10): VariableValues[] {
  const newHistory = [values, ...history];
  
  // 去重（基于所有变量值的组合）
  const uniqueHistory = newHistory.filter((item, index, arr) => {
    return arr.findIndex(other => JSON.stringify(other) === JSON.stringify(item)) === index;
  });
  
  return uniqueHistory.slice(0, maxHistory);
}
