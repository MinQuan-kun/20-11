// ==========================================================
// JAVASCRIPT CHO DỰ ÁN BÓ HOA & HOẠT ẢNH MỞ PHONG THƯ 3D
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Cánh hoa rơi tự nhiên nhẹ nhàng
  initFallingPetals();

  // 2. Chuỗi hoạt ảnh phong bì mở nắp 180 độ và lá thư trượt ra
  initEnvelopeAnimation();

  // 3. Hệ thống âm thanh êm dịu (MP3 / Synth)
  initBackgroundMusic();
});

/* ----------------------------------------------------------
   1. CÁNH HOA BAY TRÊN MÀN HÌNH (GENTLE PETALS)
   ---------------------------------------------------------- */
function initFallingPetals() {
  const container = document.getElementById('petals-container');
  if (!container) return;

  // Gam màu hoa khô vintage: hồng đất, đỏ rượu mờ, trắng ngà
  const petalColors = [
    'rgba(184, 42, 62, 0.45)',
    'rgba(217, 125, 98, 0.4)',
    'rgba(242, 173, 148, 0.5)',
    'rgba(166, 44, 62, 0.35)',
    'rgba(247, 239, 225, 0.45)'
  ];

  function createPetal() {
    const petal = document.createElement('div');
    petal.className = 'petal';

    const size = 10 + Math.random() * 14;
    const left = Math.random() * 100;
    const duration = 7 + Math.random() * 8;
    const color = petalColors[Math.floor(Math.random() * petalColors.length)];

    petal.style.width = `${size}px`;
    petal.style.height = `${size * 1.35}px`;
    petal.style.left = `${left}vw`;
    petal.style.background = color;
    petal.style.animationDuration = `${duration}s`;

    container.appendChild(petal);

    setTimeout(() => {
      petal.remove();
    }, duration * 1000);
  }

  setInterval(createPetal, 600);
  for (let i = 0; i < 10; i++) {
    setTimeout(createPetal, i * 250);
  }
}

/* ----------------------------------------------------------
   2. HOẠT ẢNH MỞ PHONG THƯ 3D (STAGED ANIMATION)
   ---------------------------------------------------------- */
function initEnvelopeAnimation() {
  const bouquetStage = document.getElementById('bouquetStage');
  const envelopeOverlay = document.getElementById('envelopeOverlay');
  const envelopeContainer = document.getElementById('envelopeContainer');
  const envelope = document.getElementById('envelope');
  const closeBtn = document.getElementById('closeLetterBtn');

  let isAnimating = false;

  // Chuỗi hành động mở thư mượt mà theo từng giai đoạn
  function startOpeningEnvelope() {
    if (isAnimating) return;
    isAnimating = true;

    // Giai đoạn 1: Hiện phong bì xuất hiện ở trung tâm
    envelopeOverlay.classList.add('show');
    envelopeContainer.classList.add('show');
    envelope.classList.remove('is-opened');
    envelope.classList.remove('is-opening');

    // Giai đoạn 2: Sau 400ms, lật mở nắp phong bì tam giác (Flap rotates 180deg)
    setTimeout(() => {
      envelope.classList.add('is-opening');
    }, 450);

    // Giai đoạn 3: Sau khi nắp đã lật mở, lá thư từ từ trượt lên phía trên
    setTimeout(() => {
      envelope.classList.add('is-opened');
      isAnimating = false;
    }, 1100);
  }

  // Đóng thư lại
  function closeEnvelope() {
    if (isAnimating) return;
    isAnimating = true;

    // Trượt lá thư thụt lại vào trong
    envelope.classList.remove('is-opened');

    // Sau khi thư đã vào túi, gập nắp phong bì lại
    setTimeout(() => {
      envelope.classList.remove('is-opening');
    }, 450);

    // Ẩn toàn bộ modal phong thư
    setTimeout(() => {
      envelopeContainer.classList.remove('show');
      envelopeOverlay.classList.remove('show');
      isAnimating = false;
    }, 950);
  }

  if (bouquetStage) bouquetStage.addEventListener('click', startOpeningEnvelope);
  if (closeBtn) closeBtn.addEventListener('click', closeEnvelope);
  if (envelopeOverlay) envelopeOverlay.addEventListener('click', closeEnvelope);

  // Phím ESC đóng thư
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeEnvelope();
  });
}

/* ----------------------------------------------------------
   3. HỆ THỐNG ÂM THANH DU DƯƠNG (AUDIO)
   ---------------------------------------------------------- */
function initBackgroundMusic() {
  const musicBtn = document.getElementById('musicToggleBtn');
  if (!musicBtn) return;

  let isMuted = localStorage.getItem('bouquet_music_muted') === 'true';

  const audioEl = new Audio('audio/bg-music.mp3');
  audioEl.loop = true;
  audioEl.volume = 0.45;

  let useSynth = false;
  let synthContext = null;
  let synthTimer = null;

  // Giai điệu piano C major êm dịu, ấm áp
  const melodyNotes = [
    261.63, 293.66, 329.63, 392.00, 440.00, 523.25,
    392.00, 329.63, 293.66, 261.63, 329.63, 392.00,
    440.00, 523.25, 587.33, 523.25, 440.00, 392.00,
    329.63, 293.66, 261.63, 196.00, 220.00, 261.63
  ];
  let noteIndex = 0;

  function initSynth() {
    if (!synthContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) synthContext = new AudioCtx();
    }
    if (synthContext && synthContext.state === 'suspended') {
      synthContext.resume();
    }
  }

  function playTone(freq, duration = 1.3) {
    if (isMuted || !synthContext) return;
    try {
      const osc = synthContext.createOscillator();
      const gain = synthContext.createGain();
      const now = synthContext.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.06, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(synthContext.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  function startSynthMelody() {
    if (synthTimer) clearInterval(synthTimer);
    initSynth();
    synthTimer = setInterval(() => {
      if (!isMuted && useSynth) {
        const freq = melodyNotes[noteIndex % melodyNotes.length];
        playTone(freq, 1.4);
        if (noteIndex % 4 === 0) playTone(freq / 2, 2.0);
        noteIndex++;
      }
    }, 950);
  }

  function stopSynthMelody() {
    if (synthTimer) {
      clearInterval(synthTimer);
      synthTimer = null;
    }
  }

  function startMusic() {
    if (isMuted) return;

    audioEl.play().then(() => {
      useSynth = false;
    }).catch(() => {
      useSynth = true;
      startSynthMelody();
    });
  }

  function updateButtonUI() {
    const textSpan = musicBtn.querySelector('.music-text');
    if (isMuted) {
      musicBtn.classList.add('muted');
      if (textSpan) textSpan.textContent = 'Âm thanh: Tắt';
    } else {
      musicBtn.classList.remove('muted');
      if (textSpan) textSpan.textContent = 'Âm thanh';
    }
  }

  musicBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    isMuted = !isMuted;
    localStorage.setItem('bouquet_music_muted', isMuted);
    updateButtonUI();

    if (isMuted) {
      audioEl.pause();
      stopSynthMelody();
    } else {
      startMusic();
    }
  });

  function handleFirstGesture() {
    if (!isMuted) startMusic();
    window.removeEventListener('click', handleFirstGesture);
    window.removeEventListener('keydown', handleFirstGesture);
    window.removeEventListener('touchstart', handleFirstGesture);
  }

  window.addEventListener('click', handleFirstGesture);
  window.addEventListener('keydown', handleFirstGesture);
  window.addEventListener('touchstart', handleFirstGesture);

  updateButtonUI();
}
