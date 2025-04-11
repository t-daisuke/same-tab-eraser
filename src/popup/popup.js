/// <reference types="chrome"/>

// 重複タブの一覧を表示
/** @returns {Promise<void>} */
async function displayDuplicateTabs() {
  const { duplicateTabs } = await chrome.storage.local.get('duplicateTabs');
  const container = document.getElementById('duplicateTabsList');
  container.innerHTML = '';

  if (!duplicateTabs || duplicateTabs.length === 0) {
    container.innerHTML = '<p>重複タブはありません</p>';
    return;
  }

  duplicateTabs.forEach(group => {
    const groupElement = document.createElement('div');
    groupElement.className = 'tab-group';
    
    const urlElement = document.createElement('h3');
    urlElement.textContent = group.url;
    groupElement.appendChild(urlElement);

    const tabsList = document.createElement('ul');
    group.tabs.forEach(tab => {
      const tabItem = document.createElement('li');
      tabItem.className = 'tab-item';
      
      const titleElement = document.createElement('span');
      titleElement.textContent = tab.title;
      tabItem.appendChild(titleElement);

      const closeButton = document.createElement('button');
      closeButton.textContent = '閉じる';
      closeButton.onclick = () => {
        if (tab.id) {
          chrome.tabs.remove(tab.id);
        }
      };
      tabItem.appendChild(closeButton);

      tabsList.appendChild(tabItem);
    });

    groupElement.appendChild(tabsList);
    container.appendChild(groupElement);
  });
}

// 初期化
document.addEventListener('DOMContentLoaded', displayDuplicateTabs);

// ストレージの変更を監視
chrome.storage.onChanged.addListener(() => {
  displayDuplicateTabs();
}); 