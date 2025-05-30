---
title: '私的ArchLinux開発環境構築'
abbrlink: 14653
date: 2025-03-13 12:09:00
tags:
  - 'ArchLinux'
  - '環境構築'
---

<!--
Copyright (c) 2025 Takaya Maekawa
This file is distributed under the terms of the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
See the LICENSE file in the source directory for details.
(https://creativecommons.org/licenses/by-nc-sa/4.0/)
-->

# ArchLinux開発環境構築

## コメント
以下の記事はとても長い。  
なので、Dockerを使った、[devkit](https://github.com/takayamaekawa/devkit) によるコマンド一発で、私と同じ環境が作れるものを開発した。なお、ディストロ全体の容量は10GBほど。以下は、ほぼほぼdevkitの [Dockerfile](https://github.com/takayamaekawa/devkit/blob/master/Dockerfile) に記述している内容と同じである。

## 開発環境構築
### ネット確認
応答があれば、ネットにつながっている。
```bash
ping google.com
```

### Localeの設定
```bash
echo LANG=en_US.UTF-8 > /etc/locale.conf

# /etc/locale.gen、最上行に追加
tee -a /etc/locale.gen <<EOL
ja_JP.UTF-8 UTF-8
en_US.UTF-8 UTF-8
EOL

locale-gen
```
## もし、Localeエラーが出たら
en\_US.UTF-8 UTF-8の行がコメントアウトされていないことを確認
```bash
sudo vim /etc/locale.gen
sudo pacman -S glibc
```

### Timezoneの設定
現在のタイムゾーンを確認
```bash
timedatectl status
```
利用可能なタイムゾーンを一覧表示
```bash
timedatectl list-timezones
```
タイムゾーンを設定
```bash
sudo timedatectl set-timezone Asia/Tokyo
```

### `pacman`キーの初期化
`GnuPG`キーリングを初期化し、以降でダウンロードするパッケージが改ざんされていないことを確認し、開発者やメンテナーによって署名されたキーを使うことで、`pacman`が安全にパッケージを検証することができる。
```bash
pacman-key --init
```

### ArchLinux公式キーの登録
Arch Linuxの公式パッケージメンテナーの公開鍵をキーリングに登録。これにより、公式リポジトリからダウンロードしたパッケージ署名を検証できる。
```bash
pacman-key --populate archlinux
```

### 基本パッケージと開発ツールのインストール
```bash
pacman -Syyu base base-devel git gvim wget unzip reflector go glibc
```
一部、かいつまんで説明する。  
- `base`  
最小限のArch Linuxシステムを構成するために必要な基本的なパッケージのグループ
- `base-devel`  
ソフトウェア開発に必要な基本的なツールが含まれるグループ（`gcc`, `make`, `binutils`など）
- `reflector`  
Arch Linuxのミラーサイトのリストを生成し、最適なミラーを選択するためのツール

### システム全体のパッケージアップグレード
```bash
pacman -Syu
```

### ユーザー作成およびパスワード設定
\<user\>となっているところは各自ユーザー名に置き換えてほしい
```bash
# rootパスワード設定
passwd
useradd -m -g users -G wheel -s /bin/bash <user>
passwd <user>
pacman -S sudo
# wheelグループにNO PASSWDの全権限付与
# %wheel ALL=(ALL:ALL) NOPASSWD: ALLの行をコメントアウト
vim /etc/sudoers
```

### AURヘルパーのインストール
非公式レポジトリであるAUR専門のパッケージマネジャーをインストールする必要がある。今回は、`yay`を紹介するが、他にも、`paru`, `pikaur`, `aura`, `cower`などがある。
```bash
git clone https://aur.archlinux.org/yay.git
cd yay
makepkg -si
```

### その他ソフトウェア
#### インストール
```bash
sudo pacman -S kitty starship w3m lazygit tree unzip neovim noto-fonts-cjk
```
説明しよう。  
- neovim  
私が愛用しているエディター、高性能、多機能、己と一緒に成長する最強のエディター
- kitty  
ターミナルエディター。画像も表示できる。キーマップも多彩。Waylandとの互換性が良い。
- starship  
プロンプトジェネレーター。あなたのターミナルを柔軟にカスタマイズできる。
- w3m  
ターミナルでのブラウジングが可能なTUI。kittyの`imagemagick`と組み合わせれば、ブラウジング中に画像も見れちゃう。
- noto-fonts-cjk
日本語フォント。

### pyenvによるpython環境構築
#### pyenvのインストール
以下、pyenvで、tkが必要になることがあるため。
```bash
sudo pacman -S tk pyenv
```

#### 環境変数の設定
(既に設定している場合はスキップ)
```bash
# 必要な設定を追加
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init --path)"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc
echo 'eval "$(pyenv virtualenv-init -)"' >> ~/.bashrc
source ~/.bashrc
```

#### 適切なPythonバージョンをインストール
例として、Python 3.10.12をインストールする。
```bash
# Python 3.10.12をインストール
pyenv install 3.10.12

# グローバルにPython 3.10.12を使用するように設定
pyenv global 3.10.12
```

#### 確認
```bash
# Pythonバージョンを確認
python --version
```
詳しくは、以下を参照。
https://github.com/pyenv/pyenv?tab=readme-ov-file#installation

### rustupのインストール
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```
詳しくは、以下を参照。
https://www.rust-lang.org/ja/tools/install

### dockerのインストール
```bash
sudo pacman -S docker docker-compose
```

### githubシークレットサービス
`git-credential-manager`を使用すると、Gitでのリモートへのプッシュ時に、ブラウザによるログイン認証が行われる。
私は以下に書いてある内容を環境毎に入力するのが面倒だったので、専用のbashファイルを作って、実行するようにしてます。
興味のある方は、[takayamaekawa/dotfiles:/.global/bin/gauth](https://github.com/takayamaekawa/dotfiles/blob/master/.global/bin/gauth) を見てみてください。
```bash
yay -Syu git-credential-manager-core-extras
git config --global credential.helper 'manager'
git config --global credential.credentialStore secretservice
```
名前とメールアドレスを登録してなかったら以下
```bash
git config --global user.email "you@example.com"
git config --global user.name "Your Name"
```
各レポジトリでHTTPS URLになっていることを確認
なっていなかったら、
```bash
git remote set-url origin https://github.com/username/repo.git
```

### java\/scala環境構築
どちらも[sdkman](https://sdkman.io/)を使用してセットアップしていく。
まずは、java環境を作る。
例として、oracle製のjava17をインストールする。
```
curl -s "https://get.sdkman.io" | bash
source ~/.sdkman/bin/sdkman-init.sh
sdk install java 17.0.12-oracle
```
なお、別のjavaバージョンが知りたい場合は、以下を実行して、見ることができる。
```
sdk list java
```
次に、javaの後継と言われているあの言語、scala環境を作る。
```bash
curl -s "https://get.sdkman.io" | bash
source ~/.sdkman/bin/sdkman-init.sh
sdk install sbt
yay -S coursier
coursier setup -y
coursier install metals
```
`coursier`と`metals`は、Neovimの[scalameta/nvim-metals](https://github.com/scalameta/nvim-metals)プラグインで使う。

### Neovimの設定
以下の私のNeovimの設定レポジトリを紹介する。ぜひ見てほしい。  
https://github.com/takayamaekawa/nvim

### kittyの設定
#### w3mでブラウジング中に画像を表示するための設定
```bash
sudo pacman -S imagemagick
```
あとは、w3mの設定ファイルを変更する。
`~/.w3m/config`
```
...
inline_image_protocol 4
...
```
これで、インライン画像方式がkitty(ImageMagick)を使うものになる。

### nvmによるnpm\/node環境構築
例として、nvmバージョン`v0.40.2`で、nodeバージョン`22.12.0`をインストールする。
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash
nvm install 22.12.0
nvm use 22.12.0
```

### dotfilesのインポート
私の環境では、設定ファイルはすべてGithubのレポジトリ: [takayamaekawa/dotfiles](https://github.com/takayamaekawa/dotfiles)にまとめているので、各ソフトウェアのドットファイルを移植するだけで済む。

### GUI環境の構築（任意）
```bash
sudo pacman -S acpid xorg sddm plasma konsole
sudo systemctl enable sddm
```
私は、KDE PlasmaしかArchLinuxでは試したことないが、使いやすいと感じている。同時にダウンロードしておいたほうがいいものを紹介しよう。
```bash
sudo pacman -S power-profiles-daemon
```
これにより、GUI操作で電源モードをパフォーマンス・バランス・省電力に変更できる。

## 最後に
書いてて思った、面倒だ！！！

## 参考
https://zenn.dev/ytjvdcm/articles/0efb9112468de3
