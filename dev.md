# Same Tab Window 開発者向けドキュメント

## プロジェクト構造

```
same-tab-window/
├── manifest.json          # 拡張機能の設定ファイル
├── src/
│   ├── background/        # バックグラウンドスクリプト
│   │   └── background.js  # タブ管理のメインロジック
│   ├── popup/            # ポップアップUI
│   │   ├── popup.html    # ポップアップのHTML
│   │   ├── popup.css     # ポップアップのスタイル
│   │   └── popup.js      # ポップアップのロジック
│   └── utils/            # ユーティリティ関数
│       └── tabUtils.js   # タブ操作のユーティリティ
├── tests/                # テストファイル
│   ├── unit/            # ユニットテスト
│   └── integration/     # 結合テスト
└── assets/              # アイコンなどの静的ファイル
    └── icons/          # 拡張機能のアイコン
```

## 技術スタック

- Chrome Extensions API
- JavaScript (ES6+)
- Jest (テストフレームワーク)

## 主要コンポーネント

### 1. バックグラウンドスクリプト (background.js)
- タブの状態管理
- 重複タブの検出ロジック
- タブ削除の実行

### 2. ポップアップUI (popup.html, popup.js)
- 重複タブの一覧表示
- ユーザーインタラクションの処理
- タブ削除の確認ダイアログ

### 3. ユーティリティ関数 (tabUtils.js)
- タブ情報の取得
- 重複チェックロジック
- タブ操作のヘルパー関数

## 実装の詳細

### タブ情報の取得
```javascript
// すべてのウィンドウとタブを取得
chrome.windows.getAll({populate: true}, (windows) => {
  // タブ情報の処理
});
```

### 重複タブの検出
1. URLをキーとしてタブをグループ化
2. 各グループから重複を判定
3. アクティブタブとピン留めタブを除外

### タブ削除の処理
1. 削除対象のタブIDを取得
2. 確認ダイアログを表示
3. ユーザーの確認後、タブを削除

## テスト戦略

### ユニットテスト
- tabUtils.jsの各関数
- 重複検出ロジック
- タブ操作のヘルパー関数

### 結合テスト
- バックグラウンドスクリプトとポップアップの連携
- タブ情報の取得から削除までの一連の流れ

## セキュリティ考慮事項

- タブのURL情報のみを取得
- データの外部送信を禁止
- ユーザーの確認なしでのタブ削除を防止

## パフォーマンス最適化

- 大量のタブ処理時のメモリ使用量の最適化
- 非同期処理の適切な使用
- キャッシュの活用

## 今後の拡張性

- 設定のカスタマイズ機能
- タブグループのサポート
- 履歴機能の追加

## 開発環境の設定

### 開発ツール
- TypeScript (型推論と型安全性の確保)
- ESLint (コード品質の維持)
- Prettier (コードフォーマットの統一)
- Husky (Git hooksによる自動チェック)
- lint-staged (ステージングされたファイルのみのチェック)

### 開発サイクル

#### 1. コード品質の自動チェック
```json
// package.json
{
  "scripts": {
    "lint": "eslint . --ext .js,.ts",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "precommit": "lint-staged"
  },
  "lint-staged": {
    "*.{js,ts}": [
      "eslint --fix",
      "prettier --write",
      "jest --bail --findRelatedTests"
    ]
  }
}
```

#### 2. Git hooksの設定
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test"
    }
  }
}
```

#### 3. 開発ワークフロー
1. コードの変更
2. 自動フォーマット (Prettier)
3. リンターによるチェック (ESLint)
4. 型チェック (TypeScript)
5. ユニットテストの実行 (Jest)
6. コミット前の自動チェック (Husky)
7. プッシュ前のテスト実行

### 開発環境のセットアップ

1. 依存関係のインストール
```bash
npm install --save-dev typescript @types/chrome eslint prettier husky lint-staged jest @types/jest
```

2. TypeScript設定
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "ESNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

3. ESLint設定
```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/explicit-function-return-type": "error"
  }
}
```

4. Prettier設定
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### CI/CDパイプライン

GitHub Actionsを使用した自動テストとデプロイ：

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test
``` 