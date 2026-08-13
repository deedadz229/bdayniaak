/* ==========================================
   NEO-BRUTALISM BIRTHDAY WEBSITE
   Core Interactive Logic, Music & Confetti Engines
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  // Clear any legacy localStorage state so user's direct HTML edits are 100% respected
  localStorage.removeItem('neo_bday_state');

  // ==========================================
  // 1. BACKGROUND MUSIC CONTROLLER
  // ==========================================
  const bgMusic = document.getElementById('bg-music');
  const musicToggleBtn = document.getElementById('music-toggle-btn');
  const musicIcon = document.getElementById('music-icon');
  let isMusicPlaying = false;
  let userInteracted = false;

  function playMusic() {
    if (!bgMusic) return;
    bgMusic.play().then(() => {
      isMusicPlaying = true;
      if (musicIcon) musicIcon.textContent = '🎵 MUSIC: ON';
      if (musicToggleBtn) {
        musicToggleBtn.classList.remove('brutal-btn-white');
        musicToggleBtn.classList.add('brutal-btn-yellow');
      }
    }).catch(err => {
      console.log('Autoplay prevented by browser, waiting for user interaction:', err);
      isMusicPlaying = false;
      if (musicIcon) musicIcon.textContent = '🔇 MUSIC: OFF';
      if (musicToggleBtn) {
        musicToggleBtn.classList.remove('brutal-btn-yellow');
        musicToggleBtn.classList.add('brutal-btn-white');
      }
    });
  }

  function pauseMusic() {
    if (!bgMusic) return;
    bgMusic.pause();
    isMusicPlaying = false;
    if (musicIcon) musicIcon.textContent = '🔇 MUSIC: OFF';
    if (musicToggleBtn) {
      musicToggleBtn.classList.remove('brutal-btn-yellow');
      musicToggleBtn.classList.add('brutal-btn-white');
    }
  }

  function toggleMusic() {
    if (isMusicPlaying) {
      pauseMusic();
      showToast('Music Paused ⏸️');
    } else {
      playMusic();
      showToast('Music Playing 🎵');
    }
  }

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userInteracted = true;
      toggleMusic();
    });
  }

  // Auto-start music on first user click/tap anywhere on page
  function startMusicOnFirstInteraction() {
    if (!userInteracted && !isMusicPlaying) {
      userInteracted = true;
      playMusic();
    }
    document.removeEventListener('click', startMusicOnFirstInteraction);
    document.removeEventListener('keydown', startMusicOnFirstInteraction);
    document.removeEventListener('touchstart', startMusicOnFirstInteraction);
  }

  document.addEventListener('click', startMusicOnFirstInteraction);
  document.addEventListener('keydown', startMusicOnFirstInteraction);
  document.addEventListener('touchstart', startMusicOnFirstInteraction);

  // Tab Visibility Change Handler: Pause music when leaving page, resume when entering page
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (bgMusic && !bgMusic.paused) {
        bgMusic.pause();
      }
    } else {
      if (isMusicPlaying && bgMusic) {
        bgMusic.play().catch(e => console.log('Resume blocked on return:', e));
      }
    }
  });

  window.addEventListener('blur', () => {
    if (bgMusic && !bgMusic.paused) {
      bgMusic.pause();
    }
  });

  window.addEventListener('focus', () => {
    if (isMusicPlaying && bgMusic && !document.hidden) {
      bgMusic.play().catch(e => console.log('Focus resume blocked:', e));
    }
  });

  // ==========================================
  // 2. SOUND SYNTHESIZER FOR CLICK EFFECTS
  // ==========================================
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playPopSound() {
    initAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.09);
  }

  function playFanfareSound() {
    initAudio();
    if (!audioCtx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const startTime = audioCtx.currentTime + (idx * 0.1);
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.36);
    });
  }

  // ==========================================
  // 3. CANVAS CONFETTI ENGINE
  // ==========================================
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let particles = [];

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const confettiColors = ['#FFE600', '#FF3366', '#00E5FF', '#00E676', '#FF9100', '#9D4EDD'];

  function createConfettiBurst(x, y, count = 70) {
    if (!canvas || !ctx) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      particles.push({
        x: x || window.innerWidth / 2,
        y: y || window.innerHeight / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: Math.random() * 12 + 6,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        shape: Math.random() > 0.4 ? 'rect' : 'circle',
        opacity: 1
      });
    }
  }

  function updateConfetti() {
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25;
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.008;

      if (p.opacity <= 0 || p.y > window.innerHeight + 20) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillStyle = p.color;
      ctx.strokeStyle = '#121212';
      ctx.lineWidth = 1.5;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.strokeRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }

    requestAnimationFrame(updateConfetti);
  }

  updateConfetti();

  // ==========================================
  // 4. SURPRISE GIFT BOX INTERACTION
  // ==========================================
  const giftTrigger = document.getElementById('gift-box-trigger');
  const openSurpriseBtn = document.getElementById('open-surprise-btn');
  const giftBox = document.getElementById('gift-box');
  const surpriseReveal = document.getElementById('surprise-card-reveal');

  let surpriseOpened = false;

  function triggerSurprise() {
    if (surpriseOpened) {
      createConfettiBurst(window.innerWidth / 2, window.innerHeight / 2, 80);
      playFanfareSound();
      return;
    }

    surpriseOpened = true;
    giftBox.classList.add('gift-box-shake');
    playPopSound();

    setTimeout(() => {
      giftBox.classList.remove('gift-box-shake');
      giftBox.classList.add('gift-box-opened');

      createConfettiBurst(window.innerWidth / 2, window.innerHeight / 2, 100);
      setTimeout(() => createConfettiBurst(window.innerWidth * 0.3, window.innerHeight * 0.4, 60), 200);
      setTimeout(() => createConfettiBurst(window.innerWidth * 0.7, window.innerHeight * 0.4, 60), 400);

      playFanfareSound();
      surpriseReveal.classList.add('active');
      openSurpriseBtn.textContent = '🎉 CELEBRATE AGAIN!';
      showToast('Surprise Unlocked! 🎁');
    }, 450);
  }

  if (giftTrigger) giftTrigger.addEventListener('click', triggerSurprise);
  if (openSurpriseBtn) openSurpriseBtn.addEventListener('click', triggerSurprise);

  // ==========================================
  // 5. PHOTO CARD PREVIEW LIGHTBOX MODAL
  // ==========================================
  const galleryGrid = document.getElementById('gallery-grid');
  const photoViewModal = document.getElementById('photo-view-modal');
  const photoViewClose = document.getElementById('photo-view-close');
  const photoViewImg = document.getElementById('photo-view-img');
  const photoViewCaption = document.getElementById('photo-view-caption');

  if (galleryGrid) {
    galleryGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.photo-card');
      if (card && photoViewModal) {
        const img = card.querySelector('img');
        const caption = card.querySelector('.photo-caption');

        if (img && photoViewImg) photoViewImg.src = img.src;
        if (caption && photoViewCaption) photoViewCaption.textContent = caption.textContent;

        photoViewModal.classList.add('active');
        playPopSound();
        createConfettiBurst(window.innerWidth / 2, window.innerHeight / 2, 40);
      }
    });
  }

  if (photoViewClose) {
    photoViewClose.addEventListener('click', () => {
      if (photoViewModal) photoViewModal.classList.remove('active');
    });
  }

  if (photoViewModal) {
    photoViewModal.addEventListener('click', (e) => {
      if (e.target === photoViewModal) {
        photoViewModal.classList.remove('active');
      }
    });
  }

  // Final Confetti Button
  const finalConfettiBtn = document.getElementById('final-confetti-btn');
  if (finalConfettiBtn) {
    finalConfettiBtn.addEventListener('click', () => {
      playFanfareSound();
      createConfettiBurst(window.innerWidth / 2, window.innerHeight * 0.8, 120);
    });
  }

  // ==========================================
  // 6. TOAST NOTIFICATION UTILITY
  // ==========================================
  function showToast(msg) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // ==========================================
  // 7. CUSTOM CURSOR & MICRO-INTERACTIONS
  // ==========================================
  const cursor = document.getElementById('custom-cursor');
  if (cursor && window.innerWidth > 992) {
    window.addEventListener('mousemove', (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    });

    document.querySelectorAll('button, a, .photo-card, .wish-card, input, textarea').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
      el.addEventListener('click', playPopSound);
    });
  }

  // Welcome Confetti Burst
  setTimeout(() => {
    createConfettiBurst(window.innerWidth / 2, window.innerHeight / 3, 50);
  }, 400);

});
