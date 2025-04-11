import { jest } from '@jest/globals';
import { findDuplicateTabs, formatTabInfo, TabInfo, getAllTabs, removeTabs } from '../tabUtils';

// グローバルなChromeオブジェクトの型を拡張
declare global {
  namespace NodeJS {
    interface Global {
      chrome: {
        windows: {
          getAll: jest.Mock<Promise<chrome.windows.Window[]>, [chrome.windows.GetInfo?]>;
        };
        tabs: {
          remove: jest.Mock<Promise<void>, [number | number[]]>;
        };
      };
    }
  }
}

describe('getAllTabs', () => {
  test('すべてのタブを取得できる', async () => {
    const mockTabs = [
      { id: 1, url: 'https://example.com', title: 'Example', pinned: false, active: false },
      { id: 2, url: 'https://google.com', title: 'Google', pinned: false, active: false }
    ];
    const mockWindows = [{ id: 1, tabs: mockTabs }];
    
    (chrome.windows.getAll as jest.Mock).mockResolvedValueOnce(mockWindows);
    
    const result = await getAllTabs();
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 1,
      url: 'https://example.com',
      title: 'Example',
      windowId: 1,
      pinned: false,
      active: false
    });
  });

  test('タブが存在しないウィンドウを処理できる', async () => {
    const mockWindows = [{ id: 1 }];
    (chrome.windows.getAll as jest.Mock).mockResolvedValueOnce(mockWindows);
    
    const result = await getAllTabs();
    expect(result).toHaveLength(0);
  });
});

describe('removeTabs', () => {
  test('タブを削除できる', async () => {
    (chrome.tabs.remove as jest.Mock).mockResolvedValueOnce(undefined);
    
    await removeTabs([1, 2]);
    expect(chrome.tabs.remove).toHaveBeenCalledTimes(2);
    expect(chrome.tabs.remove).toHaveBeenCalledWith(1);
    expect(chrome.tabs.remove).toHaveBeenCalledWith(2);
  });

  test('タブの削除に失敗した場合にエラーを投げる', async () => {
    (chrome.tabs.remove as jest.Mock).mockRejectedValueOnce(new Error('Failed to remove tab'));
    
    await expect(removeTabs([1])).rejects.toThrow('Failed to remove tab');
  });
});

describe('findDuplicateTabs', () => {
  test('重複タブがない場合は空のMapを返す', () => {
    const tabs: TabInfo[] = [
      { id: 1, url: 'https://example.com', title: 'Example', windowId: 1, pinned: false, active: false },
      { id: 2, url: 'https://google.com', title: 'Google', windowId: 1, pinned: false, active: false }
    ];
    
    const result = findDuplicateTabs(tabs);
    expect(result.size).toBe(0);
  });

  test('重複タブを正しく検出する', () => {
    const tabs: TabInfo[] = [
      { id: 1, url: 'https://example.com', title: 'Example 1', windowId: 1, pinned: false, active: false },
      { id: 2, url: 'https://example.com', title: 'Example 2', windowId: 1, pinned: false, active: false },
      { id: 3, url: 'https://google.com', title: 'Google', windowId: 1, pinned: false, active: false }
    ];
    
    const result = findDuplicateTabs(tabs);
    expect(result.size).toBe(1);
    expect(result.get('https://example.com')?.length).toBe(2);
  });

  test('ピン留めされたタブは重複としてカウントしない', () => {
    const tabs: TabInfo[] = [
      { id: 1, url: 'https://example.com', title: 'Example 1', windowId: 1, pinned: true, active: false },
      { id: 2, url: 'https://example.com', title: 'Example 2', windowId: 1, pinned: false, active: false }
    ];
    
    const result = findDuplicateTabs(tabs);
    expect(result.size).toBe(0);
  });

  test('アクティブなタブは重複としてカウントしない', () => {
    const tabs: TabInfo[] = [
      { id: 1, url: 'https://example.com', title: 'Example 1', windowId: 1, pinned: false, active: true },
      { id: 2, url: 'https://example.com', title: 'Example 2', windowId: 1, pinned: false, active: false }
    ];
    
    const result = findDuplicateTabs(tabs);
    expect(result.size).toBe(0);
  });

  test('複数の重複グループを正しく検出する', () => {
    const tabs: TabInfo[] = [
      { id: 1, url: 'https://example.com', title: 'Example 1', windowId: 1, pinned: false, active: false },
      { id: 2, url: 'https://example.com', title: 'Example 2', windowId: 1, pinned: false, active: false },
      { id: 3, url: 'https://google.com', title: 'Google 1', windowId: 1, pinned: false, active: false },
      { id: 4, url: 'https://google.com', title: 'Google 2', windowId: 1, pinned: false, active: false }
    ];
    
    const result = findDuplicateTabs(tabs);
    expect(result.size).toBe(2);
    expect(result.get('https://example.com')?.length).toBe(2);
    expect(result.get('https://google.com')?.length).toBe(2);
  });

  test('空のタブリストを処理できる', () => {
    const tabs: TabInfo[] = [];
    const result = findDuplicateTabs(tabs);
    expect(result.size).toBe(0);
  });
});

describe('formatTabInfo', () => {
  test('タブ情報を正しくフォーマットする', () => {
    const tab: TabInfo = {
      id: 1,
      url: 'https://example.com',
      title: 'Example',
      windowId: 1,
      pinned: false,
      active: false
    };
    
    const result = formatTabInfo(tab);
    expect(result).toBe('Example (https://example.com)');
  });
}); 