---
title: 'QiitaとHexoで同時投稿をするために'
tags:
  - 'Qiita'
  - 'Hexo'
abbrlink: 8859
date: 2025-04-28 16:01:00
---

# QiitaとHexoで同時投稿するには

どちらもMarkDown形式のファイルを自動化されたcss、javascriptと合わせて、最終的に、htmlに変換するサービスを提供している。`npm`パッケージリポジトリににそれらをCLIから操作できる便利なツールが出ているため、先に、`npm`使える状況にないよって人は以下を参考にしてね。
[私的ArchLinux開発環境構築 >> nvmによるnpm/node環境構築](https://qiita.com/verazza/items/1561e33b12f83d650f8f#nvm%E3%81%AB%E3%82%88%E3%82%8Bnpmnode%E7%92%B0%E5%A2%83%E6%A7%8B%E7%AF%89)

## Hexo
### インストール
```bash
npm i --save-dev hexo-cli -g
```

これを実行した後は、どのディレクトリ階層でも、`hexo`コマンドが使えるようになっていると思う。次に、ディレクトリ階層を作っていくが、それを1から構成するのは骨が折れるので、以下を実行し、必要ファイルを`hexo`に生成してもらう。

### ファイル配置
```bash
# 作業ディレクトリを作ってその中で実行する。
hexo init
```

### 記事の作成
```bash
hexo new "<title>"
```
これにより、`source/_posts/`内に`<title>.md`が追加されるので、それを編集する。

### ローカルサーバー起動（テスト）
規定では、`http://localhost:4000`で起動される。
```bash
hexo server
```

### カスタマイズ
#### デプロイヤー
以下、Githubをデプロイ先として考える。  
現状、`source/_posts/`に`*.md`ファイルを配置し、`hexo server`をすることで、ローカルでそれらを確認できるが、実際は、リモートで配信するためのプッシュ（デプロイ）が必要になる。別にGithubのワークフローでも自動プッシュが可能。しかし、私はコマンド派。
```bash
npm i hexo-deployer-git
```
`_config.yml`の変更場所
```yml
# デプロイ先のレポジトリ名が`<user>.github.io`の場合
url: https://<user>.github.io/
deploy:
  type: git
  repo: https://github.com/<user>/<user>.github.io
  branch: master
```

#### テーマ
私は、[jerryc127/hexo-theme-butterfly](https://github.com/jerryc127/hexo-theme-butterfly)を使っています。他にも、テーマはたくさんあるので好みのものを選ぼう。
https://hexo.io/themes/

#### リンク簡略化〜永久リンクを短くする〜
デフォルトの設定では、投稿後のリンクは、`https://<デプロイ先のURL>/2025/04/28/<title>/`となるが、以下を導入することで、`https://<デプロイ先URL>/posts/8821/`というURLでアクセスできるようになる。
```bash
npm i hexo-abbrlink --save
```
`_config.yml`
```yml
permalink: posts/:abbrlink/
```

## Qiita（Qiita-CLI）
### インストール
```bash
npm i @qiita/qiita-cli --save-dev
```
これにより、`npx`コマンドを経由して、`qiita`コマンドが使えるようになった。以下、初回に限り実行するもの。
```bash
npx qiita init
npx qiita login
```
ここで私は困った。  
この`qiita`コマンドでは、`--root`引数により、ルートプロジェクトは設定できるものの、`public`ディレクトリは必要なのだ。
一方、`hexo`では、`*.md`ファイルが`source/_posts/`ディレクトリに配置する。ここをうまいこと統合する必要がある。  
そこで、私が、その、`hexo`から`qiita`への橋渡しとなるバッシュスクリプトを開発した。それが以下である。  
`deploy_to_qiita.sh`
```bash
#!/bin/bash

ROOT_QIITA="qiita"
SOURCE="source/_posts"

cd "$(dirname "$0")"

current_quotepath=$(git config --get core.quotepath)
if [ "$current_quotepath" != "false" ]; then
  echo "Setting core.quotepath to false to handle Japanese filenames correctly."
  git config --global core.quotepath false
fi

mkdir -p "${ROOT_QIITA}/public"

CHANGED_FILES=$(git diff --name-only | grep "${SOURCE}/.*\.md$")

if [ -z "$CHANGED_FILES" ]; then
  echo "No .md files changed since last commit."
else
  echo "Changed .md files:"
  while IFS= read -r file; do
    echo "- $file"

    source_file="$file"
    target_file="${ROOT_QIITA}/public/$(basename "$source_file")"

    if [[ -f "$target_file" ]]; then
      echo "File exists: $source_file -> $target_file"

      temp_file="${target_file}.temp"
      mv "$target_file" "$temp_file"

      cp "$source_file" "$target_file"

      TEMP_FRONT_MATTER=$(head -n 999 "$temp_file" | grep -E "^updated_at:|private:|id:|organization_url_name:|slide:|ignorePublish:")
      TEMP_UPDATED_AT=$(echo "$TEMP_FRONT_MATTER" | grep -oE "^updated_at: (.*)$" | sed -E "s/^updated_at: //")
      TEMP_PRIVATE=$(echo "$TEMP_FRONT_MATTER" | grep -oE "^private: (.*)$" | sed -E "s/^private: //")
      TEMP_ID=$(echo "$TEMP_FRONT_MATTER" | grep -oE "^id: (.*)$" | sed -E "s/^id: //")
      TEMP_ORG_URL=$(echo "$TEMP_FRONT_MATTER" | grep -oE "^organization_url_name: (.*)$" | sed -E "s/^organization_url_name: //")
      TEMP_SLIDE=$(echo "$TEMP_FRONT_MATTER" | grep -oE "^slide: (.*)$" | sed -E "s/^slide: //")
      TEMP_IGNORE=$(echo "$TEMP_FRONT_MATTER" | grep -oE "^ignorePublish: (.*)$" | sed -E "s/^ignorePublish: //")

      if [ -n "$TEMP_UPDATED_AT" ]; then
        sed -i "1a updated_at: ${TEMP_UPDATED_AT}" "$target_file"
      fi
      sed -i "2a private: ${TEMP_PRIVATE}" "$target_file"
      if [ -n "$TEMP_ID" ]; then
        sed -i "3a id: ${TEMP_ID}" "$target_file"
      fi
      if [ -n "$TEMP_ORG_URL" ]; then
        sed -i "4a organization_url_name: ${TEMP_ORG_URL}" "$target_file"
      fi
      sed -i "5a slide: ${TEMP_SLIDE}" "$target_file"
      sed -i "6a ignorePublish: ${TEMP_SLIDE}" "$target_file"

      rm "$temp_file"
    else
      echo "New file: $source_file -> $target_file"

      cp "$source_file" "$target_file"
      FRONT_MATTER=$(head -n 999 "$target_file" | grep -E "^title:|tags:|abbrlink:|date:")
      UPDATED_AT=$(echo "$FRONT_MATTER" | grep -oE "^date: (.*)$" | sed -E "s/^date: //")
      sed -i "1a updated_at: \"${UPDATED_AT}\"" "$target_file"
      sed -i "2a private: false" "$target_file"
      sed -i "3a id: null" "$target_file"
      sed -i "4a organization_url_name: null" "$target_file"
      sed -i "5a slide: false" "$target_file"
      sed -i "6a ignorePublish: false" "$target_file"
    fi

    npx qiita publish --root "${ROOT_QIITA}" "$(basename "$source_file" .md)"
  done <<<"$CHANGED_FILES"
fi
```
これにより、Qiitaで投稿する際に必要になる、キー`updated_at;private;id;organization_url_name;slide;ignorePublish;`などが`hexo new "<title>"`コマンドで生成された`source/_posts/`内にある`*.md`ファイルに対して、自動で追加され、そのまま投稿できるようになる。  
なお、一度、`qiita/`ディレクトリを作り、そこに、`source/_posts/`内の`*.md`ファイルをコピーした後で、`sed`コマンドによるファイル操作を行うので、元の`*.md`ファイルが汚染されることはない。
最新の`deploy_to_qiita.sh`については、以下を参照してほしい。更新があれば、記事の方も更新するようにするので、同じ内容になるかとは思う。(一応)  
https://github.com/verazza/blog/blob/master/deploy_to_qiita.sh

## `package.json`のタスク
以下、参考までに。
```json
"scripts": {
  "server": "hexo clean && hexo generate && hexo server",
  "deploy": "hexo clean && hexo generate && hexo deploy",
  "deploy2": "./deploy_to_qiita.sh",
  "deploy-all": "npm run deploy && npm run deploy2"
},
```

## 最後に
今回は、記事作成および投稿に`hexo`を使っていた私が`qiita`にも、一応投稿しておくか！ってことで、`Qiita-CLI`を使いましたが、良い機会になりました。やっぱコマンド触ってるだけでエンジニアっぽい...
追記:  
おそらく、これを応用すれば、`zenn`にも投稿できると思うので、またいずれ...

## 参考
[jerryc127/hexo-theme-butterfly](https://github.com/jerryc127/hexo-theme-butterfly)テーマを使うときに  
https://sj-note.com/hexo-butterfly-upgrade

`hexo`の有用プラグインの検索に  
https://qiita.com/ORCHESTRA_TAPE/items/a0c795904e33cdf043d7

