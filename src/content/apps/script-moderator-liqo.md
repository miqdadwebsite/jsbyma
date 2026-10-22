---
title: "Script Moderator Liqo"
description: "Script otomatis untuk moderasi grup Liqo. Dilengkapi fitur anti-spam, filter kata, dan laporan aktivitas harian."
version: "2.1.0"
category: "Automation"
platform: ["Windows", "Linux"]
downloadUrl: "https://github.com/jsbyma/liqo-mod/releases"
sourceUrl: "https://github.com/jsbyma/liqo-mod"
size: "8 MB"
pubDate: 2024-03-15
isFree: true
isOpenSource: true
featured: true
---

## Tentang Aplikasi

Script Moderator Liqo adalah alat otomasi yang dirancang khusus untuk memudahkan pengelolaan grup Liqo. Dengan fitur-fitur canggih, script ini membantu moderator menjalankan tugas secara efisien.

## Fitur Utama

- **Anti-Spam** — Deteksi dan hapus pesan spam secara otomatis
- **Filter Kata** — Buat daftar kata terlarang yang bisa dikustomisasi
- **Auto-Welcome** — Sambut anggota baru dengan pesan yang bisa dipersonalisasi
- **Laporan Harian** — Ringkasan aktivitas grup dikirim setiap hari
- **Manajemen Member** — Kick/ban member yang melanggar aturan

## Cara Instalasi

```bash
git clone https://github.com/jsbyma/liqo-mod
cd liqo-mod
npm install
npm start
```

## Konfigurasi

Edit file `config.json` untuk mengatur token bot, ID grup, dan aturan filter.
