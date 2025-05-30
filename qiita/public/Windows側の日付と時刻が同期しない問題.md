---
updated_at: '2025-04-28T20:04:53+09:00'
private: false
id: 18f0f23c6c19b32e9d3d
organization_url_name: null
slide: false
ignorePublish: false
title: 'Windows側の日付と時刻が同期しない問題'
tags:
  - 'Windows'
  - 'DualBoot'
abbrlink: 34194
date: 2025-04-20 04:10:01
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
