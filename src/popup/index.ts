import './index.css'
import { t, getDefaultLang } from '../i18n';
import { getStorage, setStorage, getSessionStorage, setSessionStorage } from '../utils/storage';
import { verifyPassword } from '../utils/password';

interface SavedVideo {
  id: string;
  title: string;
  url: string;
  domain: string;
  savedAt: string;
  thumbnailInfo?: {
    url: string;
  };
}

// 多言語辞書
const LANGS = ['ja', 'en', 'zh'] as const;
type Lang = typeof LANGS[number];

// 言語設定
let currentLang: Lang = 'ja';

// ログ出力制御用
let enableLog = false;
function log(...args: any[]) {
  if (enableLog) {
    console.log('[ReClip]', ...args);
  }
}

// 設定の取得
async function loadSettings() {
  const result = await chrome.storage.local.get('reclipSettings');
  enableLog = !!(result.reclipSettings?.enableLog);
  currentLang = (result.reclipSettings?.lang as Lang) || getDefaultLang();
  const toggle = document.getElementById('logToggle') as HTMLInputElement | null;
  if (toggle) toggle.checked = enableLog;
  const langSelect = document.getElementById('langSelect') as HTMLSelectElement | null;
  if (langSelect) langSelect.value = currentLang;
  renderTexts();
}

// 設定の保存
async function saveSettings() {
  await chrome.storage.local.set({ reclipSettings: { enableLog, lang: currentLang } });
}

// 設定トグルのイベント
function setupSettingsMenu() {
  const toggle = document.getElementById('logToggle') as HTMLInputElement | null;
  if (toggle) {
    toggle.addEventListener('change', async (e) => {
      enableLog = (e.target as HTMLInputElement).checked;
      await saveSettings();
      log(enableLog ? t('logEnabled', currentLang) : t('logDisabled', currentLang));
    });
  }
  const langSelect = document.getElementById('langSelect') as HTMLSelectElement | null;
  if (langSelect) {
    langSelect.addEventListener('change', async (e) => {
      currentLang = (e.target as HTMLSelectElement).value as Lang;
      await saveSettings();
      renderTexts();
      displayVideos();
    });
  }
}

function renderTexts() {
  (document.getElementById('titleLabel') as HTMLElement).textContent = t('savedVideos', currentLang);
  (document.getElementById('logLabel') as HTMLElement).textContent = t('logToggle', currentLang);
  (document.getElementById('deleteAll') as HTMLButtonElement).textContent = t('deleteAll', currentLang);
  (document.getElementById('openList') as HTMLButtonElement).textContent = t('openList', currentLang);
  (document.getElementById('langLabel') as HTMLElement).textContent = t('langLabel', currentLang);
  (document.getElementById('settingsText') as HTMLElement).textContent = t('settings', currentLang);
  
  // パスワード入力画面のテキスト
  const passwordEnterText = document.getElementById('passwordEnterText');
  const passwordInput = document.getElementById('passwordInput') as HTMLInputElement;
  const submitPassword = document.getElementById('submitPassword');
  const cancelPassword = document.getElementById('cancelPassword');

  if (passwordEnterText) passwordEnterText.textContent = t('passwordEnter', currentLang);
  if (passwordInput) passwordInput.placeholder = t('password', currentLang);
  if (submitPassword) submitPassword.textContent = t('passwordSubmit', currentLang);
  if (cancelPassword) cancelPassword.textContent = t('passwordCancel', currentLang);
}

