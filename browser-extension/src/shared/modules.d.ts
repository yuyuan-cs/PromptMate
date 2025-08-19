// 为没有类型定义的模块提供空类型声明
declare module 'vite';
declare module '@vitejs/plugin-react-swc';
declare module 'lucide-react';
declare module 'react/jsx-runtime';

// 声明其他可能缺少类型的模块
declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.png' {
  const content: any;
  export default content;
}

declare module '*.jpg' {
  const content: any;
  export default content;
}

declare module '*.jpeg' {
  const content: any;
  export default content;
}

declare module '*.gif' {
  const content: any;
  export default content;
}

declare module '*.css' {
  const content: any;
  export default content;
}

declare module '*.scss' {
  const content: any;
  export default content;
}

declare module '*.sass' {
  const content: any;
  export default content;
}

declare module '*.less' {
  const content: any;
  export default content;
}

declare module '*.styl' {
  const content: any;
  export default content;
}

declare module '*.json' {
  const content: any;
  export default content;
} 