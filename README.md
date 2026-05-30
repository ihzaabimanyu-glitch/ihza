# 🎯 Sistem Absen Wajah (Face Detection Website)

Website interaktif untuk absensi wajah real-time menggunakan teknologi AI dan machine learning.

## ✨ Fitur Utama

- 🎥 **Deteksi Wajah Real-Time**: Mendeteksi wajah secara langsung dari webcam Anda
- 📊 **Statistik Deteksi**: Menampilkan jumlah wajah, akurasi, dan FPS
- 📸 **Ambil Foto**: Tangkap hasil deteksi dan simpan ke gallery
- 👤 **Informasi Wajah**: Menampilkan detail setiap wajah yang terdeteksi
- 🎨 **Interface Modern**: Desain yang cantik dan responsif
- 📱 **Mobile Friendly**: Dapat digunakan di berbagai perangkat

## 🛠️ Teknologi yang Digunakan

- **HTML5**: Struktur halaman web
- **CSS3**: Styling dengan gradient dan animasi
- **JavaScript (Vanilla)**: Logika aplikasi
- **TensorFlow.js**: Framework machine learning di browser
- **BlazeFace**: Model deteksi wajah yang cepat dan akurat

## 📋 Persyaratan

- Browser modern dengan dukungan:
  - WebRTC (untuk akses kamera)
  - Canvas API
  - WebGL (untuk TensorFlow.js)
- Koneksi internet (untuk load library dari CDN)
- Kamera/Webcam pada perangkat Anda

## 🚀 Cara Menggunakan

1. **Buka halaman website**: Akses file `index.html` melalui browser
2. **Klik "Mulai Deteksi"**: Sistem akan meminta izin akses kamera
3. **Berikan izin**: Izinkan browser mengakses kamera Anda
4. **Lihat deteksi real-time**: Wajah akan terdeteksi otomatis dengan bounding box
5. **Ambil foto**: Klik tombol "Ambil Foto" untuk menangkap hasil
6. **Kelola gallery**: Lihat dan hapus foto dari gallery yang ada

## 📊 Informasi yang Ditampilkan

### Statistik Deteksi
- **Wajah Terdeteksi**: Jumlah wajah yang terdeteksi
- **FPS**: Frame per second (kecepatan pemrosesan)
- **Akurasi**: Persentase kepercayaan deteksi (0-100%)
- **Status**: Status sistem saat ini

### Detail Setiap Wajah
- **ID Wajah**: Nomor urut wajah
- **Posisi**: Koordinat X, Y di layar
- **Ukuran**: Lebar dan tinggi bounding box
- **Akurasi**: Persentase kepercayaan deteksi

## 🎨 Komponen UI

```
┌─────────────────────────────────────────────┐
│            HEADER (Judul)                   │
├──────────────────┬──────────────────────────┤
│                  │                          │
│   VIDEO STREAM   │   STATISTIK & INFO      │
│   & CONTROLS     │   - Face Count          │
│                  │   - FPS                 │
│                  │   - Akurasi             │
├──────────────────┴──────────────────────────┤
│            GALLERY (FOTO HASIL)             │
├─────────────────────────────────────────────┤
│              FOOTER                         │
└─────────────────────────────────────────────┘
```

## 🔧 Cara Menjalankan

### Menggunakan Python (Simple HTTP Server)
```bash
cd /workspaces/ihza
python -m http.server 8000
```
Kemudian buka browser ke: `http://localhost:8000`

### Menggunakan Node.js
```bash
npx http-server
```

### Menggunakan VS Code Live Server
- Install extension "Live Server"
- Right-click pada `index.html`
- Pilih "Open with Live Server"

## 📁 Struktur File

```
ihza/
├── index.html       # File HTML utama
├── styles.css       # File CSS untuk styling
├── app.js          # File JavaScript untuk logika deteksi
└── README.md       # File dokumentasi (ini)
```

## 🔍 Cara Kerja Algoritma

1. **Video Capture**: Mengambil frame dari webcam
2. **Input Processing**: Memproses frame untuk model
3. **Face Detection**: BlazeFace model mendeteksi wajah
4. **Draw Predictions**: Menggambar bounding box dan info
5. **Update Statistics**: Memperbarui statistik di UI
6. **Loop**: Ulangi setiap frame

## ⚙️ Konfigurasi

Untuk mengubah resolusi kamera, edit di `app.js`:

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
    video: {
        width: { ideal: 1280 },      // Ubah ukuran lebar
        height: { ideal: 720 },      // Ubah ukuran tinggi
        facingMode: 'user'           // 'user' atau 'environment'
    }
});
```

## 🎯 Tips Penggunaan

- **Pencahayaan Baik**: Pastikan tempat Anda cukup terang
- **Jarak Optimal**: Tempatkan wajah 30cm-1m dari kamera
- **Posisi Natural**: Wajah menghadap kamera untuk hasil terbaik
- **Hindari Cahaya Samping**: Cahaya dari samping dapat mengurangi akurasi
- **Browser Terbaru**: Gunakan browser versi terbaru untuk performa optimal

## 🐛 Troubleshooting

### Kamera tidak bisa diakses
- Periksa izin kamera di browser
- Pastikan tidak ada aplikasi lain yang menggunakan kamera
- Restart browser

### Model tidak mau memuat
- Pastikan koneksi internet stabil
- Coba refresh halaman
- Periksa console untuk error messages

### FPS rendah
- Turunkan resolusi kamera
- Tutup tab/aplikasi lain yang berat
- Gunakan browser yang lebih ringan

### Deteksi tidak akurat
- Tingkatkan pencahayaan di sekitar Anda
- Posisikan wajah lebih dekat ke kamera
- Hindari shadows di wajah

## 📈 Performa

- **Model Size**: ~100KB (BlazeFace)
- **Latency**: ~20-50ms per frame
- **Memory Usage**: ~100-200MB
- **Browser Support**: Chrome, Firefox, Edge, Safari (terbaru)

## 📝 Lisensi

Proyek ini menggunakan library open-source:
- TensorFlow.js (Apache 2.0)
- BlazeFace (Apache 2.0)

## 👨‍💻 Developer

Dibuat dengan ❤️ menggunakan TensorFlow.js dan teknologi web modern.

## 🔗 Referensi

- [TensorFlow.js Documentation](https://www.tensorflow.org/js)
- [BlazeFace Model](https://github.com/tensorflow/tfjs-models/tree/master/blazeface)
- [Web APIs - getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

## 🎉 Terima Kasih

Terima kasih telah menggunakan Sistem Deteksi Wajah kami. Jika ada pertanyaan atau saran, silakan buat issue atau discussion.

---

**Versi**: 1.0.0  
**Updated**: 2026  
**Status**: ✅ Production Ready
