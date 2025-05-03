import './index.css';
// サムネイルURLを取得する関数
function getThumbnailUrl(video) {
    console.log('Getting thumbnail for video:', video);
    if (video.thumbnailInfo.type === 'youtube' && video.thumbnailInfo.videoId) {
        return `https://img.youtube.com/vi/${video.thumbnailInfo.videoId}/mqdefault.jpg`;
    }
    return 'img/logo-48.png';
}
// 動画一覧を表示する関数
function displayVideos(data) {
    console.log('Displaying videos with data:', data);
    const container = document.getElementById('videoList');
    if (!container) {
        console.error('Container element not found');
        return;
    }
    // データの構造を確認
    const items = data.items || [];
    console.log('Number of items:', items.length);
    if (items.length === 0) {
        console.log('No videos found');
        container.innerHTML = `
      <div class="no-videos-message">
        <p>保存した動画はありません</p>
      </div>
    `;
        return;
    }
    // 日付でソート（新しい順）
    const sortedVideos = [...items].sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
    console.log('Sorted videos:', sortedVideos);
    container.innerHTML = `
    <div class="video-list-header">
      <h2>保存した動画一覧</h2>
      <button id="deleteAll" class="delete-all-btn">すべて削除</button>
    </div>
    <div class="video-grid">
      ${sortedVideos.map(video => `
        <div class="video-item" data-video-id="${video.id}">
          <div class="video-thumbnail">
            <img src="${getThumbnailUrl(video)}" alt="${video.title}" onerror="this.src='img/logo-48.png'">
            <button class="delete-btn" data-video-id="${video.id}">×</button>
          </div>
          <div class="video-info">
            <h3 class="video-title">${video.title}</h3>
            <p class="video-domain">${video.domain}</p>
            <p class="video-date">${new Date(video.savedAt).toLocaleString()}</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;
    // 個別削除ボタンのイベントリスナー
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const videoId = button.getAttribute('data-video-id');
            console.log('Delete button clicked for video:', videoId);
            if (videoId) {
                deleteVideo(videoId);
            }
        });
    });
    // 一括削除ボタンのイベントリスナー
    const deleteAllButton = document.getElementById('deleteAll');
    if (deleteAllButton) {
        deleteAllButton.addEventListener('click', () => {
            console.log('Delete all button clicked');
            deleteAllVideos();
        });
    }
    // 動画アイテムのクリックイベント
    document.querySelectorAll('.video-item').forEach(item => {
        item.addEventListener('click', () => {
            const videoId = item.getAttribute('data-video-id');
            console.log('Video item clicked:', videoId);
            const video = sortedVideos.find(v => v.id === videoId);
            if (video) {
                window.open(video.url, '_blank');
            }
        });
    });
}
// 個別の動画を削除する関数
function deleteVideo(videoId) {
    console.log('Deleting video:', videoId);
    chrome.storage.local.get(['savedVideos'], (result) => {
        console.log('Current storage data:', result);
        const data = result.savedVideos || { items: [] };
        data.items = data.items.filter(video => video.id !== videoId);
        chrome.storage.local.set({ savedVideos: data }, () => {
            console.log('Video deleted, updating display');
            displayVideos(data);
        });
    });
}
// すべての動画を削除する関数
function deleteAllVideos() {
    if (confirm('保存した動画をすべて削除しますか？')) {
        console.log('Deleting all videos');
        chrome.storage.local.set({ savedVideos: { items: [] } }, () => {
            console.log('All videos deleted, updating display');
            displayVideos({ items: [] });
        });
    }
}
// ストレージの変更を監視
chrome.storage.onChanged.addListener((changes, namespace) => {
    console.log('Storage changed:', changes, namespace);
    if (namespace === 'local' && changes.savedVideos) {
        console.log('Saved videos changed:', changes.savedVideos);
        displayVideos(changes.savedVideos.newValue);
    }
});
// 初期表示
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    // ストレージからデータを取得
    chrome.storage.local.get(['savedVideos'], (result) => {
        console.log('Storage result:', result);
        // データの構造を確認
        if (!result.savedVideos) {
            console.log('No savedVideos data found, initializing empty data');
            chrome.storage.local.set({ savedVideos: { items: [] } }, () => {
                displayVideos({ items: [] });
            });
        }
        else {
            console.log('Found savedVideos data:', result.savedVideos);
            displayVideos(result.savedVideos);
        }
    });
});
