// Variabel global
let video = null;
let canvas = null;
let ctx = null;
let model = null;
let isDetecting = false;
let detectionFrames = 0;
let lastFrameTime = Date.now();
let currentFPS = 0;
let attendanceRecords = [];

// DOM Elements
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const captureBtn = document.getElementById('captureBtn');
const loading = document.getElementById('loading');
const faceCountEl = document.getElementById('faceCount');
const fpsEl = document.getElementById('fps');
const accuracyEl = document.getElementById('accuracy');
const statusEl = document.getElementById('status');
const facesList = document.getElementById('facesList');
const attendanceCountEl = document.getElementById('attendanceCount');
const attendanceList = document.getElementById('attendanceList');
const gallery = document.getElementById('gallery');
const gallerySection = document.getElementById('gallerySection');

// Inisialisasi
window.addEventListener('DOMContentLoaded', async () => {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    // Load model
    await loadModel();

    // Event listeners
    startBtn.addEventListener('click', startDetection);
    stopBtn.addEventListener('click', stopDetection);
    captureBtn.addEventListener('click', capturePhoto);
});

// Load BlazeFace model
async function loadModel() {
    try {
        loading.classList.add('active');
        loading.textContent = 'Memuat model deteksi wajah...';
        
        // Load BlazeFace model
        model = await blazeface.load();
        
        loading.classList.remove('active');
        console.log('Model berhasil dimuat');
    } catch (error) {
        console.error('Error memuat model:', error);
        loading.textContent = '❌ Gagal memuat model. Silakan refresh halaman.';
    }
}

// Mulai deteksi
async function startDetection() {
    try {
        startBtn.disabled = true;
        loading.classList.add('active');
        loading.textContent = 'Meminta izin kamera...';

        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            },
            audio: false
        });

        video.srcObject = stream;
        video.onloadedmetadata = () => {
            video.play();
            
            // Setup canvas
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            loading.classList.remove('active');
            isDetecting = true;
            stopBtn.disabled = false;
            captureBtn.disabled = false;
            
            // Update status
            updateStatus('Mendeteksi...', 'detecting');
            
            // Mulai detection loop
            detectFaces();
        };
    } catch (error) {
        console.error('Error mengakses kamera:', error);
        alert('Tidak dapat mengakses kamera. Pastikan browser memiliki izin.');
        startBtn.disabled = false;
        loading.classList.remove('active');
    }
}

// Hentikan deteksi
function stopDetection() {
    isDetecting = false;
    
    // Stop video stream
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Reset UI
    startBtn.disabled = false;
    stopBtn.disabled = true;
    captureBtn.disabled = true;
    faceCountEl.textContent = '0';
    fpsEl.textContent = '0';
    accuracyEl.textContent = '0%';
    updateStatus('Siap', 'idle');
    facesList.innerHTML = '<p class="empty-message">Belum ada wajah terdeteksi</p>';
}

// Loop deteksi wajah
async function detectFaces() {
    if (!isDetecting) return;

    try {
        // Ambil prediksi dari model
        const predictions = await model.estimateFaces(video, false);

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw video ke canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (predictions && predictions.length > 0) {
            // Draw predictions
            predictions.forEach((prediction, idx) => {
                drawFace(prediction, idx);
            });

            // Update statistics
            updateStats(predictions);
        } else {
            // Tidak ada wajah terdeteksi
            faceCountEl.textContent = '0';
            accuracyEl.textContent = '0%';
            facesList.innerHTML = '<p class="empty-message">Belum ada wajah terdeteksi</p>';
        }

        // Hitung FPS
        detectionFrames++;
        const now = Date.now();
        const elapsed = now - lastFrameTime;
        
        if (elapsed >= 1000) {
            currentFPS = Math.round((detectionFrames * 1000) / elapsed);
            fpsEl.textContent = currentFPS;
            detectionFrames = 0;
            lastFrameTime = now;
        }

        // Lanjut ke frame berikutnya
        requestAnimationFrame(detectFaces);
    } catch (error) {
        console.error('Error dalam deteksi:', error);
        requestAnimationFrame(detectFaces);
    }
}

