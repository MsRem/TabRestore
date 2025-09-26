// 国际化动态替换
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (chrome && chrome.i18n && chrome.i18n.getMessage) {
      el.textContent = chrome.i18n.getMessage(key) || key;
    }
  });
}

// 应用主题
function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  // 同步图标选择器激活状态
  document.querySelectorAll('.theme-option').forEach(option => {
    option.classList.toggle('active', option.getAttribute('data-theme') === theme);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  applyI18n();
  
  const widthInput = document.getElementById('widthInput');
  const widthValue = document.getElementById('widthValue');
  const widthSlider = document.getElementById('widthSlider');
  const countInput = document.getElementById('countInput');
  const countValue = document.getElementById('countValue');
  const countSlider = document.getElementById('countSlider');
  const quickRestore = document.getElementById('checkboxInput');
  const themeOptions = document.querySelectorAll('.theme-option');

  // 读取设置
  chrome.storage.sync.get({
    width: 300,
    count: 10,
    quickRestore: false,
    theme: 'auto'
  }, (items) => {
    widthInput.value = items.width;
    widthValue.setAttribute('width-value', items.width);
    widthSlider.style.setProperty('--value', items.width);
    widthSlider.style.setProperty('--text-value', JSON.stringify(items.width));

    countInput.value = items.count;
    countValue.setAttribute('count-value', items.count);
    countSlider.style.setProperty('--value', items.count);
    countSlider.style.setProperty('--text-value', JSON.stringify(items.count));

    quickRestore.checked = !!items.quickRestore;
    
    applyTheme(items.theme);
  });

  function save() {
    const activeTheme = document.querySelector('.theme-option.active')?.getAttribute('data-theme') || 'auto';
    chrome.storage.sync.set({
      width: parseInt(widthInput.value),
      count: parseInt(countInput.value),
      quickRestore: !!(quickRestore && quickRestore.checked),
      theme: activeTheme
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

  quickRestore.addEventListener('change', save);

  // 主题图标点击
  themeOptions.forEach(option => {
    option.addEventListener('click', () => {
      const theme = option.getAttribute('data-theme');
      applyTheme(theme);
      save();
    });
  });
});
