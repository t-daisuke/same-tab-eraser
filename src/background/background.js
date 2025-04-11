/// <reference types="chrome"/>

// タブの状態を管理する変数
/** @type {Map<string, chrome.tabs.Tab[]>} */
let tabGroups = new Map();

// タブの更新を監視
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    updateTabGroups();
  }
});

// タブの削除を監視
chrome.tabs.onRemoved.addListener(() => {
  updateTabGroups();
});

// タブの移動を監視
chrome.tabs.onMoved.addListener(() => {
  updateTabGroups();
});

// タブグループの更新
/** @returns {Promise<void>} */
async function updateTabGroups() {
  const tabs = await chrome.tabs.query({});
  const newTabGroups = new Map();

  // URLをキーとしてタブをグループ化
  tabs.forEach(tab => {
    if (!tab.url) return; // URLが空のタブはスキップ
    if (tab.url.startsWith('chrome://')) return; // Chrome内部ページはスキップ

    const url = new URL(tab.url).origin + new URL(tab.url).pathname;
    if (!newTabGroups.has(url)) {
      newTabGroups.set(url, []);
    }
    newTabGroups.get(url).push(tab);
  });

  // 重複タブを検出
  const duplicateTabs = [];
  for (const [url, tabList] of newTabGroups.entries()) {
    if (tabList.length > 1) {
      duplicateTabs.push({
        url,
        tabs: tabList
      });
    }
  }

  // 重複タブ情報をストレージに保存
  await chrome.storage.local.set({ duplicateTabs });
}

// 初期化
updateTabGroups(); 