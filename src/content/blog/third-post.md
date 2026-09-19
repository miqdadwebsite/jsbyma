---
title: 'Cara blokir website tertentu'
description: 'Cara blokir website tertentu di Windows 11, mudah dan gratis'
category: 'Tutorial'
pubDate: 'Sept 19 2026'
heroImage: '../../assets/block_website.png'
---

1. Buka Notepad sebagai Administrator
Klik Start, cari Notepad, lalu klik kanan → Run as administrator.

2. Buka file hosts
Di Notepad pilih File → Open.

Masuk ke:
C:\Windows\System32\drivers\etc

Ubah pilihan file dari Text Documents menjadi All Files.

Buka file:
hosts

3. Tambahkan website yang ingin diblokir

Di bagian paling bawah tambahkan:

```html
127.0.0.1 youtube.com
127.0.0.1 www.youtube.com
```

Bisa tambahkan website lain:

```html
127.0.0.1 instagram.com

127.0.0.1 www.instagram.com

127.0.0.1 tiktok.com

127.0.0.1 www.tiktok.com
```
4. Simpan file hosts.

5. Bersihkan DNS cache

Buka Command Prompt sebagai Administrator, lalu jalankan:

ipconfig /flushdns

Coba buka websitenya lagi.

Biasanya website akan gagal dibuka karena domain tersebut diarahkan ke komputer sendiri.
