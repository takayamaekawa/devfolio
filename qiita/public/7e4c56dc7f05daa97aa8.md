---
title: OBSやVBCableを使わずに音声を内部ルーティング
tags:
  - archLinux
  - OBS
  - JACK
  - VBCable
private: false
updated_at: '2025-04-28T20:04:53+09:00'
id: 7e4c56dc7f05daa97aa8
organization_url_name: null
slide: false
ignorePublish: false
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
![jack_graph.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3628758/e1e25ade-583d-4dfe-8a88-0181888877f7.png)
