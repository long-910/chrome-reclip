import { LANGS, Lang, I18N, getDefaultLang, t } from '../i18n';
import { getStorage, setStorage } from '../utils/storage';
import { hashPassword } from '../utils/password';

let currentLang: Lang = 'ja';
let enableLog = false;

// パスワード設定の状態管理
let isPasswordEnabled = false;
let passwordHash = '';

// DOM要素の取得と初期化
const passwordToggle = document.getElementById('passwordToggle') as HTMLInputElement | null;
const passwordSettings = document.getElementById('passwordSettings') as HTMLDivElement | null;
const newPasswordInput = document.getElementById('newPassword') as HTMLInputElement | null;
const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement | null;
const savePasswordButton = document.getElementById('savePassword') as HTMLButtonElement | null;
const sessionDurationInput = document.getElementById('sessionDuration') as HTMLInputElement | null;
const passwordStatus = document.getElementById('passwordStatus') as HTMLDivElement | null;
const changePasswordBtn = document.getElementById('changePasswordBtn') as HTMLButtonElement | null;

async function loadSettings() {
  try {
    const result = await chrome.storage.local.get('reclipSettings');
    enableLog = !!(result.reclipSettings?.enableLog);
    currentLang = (result.reclipSettings?.lang as Lang) || getDefaultLang();
    
    const toggle = document.getElementById('logToggle') as HTMLInputElement | null;
    if (toggle) toggle.checked = enableLog;
    
    const langSelect = document.getElementById('langSelect') as HTMLSelectElement | null;
    if (langSelect) langSelect.value = currentLang;
    
    renderTexts();

    // 現在の設定を読み込む
    const settings = await getStorage('settings') || {};
    if (sessionDurationInput && settings.sessionDuration) {
      sessionDurationInput.value = (settings.sessionDuration / (60 * 1000)).toString();
    }
    updatePasswordStatus(settings);
  } catch (error) {
    console.error('設定の読み込み中にエラーが発生しました:', error);
  }
}

function updatePasswordStatus(settings: any = {}) {
  if (!changePasswordBtn) return;
  
  if (settings?.passwordEnabled) {
    changePasswordBtn.style.display = 'block';
    if (passwordSettings) {
      passwordSettings.style.display = 'none';
    }
  } else {
    changePasswordBtn.style.display = 'none';
    if (passwordSettings) {
      passwordSettings.style.display = 'none';
    }
  }
}

async function saveSettings() {
  try {
    await chrome.storage.local.set({ reclipSettings: { enableLog, lang: currentLang } });
    await renderTexts();  // 設定保存後にテキストを更新
  } catch (error) {
    console.error('設定の保存中にエラーが発生しました:', error);
  }
}

function setupEvents() {
  const logToggle = document.getElementById('logToggle') as HTMLInputElement | null;
  const langSelect = document.getElementById('langSelect') as HTMLSelectElement | null;

  if (logToggle) {
    logToggle.addEventListener('change', async (e) => {
      enableLog = (e.target as HTMLInputElement).checked;
      await saveSettings();
    });
  }

  if (langSelect) {
    langSelect.addEventListener('change', async (e) => {
      currentLang = (e.target as HTMLSelectElement).value as Lang;
      await saveSettings();
      await renderTexts();  // 言語変更後にテキストを更新
    });
  }
}

function renderTexts() {
  const elements = {
    settingsTitle: document.getElementById('settingsTitle'),
    logLabel: document.getElementById('logLabel'),
    langLabel: document.getElementById('langLabel'),
    passwordLabel: document.getElementById('passwordLabel'),
    newPasswordLabel: document.getElementById('newPasswordLabel'),
    confirmPasswordLabel: document.getElementById('confirmPasswordLabel'),
    sessionDurationLabel: document.getElementById('sessionDurationLabel'),
    savePassword: document.getElementById('savePassword'),
    changePasswordBtn: document.getElementById('changePasswordBtn'),
    termsLink: document.getElementById('termsLink') as HTMLAnchorElement | null,
    privacyLink: document.getElementById('privacyLink') as HTMLAnchorElement | null,
    deleteAll: document.getElementById('deleteAll'),
    openList: document.getElementById('openList')
  };

  // 各要素のテキストを更新
  if (elements.settingsTitle) elements.settingsTitle.textContent = t('settings', currentLang);
  if (elements.logLabel) elements.logLabel.textContent = t('logToggle', currentLang);
  if (elements.langLabel) elements.langLabel.textContent = t('langLabel', currentLang);
  if (elements.passwordLabel) elements.passwordLabel.textContent = t('passwordLabel', currentLang);
  if (elements.newPasswordLabel) elements.newPasswordLabel.textContent = t('newPasswordLabel', currentLang);
  if (elements.confirmPasswordLabel) elements.confirmPasswordLabel.textContent = t('confirmPasswordLabel', currentLang);
  if (elements.sessionDurationLabel) elements.sessionDurationLabel.textContent = t('sessionDurationLabel', currentLang);
  if (elements.savePassword) elements.savePassword.textContent = t('savePassword', currentLang);
  if (elements.changePasswordBtn) elements.changePasswordBtn.textContent = t('changePasswordBtn', currentLang);
  if (elements.deleteAll) elements.deleteAll.textContent = t('deleteAll', currentLang);
  if (elements.openList) elements.openList.textContent = t('openList', currentLang);

  // 利用規約・プライバシーポリシーリンク
  if (elements.termsLink) {
    elements.termsLink.textContent = t('terms', currentLang);
    elements.termsLink.href = `../pages/terms_${currentLang}.html`;
  }
  if (elements.privacyLink) {
    elements.privacyLink.textContent = t('privacy', currentLang);
    elements.privacyLink.href = `../pages/privacy_${currentLang}.html`;
  }
}

