# Studio Undangan Nusantara

Tools berbasis Python untuk membuat dan mengedit surat undangan dengan UI visual:

- Panel edit komponen di kiri.
- Template undangan besar di tengah.
- Garis konektor dari editor ke komponen template.
- Semua komponen bisa diedit: teks, tanggal, logo, tanda tangan, posisi, ukuran, warna.
- Template siap pakai: `Rapat Resmi`, `Pernikahan`, `Seminar/Workshop`, `Ulang Tahun`, `Aqiqah`.

## Jalankan

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Lalu buka browser ke: `http://127.0.0.1:5000`

## Deploy Gratis di Render (Sampai Live)

### 1. Push project ke GitHub

```powershell
git init
git add .
git commit -m "deploy-ready for render"
```

Lalu buat repo baru di GitHub dan push branch utama.

### 2. Deploy via Blueprint Render (paling cepat)

1. Login ke [render.com](https://render.com).
2. Klik `New` -> `Blueprint`.
3. Connect repo GitHub kamu.
4. Render akan membaca file `render.yaml` otomatis.
5. Klik `Apply` / `Create`.
6. Tunggu build selesai (status `Live`).

Service sudah otomatis pakai:
- Build: `pip install -r requirements.txt`
- Start: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 180`
- Health check: `/healthz`

### 3. Link live

Setelah status `Live`, kamu dapat URL seperti:

`https://studio-undangan-nusantara.onrender.com`

### 4. Cek cepat setelah live

- Buka `/healthz` -> harus tampil JSON `{"ok": true, ...}`.
- Buka halaman utama app.
- Coba load template dan test export PNG/PDF.

### 5. Update app setelah ada perubahan

Setiap kali kamu push ke GitHub, Render auto redeploy (karena `autoDeploy: true`).

## Catatan Render Free

- Service free bisa sleep saat tidak ada trafik.
- Request pertama setelah idle biasanya butuh waktu boot beberapa detik.

## Fitur utama

- Drag komponen langsung di preview.
- Upload gambar untuk logo/tanda tangan/QR.
- Export dan import template JSON.
- Download hasil desain ke PNG kualitas tinggi.
- Download PDF langsung dari aplikasi.
- Download DOCX editable langsung dari aplikasi.
- Mode kertas `2-up` (satu kertas berisi 2 undangan kiri-kanan) untuk preview, print, PNG, dan PDF.
- Mode `2-up beda isi`: undangan kanan bisa pakai template berbeda dari undangan kiri.
- Preset ukuran kertas produksi: `A4`, `F4`, `Letter` (portrait/landscape), plus margin mm.
- Cut marks otomatis untuk bantu potong hasil cetak.
- Undo/Redo (termasuk shortcut `Ctrl+Z` / `Ctrl+Y`).
- Template Builder visual di panel kiri: buat template baru dari nol atau clone template aktif.
- Tambah komponen baru dari Builder (`text`, `multiline`, `image`, `signature`) tanpa popup prompt.
- Tambah komponen baru dari Builder (`text`, `multiline`, `image`, `signature`, `line`) tanpa popup prompt.
- Reset template ke default.
- Cetak langsung dari browser.
- Ukuran komponen diubah langsung di canvas via handle resize (kanan, bawah, sudut kanan-bawah).
- Di layar sentuh, komponen bisa diperbesar/diperkecil dengan gesture pinch.

## Catatan export

- Untuk hasil `PNG/PDF` paling stabil, gunakan upload file gambar lokal (logo/ttd) langsung di panel.
- Jika memakai URL gambar eksternal tanpa izin CORS, gambar tertentu bisa gagal ikut dirender saat export.
- Saat mode `2-up beda isi`, pilih template kanan dari dropdown `Template Kanan` di toolbar.
- Untuk hasil cetak siap potong, aktifkan preset kertas + margin + `Cut marks`.

## Alur cepat 2-up beda isi

1. Pilih `Mode Kertas` -> `2 Undangan Kiri-Kanan`.
2. Pilih `Sumber 2-up` -> `Kanan template berbeda`.
3. Pilih template kanan di `Template Kanan`.
4. Atur `Ukuran Kertas`, `Margin`, dan `Cut marks`.
5. Export ke `PDF` atau `PNG`.

## Basis komponen template

Rangkuman riset komponen undangan ada di:

- [docs/research_components.md](docs/research_components.md)
