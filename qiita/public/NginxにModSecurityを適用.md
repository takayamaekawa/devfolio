---
updated_at: '2025-04-28T20:04:53+09:00'
private: false
id: 0509d717f35f5152f46d
organization_url_name: null
slide: false
ignorePublish: false
title: 'NginxにModSecurityを適用'
tags:
  - 'Nginx'
  - 'ModSecurity'
abbrlink: 39499
date: 2025-02-01 00:00:00
---

<!--
Copyright (c) 2025 verazza
This file is distributed under the terms of the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
See the LICENSE file in the source directory for details.
(https://creativecommons.org/licenses/by-nc-sa/4.0/)
-->

# NginxにModSecurityを導入するまで

## インストール
```bash
sudo pacman -S libmodsecurity modsecurity-crs
```

## Nginxへの適用

### ModSecurityと依存関係のインストール
```bash
sudo pacman -Syu
sudo pacman -S git gcc pcre pcre2 zlib make
```

### ModSecurityのダウンロードとビルド
```bash
git clone --depth 1 https://github.com/SpiderLabs/ModSecurity-nginx.git
git clone --depth 1 -b v3.0.13 https://github.com/SpiderLabs/ModSecurity
cd ModSecurity
git submodule init
git submodule update
./build.sh
./configure
make
sudo make install
```

### nginxのソースコードのダウンロードとビルド
http://nginx.org/download/
ここより、最新のバージョンのnginxをダウンロードする
ここでもいいかも
http://nginx.org/en/download.html

```bash
wget http://nginx.org/download/nginx-[latest nginx version].tar.gz
tar zxvf nginx-[latest nginx version].tar.gz
cd nginx-[latest nginx version]

./configure --with-compat --add-dynamic-module=../ModSecurity-nginx
make modules
sudo cp objs/ngx_http_modsecurity_module.so /etc/nginx/modules
```

### RuleSetをダウンロードと配置
https://github.com/coreruleset/coreruleset

```bash
wget https://github.com/coreruleset/coreruleset/archive/refs/tags/v[latest version].tar.gz
tar -xzvf v[latest version].tar.gz

sudo mkdir -p /etc/nginx/modsec/coreruleset
sudo cp -r coreruleset-[latest version]/crs-setup.conf.example /etc/nginx/modsec/coreruleset/crs-setup.conf
sudo cp -r coreruleset-[latest version]/rules /etc/nginx/modsec/coreruleset/
```

### 必要なファイルのダウンロード
```bash
wget https://raw.githubusercontent.com/SpiderLabs/ModSecurity/v3/master/modsecurity.conf-recommended -O /etc/nginx/modsec/modsecurity.conf
wget https://raw.githubusercontent.com/SpiderLabs/ModSecurity/v3/master/unicode.mapping -O /etc/nginx/modsec/unicode.mapping
```

### Nginx設定ファイルを編集
`/etc/nginx/nginx.conf`
```conf
load_module modules/ngx_http_modsecurity_module.so;

http {
    ...
    modsecurity on;
    modsecurity_rules_file /etc/nginx/modsec/modsecurity.conf;
    ...
}
```
