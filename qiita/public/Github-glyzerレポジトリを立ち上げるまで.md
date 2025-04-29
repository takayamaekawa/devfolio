---
updated_at: '2025-04-28T20:04:53+09:00'
private: false
id: 56a9d0573e661ca6983f
organization_url_name: null
slide: false
ignorePublish: false
title: 'Github:glyzerレポジトリを立ち上げるまで'
tags:
  - 'python'
  - 'gemini'
abbrlink: 33934
date: 2025-03-28 23:59:00
---

<!--
Copyright (c) 2025 verazza
This file is distributed under the terms of the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
See the LICENSE file in the source directory for details.
(https://creativecommons.org/licenses/by-nc-sa/4.0/)
-->

## 回顧録
ある日、CLI環境を構築する際に、新たなTUI（ターミナルインターフェース）アプリが必要だなと感じた。  
それは、ChatGPTやGeminiに代表されるAI-Chatアプリだ。それらがターミナルから使えればいいなと思ったのが事の始まりである。  
そこでgemini-cliというものを知り、GeminiAPIKeyが必要になることを知る。そこからGeminiAPIに興味を持ち、手始めにpythonに接続することで、広範囲の分析が可能になることを知った。  
これより、プロジェクト[glyzer](https://github.com/verazza/glyzer)の始まりである。

## インストール
[eliben/gemini-cli](https://github.com/eliben/gemini-cli)

## このプロジェクトの理想
Neovimでの開発中に、特定のキーマップより(`<leader>gm`など)現在のファイルに対して、geminiと応答を図る。また、入力でディレクトリパスを指定して、その中の指定拡張子よりdbファイルにまとめ、それをソースに、触媒に、栄養にし、応答を図る。
2つの環境の類似性より、分析を依頼する。

## gemini-cliに関するコマンド
- ファイル群をdbファイル形式にする
これはgeminiが食う。
```bash
gemini-cli embed db out.db --files .,*.py

gemini-cli embed db out.db --files-list question.txt
```
PythonはあくまでGeminiAPIを使って、ソースを食わせる役割。別に言語は何でもいいと思う

## 現在思考中のもの
以下、[glyzer:/setup.py](https://github.com/verazza/glyzer/blob/master/setup.py) の説明
gemini-cliコマンドより、検索対象となるコード、それに対する質問となるコード(平文でもコードとみなす)に対して、それらいくつものファイル群を、数値ベクトル・埋め込みベクトルに変換(dbファイルにあたる)したものを、NumPy配列に変換する。単にdbファイルにエクスポートし、数値ベクトルにしても、それらは単なるバイナリデータに過ぎず、特定のデータ型・構造を持たないため、直接的に数値演算が可能になるNumPy配列に変換する必要がある。これにより、データを特定のデータ型(整数、不動小数点など)を持つ多次元配列として解釈できる。これより、コサイン類似性より比較する。コサイン類似度の高いコード片をソートし、出力する。また、その類似性よりわかったコードスニップより、geminiと応答する。

なぜデータベース(`*.db`)形式なのか。
* 大量の埋め込みベクトルが効率的に保存・管理ができる
* インデックス機能より検索が容易である
* データベースを容易に持ち運び、共有できる

## 参考
- Gemini API Docs
https://github.com/google-gemini/cookbook/blob/main/quickstarts/Get_started.ipynb
