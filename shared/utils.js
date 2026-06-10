/**
 * 共享工具函数 — popup 和 options 共用
 */

/**
 * 应用主题到 body
 * @param {'auto'|'light'|'dark'} theme
 */
function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
}

/**
 * 读取扩展设置（带默认值）
 * @returns {Promise<{width: number, count: number, quickRestore: boolean, theme: string}>}
 */
function getSettings() {
  return new Promise(resolve => {
    chrome.storage.sync.get({
      width: 300,
      count: 10,
      fontSize: 12,
      quickRestore: false,
      theme: 'auto'
    }, resolve);
  });
}
