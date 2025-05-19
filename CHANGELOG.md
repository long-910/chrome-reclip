# CHANGELOG

```txt
Summary
  1. document grouping follow 'SemVer2.0' protocol
  2. use 'PATCH' as a minimum granularity
  3. use concise descriptions
  4. type: feat \ fix \ update \ perf \ remove \ docs \ chore
  5. version timestamp follow the yyyy.MM.dd format
```

## 1.0.1 [2025.05.19]

### Added

- Password protection feature
  - Secure access to saved videos with password
  - Session management for enhanced convenience
  - Password change functionality
  - Configurable session duration (1 minute to 24 hours)
- Enhanced multilingual support
  - Added password-related strings in 3 languages (Japanese, English, Chinese)

### Improved

- Improved password setting UI
  - More intuitive operation
  - Simplified design
- Enhanced security
  - Password hashing implementation
  - Session management implementation

## 1.0.0 [2025.05.04]

- Initial multilingual release (English, Japanese, Chinese)
- Save YouTube video links via right-click context menu
- View, delete, and bulk delete saved videos in popup and list page
- Popup and list page support language switching and persistent language setting
- Console log output can be toggled in a dedicated settings page
- Settings page accessible from both popup and list page
- Improved UI/UX for desktop and popup

## 0.0.0 [2025.05.03]

- feat: initial
- feat: generator by ![create-chrome-ext](https://github.com/guocaoyi/create-chrome-ext)
