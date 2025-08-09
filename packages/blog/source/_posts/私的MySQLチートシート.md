---
title: 私的MySQLチートシート
tags:
- MySQL
- CheatSheet
abbrlink: 49418
date: '2025-04-20 03:28:55'
sitemap: false
qiita:
  id: cb01fdc789369ee28223
  status: published
  last_sync_hash: d34b8756
  last_sync_at: '2025-08-09T10:46:07.658Z'
  private: false
  updated_at: '2025-04-20 03:28:55'
  tags:
  - name: MySQL
    versions: []
  - name: CheatSheet
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

# MySQLチートシート
## インストール
```bash
sudo pacman -Syu
sudo pacman -S mysql mysql-workbench
sudo mkdir -p /var/lib/mysql/
sudo chown -R mysql:mysql /var/lib/mysql
sudo chmod -R 750 /var/lib/mysql
sudo mariadb-install-db --user=mysql --basedir=/usr --datadir=/var/lib/mysql
sudo systemctl enable --now mysqld
```

## もし、`dbeaver`などでrootにログインできなかったら、
```sql
UPDATE mysql.user SET authentication_string=PASSWORD('新しいパスワード'), plugin='mysql_native_password' WHERE User='root';
FLUSH PRIVILEGES;
EXIT;
```

## データインポートするのが遅かったら
一番早いのは、ログインしてから
```sql
use [database];
source ~/file.sql
```

## mysql import, export中の進捗をログで表示

### インストール
```bash
sudo pacman -S pv
```

### 実際に使ってみる
```bash
# import
pv ~/downloads/forum.sql | sudo mariadb --max_allowed_packet=64M web

# export
mysqldump --max_allowed_packet=64M -u root -p web | pv > ~/downloads/forum.sql
```

## exportで失敗しないために
`mysqldump`コマンドの引数で、`max_allowed_packet`を指定する
```bash
mysqldump --max_allowed_packet=64M -u root -p web > ~/path/to/sample.sql
```

## `auth_socket`プラグインを使っているかどうか検証
```sql
SELECT user, host, plugin FROM mysql.user WHERE user='mc';
```

## INSERTでSELECT参照
例として、`members`テーブルのものを`users`テーブルに移植する。
```sql
INSERT INTO users (name, password, email)
SELECT name, password, email
FROM members;
```
