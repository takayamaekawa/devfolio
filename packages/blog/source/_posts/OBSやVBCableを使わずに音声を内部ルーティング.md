---
title: OBSやVBCableを使わずに音声を内部ルーティング
tags:
  - archLinux
  - OBS
  - JACK
  - VBCable
abbrlink: 54038
date: '2025-04-20 02:54:47'
qiita:
  id: 7e4c56dc7f05daa97aa8
  status: published
  private: false
  slide: false
  ignore_publish: false
updated: '2026-05-16 23:26:51'
---

<!--
Copyright (c) 2025 Takaya Maekawa
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
jack, setupのinterfaceに持ってるオーディオインターフェースを選択。
あとは、グラフよりルーティング。
![jack_graph.png](/images/jack_graph.png)
