document.addEventListener('DOMContentLoaded', function () {
  const slider = document.getElementById('slider');
  const dots = document.querySelectorAll('.dot');
  const progressBar = document.querySelector('.progress-bar');
  const coverSection = document.getElementById('cover');
  const musicToggle = document.getElementById('musicToggle');
  const weddingMusic = document.getElementById('wedding-music');
  const openBtn = document.getElementById('openBtn');

  let currentSlide = 0;
  const totalSlides = document.querySelectorAll('.slide').length;
  let autoSlideInterval;
  let isMusicPlaying = false;
  let galleryInterval;
  let galleryInitialized = false;
  let currentGallerySlide = 0;

  // Musik toggle
  function toggleMusic() {
    if (!weddingMusic) return;

    if (isMusicPlaying) {
      weddingMusic.pause();
      musicToggle.innerHTML = '<i class="fas fa-play"></i>';
      isMusicPlaying = false;
    } else {
      weddingMusic.play().then(() => {
        musicToggle.innerHTML = '<i class="fas fa-pause"></i>';
        isMusicPlaying = true;
      }).catch(err => {
        console.log("Autoplay prevented:", err);
      });
    }
  }

  if (musicToggle && weddingMusic) {
    musicToggle.addEventListener('click', toggleMusic);
    musicToggle.style.display = "none";
  }

  // Nama tamu
  function getParameterByName(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  function displayGuestName() {
    const guestName = getParameterByName('to');
    const guestNameElement = document.getElementById('guest-name');
    if (guestNameElement) {
      guestNameElement.textContent = guestName ? decodeURIComponent(guestName.replace(/\+/g, ' ')) : "Tamu Undangan";
    }
  }

  // Buka undangan
  function openInvitation() {
    coverSection.classList.add('hidden');
    slider.style.opacity = '1';
    if (document.querySelector('.nav-dots')) {
      document.querySelector('.nav-dots').style.display = 'flex';
    }
    startAutoSlide();

    updateCountdown();
    setInterval(updateCountdown, 1000);

    if (currentSlide === 4) {
      initGallerySlider();
    }

    if (weddingMusic) {
      weddingMusic.play().then(() => {
        isMusicPlaying = true;
        if (musicToggle) musicToggle.innerHTML = '<i class="fas fa-pause"></i>';
      }).catch(err => {
        console.log("Butuh interaksi user untuk play musik");
      });

      if (musicToggle) musicToggle.style.display = "block";
    }
  }

  // Slider utama
  function startAutoSlide() {
    stopAutoSlide();
    autoSlideInterval = setInterval(() => {
      currentSlide = (currentSlide < totalSlides - 1) ? currentSlide + 1 : 0;
      updateSlider();
    }, 8000);
  }

  function stopAutoSlide() {
    clearInterval(autoSlideInterval);
  }

  function updateSlider() {
    slider.style.transform = `translateX(-${currentSlide * (100 / totalSlides)}%)`;

    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentSlide);
    });

    if (progressBar) {
      progressBar.style.width = `${((currentSlide + 1) / totalSlides) * 100}%`;
    }

    document.querySelectorAll('.slide-content').forEach(content => {
      content.classList.remove('animate-in');
    });

    const currentSlideElement = document.querySelectorAll('.slide')[currentSlide];
    if (currentSlideElement) {
      const slideContent = currentSlideElement.querySelector('.slide-content');
      if (slideContent) {
        slideContent.classList.add('animate-in');
      }
    }
    
    // Inisialisasi gallery hanya jika pindah ke slide gallery (slide-5, index 4)
    if (currentSlide === 4 && !galleryInitialized) {
      initGallerySlider();
    } else if (currentSlide !== 4) {
      // Hentikan interval gallery jika keluar dari slide gallery
      clearInterval(galleryInterval);
      galleryInitialized = false;
    }
  }

  function goToSlide(slideIndex) {
    if (slideIndex >= 0 && slideIndex < totalSlides) {
      stopAutoSlide();
      currentSlide = slideIndex;
      updateSlider();
      startAutoSlide();
    }
  }

  function nextSlide() {
    stopAutoSlide();
    currentSlide = (currentSlide < totalSlides - 1) ? currentSlide + 1 : 0;
    updateSlider();
    startAutoSlide();
  }

  function prevSlide() {
    stopAutoSlide();
    currentSlide = (currentSlide > 0) ? currentSlide - 1 : totalSlides - 1;
    updateSlider();
    startAutoSlide();
  }

  // Countdown
  function updateCountdown() {
    const weddingDate = new Date('September 11, 2025 10:00:00').getTime();
    const now = new Date().getTime();
    const distance = weddingDate - now;

    const updateElement = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = Math.max(0, value);
    };

    if (distance > 0) {
      updateElement('days', Math.floor(distance / (1000 * 60 * 60 * 24)));
      updateElement('hours', Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
      updateElement('minutes', Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
      updateElement('seconds', Math.floor((distance % (1000 * 60)) / 1000));
    }
  }

  // Dots
  dots.forEach(dot => {
    dot.addEventListener('click', function () {
      const slideIndex = parseInt(this.getAttribute('data-slide'));
      if (!isNaN(slideIndex)) goToSlide(slideIndex);
    });
  });

  // Keyboard nav
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') prevSlide();
    else if (e.key === 'ArrowRight') nextSlide();
  });

  // Swipe untuk slider utama
  let touchStartX = 0;
  let touchEndX = 0;

  if (slider) {
    slider.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    });

    slider.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeThreshold = 50;
      if (touchEndX < touchStartX - swipeThreshold) nextSlide();
      else if (touchEndX > touchStartX + swipeThreshold) prevSlide();
    });
  }

  // Gallery slider - DIPERBAIKI
  function initGallerySlider() {
    if (galleryInitialized) return;
    galleryInitialized = true;
    
    const galleryTrack = document.querySelector('.gallery-track');
    if (!galleryTrack) return;

    const gallerySlides = galleryTrack.querySelectorAll('img');
    const totalGallerySlides = gallerySlides.length;

    if (totalGallerySlides === 0) return;

    function updateGallery() {
      galleryTrack.style.transform = `translateX(-${currentGallerySlide * 100}%)`;
    }

    const leftArrow = document.querySelector('.gallery-left');
    const rightArrow = document.querySelector('.gallery-right');

    // Hapus event listener lama dan tambahkan yang baru
    if (leftArrow) {
      leftArrow.replaceWith(leftArrow.cloneNode(true));
      document.querySelector('.gallery-left').addEventListener('click', handleLeftClick);
    }
    
    if (rightArrow) {
      rightArrow.replaceWith(rightArrow.cloneNode(true));
      document.querySelector('.gallery-right').addEventListener('click', handleRightClick);
    }

    function handleLeftClick() {
      clearInterval(galleryInterval);
      
      if (currentGallerySlide > 0) {
        currentGallerySlide--;
        updateGallery();
      }
      
      startGalleryInterval();
    }

    function handleRightClick() {
      clearInterval(galleryInterval);
      
      if (currentGallerySlide < totalGallerySlides - 1) {
        currentGallerySlide++;
        updateGallery();
        startGalleryInterval();
      } else {
        clearInterval(galleryInterval);
        nextSlide();
      }
    }

    // Fungsi untuk memulai interval gallery
    function startGalleryInterval() {
      clearInterval(galleryInterval);
      
      galleryInterval = setInterval(() => {
        if (currentGallerySlide < totalGallerySlides - 1) {
          currentGallerySlide++;
          updateGallery();
        } else {
          clearInterval(galleryInterval);
          nextSlide();
        }
      }, 5000);
    }

    // Mulai interval gallery
    startGalleryInterval();

    // Swipe untuk gallery
    let gTouchStartX = 0;
    let gTouchEndX = 0;

    galleryTrack.addEventListener('touchstart', function (e) {
      gTouchStartX = e.changedTouches[0].screenX;
      clearInterval(galleryInterval);
    });

    galleryTrack.addEventListener('touchend', function (e) {
      gTouchEndX = e.changedTouches[0].screenX;
      const swipeThreshold = 50;
      
      if (gTouchEndX < gTouchStartX - swipeThreshold) {
        if (currentGallerySlide < totalGallerySlides - 1) {
          currentGallerySlide++;
          updateGallery();
          startGalleryInterval();
        } else {
          nextSlide();
        }
      } else if (gTouchEndX > gTouchStartX + swipeThreshold) {
        if (currentGallerySlide > 0) {
          currentGallerySlide--;
          updateGallery();
          startGalleryInterval();
        }
      } else {
        startGalleryInterval();
      }
    });

    // Inisialisasi awal
    updateGallery();
  }

  // Init
  if (openBtn) openBtn.addEventListener('click', openInvitation);

  displayGuestName();

  slider.style.opacity = '0';
  if (document.querySelector('.nav-dots')) {
    document.querySelector('.nav-dots').style.display = 'none';
  }

  updateSlider();

  // Cegah scroll vertical saat swipe
  // Cegah scroll hanya untuk slider, bukan semua elemen
document.body.addEventListener('touchmove', function (e) {
  // kalau targetnya ada di dalam .slide-content, biarkan scroll
  if (e.target.closest('.slide-content')) {
    return; // jangan preventDefault
  }
  if (e.touches.length > 0 && e.cancelable) {
    e.preventDefault();
  }
}, { passive: false });

});