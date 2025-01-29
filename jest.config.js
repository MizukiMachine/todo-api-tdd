/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',          // TypeScriptサポートを有効
  testEnvironment: 'node',    // Node.js環境でテストを実行
  roots: ['<rootDir>/src'],   // テストファイルの検索場所
  testMatch: ['**/*.test.ts'], // テストファイルのパターン
  verbose: true,              // 詳細なテスト結果を表示
  transform: {
    '^.+\\.tsx?$': 'ts-jest', // TypeScriptファイルの変換設定
  },
};
