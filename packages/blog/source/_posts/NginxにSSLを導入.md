---
title: NginxにSSLを導入
tags:
- nginx
- SSL
abbrlink: 21623
date: '2025-02-01 00:00:00'
qiita:
  id: 64c79e3b6572144f1faf
  status: published
  last_sync_hash: 2c33540b
  last_sync_at: '2025-08-09T10:46:07.639Z'
  private: false
  updated_at: '2025-02-01 00:00:00'
  tags:
  - name: nginx
    versions: []
  - name: SSL
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
