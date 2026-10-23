# IG HAR Analyzer

Dashboard berbahasa Indonesia untuk menganalisis performa konten Instagram dari file HAR. Aplikasi terdiri dari **satu file `index.html`**, tanpa backend dan tanpa instalasi.

## Buka aplikasi

- Website: **https://ivanbunardi.github.io/insta-scraper/**
- Atau unduh `index.html`, lalu buka langsung di Chrome.
- Internet diperlukan untuk memuat Chart.js dan SheetJS dari CDN. Parser, tabel, dan perhitungan tetap lokal; ekspor Excel dan grafik memerlukan library CDN tersebut.
- Gunakan tombol **Coba dengan data demo** sebelum mengupload HAR Anda.

## Fitur

- Dua tab report: **Ringkas** (pilihan awal) berisi hasil utama, perubahan respons, tiga ide tindakan, dan contoh konten; **Lengkap** memuat seluruh filter, tabel, rumus, kualitas data, serta bukti. Akun dan data tetap sama saat berpindah tab. Pilihan bulan diselaraskan antar-tab; pilihan tanpa pembanding hanya berlaku di Ringkas. Filter tanggal utama di Lengkap tidak membatasi ringkasan bulanan.
- Di Ringkas, respons berarti suka + komentar. Nilai konten yang umum memakai median dari post dengan kedua metrik tersedia; penilaian tidak disamakan dengan ER. Jika arah median berlawanan dengan rata-rata atau sampel kurang dari 3, ringkasan menjelaskan keterbatasannya. Tombol untuk kembali ke semua format/data gabungan tersedia bila pengaturan Lengkap membatasi data.

- Upload beberapa HAR, respons base64/UTF-8 dan beberapa JSON berurutan, penelusuran skema rekursif, normalisasi format Instagram lama/baru, serta deduplikasi.
- Pilih akun, edit follower, filter tanggal WIB/format, KPI, performa format, tren, heatmap, frekuensi, caption/hashtag, dan insight otomatis.
- Ringkasan per bulan posting, tombol untuk melihat report satu bulan, serta perbandingan dua bulan (misalnya September dan Oktober): perubahan metrik, ER per format, jumlah sampel, dan saran tindakan berbasis data. Ringkasan bulanan mengikuti akun/format; filter tanggal utama tidak membatasinya.
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
node tests/monthly.cjs
```

Uji memakai data sintetis, termasuk skema lama/baru, base64, emoji, JSON berurutan, likes tersembunyi, alias id/shortcode, ER, konversi WIB, dan proteksi formula CSV. Fixture dihasilkan di folder `output/` yang diabaikan Git.

Perbandingan bulanan memakai bulan terbit post dalam WIB dan snapshot metrik saat HAR diambil, bukan interaksi yang diperoleh khusus pada bulan tersebut. ER follower menggunakan input/snapshot follower yang sama untuk kedua bulan. Cakupan HAR, umur post, komposisi format, dan sampel yang kecil dapat memengaruhi hasil; saran merupakan kandidat eksperimen, bukan bukti sebab-akibat.

## Kualitas data dan bukti insight

- Panel kualitas menampilkan kelengkapan likes/comments/views/ER di antara post yang terdeteksi, likes tersembunyi, waktu pengamatan dari `startedDateTime`, dan median umur post. Kelengkapan bukan bukti bahwa seluruh akun atau bulan sudah direkam; tidak ada skor akurasi atau keyakinan statistik buatan.
- Ringkasan dan perbandingan bulanan menyertakan median serta rata-rata. Jika arah median ER berlawanan dengan rata-rata, kesimpulan meminta pengguna memeriksa distribusi. Setiap insight memiliki daftar post sumber, metrik, rumus atau aturan, dan jumlah sampel. Ide eksperimen dipisahkan dari temuan deskriptif. Ambang 3 sampel untuk saran format hanya penyaring praktis.
- Mode **Metrik gabungan HAR** mempertahankan perilaku deduplikasi: nilai maksimum metrik tersedia, dengan status likes tersembunyi berdasarkan pengamatan eksplisit terakhir. Nilai dapat berasal dari waktu berbeda; ini bukan snapshot tunggal atau pertumbuhan bulanan.
- Mode **Umur post 7 hari (±1 hari)** memilih satu pengamatan asli per post dalam rentang umur 6–8 hari, paling dekat hari ke-7; jika sama dekat, pilih yang lebih awal. Metrik berasal dari satu pengamatan tersebut tanpa interpolasi atau mengambil maksimum pengamatan berikutnya. Hanya bagian bulanan menggunakan mode ini. Report utama tetap memakai data gabungan. Seleksi ini tidak menjamin cakupan lengkap, umur yang persis sama, atau sebab-akibat.
- **Unduh snapshot analisis** menyimpan semua pengamatan yang telah dinormalisasi dari seluruh akun dalam file HAR sintetis yang dapat diunggah kembali. Waktu pengamatan asli dipertahankan, termasuk waktu yang tidak diketahui; cookie/token/header request asli dan follower input tidak disertakan. Caption serta komentar preview termasuk dalam data post yang diunduh. Unduhan dimatikan untuk demo. Riwayat ada di memori browser hingga ditutup; simpan unduhan dan unggah bersama HAR berikutnya untuk mempertahankannya.
- Ambil HAR sekitar hari ke-7 setiap post jika ingin memakai mode umur serupa. Satu HAR hari ini tidak dapat merekonstruksi pengamatan historis. Integrasi/import data resmi Insights belum tersedia; reach, saves, shares, watch time, follower historis, dan pemisahan iklan/organik tidak diasumsikan ada.

