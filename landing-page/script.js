// ========================================
// NEXT-GEN DARK MODE LANDING PAGE SCRIPT
// GSAP Animations & Interactive Effects
// ========================================

// ===== GSAP TIMELINE SETUP =====
gsap.registerPlugin(ScrollTrigger);

// ===== PERFORMANCE OPTIMIZATION =====
const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== DOM ELEMENTS =====
const cursorGlow = document.getElementById('cursor-glow');
const particlesContainer = document.getElementById('particles');
const heroTitle = document.querySelector('.hero-title');
const heroSubtitle = document.querySelector('.hero-subtitle');
const heroCtas = document.querySelector('.hero-ctas');
const featureCards = document.querySelectorAll('.feature-card');
const statNumbers = document.querySelectorAll('.stat-number');
const interactiveElement = document.querySelector('.interactive-element');
const testimonialsTrack = document.querySelector('.testimonials-track');

// ===== CURSOR GLOW EFFECT =====
let mouseX = 0;
let mouseY = 0;
let glowX = 0;
let glowY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function updateCursorGlow() {
  glowX += (mouseX - glowX) * 0.1;
  glowY += (mouseY - glowY) * 0.1;

  cursorGlow.style.transform = `translate(${glowX - 100}px, ${glowY - 100}px)`;
  requestAnimationFrame(updateCursorGlow);
}

updateCursorGlow();

// ===== PARTICLE SYSTEM =====
function createParticle() {
  const particle = document.createElement('div');
  particle.className = 'particle';

  // Random position
  particle.style.left = Math.random() * 100 + '%';
  particle.style.top = Math.random() * 100 + '%';

  // Random size
  const size = Math.random() * 4 + 2;
  particle.style.width = size + 'px';
  particle.style.height = size + 'px';

  // Random animation duration
  particle.style.animationDuration = (Math.random() * 10 + 15) + 's';

  particlesContainer.appendChild(particle);

  // Remove particle after animation
  setTimeout(() => {
    particle.remove();
  }, 25000);
}

// Create initial particles
for (let i = 0; i < 50; i++) {
  setTimeout(createParticle, Math.random() * 5000);
}

// Create new particles periodically
setInterval(createParticle, 300);

// ===== HERO ANIMATIONS =====
const heroTimeline = gsap.timeline();

if (!isReducedMotion) {
  heroTimeline
    .from(heroTitle, {
      duration: 1.5,
      y: 100,
      opacity: 0,
      ease: "power3.out"
    })
    .from(heroSubtitle, {
      duration: 1,
      y: 50,
      opacity: 0,
      ease: "power2.out"
    }, "-=0.5")
    .from(heroCtas, {
      duration: 0.8,
      y: 30,
      opacity: 0,
      ease: "power2.out"
    }, "-=0.3")
    .from('.floating-mockup', {
      duration: 1.2,
      scale: 0.8,
      opacity: 0,
      ease: "back.out(1.7)"
    }, "-=1");
}

// ===== SCROLL-TRIGGERED ANIMATIONS =====
if (!isReducedMotion) {
  // Feature cards animation
  featureCards.forEach((card, index) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      delay: index * 0.1,
      ease: "power2.out"
    });
  });

  // Showcase section
  gsap.from('.showcase-content', {
    scrollTrigger: {
      trigger: '.showcase',
      start: "top 80%",
      toggleActions: "play none none reverse"
    },
    x: -100,
    opacity: 0,
    duration: 1,
    ease: "power2.out"
  });

  gsap.from('.showcase-visual', {
    scrollTrigger: {
      trigger: '.showcase',
      start: "top 80%",
      toggleActions: "play none none reverse"
    },
    x: 100,
    opacity: 0,
    duration: 1,
    ease: "power2.out"
  });

  // Stats animation
  gsap.from('.stats-grid', {
    scrollTrigger: {
      trigger: '.stats',
      start: "top 80%",
      toggleActions: "play none none reverse"
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: "power2.out"
  });

  // Testimonials animation
  gsap.from('.testimonials h2', {
    scrollTrigger: {
      trigger: '.testimonials',
      start: "top 80%",
      toggleActions: "play none none reverse"
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: "power2.out"
  });

  gsap.from('.testimonial-card', {
    scrollTrigger: {
      trigger: '.testimonials',
      start: "top 70%",
      toggleActions: "play none none reverse"
    },
    y: 30,
    opacity: 0,
    duration: 0.6,
    stagger: 0.2,
    ease: "power2.out"
  });

  // Final CTA animation
  gsap.from('.final-cta h2', {
    scrollTrigger: {
      trigger: '.final-cta',
      start: "top 80%",
      toggleActions: "play none none reverse"
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: "power2.out"
  });

  gsap.from('.final-cta p', {
    scrollTrigger: {
      trigger: '.final-cta',
      start: "top 70%",
      toggleActions: "play none none reverse"
    },
    y: 30,
    opacity: 0,
    duration: 0.6,
    ease: "power2.out"
  });

  gsap.from('.final-cta .btn', {
    scrollTrigger: {
      trigger: '.final-cta',
      start: "top 60%",
      toggleActions: "play none none reverse"
    },
    scale: 0.8,
    opacity: 0,
    duration: 0.6,
    ease: "back.out(1.7)"
  });
}

// ===== COUNT-UP ANIMATION =====
function animateNumbers() {
  statNumbers.forEach(number => {
    const target = parseInt(number.getAttribute('data-target'));
    const duration = 2000; // 2 seconds
    const step = target / (duration / 16); // 60fps
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      number.textContent = Math.floor(current);
    }, 16);
  });
}

