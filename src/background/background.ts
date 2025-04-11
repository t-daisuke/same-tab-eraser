import { getAllTabs, findDuplicateTabs, removeTabs } from '../utils/tabUtils';

interface Message {
  type: 'GET_DUPLICATE_TABS' | 'REMOVE_TABS';
  tabIds?: number[];
}

chrome.runtime.onMessage.addListener((message: Message, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => {
  if (message.type === 'GET_DUPLICATE_TABS') {
    handleGetDuplicateTabs().then(sendResponse);
    return true; // 非同期レスポンスを示す
  } else if (message.type === 'REMOVE_TABS' && message.tabIds) {
    handleRemoveTabs(message.tabIds).then(sendResponse);
    return true;
  }
  return false;
});

async function handleGetDuplicateTabs() {
  const tabs = await getAllTabs();
  const duplicates = findDuplicateTabs(tabs);
  return Array.from(duplicates.entries()).map(([url, tabs]) => ({
    url,
    tabs: tabs.map(tab => ({
      id: tab.id,
      title: tab.title,
      windowId: tab.windowId
    }))
  }));
}

async function handleRemoveTabs(tabIds: number[]) {
  try {
    await removeTabs(tabIds);
    return { success: true };
  } catch (error) {
    console.error('Failed to remove tabs:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
} 