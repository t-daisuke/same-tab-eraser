export interface TabInfo {
  id: number;
  url: string;
  title: string;
  windowId: number;
  pinned: boolean;
  active: boolean;
}

export async function getAllTabs(): Promise<TabInfo[]> {
  const windows = await chrome.windows.getAll({ populate: true });
  return windows.flatMap((window: chrome.windows.Window) => 
    window.tabs?.map((tab: chrome.tabs.Tab) => ({
      id: tab.id!,
      url: tab.url!,
      title: tab.title!,
      windowId: window.id!,
      pinned: tab.pinned,
      active: tab.active
    })) || []
  );
}

export function findDuplicateTabs(tabs: TabInfo[]): Map<string, TabInfo[]> {
  const urlGroups = new Map<string, TabInfo[]>();
  
  tabs.forEach(tab => {
    if (!tab.pinned && !tab.active) {
      const url = tab.url;
      if (!urlGroups.has(url)) {
        urlGroups.set(url, []);
      }
      urlGroups.get(url)!.push(tab);
    }
  });

  // 重複があるURLのみをフィルタリング
  const duplicates = new Map<string, TabInfo[]>();
  urlGroups.forEach((tabs, url) => {
    if (tabs.length > 1) {
      duplicates.set(url, tabs);
    }
  });

  return duplicates;
}

export async function removeTabs(tabIds: number[]): Promise<void> {
  await Promise.all(tabIds.map(id => chrome.tabs.remove(id)));
}

export function formatTabInfo(tab: TabInfo): string {
  return `${tab.title} (${tab.url})`;
} 