// Draw bounding box dan landmark
function drawFace(prediction, idx) {
    const start = prediction.start;
    const end = prediction.end;
    const width = end[0] - start[0];
    const height = end[1] - start[1];

    // Draw bounding box
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.strokeRect(start[0], start[1], width, height);

    // Draw label background
    ctx.fillStyle = '#667eea';
    ctx.fillRect(start[0], start[1] - 30, 200, 30);

    // Draw label text
    const confidence = (prediction.probability[0] * 100).toFixed(1);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`Wajah #${idx + 1} (${confidence}%)`, start[0] + 10, start[1] - 12);

    // Draw landmarks (mata, hidung, telinga, mulut)
    if (prediction.landmarks) {
        drawLandmarks(prediction.landmarks);
    }
}

// Draw facial landmarks
function drawLandmarks(landmarks) {
    ctx.fillStyle = '#00f2fe';
    
    landmarks.forEach(landmark => {
        ctx.beginPath();
        ctx.arc(landmark[0], landmark[1], 5, 0, 2 * Math.PI);
        ctx.fill();
    });
}

// Update statistik
function updateStats(predictions) {
    if (predictions && predictions.length > 0) {
        faceCountEl.textContent = predictions.length;
        
        // Hitung rata-rata akurasi
        const avgAccuracy = (
            predictions.reduce((sum, p) => sum + (p.probability[0] * 100), 0) / 
            predictions.length
        ).toFixed(1);
        accuracyEl.textContent = avgAccuracy + '%';

        // Update daftar wajah
        updateFacesList(predictions);
        
        // Update status
        updateStatus('Mendeteksi...', 'detecting');
    }
}

// Update daftar wajah terdeteksi
function updateFacesList(predictions) {
    if (predictions.length === 0) {
        facesList.innerHTML = '<p class="empty-message">Belum ada wajah terdeteksi</p>';
        return;
    }

    let html = '';
    predictions.forEach((prediction, idx) => {
        const confidence = (prediction.probability[0] * 100).toFixed(1);
        const start = prediction.start;
        const end = prediction.end;
        const width = (end[0] - start[0]).toFixed(0);
        const height = (end[1] - start[1]).toFixed(0);

        html += `
            <div class="face-item">
                <div class="face-info">
                    <strong>Wajah #${idx + 1}</strong><br>
                    <small>Posisi: (${start[0].toFixed(0)}, ${start[1].toFixed(0)})<br>
                    Ukuran: ${width}x${height}px</small>
                </div>
                <div class="face-confidence">${confidence}%</div>
            </div>
        `;
    });

    facesList.innerHTML = html;
}

// Tangkap foto dan catat absen
function capturePhoto() {
    const faceCount = parseInt(faceCountEl.textContent, 10) || 0;
    if (faceCount === 0) {
        updateStatus('Tidak ada wajah untuk absen', 'idle');
        return;
    }

    // Buat foto dari canvas
    const photoCanvas = document.createElement('canvas');
    photoCanvas.width = canvas.width;
    photoCanvas.height = canvas.height;
    const photoCtx = photoCanvas.getContext('2d');
    photoCtx.drawImage(canvas, 0, 0);
    const imageData = photoCanvas.toDataURL('image/jpeg');

    // Tambah ke gallery
    addToGallery(imageData);

    // Catat absen
    const now = new Date();
    attendanceRecords.unshift({
        time: now.toLocaleString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }),
        faces: faceCount,
        accuracy: accuracyEl.textContent
    });
    renderAttendanceList();

    updateStatus('Absen berhasil dicatat!', 'success');
    setTimeout(() => {
        if (isDetecting) {
            updateStatus('Mendeteksi...', 'detecting');
        }
    }, 2000);
}

