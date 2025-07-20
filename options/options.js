// 国际化动态替换
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (chrome && chrome.i18n && chrome.i18n.getMessage) {
      el.textContent = chrome.i18n.getMessage(key) || key;
    }
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

  // 读取设置
  chrome.storage.sync.get({
    width: 300,
    count: 10,
    quickRestore: false
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
  });

  function save() {
    chrome.storage.sync.set({
      width: parseInt(widthInput.value),
      count: parseInt(countInput.value),
      quickRestore: !!(quickRestore && quickRestore.checked)
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
}); 