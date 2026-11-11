/**
 * Happy 10th Monthversary - Interactive Script
 * Features: Floating Hearts Canvas, Anniversary Counter, Music Player,
 * 3D Envelope & Letter Modal, Ragunan Highlights, Filterable Flip Gallery,
 * Confetti Celebrations, and Theme Switcher.
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. THEME TOGGLE (Blush Blossom Light & Velvet Midnight Dark)
     ========================================================================== */
  const themeToggleBtn = document.getElementById('theme-toggle');
  const htmlRoot = document.documentElement;

  // Initialize theme from localStorage or default to light
  const savedTheme = localStorage.getItem('monthversary_theme') || 'light';
  setTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      createFloatingBurst(window.innerWidth / 2, 80, ['#ff7597', '#c77dff']);
    });
  }

  function setTheme(theme) {
    htmlRoot.setAttribute('data-theme', theme);
    localStorage.setItem('monthversary_theme', theme);
    if (themeToggleBtn) {
      const icon = themeToggleBtn.querySelector('i');
      if (icon) {
        if (theme === 'dark') {
          icon.className = 'fa-solid fa-sun';
          themeToggleBtn.setAttribute('title', 'Ganti ke Mode Terang (Blush)');
        } else {
          icon.className = 'fa-solid fa-moon';
          themeToggleBtn.setAttribute('title', 'Ganti ke Mode Gelap (Midnight)');
        }
      }
    }
  }


  /* ==========================================================================
     2. FLOATING HEARTS BACKGROUND CANVAS
     ========================================================================== */
  const canvas = document.getElementById('hearts-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const particleCount = 28;

    function resizeCanvas() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Heart Particle Class
    class HeartParticle {
      constructor(isBurst = false, x = 0, y = 0) {
        this.reset(isBurst, x, y);
      }

      reset(isBurst = false, startX = 0, startY = 0) {
        this.x = isBurst ? startX : Math.random() * width;
        this.y = isBurst ? startY : height + Math.random() * 50;
        this.size = isBurst ? Math.random() * 16 + 10 : Math.random() * 18 + 8;
        this.speedY = isBurst ? (Math.random() - 0.5) * 6 - 2 : Math.random() * 1.2 + 0.5;
        this.speedX = isBurst ? (Math.random() - 0.5) * 6 : Math.sin(Math.random() * Math.PI) * 0.8;
        this.opacity = isBurst ? 1 : Math.random() * 0.55 + 0.2;
        this.fade = isBurst ? 0.02 + Math.random() * 0.02 : 0;
        this.swing = Math.random() * 2;
        this.swingSpeed = Math.random() * 0.02 + 0.01;
        this.swingAngle = Math.random() * Math.PI * 2;
        
        const colors = ['#ff5c8a', '#ff85a1', '#fbb1bd', '#ff477e', '#ff9ebb'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.isBurst = isBurst;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.globalAlpha = Math.max(0, this.opacity);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        
        // Draw Heart Shape using Beziers
        const s = this.size;
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-s / 2, -s / 2, -s, s / 3, 0, s);
        ctx.bezierCurveTo(s, s / 3, s / 2, -s / 2, 0, 0);
        ctx.fill();
        ctx.restore();
      }

      update() {
        if (this.isBurst) {
          this.x += this.speedX;
          this.y += this.speedY;
          this.opacity -= this.fade;
          this.speedY += 0.08; // gravity
        } else {
          this.swingAngle += this.swingSpeed;
          this.x += Math.sin(this.swingAngle) * this.swing;
          this.y -= this.speedY;

          if (this.y < -50) {
            this.reset();
          }
        }
      }
    }

    for (let i = 0; i < particleCount; i++) {
      const p = new HeartParticle();
      p.y = Math.random() * height; // initial spread
      particles.push(p);
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();

        if (p.isBurst && p.opacity <= 0) {
          particles.splice(i, 1);
        }
      }

      requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // Burst particles function
    window.createFloatingBurst = function(x, y, customColors) {
      for (let i = 0; i < 18; i++) {
        const p = new HeartParticle(true, x, y);
        if (customColors && customColors.length) {
          p.color = customColors[Math.floor(Math.random() * customColors.length)];
        }
        particles.push(p);
      }
    };

    // Click anywhere for a little heart sparkle
    window.addEventListener('click', (e) => {
      // Don't burst if clicking directly on buttons or inputs to avoid distraction
      const target = e.target;
      if (!target.closest('button, input, a')) {
        createFloatingBurst(e.clientX, e.clientY);
      }
    });
  }


  /* ==========================================================================
     3. ANNIVERSARY LIVE COUNTER
     ========================================================================== */
  // Default anniversary date: Exactly 10 months ago from today (11 Januari 2026 00:00:00)
  const DEFAULT_DATE = "2026-01-11T00:00:00";
  let anniversaryDateStr = localStorage.getItem('monthversary_start_date') || DEFAULT_DATE;

  const countMonthsEl = document.getElementById('count-months');
  const countDaysEl = document.getElementById('count-days');
  const countHoursEl = document.getElementById('count-hours');
  const countMinutesEl = document.getElementById('count-minutes');
  const countSecondsEl = document.getElementById('count-seconds');
  const dateDisplayEl = document.getElementById('anniversary-date-display');
  const letterDateEl = document.getElementById('letter-date-display');

  function updateCounter() {
    const startDate = new Date(anniversaryDateStr);
    const now = new Date();
    
    // Difference in milliseconds
    let diff = now.getTime() - startDate.getTime();
    if (diff < 0) diff = 0;

    // Calculate total months and extra days accurately
    let startYear = startDate.getFullYear();
    let startMonth = startDate.getMonth();
    let startDay = startDate.getDate();

    let currentYear = now.getFullYear();
    let currentMonth = now.getMonth();
    let currentDay = now.getDate();

    let totalMonths = (currentYear - startYear) * 12 + (currentMonth - startMonth);
    let pastAnnivDay = new Date(currentYear, currentMonth, startDay);

    if (now < pastAnnivDay) {
      totalMonths--;
      pastAnnivDay = new Date(currentYear, currentMonth - 1, startDay);
    }

    const daysRemaining = Math.floor((now.getTime() - pastAnnivDay.getTime()) / (1000 * 60 * 60 * 24));
    
    // Total hours, minutes, seconds of current day
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    if (countMonthsEl) countMonthsEl.textContent = totalMonths >= 0 ? totalMonths : 10;
    if (countDaysEl) countDaysEl.textContent = daysRemaining >= 0 ? daysRemaining : 0;
    if (countHoursEl) countHoursEl.textContent = String(hours).padStart(2, '0');
    if (countMinutesEl) countMinutesEl.textContent = String(minutes).padStart(2, '0');
    if (countSecondsEl) countSecondsEl.textContent = String(seconds).padStart(2, '0');
  }

  function formatIndonesianDate(dateObj) {
    const monthsIndo = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${dateObj.getDate()} ${monthsIndo[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
  }

  function renderDateInfo() {
    const startDate = new Date(anniversaryDateStr);
    const formatted = formatIndonesianDate(startDate);
    if (dateDisplayEl) {
      dateDisplayEl.innerHTML = `<i class="fa-regular fa-calendar-check"></i> Dimulai sejak: <strong>${formatted}</strong>`;
    }
    if (letterDateEl) {
      letterDateEl.textContent = formatIndonesianDate(new Date());
    }
  }

  renderDateInfo();
  updateCounter();
  setInterval(updateCounter, 1000);

  // Date Setting Modal Handlers
  const dateModal = document.getElementById('date-setting-modal');
  const btnOpenDateSetting = document.getElementById('btn-open-date-setting');
  const btnQuickEdit = document.getElementById('btn-quick-edit-date');
  const btnCloseDateModal = document.getElementById('btn-close-date-modal');
  const inputDate = document.getElementById('input-anniversary-date');
  const btnSaveDate = document.getElementById('btn-save-date');
  const btnResetDate = document.getElementById('btn-reset-date');

  function openDateModal() {
    if (inputDate) {
      // Format for datetime-local input
      const d = new Date(anniversaryDateStr);
      const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      inputDate.value = iso;
    }
    dateModal.classList.add('active');
  }

  function closeDateModal() {
    dateModal.classList.remove('active');
  }

  if (btnOpenDateSetting) btnOpenDateSetting.addEventListener('click', openDateModal);
  if (btnQuickEdit) btnQuickEdit.addEventListener('click', openDateModal);
  if (btnCloseDateModal) btnCloseDateModal.addEventListener('click', closeDateModal);

  if (btnSaveDate) {
    btnSaveDate.addEventListener('click', () => {
      if (inputDate && inputDate.value) {
        anniversaryDateStr = inputDate.value;
        localStorage.setItem('monthversary_start_date', anniversaryDateStr);
        renderDateInfo();
        updateCounter();
        closeDateModal();
        triggerConfetti(window.innerWidth / 2, window.innerHeight / 2);
      }
    });
  }

  if (btnResetDate) {
    btnResetDate.addEventListener('click', () => {
      anniversaryDateStr = DEFAULT_DATE;
      localStorage.setItem('monthversary_start_date', DEFAULT_DATE);
      renderDateInfo();
      updateCounter();
      closeDateModal();
    });
  }


  /* ==========================================================================
     4. MUSIC PLAYER CONTROLLER
     ========================================================================== */
  const audio = document.getElementById('bg-audio');
  const musicWidget = document.getElementById('music-widget');
  const widgetPlayBtn = document.getElementById('widget-play-btn');
  const widgetVolumeBtn = document.getElementById('widget-volume-btn');
  const navMusicBtn = document.getElementById('music-toggle-btn');
  const musicProgress = document.getElementById('music-progress');
  const audioToast = document.getElementById('audio-prompt-toast');
  const btnAcceptMusic = document.getElementById('btn-accept-music');
  const btnDismissMusic = document.getElementById('btn-dismiss-music');

  let isPlaying = false;
  let isMuted = false;

  // Fallback Romantic Melodic Synthesizer using Web Audio API
  let audioCtx = null;
  let synthInterval = null;
  const romanticMelody = [
    // Chords / notes for gentle romantic acoustic chime
    { freq: 261.63, dur: 0.6 }, // C4
    { freq: 329.63, dur: 0.6 }, // E4
    { freq: 392.00, dur: 0.8 }, // G4
    { freq: 523.25, dur: 1.2 }, // C5
    { freq: 440.00, dur: 0.6 }, // A4
    { freq: 349.23, dur: 0.6 }, // F4
    { freq: 329.63, dur: 0.8 }, // E4
    { freq: 293.66, dur: 1.2 }  // D4
  ];
  let melodyIdx = 0;

  function playSynthTone(freq, dur) {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  }

  function startSynthFallback() {
    if (synthInterval) clearInterval(synthInterval);
    synthInterval = setInterval(() => {
      if (isPlaying && !isMuted) {
        const note = romanticMelody[melodyIdx % romanticMelody.length];
        playSynthTone(note.freq, note.dur);
        melodyIdx++;
      }
    }, 700);
  }

  function stopSynthFallback() {
    if (synthInterval) {
      clearInterval(synthInterval);
      synthInterval = null;
    }
  }

  function togglePlayMusic() {
    if (!isPlaying) {
      playMusic();
    } else {
      pauseMusic();
    }
  }

  function playMusic() {
    if (!audio) return;
    
    audio.play().then(() => {
      setMusicState(true);
      hideAudioToast();
    }).catch(err => {
      console.log('Audio autoplay prevented, starting gentle melody fallback:', err);
      setMusicState(true);
      startSynthFallback();
      hideAudioToast();
    });
  }

  function pauseMusic() {
    if (audio) audio.pause();
    stopSynthFallback();
    setMusicState(false);
  }

  function setMusicState(playing) {
    isPlaying = playing;
    if (playing) {
      if (musicWidget) musicWidget.classList.add('playing');
      if (navMusicBtn) navMusicBtn.classList.add('playing');
      if (widgetPlayBtn) widgetPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    } else {
      if (musicWidget) musicWidget.classList.remove('playing');
      if (navMusicBtn) navMusicBtn.classList.remove('playing');
      if (widgetPlayBtn) widgetPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }
  }

  if (widgetPlayBtn) widgetPlayBtn.addEventListener('click', togglePlayMusic);
  if (navMusicBtn) navMusicBtn.addEventListener('click', togglePlayMusic);

  if (widgetVolumeBtn) {
    widgetVolumeBtn.addEventListener('click', () => {
      isMuted = !isMuted;
      if (audio) audio.muted = isMuted;
      widgetVolumeBtn.innerHTML = isMuted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
    });
  }

  if (audio) {
    audio.addEventListener('timeupdate', () => {
      if (audio.duration && musicProgress) {
        const pct = (audio.currentTime / audio.duration) * 100;
        musicProgress.style.width = `${pct}%`;
      }
    });
    audio.addEventListener('ended', () => {
      audio.currentTime = 0;
      audio.play();
    });
  }

  // Audio prompt toast for browsers requiring user gesture
  function showAudioToast() {
    if (!isPlaying && audioToast && !sessionStorage.getItem('music_prompt_dismissed')) {
      setTimeout(() => {
        audioToast.classList.add('show');
      }, 1500);
    }
  }

  function hideAudioToast() {
    if (audioToast) {
      audioToast.classList.remove('show');
      sessionStorage.setItem('music_prompt_dismissed', 'true');
    }
  }

  if (btnAcceptMusic) {
    btnAcceptMusic.addEventListener('click', () => {
      playMusic();
      hideAudioToast();
    });
  }

  if (btnDismissMusic) {
    btnDismissMusic.addEventListener('click', hideAudioToast);
  }

  showAudioToast();


  /* ==========================================================================
     5. HERO ACTIONS & SMOOTH SCROLL
     ========================================================================== */
  const btnExplore = document.getElementById('btn-explore');
  const btnSurprise = document.getElementById('btn-surprise');
  const btnVirtualHug = document.getElementById('btn-virtual-hug');

  if (btnExplore) {
    btnExplore.addEventListener('click', (e) => {
      // Auto start music on explore click if not yet playing
      if (!isPlaying) playMusic();
    });
  }

  if (btnSurprise) {
    btnSurprise.addEventListener('click', (e) => {
      triggerHeartShower();
      createFloatingBurst(e.clientX, e.clientY);
    });
  }

  if (btnVirtualHug) {
    btnVirtualHug.addEventListener('click', (e) => {
      triggerHeartShower();
      showToastMessage('Pelukan hangat paling erat terkirim ke hatimu! 🤗💖');
    });
  }


  /* ==========================================================================
     6. CONFETTI & HEART SHOWER EFFECTS
     ========================================================================== */
  function triggerConfetti(originX, originY) {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: {
          x: originX ? originX / window.innerWidth : 0.5,
          y: originY ? originY / window.innerHeight : 0.6
        },
        colors: ['#ff5c8a', '#ff85a1', '#fbb1bd', '#e63946', '#ffd166', '#c77dff'],
        shapes: ['circle', 'square']
      });
    }
  }

  function triggerHeartShower() {
    if (typeof confetti === 'function') {
      // Continuous romantic shower
      const end = Date.now() + 2.5 * 1000;
      const colors = ['#ff5c8a', '#ff85a1', '#ff477e', '#ffd166'];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.65 },
          colors: colors
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.65 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }
  }


  /* ==========================================================================
     7. LOVE LETTER / ENVELOPE MODAL
     ========================================================================== */
  const envelopeTrigger = document.getElementById('envelope-trigger');
  const letterModal = document.getElementById('letter-modal');
  const btnCloseLetter = document.getElementById('btn-close-letter');
  const btnSendConfetti = document.getElementById('btn-send-confetti');
  const btnReplyWa = document.getElementById('btn-reply-wa');

  function openLoveLetter() {
    if (!isPlaying) playMusic();
    
    // Add open animation to envelope
    if (envelopeTrigger) {
      envelopeTrigger.classList.add('envelope-open');
    }

    triggerConfetti();

    setTimeout(() => {
      if (letterModal) {
        letterModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    }, 450);
  }

  function closeLoveLetter() {
    if (letterModal) {
      letterModal.classList.remove('active');
      document.body.style.overflow = '';
    }
    if (envelopeTrigger) {
      envelopeTrigger.classList.remove('envelope-open');
    }
  }

  if (envelopeTrigger) {
    envelopeTrigger.addEventListener('click', openLoveLetter);
    envelopeTrigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLoveLetter();
      }
    });
  }

  if (btnCloseLetter) {
    btnCloseLetter.addEventListener('click', closeLoveLetter);
  }

  if (letterModal) {
    letterModal.addEventListener('click', (e) => {
      if (e.target === letterModal) closeLoveLetter();
    });
  }

  if (btnSendConfetti) {
    btnSendConfetti.addEventListener('click', () => {
      triggerHeartShower();
    });
  }

  if (btnReplyWa) {
    btnReplyWa.addEventListener('click', () => {
      const message = encodeURIComponent(
        "Selamat 10th Monthversary sayang! 💖 Aku udah baca surat romantisnya, terharu banget... Makasih banyak yaa! Aku sayang banget sama kamu juga, hari ini dan selamanya! 🥰✨"
      );
      window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
    });
  }


  /* ==========================================================================
     8. INTERACTIVE GALLERY & 3D FLIP CARDS & LIGHTBOX
     ========================================================================== */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const btnCloseLightbox = document.getElementById('btn-close-lightbox');
  const btnLikePhoto = document.getElementById('btn-like-photo');
  const likeCountEl = document.getElementById('like-count');

  // Filter Functionality
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const itemCat = item.getAttribute('data-category');
        if (filterVal === 'all' || itemCat === filterVal) {
          item.style.display = 'block';
          item.style.animation = 'fadeInUp 0.4s ease forwards';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Mobile Tap to Flip Support
  galleryItems.forEach(item => {
    item.addEventListener('click', (e) => {
      if (!e.target.closest('.btn-view-large')) {
        item.classList.toggle('is-flipped');
      }
    });
  });

  // Lightbox View Large
  const viewLargeBtns = document.querySelectorAll('.btn-view-large');
  viewLargeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const imgSrc = btn.getAttribute('data-img');
      const caption = btn.getAttribute('data-caption') || 'Kenangan Indah Bersama';

      if (lightbox && lightboxImg && lightboxCaption) {
        lightboxImg.src = imgSrc;
        lightboxCaption.textContent = caption;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (btnCloseLightbox) btnCloseLightbox.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  // Like Photo in Lightbox
  let totalLikes = parseInt(localStorage.getItem('monthversary_likes') || '10', 10);
  if (likeCountEl) likeCountEl.textContent = totalLikes;

  if (btnLikePhoto) {
    btnLikePhoto.addEventListener('click', (e) => {
      totalLikes++;
      if (likeCountEl) likeCountEl.textContent = totalLikes;
      localStorage.setItem('monthversary_likes', totalLikes);
      createFloatingBurst(e.clientX, e.clientY);
      btnLikePhoto.classList.add('liked');
      setTimeout(() => btnLikePhoto.classList.remove('liked'), 300);
    });
  }


  /* ==========================================================================
     9. SCROLL REVEAL OBSERVER
     ========================================================================== */
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-visible'));
  }


  /* ==========================================================================
     10. SWEET TOAST POPUP NOTIFICATION
     ========================================================================== */
  function showToastMessage(msg) {
    let toast = document.querySelector('.sweet-toast-box');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'sweet-toast-box';
      toast.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        background: var(--bg-card);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid var(--border-glass);
        color: var(--primary-pink);
        padding: 12px 24px;
        border-radius: 9999px;
        box-shadow: var(--shadow-lg);
        font-weight: 700;
        font-size: 0.95rem;
        z-index: 9999;
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        align-items: center;
        gap: 10px;
      `;
      document.body.appendChild(toast);
    }
    
    toast.innerHTML = `<i class="fa-solid fa-heart"></i> ${msg}`;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(-20px)';
    }, 3500);
  }

});
