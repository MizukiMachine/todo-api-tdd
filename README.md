# TypeScript TDD Todo API
このリポジトリは、TypeScriptとExpress.jsを使用したTodo APIの開発を通じて、  
テスト駆動開発（TDD）とレイヤードアーキテクチャの実践方法を学ぶためのサンプルコードです。  

Zenn Book記事「[TypeScriptで始めるTDDハンズオン」のサンプルコードです。


## 関連ページ
- [TypeScriptで始めるTDDハンズオン：レイヤードアーキテクチャでのAPI開発](https://zenn.dev/nezumizuki/books/3a7f70aab092f1)

## 概要
Todo APIを例に、以下の内容を整理しました
- テスト駆動開発（TDD）の基本的な進め方
- レイヤードアーキテクチャの実装方法
- Jestを使用したテスト駆動開発(TDD)の手法
- Express.jsでのRESTful API実装
- セキュリティを考慮した実装（XSS対策など）
- 実務的なエラーハンドリング

## 必要要件
- Node.js (v16以上)
- npm (v8以上)

## セットアップ
```bash
# リポジトリのクローン
git clone https://github.com/MizukiMachine/todo-api-tdd.git
cd todo-api-tdd

# 依存パッケージのインストール
npm install
```

## 使い方
```bash
# 開発サーバーの起動
npm run dev

# 全てのテストを1回実行
npm test

# テストを監視モードで実行（ファイル変更を検知して自動実行）
npm run test:watch

# テストカバレッジの確認
npm test -- --coverage

# 特定のディレクトリのみテスト実行
npm test -- src/repositories
npm test -- src/services
npm test -- src/controllers
```

## プロジェクト構造
```
src/
├── controllers/             # HTTPリクエスト/レスポンスの制御
│   ├── todo.controller.ts
│   └── todo.controller.test.ts
├── services/                # ビジネスロジックの実装
│   ├── todo.service.ts
│   └── todo.service.test.ts
├── repositories/            # データアクセス層
│   ├── todo.repository.ts
│   └── todo.repository.test.ts
├── middleware/              # 共通処理
│   └── validation.ts
├── errors/                  # カスタムエラー
│   └── todo.errors.ts
├── test-utils/              # テストユーティリティ
│   └── helpers.ts
└── types.ts                 # 共通の型定義
```

## 学習ステップ
1. リポジトリレイヤーの実装
   - 基本的なCRUD操作
   - インメモリデータストアの実装
   - 基本的なバリデーション

2. サービスレイヤーの実装
   - ビジネスロジックの実装
   - セキュリティ対策（XSS対策）
   - 高度なバリデーション

3. コントローラーレイヤーの実装
   - RESTful APIエンドポイント
   - リクエスト/レスポンスの処理
   - エラーハンドリング

## APIエンドポイント
| エンドポイント | メソッド | 説明 |
|--------------|---------|------|
| /todos | POST | 新規Todoの作成 |
| /todos | GET | Todo一覧の取得・検索 |
| /todos/:id | PATCH | Todoの更新 |

## デバッグ方法
1. 開発サーバーでのデバッグ
```bash
npm run dev
```

2. テスト実行時の詳細出力
```bash
npm test -- --verbose
```

