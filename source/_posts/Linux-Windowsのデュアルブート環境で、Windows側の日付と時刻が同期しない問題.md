---
title: 'Linux, Windowsのデュアルブート環境で、Windows側の日付と時刻が同期しない問題'
tags: 'Windows, DualBoot'
abbrlink: 34194
date: 2025-04-20 04:10:01
---

# Linux, Windowsのデュアルブート環境で、Windows側の日付と時刻が同期しない問題
## 解決方法
Windows側でハードウェアクロックをUTCで扱うように設定する。
以下実行後は再起動必須。
```pwsh
reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\TimeZoneInformation" /v RealTimeIsUniversal /t REG_DWORD /d 1 /f
```
