import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest(async (env) => ({
  manifest_version: 3,
  name: 'ReClip',
  version: '1.0.1',
  version_name: '1.0.1',
  description: '動画を保存して後で見るためのChrome拡張機能',
  icons: {
    '16': 'img/logo-16.png',
    '32': 'img/logo-32.png',
    '48': 'img/logo-48.png',
    '128': 'img/logo-128.png',
  },
  action: {
    default_popup: 'src/popup/index.html',
    default_icon: {
      '16': 'img/logo-16.png',
      '32': 'img/logo-32.png',
      '48': 'img/logo-48.png',
      '128': 'img/logo-128.png',
    },
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['https://www.youtube.com/*'],
      js: ['src/content/index.ts'],
    },
  ],
  permissions: [
    'storage',
    'contextMenus',
    'notifications',
  ],
  host_permissions: [
    'https://www.youtube.com/*'
  ],
  web_accessible_resources: [
    {
      resources: ['img/*', 'pages/*'],
      matches: ['https://www.youtube.com/*'],
    },
  ],
}))
