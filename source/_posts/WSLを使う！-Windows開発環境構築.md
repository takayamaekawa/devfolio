---
title: 'WSLを使う！ Windows開発環境構築'
tags:
  - 'Neovim'
  - 'Windows'
  - 'WSL'
  - '開発環境'
abbrlink: 17845
date: 2025-03-24 02:54:00
---

<!--
Copyright (c) 2025 Takaya Maekawa
This file is distributed under the terms of the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
See the LICENSE file in the source directory for details.
(https://creativecommons.org/licenses/by-nc-sa/4.0/)
-->

# WSLありきのWindows開発環境構築

## コメント
この記事は、WSL導入とWSL-Archを使うまでのロードマップを知ることができる。また、WSLにArch導入後の開発環境構築には、通常のネイティブにブートすることを想定した[私的ArchLinux開発環境構築](https://takayamaekawa.github.io/posts/14653/)の内容を含む。

ということで、まずは、WSLを使えるようにしていく。
## WSLの導入
コントロールパネル＞プログラム＞プログラムと機能＞Windowsの機能の有効化または無効化より、Linux用Windowsサブシステム\/仮想マシンプラットフォームにチェックを入れ、Windowsを再起動しよう。  
再起動後には、コマンドラインでwslコマンドが使えるようになっているはずだ。

## WSLのディストロ選び
今回は、私の普段開発で、またはサーバー機として、愛用しているArchLinuxをWSLで使うものとしよう。他のディストロを探したい場合は、以下を実行すると、WSLで使えるディストロを知ることができる。
```
wsl --list --online
```


## WSLでArchを使うまで

### インポートする方法3選
先に、TARBALLの説明をしておく。  
TARBALLとは、/etc, /homeなどLinuxの設定ファイルを含む、Linuxディストリビューションを構成する様々なファイルやディレクトリをまとめた圧縮ファイルのことだ。なお、カーネルは含まない。  
（1）TARBALLをインストールして、任意に、必要ファイルを編集し、再圧縮をかけることで、WSLにインポートする方法  
（2）ArchLinux公式が提供しているもので、すでに、インポート形式に特化した.wslファイルを落としてきて、それをインポートする方法。これはファイルを編集する手間がないので早い  
https://wiki.archlinux.org/title/Install_Arch_Linux_on_WSL
（3）ArchWSLという名前のGitプロジェクトで、これはArch.exeを管理者権限で実行するだけで、インポートが完了する方法。これは、サードパーティ製のツールにあたる。  
https://github.com/yuk7/ArchWSL

今回は、ArchLinuxを使うために、(1)を紹介するが、私は、(1)をした結果、やっぱり、(2)の方が簡単だと思った。だから、(2)の方が好みだし、推奨する。

### 手順（2）
#### Ubuntuのインストール
まずは、Ubuntuをインストールしよう。  
あれ、Archじゃないのと思った人はいるかとは思うが、次の手順のTARBALLを解凍したり、圧縮したりするのは、やっぱりLinuxでやったほうがいいと思うのだ...。（Windowsでやる方法を知らない勢）
```
wsl --install -d Ubuntu
```
#### Ubuntuターミナルに入る
インストールが完了したら、以下のコマンドでUbuntuターミナルに入ろう。
```
wsl -d Ubuntu
```

#### TARBALLのインストール
ArchLinuxのTARBALLを配信しているミラーサーバーは色々あるが、今回は以下を使用する。
http://ftp.tsukuba.wide.ad.jp/Linux/archlinux/iso/

ここで、注意なのが、WSLは、`/mnt/c`よりCドライブをマウントするのがデフォだが、間違っても、以下の作業を、
```
cd /mnt/c/path/to/work
tar ....
```
などと、Ubuntuターミナルの中で、Cドライブにアクセスすることは避けよう。私も最初は、そうしたが、そうでないときと比べて、TARBALLの解凍および圧縮がとてつもなく遅かったのだ。

それを吟味して、以下、`wget`コマンドを使用して、最新のTARBALLを落としてこよう。`archlinux-bootstrap-2025.03.01-x86_64.tar.zst`の部分は、各自、最新のものを上のミラーサーバーからリンクをコピーして読み替えてほしい。

```bash
wget http://ftp.tsukuba.wide.ad.jp/Linux/archlinux/iso/2025.03.01/archlinux-bootstrap-2025.03.01-x86_64.tar.zst
```

#### TARBALLの解凍/圧縮/再圧縮
次に、`.tar.zst`ファイルを解凍するため、`zstd`パッケージをインストールする。
```bash
sudo apt install zstd
```
そして、TARBALLの解凍、必要ファイル編集、再圧縮を行う。
```bash
unzstd archlinux-bootstrap-2025.03.01-x86_64.tar.zst

tar -xvf archlinux-bootstrap-2025.03.01-x86_64.tar

cd root.x86_64/
# Japan以下をコメントアウト
nano etc/pacman.d/mirrorlist

# TARBALLの再圧縮 
tar -czvf root.tar.gz *

# wslにマウントされているWindowsのCドライブにarchフォルダを作成。
# 別に、エクスプローラーからC:\wsl\archを作っても構わない。
mkdir -p /mnt/c/wsl/arch
cp root.tar.gz /mnt/c/wsl/arch
```

#### WSLにインポート
```
wsl --import ArchLinux C:\wsl\arch C:\wsl\arch\root.tar.gz
# 確認
wsl -l -v
```

## WSL2にアップデート
もしかしたら、インストールしてきたディストロがWSL2で実行されていないかもしれない。特に、GUIアプリケーションをディストロ内で実行し、それをWindows側でディスプレイとして閲覧したい場合は、WSL2にアップデートするのがおすすめだ。ちなみに、その機能を`WSLg`という。  
以下のコマンドで、WSL2になっているかが確認できる。各ディストロの`VERSION`の箇所が`2`になっていれば、OKだ。
```bash
wsl -l -v
# VERSIONが2になっていなかったら
# アップデート前にすべて停止させておく
wsl --shutdown
wsl --update
wsl --set-default-version 2
# これらを実行し、再度
wsl -l -v
# 2になっているはず。
```

## `wsl.conf`の作成
`/etc/wsl.conf`に配置しよう。  
設定方法は様々だが、例として以下を紹介する。
```
[user]
default=takayamaekawa

[boot]
systemd = true
initTimeout = 1000

[automount]
enable = true
options = "metadata"
mountFsTab = true

[wsl2]
localhostForwarding = true
memory = 11GB

[interop]
appendWindowsPath = false
```
おそらく一番重要なのは、`boot.systemd`と`interop.appendWindowsPath`のキーだと思う。`appendWindowsPath`は、Windowsの環境変数をWSLのディストロでも引き継ぐかどうか決められる。これを`true`にすると、起動が遅かったりするので、私は`false`にしてる。また、`boot.initTimeout`は起動を早めるが少々注意が必要。詳しくは、以下を参照。
https://learn.microsoft.com/ja-jp/windows/wsl/wsl-config#wslconf

## `.wslconfig`の作成
これは、`C:\Users\<user>\.wslconfig`に配置しよう。
以下、例として
```
[wsl2]
guiApplications = true
kernelCommandLine = cgroup_no_v1=all
```
主に、ディストロ内で実行されたGUIアプリケーションをWindows側のディスプレイで見るための設定だ。詳しくは、以下を参照。
https://learn.microsoft.com/ja-jp/windows/wsl/wsl-config#wslconfig

## Git-Credential-Managerのインストール
Windows側でDesktop-Gitをインストールしている場合、WSLのディストロでもGit-Credential-Managerを使うことができる。これにより、GitHubやGitLabなどのリモートリポジトリへの認証が簡単になる。
```bash
git config --global credential.helper "/mnt/c/Program\ Files/Git/mingw64/bin/git-credential-manager.exe"
```
詳しくは、以下を参照。  
https://learn.microsoft.com/ja-jp/windows/wsl/tutorials/wsl-git?source=recommendations

## npmのインストール
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
command -v nvm
# もしここでnvmコマンドが見つからなかったら以下を実行
# nvmは自動的に.bashrcに環境変数を追加するので、以下を実行して反映させる
source ~/.bashrc
# Node.js の現在の安定した LTS リリースをインストール
nvm install --lts
# npmを最新版にアップデート
npm install -g npm@latest
```
詳しくは、以下を参照。
https://learn.microsoft.com/ja-jp/windows/dev-environment/javascript/nodejs-on-wsl#install-nvm-nodejs-and-npm

## WSLにArchインポート後
ここからは、WSL-Archでの開発環境構築を行う。
ほとんどネイティブにArchをブートしているときに実行するものと大差ない。ということで、それは別記事に書こうと思う。[私的ArchLinux開発環境構築](https://takayamaekawa.github.io/posts/14653/)を見てほしい。また、各種WSLディストロのソフトウェアを利用中に、クリップボードにコピーしたければ、[win32yankについて](https://takayamaekawa.github.io/posts/47392/#win32yank)を参照してほしい。  

## 最後に
WSLはとてもいいと思います。第一に、メインOSが荒れないし、第二に、エクスポート・インポートも容易にできる。正直、実機で色々なOSを試してきた身としては、WSLの凄みにもう少し早く気づきたかったですね。

## WSLの高みに近づくために
例えば、完全なデスクトップ環境をWSLのディストロでも作れるんじゃないかと考える人もいると思う。私もその一人だ。実際に以下を試してみたが、WSL-Ubuntuで、ほんとうにGnomeデスクトップが立ち上がった。  
https://gist.github.com/tdcosta100/7def60bccc8ae32cf9cacb41064b1c0f

## 参考
https://zenn.dev/kyoh86/articles/4bf6513aabe517
https://blog.yukirii.dev/wsl2-arch-linux/
https://zenn.dev/artemit/articles/63e073d53179ae
