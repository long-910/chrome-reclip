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
}
setupEvents();
loadSettings();
