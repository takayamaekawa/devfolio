---
title: SSHログインに2FA導入
tags:
  - SSH
  - archLinux
  - 2FA
  - Google-Authendicator
private: false
updated_at: '2025-04-29T20:56:59+09:00'
id: b840688ec38e89839ac1
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

# sshに2FAを導入するにあたって
## インストール
```bash
sudo pacman -S libpam-google-authenticator
```
ユーザーごとに鍵を作る
```bash
google-authenticator
```

## 参照
https://wiki.archlinux.jp/index.php/Google_Authenticator#.E3.82.A4.E3.83.B3.E3.82.B9.E3.83.88.E3.83.BC.E3.83.AB
https://wiki.archlinux.jp/index.php/OpenSSH#.E4.BA.8C.E8.A6.81.E7.B4.A0.E8.AA.8D.E8.A8.BC.E3.81.A8.E5.85.AC.E9.96.8B.E9.8D.B5
