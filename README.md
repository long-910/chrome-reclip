# ReClip

[English](README.md) | [日本語 (Japanese)](README.ja.md) | [中文 (Chinese)](README.zh.md)

---

## Overview

**ReClip** is a Chrome extension that lets you save YouTube video links with a right-click ("Save to ReClip") and view them later in a popup list.  
You can also toggle console log output in the popup settings.

### Features

- Save YouTube video links
- View saved videos in a popup
- Delete videos individually or all at once
- Toggle log output (in settings)
- Multilingual support (English, Japanese, Chinese)
- Password protection
  - Secure access to saved videos with password
  - Enhanced convenience with session management
  - Password change functionality
  - Configurable session duration (1 minute to 24 hours)

### Usage

1. Load the `build` directory in Chrome's extension management page
2. Right-click a YouTube video link → "Save to ReClip"
3. Open the popup to view saved videos
4. Change language/log output in the top-right settings
5. When password protection is enabled:
   - Set password on first access
   - Password authentication required for subsequent access
   - No re-authentication needed during session

---

## Development & Build

```sh
npm install
npm run build
```

---

## License

MIT
