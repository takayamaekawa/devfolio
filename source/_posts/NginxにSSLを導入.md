---
title: 'NginxにSSLを導入'
tags:
  - 'Nginx'
  - 'SSL'
abbrlink: 21623
date: 2025-02-01 00:00:00
---

<!--
Copyright (c) 2025 verazza
This file is distributed under the terms of the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
See the LICENSE file in the source directory for details.
(https://creativecommons.org/licenses/by-nc-sa/4.0/)
-->

# NginxにSSLを導入するまで

## インストール
```
sudo pacman -S certbot

sudo pacman -S certbot-nginx
```

## 鍵生成
```bash
sudo certbot --nginx
```
新たにドメインを増やす場合、既存のSSL証明書に新たに追加することが可能。
```
sudo certbot --nginx -d sample.com,sample2.com
```
