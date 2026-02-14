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
const premiumFeatureCards = document.querySelectorAll('.premium-feature-card');
const featureCards = document.querySelectorAll('.feature-card');
const statNumbers = document.querySelectorAll('.stat-number');
const interactiveElement = document.querySelector('.interactive-element');
const testimonialsTrack = document.querySelector('.testimonials-track');

// ===== MORPHING TEXT ELEMENTS =====
const morphingWords = ['Revolutionize', 'Transform', 'Elevate', 'Master'];
let currentMorphIndex = 0;
const morphingText = document.querySelector('.title-accent');

// ===== MORPHING TEXT FUNCTION =====
function morphText() {
  if (!morphingText) return;

  const currentWord = morphingWords[currentMorphIndex];
  const nextWord = morphingWords[(currentMorphIndex + 1) % morphingWords.length];

  // Create morphing animation
  const tl = gsap.timeline();

  tl.to(morphingText, {
    duration: 0.5,
    y: -20,
    opacity: 0,
    scale: 0.8,
    ease: "power2.inOut",
    onComplete: () => {
      morphingText.textContent = nextWord;
    }
  })
  .to(morphingText, {
    duration: 0.5,
    y: 0,
    opacity: 1,
    scale: 1,
    ease: "power2.inOut"
  });

  currentMorphIndex = (currentMorphIndex + 1) % morphingWords.length;
}

// Start morphing text animation
setInterval(morphText, 3000);

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

// ===== ADVANCED PARTICLE SYSTEM WITH GRAVITATIONAL PHYSICS =====
class Particle {
  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'particle';
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * window.innerHeight;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    this.size = Math.random() * 6 + 1;
    this.mass = this.size / 3;
    this.colors = ['var(--accent-electric)', 'var(--accent-neon)', 'var(--accent-cyan)', 'var(--accent-purple)'];
    this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    this.life = Math.random() * 100 + 50;
    this.maxLife = this.life;

    this.element.style.width = this.size + 'px';
    this.element.style.height = this.size + 'px';
    this.element.style.background = this.color;
    this.element.style.boxShadow = `0 0 ${this.size * 2}px ${this.color}`;
    this.element.style.position = 'absolute';
    this.element.style.pointerEvents = 'none';

    particlesContainer.appendChild(this.element);
    this.updatePosition();
  }

  updatePosition() {
    this.element.style.left = this.x + 'px';
    this.element.style.top = this.y + 'px';
    this.element.style.opacity = this.life / this.maxLife;
  }

  update() {
    // Apply gravitational forces from mouse
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 200) {
      const force = (200 - distance) / 200;
      const angle = Math.atan2(dy, dx);
      this.vx += Math.cos(angle) * force * 0.5;
      this.vy += Math.sin(angle) * force * 0.5;
    }

    // Apply damping
    this.vx *= 0.98;
    this.vy *= 0.98;

    // Update position
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off edges
    if (this.x < 0 || this.x > window.innerWidth) this.vx *= -0.8;
    if (this.y < 0 || this.y > window.innerHeight) this.vy *= -0.8;

    // Keep within bounds
    this.x = Math.max(0, Math.min(window.innerWidth, this.x));
    this.y = Math.max(0, Math.min(window.innerHeight, this.y));

    this.updatePosition();

    // Decrease life
    this.life--;
    if (this.life <= 0) {
      this.element.remove();
      return false;
    }
    return true;
  }
}

const particles = [];
let particleCount = window.innerWidth < 768 ? 30 : 75;

function createParticle() {
  if (particles.length < particleCount) {
    particles.push(new Particle());
  }
}

function updateParticles() {
  particles.forEach((particle, index) => {
    if (!particle.update()) {
      particles.splice(index, 1);
    }
  });
  requestAnimationFrame(updateParticles);
}

updateParticles();

// Create initial particles
for (let i = 0; i < 75; i++) {
  setTimeout(createParticle, Math.random() * 5000);
}

// Create new particles periodically
setInterval(createParticle, 200);

// ===== INTERACTIVE FLOATING ELEMENTS =====
function createFloatingElement() {
  const element = document.createElement('div');
  element.className = 'floating-element';
  element.style.position = 'absolute';
  element.style.width = Math.random() * 20 + 10 + 'px';
  element.style.height = element.style.width;
  element.style.background = 'radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%)';
  element.style.borderRadius = '50%';
  element.style.left = Math.random() * 100 + '%';
  element.style.top = Math.random() * 100 + '%';
  element.style.animation = `float${Math.floor(Math.random() * 3) + 1} ${Math.random() * 10 + 15}s ease-in-out infinite`;

  document.querySelector('.background-effects').appendChild(element);

  setTimeout(() => {
    element.remove();
  }, 25000);
}

