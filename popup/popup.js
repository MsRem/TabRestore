document.addEventListener('DOMContentLoaded', async () => {
  try {
    const settings = await getSettings();
    applyTheme(settings.theme);
    document.body.style.fontSize = `${settings.fontSize}px`;

    chrome.sessions.getRecentlyClosed({ maxResults: settings.count }, (sessions) => {
      if (chrome.runtime.lastError) {
        console.error('获取最近关闭标签页失败:', chrome.runtime.lastError);
        return;
      }

      if (sessions.length > 0) {
        if (settings.quickRestore) {
          quickRestoreFirst(sessions[0]);
        } else {
          document.body.style.width = `${settings.width}px`;
          renderHistory(sessions);
        }
      }
    });
  } catch (err) {
    console.error('初始化失败:', err);
  }
});

/**
 * 快速恢复：立即恢复最近一个标签页/窗口并关闭弹窗
 */
function quickRestoreFirst(session) {
  const target = session.tab || session.window;
  if (!target) return;

  chrome.sessions.restore(target.sessionId, () => {
    if (chrome.runtime.lastError) {
      console.error('恢复失败:', chrome.runtime.lastError);
    }
    window.close();
  });
}

/**
 * 从模板创建单个标签页项
 */
function createTabItem(tab) {
  const tpl = document.getElementById('template-tab-item');
  const item = tpl.content.cloneNode(true).firstElementChild;

  const icon = item.querySelector('.icon');
  icon.src = chrome.runtime.getURL(`_favicon/?pageUrl=${encodeURIComponent(tab.url)}&size=32`);

  const title = item.querySelector('.title');
  title.textContent = tab.title || tab.url;

  item.addEventListener('click', (e) => {
    e.stopPropagation();
    chrome.sessions.restore(tab.sessionId, () => {
      if (chrome.runtime.lastError) {
        console.error('恢复标签页失败:', chrome.runtime.lastError);
        return;
      }
      window.close();
    });
  });

  return item;
}

/**
 * 渲染历史记录列表
 */
function renderHistory(sessions) {
  const list = document.getElementById('history-list');
  list.innerHTML = '';

  sessions.forEach(session => {
    if (session.tab) {
      list.appendChild(createTabItem(session.tab));
    } else if (session.window) {
      list.appendChild(createWindowItem(session.window));
    }
  });
}

/**
 * 从模板创建窗口分组项
 */
function createWindowItem(win) {
  const tpl = document.getElementById('template-window-item');
  const item = tpl.content.cloneNode(true).firstElementChild;

  const header = item.querySelector('.window-header');
  const icon = item.querySelector('.window-icon');
  const title = item.querySelector('.window-title');
  const expand = item.querySelector('.expand-btn');
  const tabs = item.querySelector('.window-tabs');

  icon.src = chrome.runtime.getURL('icons/tab.svg');
  expand.src = chrome.runtime.getURL('icons/down.svg');
  title.textContent = `${win.tabs.length} ${chrome.i18n.getMessage('windowTabsLabel')}`;

  // 填充子标签页
  win.tabs.forEach(tab => {
    tabs.appendChild(createTabItem(tab));
  });

  // 展开/收起
  expand.addEventListener('click', (e) => {
    e.stopPropagation();
    tabs.classList.toggle('expanded');
    expand.src = chrome.runtime.getURL(
      tabs.classList.contains('expanded') ? 'icons/up.svg' : 'icons/down.svg'
    );
  });

  // 点击标题恢复整个窗口
  header.addEventListener('click', (e) => {
    e.stopPropagation();
    chrome.sessions.restore(win.sessionId, () => {
      if (chrome.runtime.lastError) {
        console.error('恢复窗口失败:', chrome.runtime.lastError);
        return;
      }
      window.close();
    });
  });

  return item;
}
