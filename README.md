# START RIGHT Careers LP

配送パートナー採用のための静的ランディングページです。

## 目的

- START RIGHTの事業思想と北海道での配送ネットワークを視覚的に伝える
- 未経験者の応募不安を減らす
- LINE説明会への到達率を高める
- スマートフォンでの閲覧・応募を最優先する

## 構成

- `index.html` ページ本文・構造
- `styles.css` レスポンシブデザイン・アニメーション
- `script.js` FAQ、スクロール表示、CTA計測イベント
- `vercel.json` 静的配信設定とセキュリティヘッダー

## CTA

公式LINE: https://lin.ee/wiORr8sf

## 計測

LINEボタンのクリック時に `dataLayer` へ `line_cta_click` イベントを送ります。Google Tag Managerを追加した場合、そのままクリック位置別に計測できます。