// Create floating elements
setInterval(createFloatingElement, 1000);

// ===== LAYERED PARALLAX BACKGROUNDS =====
function createParallaxLayers() {
  const backgroundEffects = document.querySelector('.background-effects');

  // Create multiple parallax layers
  for (let i = 0; i < 5; i++) {
    const layer = document.createElement('div');
    layer.className = `parallax-layer parallax-layer-${i}`;
    layer.style.position = 'absolute';
    layer.style.top = '0';
    layer.style.left = '0';
    layer.style.width = '100%';
    layer.style.height = '100%';
    layer.style.zIndex = -i - 1;
    layer.style.opacity = (5 - i) * 0.1;

    // Add gradient or pattern based on layer
    if (i % 2 === 0) {
      layer.style.background = `radial-gradient(circle at ${Math.random() * 100}% ${Math.random() * 100}%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`;
    } else {
      layer.style.background = `linear-gradient(${Math.random() * 360}deg, rgba(139, 92, 246, 0.05) 0%, transparent 50%)`;
    }

    backgroundEffects.appendChild(layer);
  }
}

// Initialize parallax layers
createParallaxLayers();

// ===== SCROLL-TRIGGERED MORPHING BETWEEN SECTIONS =====
function createSectionTransitions() {
  const sections = document.querySelectorAll('section');

  sections.forEach((section, index) => {
    if (!isReducedMotion) {
      // Create blur-to-focus effect
      gsap.set(section, { filter: 'blur(5px)' });

      gsap.to(section, {
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          end: "top 20%",
          scrub: 1,
          onEnter: () => {
            // Dynamic color shift based on scroll position
            const scrollY = window.scrollY;
            const hue = (scrollY / 10) % 360;
            document.documentElement.style.setProperty('--dynamic-hue', hue + 'deg');
          }
        },
        filter: 'blur(0px)',
        background: `linear-gradient(135deg, hsl(var(--dynamic-hue, 220), 20%, 10%) 0%, hsl(var(--dynamic-hue, 220), 15%, 5%) 100%)`,
        ease: "none"
      });

      // Add dynamic lighting based on scroll
      gsap.to(section, {
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        },
        boxShadow: `inset 0 0 100px rgba(59, 130, 246, 0.1)`,
        ease: "none"
      });
    }
  });
}

// Initialize section transitions
createSectionTransitions();

// ===== ADVANCED HERO ANIMATIONS =====
const heroTimeline = gsap.timeline();

if (!isReducedMotion) {
  heroTimeline
    .from(heroTitle, {
      duration: 2.5,
      y: 150,
      opacity: 0,
      rotationX: -90,
      transformOrigin: "center center",
      ease: "power4.out",
      stagger: 0.1
    })
    .from(heroSubtitle, {
      duration: 1.5,
      y: 80,
      opacity: 0,
      scale: 0.8,
      ease: "power3.out"
    }, "-=1.8")
    .from(heroCtas, {
      duration: 1.2,
      y: 60,
      opacity: 0,
      scale: 0.7,
      ease: "back.out(1.7)",
      stagger: 0.2
    }, "-=1.3")
    .from('.floating-mockup', {
      duration: 2,
      scale: 0.2,
      opacity: 0,
      rotation: -360,
      ease: "power4.out"
    }, "-=1.5")
    .from('.hero-visual', {
      duration: 1.2,
      x: 150,
      opacity: 0,
      ease: "power2.out"
    }, "-=1.2");

  // Enhanced continuous floating animation with multiple elements
  gsap.to('.floating-mockup', {
    y: -30,
    rotation: 5,
    duration: 4,
    ease: "power2.inOut",
    yoyo: true,
    repeat: -1
  });

  gsap.to('.mockup-screen', {
    background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 50%, var(--bg-tertiary) 100%)',
    duration: 6,
    ease: "power2.inOut",
    yoyo: true,
    repeat: -1
  });

  // Add ambient glow animation
  gsap.to('.ambient-glow', {
    scale: 1.2,
    opacity: 0.8,
    duration: 3,
    ease: "power2.inOut",
    yoyo: true,
    repeat: -1
  });
}

