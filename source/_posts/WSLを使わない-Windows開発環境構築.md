---
title: WSLを使わない! Windows開発環境構築
tags: 'Neovim, Windows, 開発環境'
abbrlink: 47392
date: 2025-03-14 18:52:00
---

# WSLないないのWindows開発環境構築

## コメント
こちらの記事は、主に、CLI環境で開発していきたいという方にすごく向いているかと思う。

## ターミナルのアップデート
まずは、今回の主役、ターミナルpwsh(powershell)をアップデート
https://github.com/PowerShell/PowerShell/releases/
Latestの安定版をインストール
ダウンロードするときに、arm64かx64か、どれをダウンロードすればいいかわからない場合は、アーキテクチャーを調べよう。
```
msinfo32
```
システムの種類が`x64ベース PC`であれば、
x64のmsiのインストーラーをダウンロード & 実行すればよい。

## sudoの有効化
システム＞開発者向けより、sudoの有効化
LinuxなどUNIX系では、`sudo`を用いるのが習慣だ。

## パッケージマネジャーのインストール
以下、Ubuntuなら`apt`, ArchLinuxなら、`pacman`など、パッケージマネジャーによって、ソフトのダウンロードを高速化するために必要だ。  
私は、`chocolatey`を使う。
https://chocolatey.org/

以下のコマンドでインストールが可能だ。
```pwsh
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

## chocolateyによる各種ソフトインストール
以下、管理者モードで実行するように
ripgrepは、nvimの[Telescope](https://github.com/nvim-telescope/telescope.nvim)プラグインの階層文字列検索を使用するときに必要になるので、合わせてダウンロードしておきたい。開発中のGit操作はすべて[lazygit](https://github.com/jesseduffield/lazygit)で行う。
```cmd
sudo choco install ripgrep lazygit starship vim neovim git wget unzip nvm -y
```

## 各種ソフトの設定
neovimで、LSP機能を使いたい人は、私の場合だと、[mason-lspconfig](https://github.com/williamboman/mason-lspconfig.nvim)を使用していて、各言語のLSPサーバーをダウンロードしてくるのに、pythonやnpmを使用することが多い。  
ゆえに、python, npmをWindowsにインストールしておこう。  

### pythonのダウンロード（任意）
以下より、最新のpythonを公式よりダウンロード >> EXE実行
https://www.python.org/downloads/

### nvmによるnpm\/nodeのインストール
```cmd
nvm install 22.12.0
nvm use 22.12.0
```

### starshipをターミナルに適用
以下、https://starship.rs/guide/ を要約したもの

- pwshに適用する場合
```pwsh
vim $PROFILE
# 以下追加
Invoke-Expression (&starship init powershell)

# コマンド一行で行うには
Invoke-Expression (&starship init powershell --print-full-init | Out-String)
```

- cmdに適用する場合
https://chrisant996.github.io/clink/clink.html
```cmd
winget install clink
```
```
#%LocalAppData%\clink\starship.lua

load(io.popen('starship init cmd'):read("*a"))()
```

```pwsh
cd $env:LOCALAPPDATA
mkdir -p .config
cd .config
wget https://raw.githubusercontent.com/bella2391/dotfiles/master/.config/starship.toml
```

### vimの設定
- _vimrcを配置
私の場合、[dotfiles](https://github.com/bella2391/dotfiles)にドットファイルをまとめているので、以下のコマンドで済む。
```pwsh
cd ~
wget https://raw.githubusercontent.com/bella2391/dotfiles/master/.vimrc
move .vimrc _vimrc
mkdir -p ~/.wsl
cd ~/.wsl/
wget https://raw.githubusercontent.com/bella2391/dotfiles/master/.wsl/.vimrc
```

#### win32yank
https://github.com/equalsraf/win32yank

- 以下、vimでコピー&ペーストを行うために
win32yankはコマンドベースの、レジスタに文字列を登録することのできるWindowsで使えるものだ。UNIX系のXディスプレイだと、`x-clip`やWayLandディスプレイだと、`wl-copy`などがある。
```pwsh
cd ~/git/dotfiles/.global/bin/ # 配置場所は任意
wget https://github.com/equalsraf/win32yank/releases/download/v0.1.1/win32yank-x64.zip
unzip .\win32yank-x64.zip
Remove-Item .\LICENSE, .\README.md, .\win32yank-x64.zip
```
別途、`exe`ファイルの入ったフォルダをユーザー環境変数にセットしておこう。なお、今回は、WSLないないだが、WSLありきの環境で使う場合は、`.exe`実行ファイルの入ったフォルダをWSLのディストロ内で環境変数のパスに通す必要がある。

### ターミナルフォントを設定
私は、NerdFontが良いと思う。
nvimの`nvim-web-devicons`プラグインでも使える。
https://www.nerdfonts.com/

Agave.zipなどをダウンロード
エクスプローラーから展開して、フォント群(ttfなど)を選択、インストール
ターミナルプロファイルより適用

### ターミナルキーマップを設定
以下をターミナルプロファイルに追加。
`Next tab`: `C-Shift-[`
`Previous tab`: `C-Shift-]`
`Split pane`: `C-Shift-Enter`

### Neovimの設定
私の場合、Githubにその設定ファイルがあるので、それをインポートするだけで済む。
Neovimの設定ファイルは、`C:\Users\<user>\AppData\Local\`に配置しなければいけない。
```pwsh
# cmdなら
cd %LOCALAPPDATA%
# pwshなら
cd $env:LOCALAPPDATA

git clone https://github.com/bella2391/nvim.git
```

以下、私でないなら読み飛ばして構わない。
## シンボリックリンク作成
```cmd
cd
mkdir -p git
```
- cmd
```cmd
mklink /D nvim %LOCALAPPDATA%/nvim
```
- pwsh
```pwsh
New-Item -ItemType Junction -Path "nvim" -Target "$env:LOCALAPPDATA\nvim"
```