// パスワード設定の保存
async function savePasswordSettings() {
  if (!newPasswordInput || !confirmPasswordInput || !sessionDurationInput) {
    console.error('必要なDOM要素が見つかりません');
    return;
  }

  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  const sessionDuration = parseInt(sessionDurationInput.value) * 60 * 1000;

  if (newPassword !== confirmPassword) {
    alert(t('passwordMismatch', currentLang));
    return;
  }

  if (newPassword.length < 4) {
    alert(t('passwordTooShort', currentLang));
    return;
  }

  if (sessionDuration < 60 * 1000 || sessionDuration > 24 * 60 * 60 * 1000) {
    alert(t('invalidSessionDuration', currentLang));
    return;
  }

  const hashedPassword = await hashPassword(newPassword);
  
  const settings = {
    passwordEnabled: isPasswordEnabled,
    passwordHash: hashedPassword,
    sessionDuration: sessionDuration
  };

  await setStorage('settings', settings);
  updatePasswordStatus(settings);

  newPasswordInput.value = '';
  confirmPasswordInput.value = '';
  if (passwordSettings) {
    passwordSettings.style.display = 'none';
  }
  alert(t('passwordSaved', currentLang));
}

// イベントリスナーの設定
function setupEventListeners() {
  const logToggle = document.getElementById('logToggle') as HTMLInputElement | null;
  const langSelect = document.getElementById('langSelect') as HTMLSelectElement | null;
  const deleteAllBtn = document.getElementById('deleteAll') as HTMLButtonElement | null;
  const openListBtn = document.getElementById('openList') as HTMLButtonElement | null;

  if (logToggle) {
    logToggle.addEventListener('change', async (e) => {
      enableLog = (e.target as HTMLInputElement).checked;
      await saveSettings();
    });
  }

  if (langSelect) {
    langSelect.addEventListener('change', async (e) => {
      currentLang = (e.target as HTMLSelectElement).value as Lang;
      await saveSettings();
      await renderTexts();  // 言語変更後にテキストを更新
    });
  }

  // すべて削除ボタン
  if (deleteAllBtn) {
    deleteAllBtn.addEventListener('click', async () => {
      if (confirm(t('confirmDeleteAll', currentLang))) {
        await chrome.storage.local.set({ savedVideos: [] });
        alert(t('allVideosDeleted', currentLang));
      }
    });
  }

  // 一覧ページを開くボタン
  if (openListBtn) {
    openListBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('src/pages/saved.html') });
    });
  }

  // パスワード関連のイベントリスナー
  if (passwordToggle) {
    passwordToggle.addEventListener('change', async (e) => {
      isPasswordEnabled = (e.target as HTMLInputElement).checked;
      if (passwordSettings) {
        passwordSettings.style.display = isPasswordEnabled ? 'block' : 'none';
      }
      
      if (!isPasswordEnabled) {
        const settings = {
          passwordEnabled: false,
          passwordHash: '',
          sessionDuration: sessionDurationInput ? parseInt(sessionDurationInput.value) * 60 * 1000 : 60 * 60 * 1000
        };
        await setStorage('settings', settings);
        updatePasswordStatus(settings);
      }
    });
  }

  if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', () => {
      if (passwordSettings) {
        passwordSettings.style.display = 'block';
      }
      if (newPasswordInput) newPasswordInput.value = '';
      if (confirmPasswordInput) confirmPasswordInput.value = '';
    });
  }

  if (savePasswordButton) {
    savePasswordButton.addEventListener('click', async () => {
      await savePasswordSettings();
      if (passwordSettings) {
        passwordSettings.style.display = 'none';
      }
    });
  }
}

// パスワード設定の初期化
async function initializePasswordSettings() {
  try {
    const settings = await getStorage('settings') || {};
    isPasswordEnabled = settings?.passwordEnabled || false;
    passwordHash = settings?.passwordHash || '';
    
    if (passwordToggle) {
      passwordToggle.checked = isPasswordEnabled;
    }
    if (passwordSettings) {
      passwordSettings.style.display = 'none';
    }
    updatePasswordStatus(settings);
  } catch (error) {
    console.error('パスワード設定の初期化中にエラーが発生しました:', error);
    // エラー時はデフォルト値を使用
    isPasswordEnabled = false;
    passwordHash = '';
    if (passwordToggle) {
      passwordToggle.checked = false;
    }
    if (passwordSettings) {
      passwordSettings.style.display = 'none';
    }
    updatePasswordStatus({});
  }
}

// 初期化処理
async function initialize() {
  try {
    setupEventListeners();
    await loadSettings();
    await initializePasswordSettings();
    await renderTexts();  // 初期化時にテキストを更新
  } catch (error) {
    console.error('初期化中にエラーが発生しました:', error);
  }
}

// メインの初期化処理
initialize();

// DOMContentLoadedイベントリスナー
document.addEventListener('DOMContentLoaded', async () => {
  // 現在の設定を読み込む
  const settings = await getStorage('settings') || {};
  if (sessionDurationInput && settings.sessionDuration) {
    sessionDurationInput.value = (settings.sessionDuration / (60 * 1000)).toString();
  }
}); 