// ===== ADVANCED SCROLL-TRIGGERED ANIMATIONS =====
if (!isReducedMotion) {
  // Premium feature cards animation with advanced effects
  premiumFeatureCards.forEach((card, index) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: "top 85%",
        end: "bottom 15%",
        toggleActions: "play none none reverse"
      },
      y: 80,
      opacity: 0,
      rotationX: -45,
      scale: 0.8,
      duration: 1.2,
      delay: index * 0.15,
      ease: "power3.out"
    });

    // Add continuous hover effect
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        y: -20,
        scale: 1.05,
        duration: 0.4,
        ease: "power2.out"
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        duration: 0.4,
        ease: "power2.out"
      });
    });
  });

  // Feature cards animation with stagger and morphing
  featureCards.forEach((card, index) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      },
      y: 60,
      opacity: 0,
      scale: 0.9,
      rotationY: -30,
      duration: 1,
      delay: index * 0.12,
      ease: "power3.out"
    });

    // Advanced hover effects for feature cards
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        y: -15,
        scale: 1.03,
        rotationY: 5,
        duration: 0.3,
        ease: "power2.out"
      });
      gsap.to(card.querySelector('.card-icon'), {
        scale: 1.2,
        rotation: 360,
        duration: 0.5,
        ease: "power2.out"
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        rotationY: 0,
        duration: 0.3,
        ease: "power2.out"
      });
      gsap.to(card.querySelector('.card-icon'), {
        scale: 1,
        rotation: 0,
        duration: 0.5,
        ease: "power2.out"
      });
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

