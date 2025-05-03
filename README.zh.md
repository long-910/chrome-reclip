# ReClip

[![Node.js CI](https://github.com/long-910/chrome-reclip/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/long-910/chrome-reclip/actions/workflows/node.js.yml)

[English](README.md) | [日本語 (Japanese)](README.ja.md) | [中文 (Chinese)](README.zh.md)

---

## 概述

**ReClip** 是一个Chrome扩展程序，只需右键点击YouTube视频链接并选择"保存到ReClip"，即可稍后在弹窗中查看保存的视频列表。
还可以在弹窗设置中切换控制台日志输出。

### 主要功能

- 保存YouTube视频链接
- 弹窗中显示已保存视频
- 支持单个或全部删除
- 日志输出开关（设置中切换）
- 多语言支持（英语、日语、中文）

### 使用方法

1. 在Chrome扩展管理页面加载`build`目录
2. 右键点击YouTube视频链接 → "保存到ReClip"
3. 点击扩展图标弹出窗口查看已保存视频
4. 右上角设置中切换语言和日志输出

---

## 开发与构建

```sh
npm install
npm run build
```

---

## 许可证

MIT
