let currentStream = null;
let currentCamera = 'user';
let currentFilter = 'normal';
let capturedPoses = [];

// Dynamic Elements initialization dari WEDDING_CONFIG
document.addEventListener("DOMContentLoaded", () => {
  // Load Config ke Tampilan UI Depan
  document.getElementById("page-title").innerText = `${WEDDING_CONFIG.groomName} & ${WEDDING_CONFIG.brideName} — Wedding Photobooth`;
  document.getElementById("couple-names").innerText = `${WEDDING_CONFIG.groomName} & ${WEDDING_CONFIG.brideName}`;
  document.getElementById("mini-initials").innerText = WEDDING_CONFIG.coupleInitials;
  document.getElementById("wedding-hashtag").innerText = WEDDING_CONFIG.hashtag;
  document.getElementById("wedding-date").innerText = WEDDING_CONFIG.weddingDate;
  document.getElementById("wedding-message").innerText = WEDDING_CONFIG.greetingMessage;
  
  if (WEDDING_CONFIG.heroPhoto) {
    document.getElementById("wedding-hero-img").src = WEDDING_CONFIG.heroPhoto;
  }
  
  // Custom Theme Color
  if (WEDDING_CONFIG.themeColor) {
    document.documentElement.style.setProperty('--accent-color', WEDDING_CONFIG.themeColor);
  }
});

// Pindah Screen
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

function goToLanding() {
  stopCamera();
  showScreen('landing-screen');
}

function goToBooth() {
  showScreen('booth-screen');
  startCamera();
}

// Pengaturan Kamera
async function startCamera() {
  stopCamera();
  try {
    currentStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: currentCamera, width: { ideal: 1280 }, height: { ideal: 960 } },
      audio: false
    });
    document.getElementById('webcam').srcObject = currentStream;
  } catch (err) {
    alert("Gagal mengakses kamera: " + err.message);
  }
}

function stopCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach(t => t.stop());
    currentStream = null;
  }
}

function switchCamera() {
  currentCamera = (currentCamera === 'user') ? 'environment' : 'user';
  startCamera();
}

function setFilter(filterName, btn) {
  currentFilter = filterName;
  document.getElementById('webcam').className = `filter-${filterName}`;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// Sesi Multi Pose Foto
async function startMultiPoseSession() {
  capturedPoses = [];
  const timerOverlay = document.getElementById('timer-overlay');
  const timerNumber = document.getElementById('timer-number');
  const poseIndicator = document.getElementById('pose-indicator');
  const totalPoses = WEDDING_CONFIG.frame.posesCount;

  timerOverlay.style.display = 'flex';

  for (let i = 1; i <= totalPoses; i++) {
    poseIndicator.innerText = `Siap-siap Pose ${i} dari ${totalPoses}`;
    
    // Countdown 3 detik
    for (let c = 3; c > 0; c--) {
      timerNumber.innerText = c;
      await new Promise(r => setTimeout(r, 1000));
    }

    // Efek Flash & Jepret
    triggerFlash();
    captureSinglePose();
    await new Promise(r => setTimeout(r, 800));
  }

  timerOverlay.style.display = 'none';
  stopCamera();
  renderWeddingFrame();
}

function triggerFlash() {
  const flash = document.getElementById('flash');
  flash.style.opacity = '1';
  setTimeout(() => flash.style.opacity = '0', 300);
}

function captureSinglePose() {
  const video = document.getElementById('webcam');
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = video.videoWidth || 640;
  tempCanvas.height = video.videoHeight || 480;
  const ctx = tempCanvas.getContext('2d');

  if (currentCamera === 'user') {
    ctx.translate(tempCanvas.width, 0);
    ctx.scale(-1, 1);
  }

  ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
  capturedPoses.push(tempCanvas.toDataURL('image/png'));
}

// Render Foto ke Frame Wedding
function renderWeddingFrame() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const frameConfig = WEDDING_CONFIG.frame;

  canvas.width = frameConfig.renderWidth;
  canvas.height = frameConfig.renderHeight;

  let loadedImages = 0;
  const frameImg = new Image();
  frameImg.src = frameConfig.src;

  frameImg.onload = () => {
    // Render foto tamu ke slot
    frameConfig.slots.forEach((slot, idx) => {
      if (capturedPoses[idx]) {
        const poseImg = new Image();
        poseImg.src = capturedPoses[idx];
        poseImg.onload = () => {
          // Cropping & Aspect ratio cover
          drawCoverImage(ctx, poseImg, slot.x, slot.y, slot.w, slot.h, currentFilter);
          loadedImages++;
          
          if (loadedImages === frameConfig.slots.length) {
            // Gambar Frame PNG di atas foto
            ctx.drawImage(frameImg, 0, 0, frameConfig.renderWidth, frameConfig.renderHeight);
            
            // Tampilkan Hasil
            const finalDataUrl = canvas.toDataURL('image/jpeg', 0.9);
            document.getElementById('photo-result').src = finalDataUrl;
            showScreen('result-screen');
          }
        };
      }
    });
  };
}

function drawCoverImage(ctx, img, x, y, w, h, filterName) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  // Applikasi Filter Sederhana ke Canvas
  if (filterName === 'bw') ctx.filter = 'grayscale(1)';
  else if (filterName === 'vintage') ctx.filter = 'sepia(0.3)';
  else if (filterName === 'beauty') ctx.filter = 'brightness(1.08) contrast(0.95)';
  else if (filterName === 'radiant') ctx.filter = 'sepia(0.15) brightness(1.05)';

  const imgRatio = img.width / img.height;
  const slotRatio = w / h;
  let renderW, renderH, renderX, renderY;

  if (imgRatio > slotRatio) {
    renderH = h;
    renderW = h * imgRatio;
    renderX = x - (renderW - w) / 2;
    renderY = y;
  } else {
    renderW = w;
    renderH = w / imgRatio;
    renderX = x;
    renderY = y - (renderH - h) / 2;
  }

  ctx.drawImage(img, renderX, renderY, renderW, renderH);
  ctx.restore();
}

// Simpan Foto & Send Wish ke Google Apps Script (Optional)
function savePhotoAndWish() {
  const resultImg = document.getElementById('photo-result').src;
  const guestName = document.getElementById('guest-name').value || "Tamu Anonym";
  const guestWish = document.getElementById('guest-wish').value || "-";
  const statusElem = document.getElementById('upload-status');

  // Trigger Download Lokal
  const link = document.createElement('a');
  link.download = `wedding-${WEDDING_CONFIG.coupleInitials}-${Date.now()}.jpg`;
  link.href = resultImg;
  link.click();

  // Kirim ke Google Sheets & Drive jika URL terpasang
  if (WEDDING_CONFIG.appsScriptUrl && WEDDING_CONFIG.appsScriptUrl.includes("script.google.com")) {
    statusElem.innerText = "Mengirim doa & menyimpan foto ke album...";
    
    fetch(WEDDING_CONFIG.appsScriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: resultImg,
        name: guestName,
        wish: guestWish,
        couple: `${WEDDING_CONFIG.groomName} & ${WEDDING_CONFIG.brideName}`
      })
    }).then(() => {
      statusElem.innerText = "✨ Doa & foto berhasil terkirim ke pengantin!";
    }).catch(() => {
      statusElem.innerText = "Foto tersimpan di HP-mu!";
    });
  }
}

function resetPhoto() {
  goToBooth();
    }
