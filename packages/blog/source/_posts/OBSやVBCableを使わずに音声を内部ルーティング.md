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
  last_sync_hash: 80a56df7
  last_sync_at: '2025-08-09T10:46:07.640Z'
  private: false
  updated_at: '2025-04-20 02:54:47'
  tags:
  - name: archLinux
    versions: []
  - name: OBS
    versions: []
  - name: JACK
    versions: []
  - name: VBCable
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
![jack_graph.png](/images/jack_graph.png)
