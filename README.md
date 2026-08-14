# MPL-PK v2.3

Sistem Informasi Litmas & Pembimbingan — Bapas Kelas II Lahat

**UI modern** (Indigo + Teal) · **Statistik rinci** seluruh aspek data

## Menu
- Dashboard
- **Permintaan Litmas** (input tunggal / massal — kategori & tindak pidana **per klien**)
- Registrasi
- Pembagian Litmas (Penunjukan PK)
- **Statistik Rinci** (kategori pidana, tindak pidana, jenis litmas, JK, UPT, beban PK, dll.)
- Master PK & APK, UPT, Pengguna (Admin)

## Nomor Register Otomatis
Format: `0001/MPL/I/2026`

## Input Massal
1. Data surat (No. Surat, Tanggal, UPT, Jenis Litmas, Keterangan) diisi sekali
2. Tiap baris klien: Nama, JK, **Kategori**, **Jenis Tindak Pidana** (boleh berbeda)
3. Register otomatis berurutan

## Login default
| Username | Password | Peran |
|----------|----------|--------|
| admin | admin123 | Admin |
| pk1 | pk123 | PK |

## Deploy
1. Frontend → Vercel / Netlify / Pages  
2. `gas/Code.gs` → Apps Script Web App (Anyone)  
3. Login → Pengaturan → tempel URL `/exec` → Sinkron
