import { getDefaultLang, t } from '../i18n';
let currentLang = 'ja';
let enableLog = false;
async function loadSettings() {
    const result = await chrome.storage.local.get('reclipSettings');
    enableLog = !!(result.reclipSettings?.enableLog);
    currentLang = result.reclipSettings?.lang || getDefaultLang();
    document.getElementById('logToggle').checked = enableLog;
    document.getElementById('langSelect').value = currentLang;
    renderTexts();
}
async function saveSettings() {
    await chrome.storage.local.set({ reclipSettings: { enableLog, lang: currentLang } });
}
function setupEvents() {
    document.getElementById('logToggle').addEventListener('change', async (e) => {
        enableLog = e.target.checked;
        await saveSettings();
    });
    document.getElementById('langSelect').addEventListener('change', async (e) => {
        currentLang = e.target.value;
        await saveSettings();
        renderTexts();
    });
}
function renderTexts() {
    document.getElementById('settingsTitle').textContent = t('settings', currentLang);
    document.getElementById('logLabel').textContent = t('logToggle', currentLang);
    document.getElementById('langLabel').textContent = t('langLabel', currentLang);
    // 利用規約・プライバシーポリシーリンク
    const termsLink = document.getElementById('termsLink');
    const privacyLink = document.getElementById('privacyLink');
    termsLink.textContent = t('terms', currentLang);
    privacyLink.textContent = t('privacy', currentLang);
    if (currentLang === 'ja') {
        termsLink.href = '../pages/terms_ja.html';
        privacyLink.href = '../pages/privacy_ja.html';
    }
    else if (currentLang === 'en') {
        termsLink.href = '../pages/terms_en.html';
        privacyLink.href = '../pages/privacy_en.html';
    }
    else {
        termsLink.href = '../pages/terms_zh.html';
        privacyLink.href = '../pages/privacy_zh.html';
    }
}
setupEvents();
loadSettings();
