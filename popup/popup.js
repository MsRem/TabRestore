document.addEventListener('DOMContentLoaded', async () => {
  // 获取设置
  const settings = await getSettings();

  chrome.sessions.getRecentlyClosed({ maxResults: settings.count }, (sessions) => {
    if (sessions.length > 0) {
      if (!!settings.quickRestore) {
        // 自动恢复第一个项
        const first = sessions[0];
        if (first.tab) {
          chrome.sessions.restore(first.tab.sessionId).then(() => window.close());
        } else if (first.window) {
          chrome.sessions.restore(first.window.sessionId).then(() => window.close());
        }
      } else {
        document.body.style.width = `${settings.width}px`;
        renderHistory(sessions);
      }
    }
  });
});

function createTabItem(tab) {
  const item = document.createElement('div');
  item.className = 'tab-item';

  const icon = document.createElement('img');
  icon.src = chrome.runtime.getURL(`_favicon/?pageUrl=${encodeURIComponent(tab.url)}&size=32`);
  icon.className = 'icon';
  item.appendChild(icon);

  const title = document.createElement('span');
  title.textContent = tab.title || tab.url;
  title.className = 'title';
  item.appendChild(title);

  item.addEventListener('click', (e) => {
    e.stopPropagation();
    chrome.sessions.restore(tab.sessionId).then(() => {
      window.close();
    });
  });
  return item;
}


function renderHistory(sessions) {
  const list = document.getElementById('history-list');
  list.innerHTML = '';
  sessions.forEach(session => {
    if (session.tab) {
      // 单tab项
      list.appendChild(createTabItem(session.tab));
    } else if (session.window) {
      // 窗口项
      const item = document.createElement('div');
      item.className = 'window-item';

      // 头部
      const header = document.createElement('div');
      header.className = 'window-header';

      // 窗口图标
      const icon = document.createElement('img');
      icon.src = chrome.runtime.getURL('icons/tab.svg');
      icon.className = 'icon';
      header.appendChild(icon);

      // 标题
      const title = document.createElement('span');
      title.className = 'window-title';
      title.textContent = `${session.window.tabs.length} ${chrome.i18n.getMessage('windowTabsLabel')}`;
      header.appendChild(title);

      // 展开按钮
      const expand = document.createElement('img');
      expand.className = 'icon expand-btn';
      expand.src = chrome.runtime.getURL('icons/down.svg');

      // tab列表
      const tabs = document.createElement('div');
      tabs.className = 'window-tabs';
      session.window.tabs.forEach(tab => {
        tabs.appendChild(createTabItem(tab));
      });

      // 展开/收起逻辑
      expand.addEventListener('click', (e) => {
        e.stopPropagation();
        tabs.classList.toggle('expanded');
        if (tabs.classList.contains('expanded')) {
          expand.src = chrome.runtime.getURL('icons/up.svg');
        } else {
          expand.src = chrome.runtime.getURL('icons/down.svg');
        }
      });

      // 标题点击
      header.addEventListener('click', (e) => {
        e.stopPropagation();
        chrome.sessions.restore(session.window.sessionId).then(() => {
          window.close();
        });
      });

      header.appendChild(expand);
      item.appendChild(header);
      item.appendChild(tabs);
      list.appendChild(item);
    }
  });
}

function getSettings() {
  return new Promise(resolve => {
    chrome.storage.sync.get({
      width: 350,
      count: 10,
      quickRestore: false
    }, resolve);
  });
} 