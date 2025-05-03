import './index.css';
// 多言語辞書
const LANGS = ['ja', 'en', 'zh'];
const I18N = {
    ja: {
        savedVideos: '保存した動画',
        logToggle: 'ログ出力ON/OFF',
        deleteAll: 'すべて削除',
        openList: '一覧ページを開く',
        noVideos: '保存した動画はありません',
        howTo: '動画を保存するには：',
        howToStep1: 'YouTubeの動画リンクを右クリック',
        howToStep2: '「ReClipに保存」を選択',
        delete: '削除',
        confirmDelete: 'この動画を削除しますか？',
        confirmDeleteAll: 'すべての動画を削除しますか？',
        logEnabled: 'ログ出力が有効になりました',
        logDisabled: 'ログ出力が無効になりました',
        langLabel: '言語',
        settings: '設定',
    },
    en: {
        savedVideos: 'Saved Videos',
        logToggle: 'Enable Log Output',
        deleteAll: 'Delete All',
        openList: 'Open List Page',
        noVideos: 'No saved videos',
        howTo: 'How to save videos:',
        howToStep1: 'Right-click a YouTube video link',
        howToStep2: 'Select "Save to ReClip"',
        delete: 'Delete',
        confirmDelete: 'Delete this video?',
        confirmDeleteAll: 'Delete all videos?',
        logEnabled: 'Log output enabled',
        logDisabled: 'Log output disabled',
        langLabel: 'Language',
        settings: 'Settings',
    },
    zh: {
        savedVideos: '已保存的视频',
        logToggle: '启用日志输出',
        deleteAll: '全部删除',
        openList: '打开列表页面',
        noVideos: '没有已保存的视频',
        howTo: '如何保存视频：',
        howToStep1: '右键点击YouTube视频链接',
        howToStep2: '选择"保存到ReClip"',
        delete: '删除',
        confirmDelete: '要删除此视频吗？',
        confirmDeleteAll: '要删除所有视频吗？',
        logEnabled: '日志输出已启用',
        logDisabled: '日志输出已禁用',
        langLabel: '语言',
        settings: '设置',
    },
};
// 言語設定
let currentLang = 'ja';
function t(key) {
    return I18N[currentLang][key] || key;
}
// ログ出力制御用
let enableLog = false;
function log(...args) {
    if (enableLog) {
        console.log('[ReClip]', ...args);
    }
}
// 設定の取得
async function loadSettings() {
    const result = await chrome.storage.local.get('reclipSettings');
    enableLog = !!(result.reclipSettings?.enableLog);
    currentLang = result.reclipSettings?.lang || getDefaultLang();
    const toggle = document.getElementById('logToggle');
    if (toggle)
        toggle.checked = enableLog;
    const langSelect = document.getElementById('langSelect');
    if (langSelect)
        langSelect.value = currentLang;
    renderTexts();
}
function getDefaultLang() {
    const navLang = navigator.language.slice(0, 2);
    return LANGS.includes(navLang) ? navLang : 'ja';
}
// 設定の保存
async function saveSettings() {
    await chrome.storage.local.set({ reclipSettings: { enableLog, lang: currentLang } });
}
// 設定トグルのイベント
function setupSettingsMenu() {
    const toggle = document.getElementById('logToggle');
    if (toggle) {
        toggle.addEventListener('change', async (e) => {
            enableLog = e.target.checked;
            await saveSettings();
            log(enableLog ? t('logEnabled') : t('logDisabled'));
        });
    }
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
        langSelect.addEventListener('change', async (e) => {
            currentLang = e.target.value;
            await saveSettings();
            renderTexts();
            displayVideos();
        });
    }
}
function renderTexts() {
    document.getElementById('titleLabel').textContent = t('savedVideos');
    document.getElementById('logLabel').textContent = t('logToggle');
    document.getElementById('deleteAll').textContent = t('deleteAll');
    document.getElementById('openList').textContent = t('openList');
    document.getElementById('langLabel').textContent = t('langLabel');
    document.getElementById('settingsText').textContent = t('settings');
}
// 保存した動画の一覧を表示する関数
async function displayVideos() {
    try {
        const result = await chrome.storage.local.get('savedVideos');
        const savedVideos = (result.savedVideos || []);
        log('取得した動画データ:', savedVideos);
        const videoList = document.getElementById('videoList');
        if (!videoList) {
            log('videoList要素が見つかりません');
            return;
        }
        videoList.innerHTML = '';
        if (savedVideos.length === 0) {
            videoList.innerHTML = `
        <div class="empty-state">
          <p>${t('noVideos')}</p>
          <p class="help-text">${t('howTo')}</p>
          <ol>
            <li>${t('howToStep1')}</li>
            <li>${t('howToStep2')}</li>
          </ol>
        </div>
      `;
            return;
        }
        savedVideos.sort((a, b) => {
            const dateA = new Date(a.savedAt).getTime();
            const dateB = new Date(b.savedAt).getTime();
            return dateB - dateA;
        });
        savedVideos.forEach((video) => {
            const videoElement = document.createElement('div');
            videoElement.className = 'video-item';
            const thumbnailUrl = video.thumbnailInfo?.url || chrome.runtime.getURL('img/logo-48.png');
            const title = video.title || t('noVideos');
            const displayTitle = title.length > 50 ? title.substring(0, 47) + '...' : title;
            videoElement.innerHTML = `
        <img src="${thumbnailUrl}" alt="${displayTitle}" class="video-thumbnail" onerror="this.src='${chrome.runtime.getURL('img/logo-48.png')}'">
        <div class="video-info">
          <h3 class="video-title" title="${title}">${displayTitle}</h3>
          <p class="video-domain">${video.domain}</p>
          <button class="delete-btn" data-id="${video.id}">${t('delete')}</button>
        </div>
      `;
            videoElement.addEventListener('click', (e) => {
                const target = e.target;
                if (!target.classList.contains('delete-btn')) {
                    chrome.tabs.create({ url: video.url });
                }
            });
            const deleteBtn = videoElement.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    if (confirm(t('confirmDelete'))) {
                        const updatedVideos = savedVideos.filter((v) => v.id !== video.id);
                        await chrome.storage.local.set({ savedVideos: updatedVideos });
                        displayVideos();
                    }
                });
            }
            videoList.appendChild(videoElement);
        });
    }
    catch (error) {
        log('動画の表示中にエラーが発生しました:', error);
    }
}
document.getElementById('deleteAll')?.addEventListener('click', async () => {
    if (confirm(t('confirmDeleteAll'))) {
        await chrome.storage.local.set({ savedVideos: [] });
        displayVideos();
    }
});
document.getElementById('openList')?.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/pages/saved.html') });
});
document.getElementById('settingsLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: chrome.runtime.getURL('src/popup/settings.html') });
});
// 設定UI初期化
setupSettingsMenu();
// 設定値ロード
loadSettings();
// 初期表示
displayVideos();
// ストレージの変更を監視
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.savedVideos) {
        displayVideos();
    }
    if (namespace === 'local' && changes.reclipSettings) {
        loadSettings();
    }
});
