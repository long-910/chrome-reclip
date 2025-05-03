console.log('background is running');
chrome.runtime.onMessage.addListener((request) => {
    if (request.type === 'COUNT') {
        console.log('background has received a message from popup, and count is ', request?.count);
    }
});
// コンテキストメニューの作成
chrome.runtime.onInstalled.addListener(() => {
    // 既存のメニューを削除
    chrome.contextMenus.removeAll(() => {
        // 新しいメニューを作成
        chrome.contextMenus.create({
            id: 'saveVideo',
            title: 'ReClipに保存',
            contexts: ['link'],
            targetUrlPatterns: ['*://*.youtube.com/watch?v=*']
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('コンテキストメニューの作成に失敗:', chrome.runtime.lastError);
            }
            else {
                console.log('コンテキストメニューを作成しました');
            }
        });
    });
});
// YouTube動画URLからタイトルを取得
async function fetchYouTubeTitle(url) {
    try {
        const res = await fetch(url);
        const text = await res.text();
        // <meta property="og:title" content="動画タイトル">
        const ogTitleMatch = text.match(/<meta property="og:title" content="([^"]+)"/);
        if (ogTitleMatch)
            return ogTitleMatch[1];
        // <title>動画タイトル - YouTube</title>
        const titleMatch = text.match(/<title>(.*?) - YouTube<\/title>/);
        if (titleMatch)
            return titleMatch[1];
        return '無題';
    }
    catch {
        return '無題';
    }
}
// YouTubeのビデオIDを取得する関数
function getYouTubeVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : undefined;
}
// ドメインを取得する関数
function getDomain(url) {
    try {
        return new URL(url).hostname.replace('www.', '');
    }
    catch {
        return 'unknown';
    }
}
// サムネイル情報を取得する関数
function getThumbnailUrl(url, domain) {
    if (domain.includes('youtube.com')) {
        const videoId = getYouTubeVideoId(url);
        if (videoId) {
            return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        }
    }
    return chrome.runtime.getURL('img/logo-48.png');
}
// コンテキストメニューがクリックされたときの処理
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'saveVideo' && info.linkUrl) {
        const url = info.linkUrl;
        const domain = 'youtube.com';
        const title = await fetchYouTubeTitle(url);
        const videoInfo = {
            id: Date.now().toString(),
            title,
            url,
            domain,
            savedAt: new Date().toISOString(),
            thumbnailInfo: {
                url: `https://img.youtube.com/vi/${getYouTubeVideoId(url)}/mqdefault.jpg`
            }
        };
        const result = await chrome.storage.local.get('savedVideos');
        const savedVideos = result.savedVideos || [];
        savedVideos.push(videoInfo);
        await chrome.storage.local.set({ savedVideos });
        chrome.notifications.create({
            type: 'basic',
            iconUrl: chrome.runtime.getURL('img/logo-48.png'),
            title: 'ReClip',
            message: '動画を保存しました'
        });
    }
});
export {};
