interface Tab {
  id: number;
  title: string;
  windowId: number;
}

interface DuplicateGroup {
  url: string;
  tabs: Tab[];
}

const scanButton = document.getElementById('scanButton') as HTMLButtonElement;
const resultsDiv = document.getElementById('results') as HTMLDivElement;

scanButton.addEventListener('click', async () => {
  try {
    const duplicates = await chrome.runtime.sendMessage({ type: 'GET_DUPLICATE_TABS' });
    displayResults(duplicates);
  } catch (error) {
    console.error('Failed to get duplicate tabs:', error);
    resultsDiv.innerHTML = '<p class="error">エラーが発生しました</p>';
  }
});

function displayResults(duplicates: DuplicateGroup[]) {
  if (duplicates.length === 0) {
    resultsDiv.innerHTML = '<p>重複しているタブはありません</p>';
    return;
  }

  resultsDiv.innerHTML = duplicates.map(group => `
    <div class="duplicate-group">
      <h3>${group.url}</h3>
      <ul class="tab-list">
        ${group.tabs.map(tab => `
          <li class="tab-item">
            <span class="tab-info">${tab.title}</span>
            <button class="remove-button" data-tab-id="${tab.id}">削除</button>
          </li>
        `).join('')}
      </ul>
    </div>
  `).join('');

  // 削除ボタンのイベントリスナーを設定
  document.querySelectorAll('.remove-button').forEach(button => {
    button.addEventListener('click', async (event) => {
      const tabId = parseInt((event.target as HTMLButtonElement).dataset.tabId!);
      try {
        const result = await chrome.runtime.sendMessage({
          type: 'REMOVE_TABS',
          tabIds: [tabId]
        });
        
        if (result.success) {
          // 削除成功したタブをUIから削除
          const tabItem = (event.target as HTMLElement).closest('.tab-item');
          tabItem?.remove();
          
          // グループ内のタブがなくなったらグループも削除
          const group = tabItem?.closest('.duplicate-group');
          if (group?.querySelectorAll('.tab-item').length === 0) {
            group.remove();
          }
          
          // すべてのグループがなくなったらメッセージを表示
          if (resultsDiv.querySelectorAll('.duplicate-group').length === 0) {
            resultsDiv.innerHTML = '<p>重複しているタブはありません</p>';
          }
        } else {
          console.error('Failed to remove tab:', result.error);
        }
      } catch (error) {
        console.error('Failed to remove tab:', error);
      }
    });
  });
} 