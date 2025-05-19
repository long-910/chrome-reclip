import { LANGS, Lang, I18N, getDefaultLang, t } from '../i18n';
import { getStorage, setStorage } from '../utils/storage';
import { hashPassword } from '../utils/password';

let currentLang: Lang = 'ja';
let enableLog = false;

// パスワード設定の状態管理
let isPasswordEnabled = false;
let passwordHash = '';

// DOM要素の取得
const passwordToggle = document.getElementById('passwordToggle') as HTMLInputElement;
const passwordSettings = document.getElementById('passwordSettings') as HTMLDivElement;
const newPasswordInput = document.getElementById('newPassword') as HTMLInputElement;
const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement;
const savePasswordButton = document.getElementById('savePassword') as HTMLButtonElement;
const sessionDurationInput = document.getElementById('sessionDuration') as HTMLInputElement;
const passwordStatus = document.getElementById('passwordStatus') as HTMLDivElement;
const changePasswordBtn = document.getElementById('changePasswordBtn') as HTMLButtonElement;

async function loadSettings() {
  const result = await chrome.storage.local.get('reclipSettings');
  enableLog = !!(result.reclipSettings?.enableLog);
  currentLang = (result.reclipSettings?.lang as Lang) || getDefaultLang();
  (document.getElementById('logToggle') as HTMLInputElement).checked = enableLog;
  (document.getElementById('langSelect') as HTMLSelectElement).value = currentLang;
  renderTexts();

  // 現在の設定を読み込む
  const settings = await getStorage('settings') || {};
  if (settings.sessionDuration) {
    sessionDurationInput.value = (settings.sessionDuration / (60 * 1000)).toString();
  }
  updatePasswordStatus(settings);
}

function updatePasswordStatus(settings: any) {
  if (settings.passwordEnabled) {
    changePasswordBtn.style.display = 'block';
  } else {
    changePasswordBtn.style.display = 'none';
  }
}

async function saveSettings() {
  await chrome.storage.local.set({ reclipSettings: { enableLog, lang: currentLang } });
}

function setupEvents() {
  (document.getElementById('logToggle') as HTMLInputElement).addEventListener('change', async (e) => {
    enableLog = (e.target as HTMLInputElement).checked;
    await saveSettings();
  });
  (document.getElementById('langSelect') as HTMLSelectElement).addEventListener('change', async (e) => {
    currentLang = (e.target as HTMLSelectElement).value as Lang;
    await saveSettings();
    renderTexts();
  });
}

function renderTexts() {
  (document.getElementById('settingsTitle') as HTMLElement).textContent = t('settings', currentLang);
  (document.getElementById('logLabel') as HTMLElement).textContent = t('logToggle', currentLang);
  (document.getElementById('langLabel') as HTMLElement).textContent = t('langLabel', currentLang);
  (document.getElementById('passwordLabel') as HTMLElement).textContent = t('passwordLabel', currentLang);
  (document.getElementById('newPasswordLabel') as HTMLElement).textContent = t('newPasswordLabel', currentLang);
  (document.getElementById('confirmPasswordLabel') as HTMLElement).textContent = t('confirmPasswordLabel', currentLang);
  (document.getElementById('sessionDurationLabel') as HTMLElement).textContent = t('sessionDurationLabel', currentLang);
  (document.getElementById('savePassword') as HTMLElement).textContent = t('savePassword', currentLang);
  (document.getElementById('changePasswordBtn') as HTMLElement).textContent = t('changePasswordBtn', currentLang);
  
  // 利用規約・プライバシーポリシーリンク
  const termsLink = document.getElementById('termsLink') as HTMLAnchorElement;
  const privacyLink = document.getElementById('privacyLink') as HTMLAnchorElement;
  termsLink.textContent = t('terms', currentLang);
  privacyLink.textContent = t('privacy', currentLang);
  if (currentLang === 'ja') {
    termsLink.href = '../pages/terms_ja.html';
    privacyLink.href = '../pages/privacy_ja.html';
  } else if (currentLang === 'en') {
    termsLink.href = '../pages/terms_en.html';
    privacyLink.href = '../pages/privacy_en.html';
  } else {
    termsLink.href = '../pages/terms_zh.html';
    privacyLink.href = '../pages/privacy_zh.html';
  }
}

// パスワード設定の初期化
async function initializePasswordSettings() {
  const settings = await getStorage('settings');
  isPasswordEnabled = settings?.passwordEnabled || false;
  passwordHash = settings?.passwordHash || '';
  
  passwordToggle.checked = isPasswordEnabled;
  passwordSettings.style.display = 'none';
  updatePasswordStatus(settings);
}

// パスワード設定の保存
async function savePasswordSettings() {
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
  passwordSettings.style.display = 'none';
  alert(t('passwordSaved', currentLang));
}

// イベントリスナーの設定
passwordToggle.addEventListener('change', async (e) => {
  isPasswordEnabled = (e.target as HTMLInputElement).checked;
  passwordSettings.style.display = isPasswordEnabled ? 'block' : 'none';
  
  if (!isPasswordEnabled) {
    const settings = {
      passwordEnabled: false,
      passwordHash: '',
      sessionDuration: parseInt(sessionDurationInput.value) * 60 * 1000
    };
    await setStorage('settings', settings);
    updatePasswordStatus(settings);
  }
});

changePasswordBtn.addEventListener('click', () => {
  passwordSettings.style.display = 'block';
  newPasswordInput.value = '';
  confirmPasswordInput.value = '';
});

savePasswordButton.addEventListener('click', savePasswordSettings);

setupEvents();
loadSettings();
initializePasswordSettings();

document.addEventListener('DOMContentLoaded', async () => {
  const passwordInput = document.getElementById('password') as HTMLInputElement;
  const confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement;
  const sessionDurationInput = document.getElementById('sessionDuration') as HTMLInputElement;
  const saveButton = document.getElementById('saveSettings') as HTMLButtonElement;

  // 現在の設定を読み込む
  const settings = await getStorage('settings') || {};
  if (settings.sessionDuration) {
    sessionDurationInput.value = (settings.sessionDuration / (60 * 1000)).toString();
  }

  saveButton.addEventListener('click', async () => {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const sessionDuration = parseInt(sessionDurationInput.value) * 60 * 1000; // 分をミリ秒に変換

    if (password && password !== confirmPassword) {
      alert(t('passwordMismatch', currentLang));
      return;
    }

    if (sessionDuration < 60 * 1000 || sessionDuration > 24 * 60 * 60 * 1000) {
      alert(t('invalidSessionDuration', currentLang));
      return;
    }

    const settings = {
      passwordEnabled: !!password,
      passwordHash: password ? await hashPassword(password) : '',
      sessionDuration: sessionDuration
    };

    await setStorage('settings', settings);
    alert(t('settingsSaved', currentLang));
    window.close();
  });
}); 
