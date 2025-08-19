/**
 * PromptMate 内容脚本 - 增强版本
 */

console.log('PromptMate 内容脚本已加载');

// 避免重复注入
if (!(window as any).__PROMPTMATE_INJECTED__) {
  (window as any).__PROMPTMATE_INJECTED__ = true;

  // 查找可编辑元素的函数
  function findEditableElement(): HTMLElement | null {
    console.log('开始查找可编辑元素...');
    
    // 1. 首先尝试当前焦点元素
    const activeElement = document.activeElement as HTMLElement;
    console.log('当前焦点元素:', activeElement);
    if (activeElement && isEditableElement(activeElement)) {
      console.log('找到焦点输入框:', activeElement);
      return activeElement;
    }

    // 2. 查找常见的输入框选择器
    const selectors = [
      // 标准输入框
      'input[type="text"]',
      'input[type="search"]', 
      'input[type="email"]',
      'input[type="password"]',
      'input[type="url"]',
      'input:not([type])',
      'textarea',
      '[contenteditable="true"]',
      '[contenteditable=""]',
      
      // 富文本编辑器
      '.ql-editor', // Quill
      '.ProseMirror', // ProseMirror
      '.ace_text-input', // Ace Editor
      '.CodeMirror textarea', // CodeMirror
      
      // Gemini 特定选择器
      'rich-textarea', // Gemini的输入组件
      '[data-placeholder]', // Gemini输入框
      '.ql-blank', // Gemini的编辑器
      '[role="textbox"]', // 可编辑文本框
      
      // 其他常见选择器
      '[data-testid*="input"]',
      '[aria-label*="输入"]',
      '[aria-label*="input"]',
      '[aria-label*="Ask"]',
      '[aria-label*="Type"]',
      '[aria-label*="Enter"]',
      '[placeholder]',
      
      // 更广泛的选择器
      '[contenteditable]',
      '.input',
      '.textarea',
      '.editor'
    ];

    for (const selector of selectors) {
      console.log(`尝试选择器: ${selector}`);
      const elements = document.querySelectorAll(selector);
      console.log(`找到 ${elements.length} 个元素`);
      
      for (const element of elements) {
        const htmlElement = element as HTMLElement;
        console.log('检查元素:', {
          tagName: htmlElement.tagName,
          className: htmlElement.className,
          id: htmlElement.id,
          contentEditable: htmlElement.contentEditable,
          isEditable: isEditableElement(htmlElement),
          isVisible: isVisible(htmlElement)
        });
        
        if (isEditableElement(htmlElement) && isVisible(htmlElement)) {
          console.log('找到可用输入框:', htmlElement);
          return htmlElement;
        }
      }
    }

    // 3. 最后的尝试：查找任何有文本输入能力的元素
    console.log('尝试查找任何可能的输入元素...');
    const allElements = document.querySelectorAll('*');
    for (const element of allElements) {
      const htmlElement = element as HTMLElement;
      if (htmlElement.isContentEditable || 
          (htmlElement.tagName === 'INPUT' && 
           !['button', 'submit', 'reset', 'checkbox', 'radio'].includes((htmlElement as HTMLInputElement).type))) {
        if (isVisible(htmlElement)) {
          console.log('找到备用输入元素:', htmlElement);
          return htmlElement;
        }
      }
    }

    console.log('未找到任何可用的输入框');
    return null;
  }

  // 检查元素是否可编辑
  function isEditableElement(element: HTMLElement): boolean {
    if (!element) return false;
    
    const tagName = element.tagName.toLowerCase();
    
    // 标准输入框
    if (tagName === 'textarea') return true;
    if (tagName === 'input') {
      const type = (element as HTMLInputElement).type.toLowerCase();
      return ['text', 'search', 'email', 'password', 'url', ''].includes(type);
    }
    
    // 可编辑div
    if (element.contentEditable === 'true' || element.contentEditable === '') return true;
    if (element.isContentEditable) return true;
    
    // Gemini特殊元素
    if (tagName === 'rich-textarea') return true;
    
    // 带有特定属性的元素
    if (element.hasAttribute('data-placeholder')) return true;
    if (element.getAttribute('role') === 'textbox') return true;
    
    // 检查是否有输入相关的类名
    const className = element.className || '';
    if (className.includes('editor') || 
        className.includes('input') || 
        className.includes('textarea') ||
        className.includes('ql-editor')) return true;
    
    return false;
  }

  // 检查元素是否可见
  function isVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           element.offsetWidth > 0 && 
           element.offsetHeight > 0;
  }

  // 注入文本到元素
  function injectTextToElement(element: HTMLElement, text: string): boolean {
    try {
      console.log('尝试注入文本到元素:', element);
      const tagName = element.tagName.toLowerCase();
      
      if (tagName === 'input' || tagName === 'textarea') {
        // 标准输入框
        const inputElement = element as HTMLInputElement | HTMLTextAreaElement;
        console.log('注入到标准输入框');
        
        // 聚焦元素
        inputElement.focus();
        
        // 设置值
        const oldValue = inputElement.value;
        inputElement.value = text;
        
        // 触发各种事件以确保兼容性
        const events = ['focus', 'input', 'change', 'keyup', 'paste', 'blur'];
        events.forEach(eventType => {
          inputElement.dispatchEvent(new Event(eventType, { bubbles: true }));
        });
        
        // React兼容性
        const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value') ||
                          Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
        if (descriptor && descriptor.set) {
          descriptor.set.call(inputElement, text);
          inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        console.log('文本已注入到标准输入框:', text.substring(0, 50));
        return true;
        
      } else if (element.isContentEditable || element.contentEditable === 'true' || element.contentEditable === '') {
        // 可编辑div
        console.log('注入到可编辑元素');
        
        // 聚焦元素
        element.focus();
        
        // 尝试多种方式设置内容
        const oldText = element.innerText;
        
        // 方法1: 直接设置innerText
        element.innerText = text;
        
        // 方法2: 设置textContent
        if (element.innerText !== text) {
          element.textContent = text;
        }
        
        // 方法3: 使用innerHTML（如果前面的方法失败）
        if (element.innerText !== text && element.textContent !== text) {
          element.innerHTML = text.replace(/\n/g, '<br>');
        }
        
        // 方法4: 模拟键盘输入（对某些编辑器更有效）
        if (element.innerText !== text) {
          // 清空内容
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(element);
          selection?.removeAllRanges();
          selection?.addRange(range);
          
          // 插入文本
          document.execCommand('insertText', false, text);
        }
        
        // 触发事件
        const events = ['focus', 'input', 'change', 'keyup', 'paste', 'blur'];
        events.forEach(eventType => {
          element.dispatchEvent(new Event(eventType, { bubbles: true }));
        });
        
        console.log('文本已注入到可编辑元素:', text.substring(0, 50));
        return true;
        
      } else if (tagName === 'rich-textarea') {
        // Gemini特殊组件
        console.log('注入到Gemini rich-textarea');
        
        element.focus();
        
        // 尝试设置内容
        if ('value' in element) {
          (element as any).value = text;
        }
        element.innerText = text;
        
        // 触发事件
        const events = ['focus', 'input', 'change', 'keyup', 'paste'];
        events.forEach(eventType => {
          element.dispatchEvent(new Event(eventType, { bubbles: true }));
        });
        
        console.log('文本已注入到Gemini组件:', text.substring(0, 50));
        return true;
      }
      
      // 最后的尝试：通用方法
      console.log('尝试通用注入方法');
      element.focus();
      
      // 尝试设置各种属性
      if ('value' in element) {
        (element as any).value = text;
      }
      if (element.innerText !== undefined) {
        element.innerText = text;
      }
      if (element.textContent !== undefined) {
        element.textContent = text;
      }
      
      // 触发事件
      const events = ['focus', 'input', 'change', 'keyup', 'paste'];
      events.forEach(eventType => {
        element.dispatchEvent(new Event(eventType, { bubbles: true }));
      });
      
      console.log('尝试通用注入完成');
      return true;
      
    } catch (error) {
      console.error('注入文本时出错:', error);
      return false;
    }
  }

  // 监听消息
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('内容脚本收到消息:', message);
    
    switch (message.type) {
      case 'INJECT_TEXT':
        const text = message.payload.text;
        const targetElement = findEditableElement();
        
        if (targetElement) {
          const success = injectTextToElement(targetElement, text);
          if (success) {
            // 聚焦到元素
            targetElement.focus();
            sendResponse({ success: true, message: '文本注入成功' });
          } else {
            sendResponse({ success: false, error: '文本注入失败' });
          }
        } else {
          // 创建临时提示
          showTemporaryMessage('未找到可编辑的输入框，请先点击一个输入框');
          sendResponse({ success: false, error: '未找到可编辑元素' });
        }
        break;
        
      default:
        sendResponse({ success: false, error: '未知消息类型' });
    }
    
    return true; // 保持消息通道开放
  });

  // 显示临时消息
  function showTemporaryMessage(message: string) {
    const div = document.createElement('div');
    div.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #333;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
    `;
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    div.textContent = message;
    document.body.appendChild(div);
    
    // 3秒后移除
    setTimeout(() => {
      if (div.parentNode) {
        div.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => div.remove(), 300);
      }
      style.remove();
    }, 3000);
  }
  
  console.log('PromptMate 内容脚本初始化完成');
}