// 保存した動画の一覧を表示する関数
async function displayVideos() {
  try {
    const result = await chrome.storage.local.get('savedVideos');
    const savedVideos = (result.savedVideos || []) as SavedVideo[];
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
          <p>${t('noVideos', currentLang)}</p>
          <p class="help-text">${t('howTo', currentLang)}</p>
          <ol>
            <li>${t('howToStep1', currentLang)}</li>
            <li>${t('howToStep2', currentLang)}</li>
          </ol>
        </div>
      `;
      return;
    }

    savedVideos.sort((a: SavedVideo, b: SavedVideo) => {
      const dateA = new Date(a.savedAt).getTime();
      const dateB = new Date(b.savedAt).getTime();
      return dateB - dateA;
    });

    savedVideos.forEach((video: SavedVideo) => {
      const videoElement = document.createElement('div');
      videoElement.className = 'video-item';
      const thumbnailUrl = video.thumbnailInfo?.url || chrome.runtime.getURL('img/logo-48.png');
      const title = video.title || t('noVideos', currentLang);
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
        const target = e.target as HTMLElement;
        if (!target.classList.contains('delete-btn')) {
          chrome.tabs.create({ url: video.url });
        }
      });
      const deleteBtn = videoElement.querySelector('.delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          if (confirm(t('confirmDelete'))) {
            const updatedVideos = savedVideos.filter((v: SavedVideo) => v.id !== video.id);
            await chrome.storage.local.set({ savedVideos: updatedVideos });
            displayVideos();
          }
        });
      }
      videoList.appendChild(videoElement);
    });
  } catch (error) {
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

// DOM要素の取得
const passwordAuth = document.getElementById('passwordAuth') as HTMLDivElement;
const mainContent = document.getElementById('mainContent') as HTMLDivElement;
const passwordInput = document.getElementById('passwordInput') as HTMLInputElement;
const submitPassword = document.getElementById('submitPassword') as HTMLButtonElement;

// セッション管理
const SESSION_KEY = 'reclip_auth_session';
const DEFAULT_SESSION_DURATION = 60 * 60 * 1000; // 60分

interface AuthSession {
  isAuthenticated: boolean;
  expiresAt: number;
}

// セッションの保存
async function saveSession() {
  const settings = await getStorage('settings');
  const sessionDuration = settings?.sessionDuration || DEFAULT_SESSION_DURATION;
  
  const session: AuthSession = {
    isAuthenticated: true,
    expiresAt: Date.now() + sessionDuration
  };
  await setStorage(SESSION_KEY, session);
}

// セッションの確認
async function checkSession(): Promise<boolean> {
  const session = await getStorage(SESSION_KEY) as AuthSession | null;
  if (!session) return false;

  if (!session.isAuthenticated) return false;
  if (Date.now() > session.expiresAt) {
    await setStorage(SESSION_KEY, null);
    return false;
  }

  // セッションを更新
  await saveSession();
  return true;
}

// 定期的にセッションをチェック
setInterval(async () => {
  const session = await getStorage(SESSION_KEY) as AuthSession | null;
  if (session && Date.now() > session.expiresAt) {
    await setStorage(SESSION_KEY, null);
    showPasswordAuth();
  }
}, 60000); // 1分ごとにチェック

// パスワード認証の初期化
async function initializePasswordAuth() {
  const settings = await getStorage('settings');
  const isPasswordEnabled = settings?.passwordEnabled || false;
  const passwordHash = settings?.passwordHash || '';

  if (!isPasswordEnabled) {
    showMainContent();
    return;
  }

  // セッションの確認
  if (await checkSession()) {
    showMainContent();
    return;
  }

  showPasswordAuth();
}

// パスワード認証の実行
async function authenticate() {
  const password = passwordInput.value;
  const settings = await getStorage('settings');
  const passwordHash = settings?.passwordHash || '';

  if (await verifyPassword(password, passwordHash)) {
    await saveSession();
    showMainContent();
  } else {
    alert(t('invalidPassword'));
    passwordInput.value = '';
  }
}

// UI表示の切り替え
function showPasswordAuth() {
  passwordAuth.style.display = 'block';
  mainContent.style.display = 'none';
}

function showMainContent() {
  passwordAuth.style.display = 'none';
  mainContent.style.display = 'block';
}

// イベントリスナーの設定
submitPassword.addEventListener('click', authenticate);
passwordInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    authenticate();
  }
});

// 初期化
initializePasswordAuth();
