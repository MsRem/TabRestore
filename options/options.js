// 国际化动态替换
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (chrome && chrome.i18n && chrome.i18n.getMessage) {
      el.textContent = chrome.i18n.getMessage(key) || key;
    }
  });
}

/**
 * 同步主题选择器的激活状态（options 页面特有）
 */
function syncThemeOptions(theme) {
  document.querySelectorAll('.theme-option').forEach(option => {
    option.classList.toggle('active', option.getAttribute('data-theme') === theme);
  });
}

/**
 * 应用主题：设置 body 属性 + 同步选择器 UI
 */
function applyOptionsTheme(theme) {
  applyTheme(theme);        // shared/utils.js
  syncThemeOptions(theme);
}

document.addEventListener('DOMContentLoaded', () => {
  applyI18n();
  
  const widthInput = document.getElementById('widthInput');
  const widthValue = document.getElementById('widthValue');
  const widthSlider = document.getElementById('widthSlider');
  const countInput = document.getElementById('countInput');
  const countValue = document.getElementById('countValue');
  const countSlider = document.getElementById('countSlider');
  const fontSizeInput = document.getElementById('fontSizeInput');
  const fontSizeValue = document.getElementById('fontSizeValue');
  const fontSizeSlider = document.getElementById('fontSizeSlider');
  const quickRestore = document.getElementById('checkboxInput');
  const advancedWrapper = document.getElementById('advancedWrapper');
  const themeOptions = document.querySelectorAll('.theme-option');

  /**
   * 切换高级选项（宽度/数量）的显示/隐藏
   * 快速恢复开启时折叠，关闭时展开
   */
  function toggleAdvancedOptions(checked) {
    if (checked) {
      advancedWrapper.classList.add('collapsed');
    } else {
      advancedWrapper.classList.remove('collapsed');
    }
  }

  // 读取设置
  chrome.storage.sync.get({
    width: 300,
    count: 10,
    fontSize: 14,
    quickRestore: false,
    theme: 'auto'
  }, (items) => {
    if (chrome.runtime.lastError) {
      console.error('读取设置失败:', chrome.runtime.lastError);
      return;
    }

    widthInput.value = items.width;
    widthValue.setAttribute('width-value', items.width);
    widthSlider.style.setProperty('--value', items.width);
    widthSlider.style.setProperty('--text-value', JSON.stringify(items.width));

    countInput.value = items.count;
    countValue.setAttribute('count-value', items.count);
    countSlider.style.setProperty('--value', items.count);
    countSlider.style.setProperty('--text-value', JSON.stringify(items.count));

    fontSizeInput.value = items.fontSize;
    fontSizeValue.setAttribute('fontsize-value', items.fontSize);
    fontSizeSlider.style.setProperty('--value', items.fontSize);
    fontSizeSlider.style.setProperty('--text-value', JSON.stringify(items.fontSize));

    quickRestore.checked = !!items.quickRestore;
    toggleAdvancedOptions(!!items.quickRestore);
    
    applyOptionsTheme(items.theme);
  });

  function save() {
    const activeTheme = document.querySelector('.theme-option.active')?.getAttribute('data-theme') || 'auto';
    chrome.storage.sync.set({
      width: parseInt(widthInput.value),
      count: parseInt(countInput.value),
      fontSize: parseInt(fontSizeInput.value),
      quickRestore: !!(quickRestore && quickRestore.checked),
      theme: activeTheme
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('保存设置失败:', chrome.runtime.lastError);
      }
    });
  }

  widthInput.addEventListener('input', () => {
    widthValue.setAttribute('width-value', widthInput.value);
    widthSlider.style.setProperty('--value', widthInput.value);
    widthSlider.style.setProperty('--text-value', JSON.stringify(widthInput.value));
    save();
  });

  countInput.addEventListener('input', () => {
    countValue.setAttribute('count-value', countInput.value);
    countSlider.style.setProperty('--value', countInput.value);
    countSlider.style.setProperty('--text-value', JSON.stringify(countInput.value));
    save();
  });

  fontSizeInput.addEventListener('input', () => {
    fontSizeValue.setAttribute('fontsize-value', fontSizeInput.value);
    fontSizeSlider.style.setProperty('--value', fontSizeInput.value);
    fontSizeSlider.style.setProperty('--text-value', JSON.stringify(fontSizeInput.value));
    save();
  });

  quickRestore.addEventListener('change', () => {
    toggleAdvancedOptions(quickRestore.checked);
    save();
  });

  // 主题图标点击
  themeOptions.forEach(option => {
    option.addEventListener('click', () => {
      const theme = option.getAttribute('data-theme');
      applyOptionsTheme(theme);
      save();
    });
  });
});
