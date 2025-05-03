import { LANGS, Lang, I18N, getDefaultLang, t } from '../i18n';

let currentLang: Lang = 'ja';
let enableLog = false;

async function loadSettings() {
  const result = await chrome.storage.local.get('reclipSettings');
  enableLog = !!(result.reclipSettings?.enableLog);
  currentLang = (result.reclipSettings?.lang as Lang) || getDefaultLang();
  (document.getElementById('logToggle') as HTMLInputElement).checked = enableLog;
  (document.getElementById('langSelect') as HTMLSelectElement).value = currentLang;
  renderTexts();
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
}

setupEvents();
loadSettings(); 
