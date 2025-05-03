export const LANGS = ['ja', 'en', 'zh'];
export const I18N = {
    ja: {
        savedVideos: '保存した動画',
        deleteAll: 'すべて削除',
        noVideos: '保存した動画はありません',
        delete: '削除',
        confirmDelete: 'この動画を削除しますか？',
        confirmDeleteAll: 'すべての動画を削除しますか？',
        langLabel: '言語',
        settings: '設定',
        logToggle: 'ログ出力ON/OFF',
        terms: '利用規約',
        privacy: 'プライバシーポリシー',
    },
    en: {
        savedVideos: 'Saved Videos',
        deleteAll: 'Delete All',
        noVideos: 'No saved videos',
        delete: 'Delete',
        confirmDelete: 'Delete this video?',
        confirmDeleteAll: 'Delete all videos?',
        langLabel: 'Language',
        settings: 'Settings',
        logToggle: 'Enable Log Output',
        terms: 'Terms of Use',
        privacy: 'Privacy Policy',
    },
    zh: {
        savedVideos: '已保存的视频',
        deleteAll: '全部删除',
        noVideos: '没有已保存的视频',
        delete: '删除',
        confirmDelete: '要删除此视频吗？',
        confirmDeleteAll: '要删除所有视频吗？',
        langLabel: '语言',
        settings: '设置',
        logToggle: '启用日志输出',
        terms: '使用条款',
        privacy: '隐私政策',
    },
};
export function getDefaultLang() {
    const navLang = navigator.language.slice(0, 2);
    return LANGS.includes(navLang) ? navLang : 'ja';
}
export function t(key, lang, fallback = '') {
    return I18N[lang][key] || fallback || key;
}
