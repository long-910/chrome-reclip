import { LANGS, Lang, I18N, getDefaultLang, t } from '../i18n';

let currentLang: Lang = 'ja';

async function loadSettings() {
  const result = await chrome.storage.local.get('reclipSettings');
  currentLang = (result.reclipSettings?.lang as Lang) || getDefaultLang();
  renderTexts();
}

function renderTexts() {
  (document.getElementById('titleLabel') as HTMLElement).textContent = t('savedVideos', currentLang);
  (document.getElementById('deleteAll') as HTMLButtonElement).textContent = t('deleteAll', currentLang);
  (document.getElementById('settingsText') as HTMLElement).textContent = t('settings', currentLang);
}

async function displayVideos() {
  const result = await chrome.storage.local.get('savedVideos');
  const savedVideos = (result.savedVideos || []) as any[];
  const videoList = document.getElementById('videoList')!;
  videoList.innerHTML = '';
  if (savedVideos.length === 0) {
    videoList.innerHTML = `<div style="grid-column: 1/-1; text-align:center; color:#888; font-size:1.1em;">${t('noVideos', currentLang)}</div>`;
    return;
  }
  savedVideos.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  savedVideos.forEach((video) => {
    const videoElement = document.createElement('div');
    videoElement.className = 'video-item';
    const thumbnailUrl = video.thumbnailInfo?.url || '';
    const title = video.title || t('noVideos', currentLang);
    const displayTitle = title.length > 50 ? title.substring(0, 47) + '...' : title;
    videoElement.innerHTML = `
      <img src="${thumbnailUrl}" alt="${displayTitle}" class="video-thumbnail" onerror="this.src='${chrome.runtime.getURL('img/logo-48.png')}'">
      <div class="video-info">
        <div class="video-title" title="${title}">${displayTitle}</div>
        <div class="video-domain">${video.domain}</div>
        <button class="delete-btn">${t('delete', currentLang)}</button>
      </div>
    `;
    videoElement.addEventListener('click', (e) => {
      if (!(e.target as HTMLElement).classList.contains('delete-btn')) {
        chrome.tabs.create({ url: video.url });
      }
    });
    videoElement.querySelector('.delete-btn')!.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm(t('confirmDelete', currentLang))) {
        const updatedVideos = savedVideos.filter((v) => v.id !== video.id);
        await chrome.storage.local.set({ savedVideos: updatedVideos });
        displayVideos();
      }
    });
    videoList.appendChild(videoElement);
  });
}

document.getElementById('deleteAll')!.addEventListener('click', async () => {
  if (confirm(t('confirmDeleteAll', currentLang))) {
    await chrome.storage.local.set({ savedVideos: [] });
    displayVideos();
  }
});

document.getElementById('settingsLink')!.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: chrome.runtime.getURL('src/popup/settings.html') });
});

loadSettings();
displayVideos();
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.savedVideos) displayVideos();
  if (namespace === 'local' && changes.reclipSettings) loadSettings();
}); 