// Render daftar absen
function renderAttendanceList() {
    attendanceCountEl.textContent = attendanceRecords.length;

    if (attendanceRecords.length === 0) {
        attendanceList.innerHTML = '<p class="empty-message">Belum ada absen</p>';
        return;
    }

    attendanceList.innerHTML = attendanceRecords.map((record, idx) => {
        return `
            <div class="attendance-item">
                <div>
                    <strong>Absen #${attendanceRecords.length - idx}</strong><br>
                    <small>${record.time}</small>
                </div>
                <div class="attendance-meta">
                    <span>${record.faces} wajah</span>
                    <span>${record.accuracy}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Tambah foto ke gallery
function addToGallery(imageData) {
    gallerySection.style.display = 'block';
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML = `
        <img src="${imageData}" alt="Hasil Absen">
        <button class="delete-btn">Hapus</button>
    `;

    const deleteBtn = item.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
        item.remove();
        if (gallery.children.length === 0) {
            gallerySection.style.display = 'none';
        }
    });

    item.addEventListener('click', event => {
        if (event.target !== deleteBtn) {
            openImageModal(imageData);
        }
    });

    gallery.prepend(item);
}

// Buka foto dalam modal besar
function openImageModal(imageData) {
    let modal = document.querySelector('.modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="modal-close">×</span>
                <img src="${imageData}" alt="Foto Absen">
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.classList.remove('active');
        });
        modal.addEventListener('click', event => {
            if (event.target === modal) {
                modal.classList.remove('active');
            }
        });
    } else {
        modal.querySelector('img').src = imageData;
    }

    modal.classList.add('active');
}

// Update status
function updateStatus(text, className) {
    statusEl.textContent = text;
    statusEl.className = 'status-' + className;
}

// Tangkap foto
function capturePhoto() {
    // Buat canvas baru untuk menyimpan foto
    const photoCanvas = document.createElement('canvas');
    photoCanvas.width = canvas.width;
    photoCanvas.height = canvas.height;
    const photoCtx = photoCanvas.getContext('2d');
    
    // Copy canvas ke photo canvas
    photoCtx.drawImage(canvas, 0, 0);
    
    // Convert ke image
    const imageData = photoCanvas.toDataURL('image/jpeg');
    
    // Tambah ke gallery
    addToGallery(imageData);
    
    // Show success message
    updateStatus('Foto berhasil diambil!', 'success');
    setTimeout(() => {
        if (isDetecting) {
            updateStatus('Mendeteksi...', 'detecting');
        }
    }, 2000);
}

// Tambah ke gallery
function addToGallery(imageData) {
    // Show gallery section
    gallerySection.style.display = 'block';
    
    // Create gallery item
    const item = document.createElement('div');
    item.className = 'gallery-item';
    
    const timestamp = new Date().toLocaleString('id-ID');
    
    item.innerHTML = `
        <img src="${imageData}" alt="Deteksi wajah">
        <button class="delete-btn">Hapus</button>
        <div style="position: absolute; bottom: 10px; left: 10px; background: rgba(0,0,0,0.7); color: white; padding: 5px 10px; border-radius: 5px; font-size: 0.8em; z-index: 5;">
            ${timestamp}
        </div>
    `;
    
    // Event listener untuk delete
    item.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        item.remove();
        
        // Hide gallery jika kosong
        if (gallery.children.length === 0) {
            gallerySection.style.display = 'none';
        }
    });
    
    // Event listener untuk view fullscreen
    item.addEventListener('click', () => {
        showPhotoModal(imageData);
    });
    
    gallery.appendChild(item);
}

// Show foto fullscreen
function showPhotoModal(imageData) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close">&times;</span>
            <img src="${imageData}" alt="Foto deteksi wajah">
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Download foto
function downloadPhoto(imageData, filename = 'deteksi-wajah.jpg') {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = filename;
    link.click();
}

console.log('Aplikasi Deteksi Wajah siap digunakan!');
