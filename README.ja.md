# ReClip

[English](README.md) | [日本語 (Japanese)](README.ja.md) | [中文 (Chinese)](README.zh.md)

---

## 概要

**ReClip**は、YouTube動画のリンクを右クリックして「ReClipに保存」するだけで、後から簡単に動画リストを確認できるChrome拡張機能です。
さらに、ポップアップ内の設定で「コンソールログ出力」をON/OFFできます。

### 主な機能

- YouTube動画リンクの保存
- 保存した動画の一覧表示
- 動画の削除・一括削除
- ログ出力ON/OFF（設定で切り替え）
- 多言語対応（英語・日本語・中国語）

### 使い方

1. Chrome拡張機能管理画面で`build`ディレクトリを読み込む
2. YouTube動画リンクを右クリック→「ReClipに保存」
3. ポップアップで保存済み動画を確認
4. 言語・ログ出力は右上の設定で切り替え

---

## 開発・ビルド

```sh
npm install
npm run build
```

---

## ライセンス

MIT