// ===== ADVANCED 3D TILT CARDS WITH DEPTH =====
function createAdvanced3DTilt() {
  const allCards = document.querySelectorAll('.premium-feature-card, .feature-card');

  allCards.forEach(card => {
    let bounds = card.getBoundingClientRect();
    let mouseX = 0;
    let mouseY = 0;
    let cardX = 0;
    let cardY = 0;

    // Create depth layers
    const cardContent = card.innerHTML;
    card.innerHTML = `
      <div class="card-depth-layer card-depth-1">${cardContent}</div>
      <div class="card-depth-layer card-depth-2"></div>
      <div class="card-depth-layer card-depth-3"></div>
    `;

    // Style depth layers
    const layers = card.querySelectorAll('.card-depth-layer');
    layers.forEach((layer, index) => {
      layer.style.position = 'absolute';
      layer.style.top = '0';
      layer.style.left = '0';
      layer.style.width = '100%';
      layer.style.height = '100%';
      layer.style.transition = 'transform 0.1s ease-out';
      layer.style.transformStyle = 'preserve-3d';

      if (index > 0) {
        layer.style.opacity = (3 - index) * 0.1;
        layer.style.filter = `blur(${index * 2}px)`;
      }
    });

    card.style.position = 'relative';
    card.style.transformStyle = 'preserve-3d';

    function updateBounds() {
      bounds = card.getBoundingClientRect();
    }

    function lerp(start, end, factor) {
      return start + (end - start) * factor;
    }

    function updateCard() {
      cardX = lerp(cardX, mouseX, 0.1);
      cardY = lerp(cardY, mouseY, 0.1);

      const centerX = bounds.width / 2;
      const centerY = bounds.height / 2;

      const rotateX = ((cardY - centerY) / centerY) * -15;
      const rotateY = ((cardX - centerX) / centerX) * 15;

      const scale = 1 + Math.abs(rotateX) * 0.01 + Math.abs(rotateY) * 0.01;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale}) translateZ(50px)`;

      // Update depth layers
      layers.forEach((layer, index) => {
        const depth = (index + 1) * 10;
        layer.style.transform = `translateZ(${depth}px) rotateX(${rotateX * 0.5}deg) rotateY(${rotateY * 0.5}deg)`;
      });

      requestAnimationFrame(updateCard);
    }

    card.addEventListener('mouseenter', () => {
      updateBounds();
      updateCard();
    });

    card.addEventListener('mousemove', (e) => {
      mouseX = e.clientX - bounds.left;
      mouseY = e.clientY - bounds.top;
    });

    card.addEventListener('mouseleave', () => {
      mouseX = bounds.width / 2;
      mouseY = bounds.height / 2;

      setTimeout(() => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(0px)';
        layers.forEach(layer => {
          layer.style.transform = 'translateZ(0px) rotateX(0deg) rotateY(0deg)';
        });
      }, 100);
    });
  });
}

// Initialize advanced 3D tilt effects
createAdvanced3DTilt();

// ===== HOLOGRAPHIC CARD EFFECTS =====
function createHolographicEffect() {
  const holographicCards = document.querySelectorAll('.premium-feature-card');

  holographicCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      // Create holographic overlay
      const overlay = document.createElement('div');
      overlay.className = 'holographic-overlay';
      overlay.style.position = 'absolute';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.background = 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)';
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '1';

      this.style.position = 'relative';
      this.appendChild(overlay);

      // Animate holographic effect
      gsap.to(overlay, {
        x: '100%',
        duration: 1.5,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true
      });
    });

    card.addEventListener('mouseleave', function() {
      const overlay = this.querySelector('.holographic-overlay');
      if (overlay) {
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => overlay.remove()
        });
      }
    });
  });
}

// Initialize holographic effects
createHolographicEffect();

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
  const newParticleCount = window.innerWidth < 768 ? 30 : 75;

  // Update particle count if changed
  if (newParticleCount !== particleCount) {
    particleCount = newParticleCount;

    // Clear existing particles
    particles.forEach(particle => particle.element.remove());
    particles.length = 0;

    // Create new particles
    for (let i = 0; i < particleCount; i++) {
      setTimeout(createParticle, Math.random() * 2000);
    }
  }
}

window.addEventListener('resize', handleResize);

// ===== REDUCED MOTION SUPPORT =====
function handleReducedMotion() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    // Disable complex animations
    gsap.set('.particle, .floating-element, .morphing-shapes', { display: 'none' });
    gsap.set('.cursor-glow', { opacity: 0.3 });

    // Simplify hover effects
    document.querySelectorAll('.premium-feature-card, .feature-card').forEach(card => {
      card.style.transition = 'transform 0.2s ease';
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
      });
    });
  }
}

// Check for reduced motion preference
handleReducedMotion();

// ===== ACCESSIBILITY ENHANCEMENTS =====
function enhanceAccessibility() {
  // Add focus indicators for interactive elements
  const interactiveElements = document.querySelectorAll('.btn, .nav-link, .premium-feature-card, .feature-card');

  interactiveElements.forEach(element => {
    element.addEventListener('focus', () => {
      gsap.to(element, {
        scale: 1.05,
        duration: 0.2,
        ease: "power2.out"
      });
    });

    element.addEventListener('blur', () => {
      gsap.to(element, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out"
      });
    });
  });

  // Ensure proper ARIA labels
  document.querySelectorAll('[data-feature]').forEach(card => {
    const feature = card.getAttribute('data-feature');
    card.setAttribute('aria-label', `Premium feature: ${feature}`);
  });
}

enhanceAccessibility();

// ===== DYNAMIC BACKGROUND MUSIC VISUALIZATION =====
function createMusicVisualization() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  // Create visualization bars
  const visualizationBars = [];
  const barsContainer = document.createElement('div');
  barsContainer.className = 'music-visualization';
  barsContainer.style.position = 'fixed';
  barsContainer.style.bottom = '20px';
  barsContainer.style.left = '50%';
  barsContainer.style.transform = 'translateX(-50%)';
  barsContainer.style.display = 'flex';
  barsContainer.style.gap = '2px';
  barsContainer.style.zIndex = '1000';
  barsContainer.style.opacity = '0.7';

  for (let i = 0; i < 32; i++) {
    const bar = document.createElement('div');
    bar.style.width = '4px';
    bar.style.height = '20px';
    bar.style.background = 'linear-gradient(180deg, var(--accent-neon), var(--accent-electric))';
    bar.style.borderRadius = '2px';
    bar.style.transition = 'height 0.1s ease';
    visualizationBars.push(bar);
    barsContainer.appendChild(bar);
  }

  document.body.appendChild(barsContainer);

  // Audio visualization function
  function updateVisualization() {
    analyser.getByteFrequencyData(dataArray);

    for (let i = 0; i < visualizationBars.length; i++) {
      const value = dataArray[i * 4];
      const height = (value / 255) * 60 + 10;
      visualizationBars[i].style.height = height + 'px';
      visualizationBars[i].style.opacity = value / 255;
    }

    requestAnimationFrame(updateVisualization);
  }

  // Auto-play ambient audio (simulated)
  function createAmbientAudio() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.01, audioContext.currentTime);

    oscillator.start();
    updateVisualization();
  }

  // Start visualization on user interaction
  document.addEventListener('click', () => {
    if (audioContext.state === 'suspended') {
      audioContext.resume().then(createAmbientAudio);
    }
  }, { once: true });
}

// Initialize music visualization
createMusicVisualization();

// ===== INTERACTIVE PARTICLE CONSTELLATIONS =====
function createParticleConstellations() {
  const constellations = [];
  const constellationCount = 3;

  for (let c = 0; c < constellationCount; c++) {
    const constellation = [];
    const particleCount = 8 + Math.random() * 12;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'constellation-particle';
      particle.style.position = 'absolute';
      particle.style.width = '3px';
      particle.style.height = '3px';
      particle.style.background = 'var(--accent-cyan)';
      particle.style.borderRadius = '50%';
      particle.style.boxShadow = '0 0 6px var(--accent-cyan)';
      particle.style.opacity = '0.6';

      // Position particles in constellation patterns
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 100 + Math.random() * 200;
      const centerX = Math.random() * window.innerWidth;
      const centerY = Math.random() * window.innerHeight;

      particle.style.left = (centerX + Math.cos(angle) * radius) + 'px';
      particle.style.top = (centerY + Math.sin(angle) * radius) + 'px';

      document.body.appendChild(particle);
      constellation.push(particle);
    }

    // Connect particles with lines
    for (let i = 0; i < constellation.length; i++) {
      for (let j = i + 1; j < constellation.length; j++) {
        if (Math.random() > 0.7) { // Only connect some particles
          const line = document.createElement('div');
          line.className = 'constellation-line';
          line.style.position = 'absolute';
          line.style.background = 'linear-gradient(90deg, transparent, var(--accent-cyan), transparent)';
          line.style.height = '1px';
          line.style.opacity = '0.3';
          line.style.pointerEvents = 'none';

          const p1 = constellation[i].getBoundingClientRect();
          const p2 = constellation[j].getBoundingClientRect();

          const distance = Math.sqrt(Math.pow(p2.left - p1.left, 2) + Math.pow(p2.top - p1.top, 2));
          const angle = Math.atan2(p2.top - p1.top, p2.left - p1.left);

          line.style.width = distance + 'px';
          line.style.left = p1.left + 'px';
          line.style.top = p1.top + 'px';
          line.style.transform = `rotate(${angle}rad)`;
          line.style.transformOrigin = '0 0';

          document.body.appendChild(line);
          constellation.push(line);
        }
      }
    }

    constellations.push(constellation);
  }

  // Animate constellations
  function animateConstellations() {
    constellations.forEach((constellation, cIndex) => {
      constellation.forEach((element, eIndex) => {
        if (element.classList.contains('constellation-particle')) {
          const time = Date.now() * 0.001;
          const offset = cIndex * 2 + eIndex * 0.5;
          const scale = 1 + Math.sin(time + offset) * 0.3;
          element.style.transform = `scale(${scale})`;
          element.style.opacity = 0.3 + Math.sin(time + offset) * 0.4;
        }
      });
    });

    requestAnimationFrame(animateConstellations);
  }

  animateConstellations();
}

// Initialize particle constellations
createParticleConstellations();

// ===== ADVANCED MORPHING TRANSITIONS =====
function createAdvancedMorphingTransitions() {
  const sections = document.querySelectorAll('section');

  sections.forEach((section, index) => {
    if (index < sections.length - 1) {
      const nextSection = sections[index + 1];

      // Create morphing transition element
      const transitionElement = document.createElement('div');
      transitionElement.className = 'morphing-transition';
      transitionElement.style.position = 'absolute';
      transitionElement.style.top = '0';
      transitionElement.style.left = '0';
      transitionElement.style.width = '100%';
      transitionElement.style.height = '100%';
      transitionElement.style.pointerEvents = 'none';
      transitionElement.style.zIndex = '10';
      transitionElement.style.opacity = '0';

      // Create SVG morphing path
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 1000 1000');
      svg.style.width = '100%';
      svg.style.height = '100%';

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M0,500 Q250,300 500,500 T1000,500 L1000,1000 L0,1000 Z');
      path.style.fill = 'url(#morphGradient1)';
      path.style.opacity = '0.8';

      svg.appendChild(path);
      transitionElement.appendChild(svg);
      section.appendChild(transitionElement);

      // Trigger morphing on scroll
      gsap.to(transitionElement, {
        scrollTrigger: {
          trigger: section,
          start: "bottom center",
          end: "bottom top",
          scrub: 1,
          onEnter: () => {
            gsap.to(path, {
              duration: 2,
              attr: { d: 'M0,500 Q250,700 500,500 T1000,500 L1000,1000 L0,1000 Z' },
              ease: "power2.inOut"
            });
          },
          onLeaveBack: () => {
            gsap.to(path, {
              duration: 2,
              attr: { d: 'M0,500 Q250,300 500,500 T1000,500 L1000,1000 L0,1000 Z' },
              ease: "power2.inOut"
            });
          }
        },
        opacity: 0.6,
        ease: "none"
      });
    }
  });
}

// Initialize advanced morphing transitions
createAdvancedMorphingTransitions();

// ===== AI-POWERED CONTENT PERSONALIZATION =====
function createAIPersonalization() {
  const userPreferences = {
    theme: 'dark',
    animations: true,
    interactions: 'advanced',
    performance: 'high'
  };

  // Analyze user behavior
  let scrollDepth = 0;
  let interactionCount = 0;
  let timeOnPage = 0;

  window.addEventListener('scroll', () => {
    scrollDepth = Math.max(scrollDepth, (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
  });

  document.addEventListener('click', () => {
    interactionCount++;
  });

  setInterval(() => {
    timeOnPage++;

    // AI-driven personalization
    if (scrollDepth > 50 && interactionCount > 5) {
      // User is engaged, enhance experience
      gsap.to('.particle', {
        duration: 1,
        scale: 1.2,
        ease: "power2.out"
      });
    }

    if (timeOnPage > 30) {
      // Long session, add special effects
      createParticleConstellations();
    }
  }, 1000);

  // Adaptive performance based on device capabilities
  const isLowEndDevice = navigator.hardwareConcurrency <= 2 || navigator.deviceMemory <= 2;

  if (isLowEndDevice) {
    // Reduce particle count and complexity
    particleCount = Math.min(particleCount, 20);
    gsap.set('.morphing-shapes', { display: 'none' });
  }
}

// Initialize AI personalization
createAIPersonalization();

// ===== HOLOGRAPHIC DATA VISUALIZATIONS =====
function createHolographicDataViz() {
  const dataVizContainer = document.createElement('div');
  dataVizContainer.className = 'holographic-data-viz';
  dataVizContainer.style.position = 'fixed';
  dataVizContainer.style.top = '50%';
  dataVizContainer.style.right = '20px';
  dataVizContainer.style.transform = 'translateY(-50%)';
  dataVizContainer.style.width = '200px';
  dataVizContainer.style.height = '300px';
  dataVizContainer.style.zIndex = '1000';
  dataVizContainer.style.opacity = '0.8';

  // Create holographic bars
  for (let i = 0; i < 10; i++) {
    const bar = document.createElement('div');
    bar.style.position = 'absolute';
    bar.style.bottom = '0';
    bar.style.left = (i * 20) + 'px';
    bar.style.width = '15px';
    bar.style.height = (Math.random() * 200 + 50) + 'px';
    bar.style.background = 'linear-gradient(180deg, var(--accent-neon), transparent)';
    bar.style.border = '1px solid var(--accent-cyan)';
    bar.style.borderRadius = '2px 2px 0 0';
    bar.style.boxShadow = '0 0 10px var(--accent-cyan)';
    bar.style.animation = `holographicPulse ${2 + Math.random() * 2}s ease-in-out infinite`;

    dataVizContainer.appendChild(bar);
  }

  document.body.appendChild(dataVizContainer);

  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes holographicPulse {
      0%, 100% { opacity: 0.6; transform: scaleY(1); }
      50% { opacity: 1; transform: scaleY(1.1); }
    }
  `;
  document.head.appendChild(style);
}

// Initialize holographic data visualization
createHolographicDataViz();

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

  // Initialize newsletter functionality
  initializeNewsletter();

  // Log initialization
  console.log('Next-Gen Dark Mode Landing Page with AI Personalization initialized successfully!');
});

// ===== NEWSLETTER FORM HANDLING =====
function initializeNewsletter() {
  const newsletterForm = document.querySelector('.subscribe-form');
  if (!newsletterForm) return;

  newsletterForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const emailInput = this.querySelector('input[type="email"]');
    const submitBtn = this.querySelector('.btn-newsletter');
    const originalText = submitBtn.innerHTML;

    // Show loading state
    submitBtn.innerHTML = '<span>Subscribing...</span><i class="fas fa-spinner fa-spin"></i>';
    submitBtn.disabled = true;

    // Simulate API call (replace with actual API endpoint)
    setTimeout(() => {
      // Success state
      submitBtn.innerHTML = '<span>Subscribed!</span><i class="fas fa-check"></i>';
      submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      emailInput.value = '';

      // Reset after 3 seconds
      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
      }, 3000);
    }, 1500);
  });
}
