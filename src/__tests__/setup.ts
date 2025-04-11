import { jest, beforeEach } from '@jest/globals';

// Chrome APIの型定義
interface ChromeWindow {
  id: number;
  tabs?: Array<{
    id: number;
    url: string;
    title: string;
    pinned: boolean;
    active: boolean;
  }>;
}

// Chrome APIのモック
const mockChrome = {
  windows: {
    getAll: jest.fn(() => Promise.resolve([])),
  },
  tabs: {
    remove: jest.fn(() => Promise.resolve()),
  },
} as unknown as typeof chrome;

// グローバルにChromeオブジェクトを追加
global.chrome = mockChrome;

// 各テストの前にモックをリセット
beforeEach(() => {
  jest.clearAllMocks();
});

// テストケースを追加
describe('setup', () => {
  test('Chrome APIのモックが正しく設定されている', () => {
    expect(chrome).toBeDefined();
    expect(chrome.windows.getAll).toBeDefined();
    expect(chrome.tabs.remove).toBeDefined();
  });
}); 