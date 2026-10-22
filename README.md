# IG HAR Analyzer

Dashboard berbahasa Indonesia untuk menganalisis performa konten Instagram dari file HAR. Aplikasi terdiri dari **satu file `index.html`**, tanpa backend dan tanpa instalasi.

## Buka aplikasi

- Website: **https://ivanbunardi.github.io/insta-scraper/**
- Atau unduh `index.html`, lalu buka langsung di Chrome.
- Internet diperlukan untuk memuat Chart.js dan SheetJS dari CDN. Parser, tabel, dan perhitungan tetap lokal; ekspor Excel dan grafik memerlukan library CDN tersebut.
- Gunakan tombol **Coba dengan data demo** sebelum mengupload HAR Anda.

## Fitur

- Upload beberapa HAR, respons base64/UTF-8 dan beberapa JSON berurutan, penelusuran skema rekursif, normalisasi format Instagram lama/baru, serta deduplikasi.
- Pilih akun, edit follower, filter tanggal WIB/format, KPI, performa format, tren, heatmap, frekuensi, caption/hashtag, dan insight otomatis.
- Tabel/grid dengan pencarian dan pengurutan; detail post, ranking akun, navigasi post, serta perbandingan 2–3 post.
- Ekspor CSV/Excel dan Print / Save PDF; mode terang/gelap dan tampilan responsif.

## Privasi dan batas data

HAR diproses di memori browser dan tidak diunggah ke server. Thumbnail dimatikan secara default; mengaktifkannya menghubungi server gambar. Library dimuat dari CDN. Hanya preferensi tema disimpan di localStorage.

**Jangan membagikan HAR non-sanitized:** file tersebut dapat memuat cookie, token, dan data login. Gunakan **Export HAR (sanitized)** dari Chrome DevTools.

Report hanya mencakup post yang termuat dalam HAR. Saves, shares, dan reach tidak tersedia; gunakan Instagram Insights / Meta Business Suite untuk data tersebut. ER berbasis follower memakai jumlah follower saat ini/input manual, bukan jumlah historis. Jika follower kosong, ER hanya dihitung untuk Reels dengan views yang tersedia. Field kosong dan likes tersembunyi tidak diubah menjadi nol.

## Deployment GitHub Pages

Workflow `.github/workflows/pages.yml` menjalankan uji parser, kemudian memublikasikan **hanya `index.html`** ke GitHub Pages pada setiap push ke `main`. Output pengujian dan file HAR tidak ikut dalam artifact website.

Pada repository GitHub, buka **Settings → Pages → Build and deployment → Source: GitHub Actions**. Deployment dapat dipantau melalui tab **Actions**. Tidak ada dependency aplikasi yang perlu diinstal atau secret tambahan untuk workflow ini.

Alur ini menggunakan [workflow resmi GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Uji parser

Dengan Node.js 20 atau lebih baru:

```sh
node tests/parser.cjs
```

Uji memakai data sintetis, termasuk skema lama/baru, base64, emoji, JSON berurutan, likes tersembunyi, alias id/shortcode, ER, konversi WIB, dan proteksi formula CSV. Fixture dihasilkan di folder `output/` yang diabaikan Git.

