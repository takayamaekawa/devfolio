---
title: 'OBSやVBCableを使わずに音声を内部ルーティング'
tags:
  - 'OBS'
  - 'VBCable'
  - 'Jack'
  - 'ArchLinux'
abbrlink: 54038
date: 2025-04-20 02:54:47
---

<!--
Copyright (c) 2025 verazza
This file is distributed under the terms of the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
See the LICENSE file in the source directory for details.
(https://creativecommons.org/licenses/by-nc-sa/4.0/)
-->

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
