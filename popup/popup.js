document.addEventListener('DOMContentLoaded', async () => {
  // 获取设置
  const settings = await getSettings();

  // 获取最近关闭的标签页
  chrome.sessions.getRecentlyClosed({maxResults: settings.count}, (sessions) => {
    if (sessions.length > 0){
      // 如果只显示一个且是tab，直接恢复
      if (settings.count === 1 && sessions[0].tab) {
        chrome.sessions.restore(sessions[0].tab.sessionId);
      } else {
        // 设置弹窗宽度
        document.body.style.width = `${settings.width}px`

        renderHistory(sessions);
      }
    }
  });
});

function renderHistory(sessions) {
  const list = document.getElementById('history-list');
  list.innerHTML = '';
  sessions.forEach(session => {
    if (session.tab) {
      // 单tab项
      const item = document.createElement('div');
      item.className = 'tab-item';

      const img = document.createElement('img');
      img.src = chrome.runtime.getURL(`_favicon/?pageUrl=${encodeURIComponent(session.tab.url)}&size=32`);
      img.className = 'icon';
      item.appendChild(img);

      const title = document.createElement('span');
      title.textContent = session.tab.title || session.tab.url;
      title.className = 'title';
      item.appendChild(title);

      item.addEventListener('click', () => {
        chrome.sessions.restore(session.tab.sessionId);
      });

      list.appendChild(item);
    } else if (session.window) {
      // 窗口项
      const winItem = document.createElement('div');
      winItem.className = 'window-item';

      // 头部
      const header = document.createElement('div');
      header.className = 'window-header';

      // 窗口图标
      const winIcon = document.createElement('img');
      winIcon.src = chrome.runtime.getURL('icons/tab.svg');
      winIcon.className = 'icon';
      header.appendChild(winIcon);

      // 标题
      const winTitle = document.createElement('span');
      winTitle.className = 'window-title';
      winTitle.textContent = `${session.window.tabs.length} ${chrome.i18n.getMessage('windowTabsLabel')}`;
      header.appendChild(winTitle);

      // 展开按钮
      const expandBtn = document.createElement('img');
      expandBtn.className = 'icon expand-btn';
      expandBtn.src = chrome.runtime.getURL('icons/down.svg');

      // 展开/收起逻辑
      expandBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        tabsBox.classList.toggle('expanded');
        if (tabsBox.classList.contains('expanded')) {
          expandBtn.src = chrome.runtime.getURL('icons/up.svg');
        } else {
          expandBtn.src = chrome.runtime.getURL('icons/down.svg');
        }
      });

      header.appendChild(expandBtn);
      winItem.appendChild(header);

      header.addEventListener('click', (e) => {
        e.stopPropagation();
        chrome.sessions.restore(session.window.sessionId);
      });

      // tab列表
      const tabsBox = document.createElement('div');
      tabsBox.className = 'window-tabs';

      session.window.tabs.forEach(tab => {
        const tabDiv = document.createElement('div');
        tabDiv.className = 'tab-item';
        const img = document.createElement('img');
        img.src = chrome.runtime.getURL(`_favicon/?pageUrl=${encodeURIComponent(tab.url)}&size=32`);
        img.className = 'icon';
        tabDiv.appendChild(img);

        const title = document.createElement('div');
        title.textContent = tab.title || tab.url;
        title.className = 'title';
        tabDiv.appendChild(title);
        tabDiv.addEventListener('click', (e) => {
          e.stopPropagation();
          chrome.sessions.restore(tab.sessionId);
        });
        tabsBox.appendChild(tabDiv);
      });
      winItem.appendChild(tabsBox);

      list.appendChild(winItem);
    }
  });
}

function getSettings() {
  return new Promise(resolve => {
    chrome.storage.sync.get({
      width: 350,
      count: 10
    }, resolve);
  });
} 