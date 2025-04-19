---
title: OBSやVBCableを使わずに音声を内部ルーティング
tags: 'OBS, VBCable, jack, ArchLinux'
abbrlink: 54038
date: 2025-04-20 02:54:47
---

# OBSから脱却
jackパッケージでサウンドの内部ルーティングが容易に。
# インストール
```bash
sudo pacman -S pipewire pipewire-pulse pipewire-jack qjackctl
```
```bash
systemctl --user restart pipewire
systemctl --user restart pipewire-pulse
systemctl --user restart pipewire-media-session
```
jack, setupのinterfaceに持ってるオーディオインターフェースを選択
あとは、グラフよりルーティング
![jack_graph](/images/jack_graph.png)
