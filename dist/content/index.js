"use strict";
// コンテンツスクリプトの実装
console.log('ReClip: Content script loaded');
// YouTubeの動画タイトルを取得する関数
function getYouTubeVideoTitle() {
    // 新UI/旧UI両対応
    const el = document.querySelector('h1.title yt-formatted-string') ||
        document.querySelector('h1#title yt-formatted-string') ||
        document.querySelector('h1.title') ||
        document.querySelector('h1#title');
    return el ? el.textContent?.trim() || null : null;
}
// メッセージリスナーを設定
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getVideoInfo') {
        const title = getYouTubeVideoTitle();
        sendResponse({
            title: title || document.title.replace(' - YouTube', ''),
            url: window.location.href,
            domain: window.location.hostname
        });
    }
    return true;
});
