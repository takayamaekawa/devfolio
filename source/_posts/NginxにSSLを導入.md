---
title: NginxにSSLを導入
tags: 'Nginx, SSL'
abbrlink: 21623
date: 2025-02-01 00:00:00
---

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
sudo certbot --nginx -d keyp.f5.si,kishax.f5.si
```
