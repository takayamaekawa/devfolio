# Hexo-Qiita 同期システム セットアップガイド

## 概要

このシステムはHexo静的サイトジェネレーターとQiitaプラットフォーム間での記事同期を自動化します。Hexoを単一の真実の情報源として使用し、Qiitaへの変更を自動的に反映します。

## 必要な前提条件

1. **Node.js環境** - Node.js 18以上
2. **Qiita CLI** - `npm install -g qiita-cli`
3. **Qiitaアカウント** - APIアクセス設定済み
4. **qiita-cli初期化** - プロジェクトディレクトリで`qiita init`実行済み

## システムアーキテクチャ

```
Hexo記事 (source/_posts/) 
    ↓
統合ヘッダー (Hexo + Qiita メタデータ)
    ↓
articles/ディレクトリ (qiita-cli管理)
    ↓
Qiitaプラットフォーム
```

## 初回セットアップ手順

### Step 1: articles ディレクトリのクリーンアップ

```bash
# 既存のarticlesディレクトリを削除（クリーンな状態から開始）
rm -rf articles
```

### Step 2: 初回同期実行

```bash
# Qiitaから既存記事を取得し、Hexo記事と統合
npm run qiita:sync-new
```

この処理で以下が実行されます：
1. **Qiita記事取得**: `qiita pull:article`でリモート記事をダウンロード
2. **統合ヘッダー同期**: Hexo記事にQiitaメタデータを追加
3. **変更検出**: コンテンツハッシュによる差分確認
4. **will_be_patched.md生成**: 変更のある記事のパッチファイル作成

### Step 3: 動作確認

同期後、以下を確認してください：

1. **Hexo記事のヘッダー統合**
   ```yaml
   ---
   title: 記事タイトル
   date: '2025-08-09 07:56:59'
   tags:
     - エンジニア  # QiitaのtagsがHexo形式で同期される
   qiita:
     id: 2b40040c087fe6bfc350
     status: published
     url: 'https://qiita.com/username/items/2b40040c087fe6bfc350'
     # その他のQiitaメタデータ
   ---
   ```

2. **articlesディレクトリ構造**
   ```
   articles/
   └── 記事タイトル/
       ├── 2b40040c087fe6bfc350.md  # Qiita管理ファイル
       └── will_be_patched.md      # 変更パッチファイル
   ```

3. **will_be_patched.md形式**
   ```yaml
   ---
   title: 記事タイトル
   tags: [{"name":"エンジニア","versions":[]}]  # Qiita形式
   private: false
   id: 2b40040c087fe6bfc350
   created_at: '2025-08-06T19:53:25+09:00'
   url: 'https://qiita.com/username/items/2b40040c087fe6bfc350'
   likes_count: 0
   # その他必須フィールド
   ---
   ```

## 日常的な使用方法

### 記事更新ワークフロー

1. **Hexo記事を編集** - `source/_posts/` 内のマークダウンファイルを編集

2. **変更同期** 
   ```bash
   npm run qiita:sync-new
   ```

3. **Qiitaへ公開**
   ```bash
   npx qiita patch:article
   ```
   
   対話式メニューから更新したい記事を選択

### 新規記事作成

1. **Hexo記事作成** - `source/_posts/` に新しいマークダウンファイルを作成

2. **初回同期で統合ヘッダー追加**
   ```bash
   npm run qiita:sync-new
   ```

3. **Qiitaへ新規投稿**
   ```bash
   npx qiita post:article  # 新規記事の場合
   ```

## 利用可能なコマンド

| コマンド | 説明 |
|---------|------|
| `npm run qiita:sync-new` | 完全同期（Qiita取得 → Hexo統合 → パッチ生成） |
| `npm run qiita:publish` | 自動一括公開（未実装） |
| `npx qiita pull:article` | Qiitaから記事取得のみ |
| `npx qiita patch:article` | 変更記事をQiitaに反映 |
| `npx qiita post:article` | 新規記事をQiitaに投稿 |

## システムの特徴

### 1. 統合ヘッダーシステム
- HexoとQiitaのメタデータを一つのヘッダーで管理
- `qiita:` セクションでQiita固有の情報を格納
- タグの双方向同期（Hexo形式 ⇔ Qiita形式）

### 2. 変更検出システム
- MD5ハッシュによるコンテンツ変更の自動検出
- 未変更記事のスキップによる効率的な同期
- `last_sync_hash` フィールドで変更追跡

### 3. 安全なディレクトリ管理
- 既存Qiitaディレクトリの再利用
- 重複ディレクトリ生成の防止
- UUIDベースのディレクトリ構造対応

### 4. エラー処理
- qiita-cliコマンドの非ゼロ終了コード対応
- 出力メッセージベースの成功判定
- マッピング適用エラーの警告表示

## トラブルシューティング

### よくある問題

1. **tagsが同期されない**
   - Hexo記事の`tags:`フィールドが正しい配列形式になっているか確認
   - YAML構文エラーがないかチェック

2. **will_be_patched.mdにtagsが反映されない**
   - `convertTagsToQiitaFormat`関数のデバッグ出力を確認
   - Hexoのtagsパーシング結果を検証

3. **qiita patch:articleが失敗する**
   - 必須フィールド（created_at, url, likes_count等）が含まれているか確認
   - Qiita APIの認証状態を確認

### デバッグ方法

1. **同期プロセスの詳細確認**
   ```bash
   npm run qiita:sync-new 2>&1 | tee sync-log.txt
   ```

2. **ファイル構造確認**
   ```bash
   find articles/ -name "*.md" -exec head -20 {} \; -print
   ```

3. **ハッシュ値確認**
   ```bash
   grep -r "last_sync_hash" source/_posts/
   ```

## 設定ファイル

### package.jsonスクリプト
```json
{
  "scripts": {
    "qiita:sync-new": "node scripts/qiita-sync.js sync",
    "qiita:publish": "node scripts/auto-sync.js"
  }
}
```

### mapping.js（URL置換設定）
```javascript
module.exports = [
  {
    "name": "記事名",
    "pairs": [
      ["置換前URL", "置換後URL"]
    ]
  }
];
```

## ファイル構造

```
packages/blog/
├── source/_posts/           # Hexo記事ファイル
├── articles/               # qiita-cli管理ディレクトリ
├── scripts/
│   ├── qiita-sync.js      # メイン同期スクリプト
│   ├── auto-sync.js       # 自動公開スクリプト
│   └── utils/
│       ├── header-converter.js  # ヘッダー変換ユーティリティ
│       └── file-manager.js      # ファイル管理ユーティリティ
├── mapping.js             # URL置換設定
└── package.json
```

## 開発者向け情報

### 重要な関数

- `syncQiitaToIntegratedHeader()`: QiitaメタデータをHexoに統合
- `convertToQiitaHeader()`: HexoヘッダーをQiita形式に変換
- `convertTagsToQiitaFormat()`: タグ形式の相互変換
- `createWillBePatchedFile()`: パッチファイル生成

### 拡張可能性

- Zenn連携の実装
- 自動化レベルの向上
- エラー処理の強化
- テストスイートの追加

---

**注意**: このシステムはHexoを単一の真実の情報源として設計されています。Qiita上で直接記事を編集する場合は、必ず同期コマンドを実行してHexo側に変更を反映させてください。