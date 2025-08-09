---
title: ArchLinuxでCLI開発環境を整える
tags:
- 開発環境
- archLinux
- CLI
abbrlink: 54214
date: '2025-03-28 08:54:00'
qiita:
  id: 2b508e89d8e10b190a5f
  status: published
  last_sync_hash: df5cc116
  last_sync_at: '2025-08-09T10:46:07.633Z'
  private: false
  updated_at: '2025-03-28 08:54:00'
  tags:
  - name: 開発環境
    versions: []
  - name: archLinux
    versions: []
  - name: CLI
    versions: []
  slide: false
  ignore_publish: false
---

<!--
Copyright (c) 2025 Takaya Maekawa
This file is distributed under the terms of the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
See the LICENSE file in the source directory for details.
(https://creativecommons.org/licenses/by-nc-sa/4.0/)
-->

# CLI環境を作る

## 起動時にCLIが立ち上がるための設定
```bash
sudo vim /etc/default/grub
```
`GRUB_CMDLINE_LINUX_DEFAULT=""`に`text`を追加。
起動時に、スプラッシュスクリーン(通常はディストリビューションのロゴなど)を表示したい人は、`splash`を追加できる。
- `/etc/default/grub`ファイルの変更をGRUBブートローダーに反映
```bash
sudo grub-mkconfig -o /boot/grub/grub.cfg
```
- 現状、システム起動のデフォルトターゲットに何が指定されているのかを知る
```bash
sudo systemctl get-default
```
通常、GUI環境を使用している場合は、`graphical.target`と表示され、そしてそれは、`multi-user.target`を包含している。しかし、CLI環境オンリーで十分だという人にとっては、システム起動時間の短縮やリソース効率の向上の観点から、デフォルトターゲットを`multi-user.target`に切り替えることをおすすめできる。
```bash
sudo systemctl set-default multi-user.target
```
- GUI環境に戻したいときは
```bash
sudo systemctl set-default graphical.target
```
- 日本語の表示、入力にすぐれたターミナルエミュレータをインストールする
以下、fbtermでの実装で失敗した。まず、多くのデスクトップ環境で使われているibusとfbtermを連携させるのに必要なibus-mozcをAURパッケージからyayコマンドでインストールするはずが、ビルドに失敗する。また、kmsconでの日本語表示には、成功しているため、以降、土台をkmsconに置く。

## kmscon
`kmscon`はUnicode/UTF-8 互換で動くので日本語表示ができる。

### kmsconのインストール
```bash
yay -S kmscon
```

### 日本語フォントをインストール
```bash
sudo pacman -S ttf-dejavu otf-ipafont
```

### フォントを適用
`/etc/fonts/conf.d/99-kmscon.conf`
私は、フォントにNerdFontの`Agave`を使っているので、以下のようになる。
```
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
<match>
  <test name="family"><string>monospace</string></test>
  <edit name="family" mode="prepend" binding="strong">
    <string>Agave Nerd Font Mono</string>
    <string>DejaVu Sans Mono</string>
    <string>IPAGothic</string>
  </edit>
</match>
</fontconfig>
```

### キーボードレイアウトを設定
`/etc/kmscon/kmscon.conf`
```
xkb-layout=jp
```

### tty2以降をkmsconに設定
あとで、`kmsconvt@tty3.service`を作るため、スキップしてもよい。
```bash
sudo ln -s /usr/lib/systemd/system/kmsconvt\@.service /etc/systemd/system/autovt\@.service
```
- `kmsconvt@.service`を有効化
`autovt@tty3.service` は `kmsconvt@.service` へのシンボリックリンクなため、元のサービスを有効化することで、`autovt@tty3.service` も間接的に有効になる。
```bash
sudo systemctl enable kmsconvt@tty3.service
```

### kmsconをtty3にセットする
```bash
# テンプレートサービスを別名でコピー
sudo cp /usr/lib/systemd/system/kmsconvt@.service /etc/systemd/system/kmsconvt@tty3.service
```
### kmscon（tty）上で日本語入力を可能にする
以下、uimでmozcを使用する設定
- インストール
```bash
yay -S uim
```
`~/.uim`
```
(define default-im-name 'mozc)
(define-key generic-on-key? '("<Control> "))
(define-key generic-off-key? '("<Control> "))
```
あとは、以下を`~/.bashrc`などに書けばOK
```
uim-fep
```
これにより、Ctrl+Spaceキーで日本語入力の切り替えが可能になる。
- 参考
kmscon
https://www.kaias1jp.com/entry/2021/01/11/173542
https://qiita.com/Pseudonym/items/9ff0e9028dfd6bad5958
~~fbterm
https://qiita.com/Pseudonym/items/12e447557a5234bb265b~~

## CLI環境で使えるツール一覧
- コマンドラインでGeminiと話せるツール
https://github.com/greycodee/gemini-terminal
https://github.com/eliben/gemini-cli
- コマンドラインでDiscordが使えるツール
https://github.com/ayn2op/discordo

## discordoをCLI環境で使えるようにする
何度か試行したが、できなかった。
~~まず、discordトークンは、機密情報なので、libsecretかgnome-keyringかkwalletを使用したい。
GUIではアンロックは容易だが、CLIでのキーリングのアンロックがサポートされていないシークレットサービスも少なくない。
ということで、まずは、CLI上でキーリングをアンロックし、discordoでログインできるかどうかを確認する必要がある。`opensc`パッケージに同封されている`pkcs11-tool`よりCLIでのアンロックを試したが、あれは、`gnome-keyring`で使えるようなものだった。CLIでは`gnome-keyring-daemon`が起動できないため、失敗に終わった。~~
