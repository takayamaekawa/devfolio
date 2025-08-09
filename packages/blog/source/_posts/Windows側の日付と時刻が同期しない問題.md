---
title: Windows側の日付と時刻が同期しない問題
tags:
- Windows
- dualboot
abbrlink: 34194
date: '2025-04-20 04:10:01'
qiita:
  id: 18f0f23c6c19b32e9d3d
  status: published
  last_sync_hash: 1f6d5a02
  last_sync_at: '2025-08-09T10:46:07.649Z'
  private: false
  updated_at: '2025-04-20 04:10:01'
  tags:
  - name: Windows
    versions: []
  - name: dualboot
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

# Linux, Windowsのデュアルブート環境で、Windows側の日付と時刻が同期しない問題
## 解決方法
Windows側でハードウェアクロックをUTCで扱うように設定する。
以下実行後は再起動必須。
```pwsh
reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\TimeZoneInformation" /v RealTimeIsUniversal /t REG_DWORD /d 1 /f
```
