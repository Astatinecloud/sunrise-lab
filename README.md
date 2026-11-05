# SUNRISE LAB

日本語・高校生向けの教育用ブラウザーゲーム。CPIによる送達とTPDによる耐性タンパク質分解を学びます。

公開URL： https://astatinecloud.github.io/sunrise-lab/

## ローカル実行

Node.js 22.18以降を使用します（Windows PowerShellではnpm.cmdも使用できます）。

```sh
npm ci
npm run dev
npm test
npm run validate
npm run build
```

ビルド成果物はdist/です。mainへのpushで`.github/workflows/pages.yml`がGitHub Pagesへ自動デプロイします。

直接融合した分解タグによる耐性低下と発現量・耐性の非比例性は実験で確認されています。設計KanRアダプターによる耐性低下は未確認で、統合SUNRISEの成功例は数理モデルの予測です。モデルは高発現域のプラトーを再現しません。

- [モデルと出典](docs/MODEL.md)
- [数値検証と既知の不一致](docs/VALIDATION.md)
- [操作ガイド](docs/PLAYGUIDE.md)