// Trigger count-up when stats section is in view
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateNumbers();
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelector('.stats').addEventListener('mouseenter', () => {
  statsObserver.observe(document.querySelector('.stats'));
});

// ===== MAGNETIC BUTTONS =====
document.querySelectorAll('.btn-magnetic').forEach(btn => {
  btn.addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    this.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
  });

  btn.addEventListener('mouseleave', function() {
    this.style.transform = 'translate(0px, 0px)';
  });
});

// ===== 3D TILT CARDS =====
featureCards.forEach(card => {
  card.addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
  });

  card.addEventListener('mouseleave', function() {
    this.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
  });
});

// ===== INTERACTIVE ELEMENT =====
interactiveElement.addEventListener('click', function() {
  gsap.to(this, {
    scale: 1.2,
    rotation: 360,
    duration: 0.6,
    ease: "power2.out",
    yoyo: true,
    repeat: 1
  });
});

// ===== SMOOTH SCROLLING =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const headerOffset = 80;
      const elementPosition = target.offsetTop;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.querySelector('.navbar');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;

  if (currentScrollY > lastScrollY && currentScrollY > 100) {
    navbar.style.transform = 'translateY(-100%)';
  } else {
    navbar.style.transform = 'translateY(0)';
  }

  lastScrollY = currentScrollY;
});

// ===== PARALLAX EFFECTS =====
if (!isReducedMotion) {
  gsap.to('.gradient-mesh', {
    scrollTrigger: {
      scrub: 1
    },
    y: -100,
    ease: "none"
  });

  gsap.to('.floating-mockup', {
    scrollTrigger: {
      scrub: 1
    },
    y: -50,
    rotation: 5,
    ease: "none"
  });
}

// ===== TESTIMONIALS AUTO-SCROLL =====
let testimonialsScroll = 0;
const testimonialsSpeed = 0.5;

function scrollTestimonials() {
  if (testimonialsTrack) {
    testimonialsScroll -= testimonialsSpeed;
    if (Math.abs(testimonialsScroll) >= testimonialsTrack.scrollWidth / 2) {
      testimonialsScroll = 0;
    }
    testimonialsTrack.style.transform = `translateX(${testimonialsScroll}px)`;
  }
  requestAnimationFrame(scrollTestimonials);
}

scrollTestimonials();

// ===== PERFORMANCE MONITORING =====
let frameCount = 0;
let lastTime = performance.now();

function monitorPerformance() {
  frameCount++;
  const currentTime = performance.now();

  if (currentTime - lastTime >= 1000) {
    const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
    console.log(`FPS: ${fps}`);

    frameCount = 0;
    lastTime = currentTime;
  }

  requestAnimationFrame(monitorPerformance);
}

// Uncomment to monitor FPS
// monitorPerformance();

// ===== LAZY LOADING OPTIMIZATION =====
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    }
  });
});

// Observe lazy images (if any)
document.querySelectorAll('img[data-src]').forEach(img => {
  imageObserver.observe(img);
});

// ===== RESPONSIVE ADJUSTMENTS =====
function handleResize() {
  // Adjust particle count based on screen size
  const particleCount = window.innerWidth < 768 ? 20 : 50;

  // Clear existing particles
  particlesContainer.innerHTML = '';

  // Create new particles
  for (let i = 0; i < particleCount; i++) {
    setTimeout(createParticle, Math.random() * 2000);
  }
}

window.addEventListener('resize', handleResize);

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
  // Initialize stats observer
  if (document.querySelector('.stats')) {
    statsObserver.observe(document.querySelector('.stats'));
  }

  // Add fade-in class to elements for intersection observer
  const fadeElements = document.querySelectorAll('.fade-in');
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
      }
    });
  }, { threshold: 0.1 });

  fadeElements.forEach(el => fadeObserver.observe(el));

  // Log initialization
  console.log('Next-Gen Dark Mode Landing Page initialized successfully!');
});
