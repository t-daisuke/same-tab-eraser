declare namespace chrome {
  namespace runtime {
    interface MessageSender {
      tab?: chrome.tabs.Tab;
      frameId?: number;
    }

    function sendMessage(message: any, responseCallback?: (response: any) => void): void;
    function sendMessage(message: any, options: { [key: string]: any }, responseCallback?: (response: any) => void): void;
    function sendMessage(extensionId: string, message: any, responseCallback?: (response: any) => void): void;
    function sendMessage(extensionId: string, message: any, options: { [key: string]: any }, responseCallback?: (response: any) => void): void;

    const onMessage: {
      addListener(callback: (message: any, sender: MessageSender, sendResponse: (response: any) => void) => void): void;
      removeListener(callback: (message: any, sender: MessageSender, sendResponse: (response: any) => void) => void): void;
    };
  }

  namespace tabs {
    interface Tab {
      id?: number;
      url?: string;
      title?: string;
      pinned: boolean;
      active: boolean;
    }

    function remove(tabId: number): Promise<void>;
  }

  namespace windows {
    interface Window {
      id?: number;
      tabs?: chrome.tabs.Tab[];
    }

    function getAll(getInfo?: { populate?: boolean }): Promise<Window[]>;
  }
} 