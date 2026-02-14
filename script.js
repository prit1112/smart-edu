// ========================================
// PREMIUM AUTHENTICATION SCRIPT
// Cinematic Dark Mode Interactions
// ========================================

// ===== GSAP REGISTRATION =====
gsap.registerPlugin();

// ===== GSAP FALLBACK =====
if (typeof gsap === 'undefined') {
  console.warn('GSAP not loaded, using fallback animations');
  window.gsap = {
    to: (target, vars) => {
      if (vars.onComplete) setTimeout(vars.onComplete, vars.duration * 1000 || 1000);
      return { kill: () => {} };
    },
    fromTo: (target, fromVars, toVars) => {
      if (toVars.onComplete) setTimeout(toVars.onComplete, toVars.duration * 1000 || 1000);
      return { kill: () => {} };
    }
  };
}

// ===== DOM ELEMENTS =====
const cursorGlow = document.getElementById('cursor-glow');
const particlesContainer = document.querySelector('.particles-container');
const authCard = document.querySelector('.auth-card');
const toggleBtns = document.querySelectorAll('.toggle-btn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const loginMessage = document.getElementById('loginMessage');
const registerMessage = document.getElementById('registerMessage');

// ===== STATE MANAGEMENT =====
let currentForm = 'login';
let particles = [];
let isCapsLockOn = false;

// ===== PERFORMANCE OPTIMIZATION =====
const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== PARTICLE SYSTEM =====
class Particle {
  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'particle';
    this.reset();
    particlesContainer.appendChild(this.element);
  }

  reset() {
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * window.innerHeight;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.element.style.left = this.x + 'px';
    this.element.style.top = this.y + 'px';
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;
    if (this.y < 0 || this.y > window.innerHeight) this.vy *= -1;

    this.element.style.left = this.x + 'px';
    this.element.style.top = this.y + 'px';
  }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
  initializeParticles();
  initializeCursorGlow();
  initializeFormToggling();
  initializePasswordToggles();
  initializeValidation();
  initializeCapsLockDetection();
  initializeFormSubmission();
  initializeAccessibility();

  // Log initialization
  console.log('Premium Authentication UI initialized successfully!');
});

// ===== PARTICLE SYSTEM INITIALIZATION =====
function initializeParticles() {
  const particleCount = window.innerWidth < 768 ? 15 : 25;

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  if (!isReducedMotion) {
    animateParticles();
  }
}

function animateParticles() {
  particles.forEach(particle => particle.update());
  requestAnimationFrame(animateParticles);
}

// ===== CURSOR GLOW EFFECT =====
function initializeCursorGlow() {
  let mouseX = 0;
  let mouseY = 0;
  let glowX = 0;
  let glowY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function updateGlow() {
    glowX += (mouseX - glowX) * 0.1;
    glowY += (mouseY - glowY) * 0.1;

    cursorGlow.style.left = glowX - 75 + 'px';
    cursorGlow.style.top = glowY - 75 + 'px';
    cursorGlow.style.opacity = '0.3';

    requestAnimationFrame(updateGlow);
  }

  if (!isReducedMotion) {
    updateGlow();
  }
}

// ===== FORM TOGGLING =====
function initializeFormToggling() {
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetForm = btn.dataset.form;

      if (targetForm === currentForm) return;

      // Update toggle buttons
      toggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Animate form transition
      const currentFormEl = document.querySelector('.auth-form.active');
      const targetFormEl = document.getElementById(targetForm + 'Form');

      if (!isReducedMotion) {
        gsap.to(currentFormEl, {
          opacity: 0,
          x: -20,
          duration: 0.3,
          ease: "power2.inOut",
          onComplete: () => {
            currentFormEl.classList.remove('active');
            targetFormEl.classList.add('active');

            gsap.fromTo(targetFormEl, {
              opacity: 0,
              x: 20
            }, {
              opacity: 1,
              x: 0,
              duration: 0.3,
              ease: "power2.inOut"
            });
          }
        });
      } else {
        currentFormEl.classList.remove('active');
        targetFormEl.classList.add('active');
      }

      currentForm = targetForm;
      clearMessages();
    });
  });
}

// ===== PASSWORD TOGGLE =====
function initializePasswordToggles() {
  document.querySelectorAll('.password-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const targetId = toggle.dataset.target;
      const input = document.getElementById(targetId);
      const icon = toggle.querySelector('i');

      if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
      } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
      }
    });
  });
}

// ===== REAL-TIME VALIDATION =====
function initializeValidation() {
  // Email validation
  document.querySelectorAll('input[type="email"]').forEach(input => {
    input.addEventListener('blur', validateEmail);
    input.addEventListener('input', validateEmail);
  });

  // Password validation
  document.querySelectorAll('input[type="password"]').forEach(input => {
    input.addEventListener('input', () => {
      validatePassword(input);
      if (input.id === 'registerPassword') {
        checkPasswordMatch();
        updatePasswordStrength(input.value);
      }
    });
  });

  // Confirm password validation
  document.getElementById('confirmPassword').addEventListener('input', checkPasswordMatch);
}

function validateEmail(e) {
  const input = e.target;
  const formGroup = input.closest('.form-group');
  const email = input.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  formGroup.classList.remove('success', 'error');

  if (email === '') {
    return; // Don't show error for empty field on blur
  }

  if (emailRegex.test(email)) {
    formGroup.classList.add('success');
  } else {
    formGroup.classList.add('error');
  }
}

function validatePassword(input) {
  const formGroup = input.closest('.form-group');
  const password = input.value;

  formGroup.classList.remove('success', 'error');

  if (password.length === 0) {
    return;
  }

  if (password.length >= 8) {
    formGroup.classList.add('success');
  } else {
    formGroup.classList.add('error');
  }
}

function checkPasswordMatch() {
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const formGroup = document.getElementById('confirmPassword').closest('.form-group');

  formGroup.classList.remove('success', 'error');

  if (confirmPassword === '') return;

  if (password === confirmPassword && password.length >= 8) {
    formGroup.classList.add('success');
  } else {
    formGroup.classList.add('error');
  }
}

function updatePasswordStrength(password) {
  const strengthBar = document.getElementById('strengthFill');
  const strengthText = document.getElementById('strengthText');
  const strengthContainer = document.querySelector('.password-strength');

  if (password.length === 0) {
    strengthContainer.style.display = 'none';
    return;
  }

  strengthContainer.style.display = 'block';

  let strength = 0;
  let feedback = [];

  // Length check
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;

  // Character variety
  if (/[a-z]/.test(password)) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;

  // Reset classes
  strengthBar.parentElement.className = 'strength-bar';

  if (strength < 3) {
    strengthBar.parentElement.classList.add('strength-weak');
    strengthText.textContent = 'Weak password';
  } else if (strength < 5) {
    strengthBar.parentElement.classList.add('strength-fair');
    strengthText.textContent = 'Fair password';
  } else {
    strengthBar.parentElement.classList.add('strength-strong');
    strengthText.textContent = 'Strong password';
  }

  const percentage = Math.min((strength / 6) * 100, 100);
  strengthBar.style.width = percentage + '%';
}

// ===== CAPS LOCK DETECTION =====
function initializeCapsLockDetection() {
  document.querySelectorAll('input[type="password"]').forEach(input => {
    let capsWarning = input.parentElement.querySelector('.caps-warning');

    if (!capsWarning) {
      capsWarning = document.createElement('div');
      capsWarning.className = 'caps-warning';
      capsWarning.textContent = 'Caps Lock is on';
      input.parentElement.appendChild(capsWarning);
    }

    input.addEventListener('keydown', (e) => {
      isCapsLockOn = e.getModifierState('CapsLock');
      updateCapsWarning(capsWarning);
    });

    input.addEventListener('keyup', (e) => {
      isCapsLockOn = e.getModifierState('CapsLock');
      updateCapsWarning(capsWarning);
    });

    input.addEventListener('blur', () => {
      capsWarning.classList.remove('show');
    });
  });
}

function updateCapsWarning(warning) {
  if (isCapsLockOn) {
    warning.classList.add('show');
  } else {
    warning.classList.remove('show');
  }
}

// ===== FORM SUBMISSION =====
function initializeFormSubmission() {
  loginForm.addEventListener('submit', handleLogin);
  registerForm.addEventListener('submit', handleRegister);
}

async function handleLogin(e) {
  e.preventDefault();

  if (!validateForm(loginForm)) return;

  setLoading(loginBtn, true);

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate success
    showMessage(loginMessage, 'Login successful! Redirecting...', 'success');

    if (!isReducedMotion) {
      gsap.to(loginBtn, {
        scale: 1.05,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }

    // Redirect after success animation
    setTimeout(() => {
      window.location.href = '/dashboard'; // Replace with actual redirect
    }, 1500);

  } catch (error) {
    showMessage(loginMessage, 'Login failed. Please try again.', 'error');
    shakeForm(loginForm);
  } finally {
    setLoading(loginBtn, false);
  }
}

async function handleRegister(e) {
  e.preventDefault();

  if (!validateForm(registerForm)) return;

  setLoading(registerBtn, true);

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Simulate success
    showMessage(registerMessage, 'Account created successfully! Welcome to SmartEdu.', 'success');

    if (!isReducedMotion) {
      gsap.to(registerBtn, {
        scale: 1.05,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }

    // Redirect after success animation
    setTimeout(() => {
      window.location.href = '/dashboard'; // Replace with actual redirect
    }, 2000);

  } catch (error) {
    showMessage(registerMessage, 'Registration failed. Please try again.', 'error');
    shakeForm(registerForm);
  } finally {
    setLoading(registerBtn, false);
  }
}

function validateForm(form) {
  let isValid = true;
  const inputs = form.querySelectorAll('input[required]');

  inputs.forEach(input => {
    if (!input.value.trim()) {
      showFieldError(input, 'This field is required');
      isValid = false;
    } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
      showFieldError(input, 'Please enter a valid email address');
      isValid = false;
    } else if (input.type === 'password' && input.value.length < 8) {
      showFieldError(input, 'Password must be at least 8 characters');
      isValid = false;
    }
  });

  // Check password match for register form
  if (form.id === 'registerForm') {
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
      showFieldError(document.getElementById('confirmPassword'), 'Passwords do not match');
      isValid = false;
    }
  }

  return isValid;
}

function showFieldError(input, message) {
  const formGroup = input.closest('.form-group');
  formGroup.classList.add('error');
  formGroup.classList.remove('success');

  // Create or update error message
  let errorEl = formGroup.querySelector('.field-error');
  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.className = 'field-error';
    formGroup.appendChild(errorEl);
  }
  errorEl.textContent = message;
  errorEl.style.display = 'block';
}

function setLoading(button, loading) {
  const btnText = button.querySelector('.btn-text');
  const spinner = button.querySelector('.btn-spinner');

  if (loading) {
    button.disabled = true;
    btnText.style.opacity = '0';
    spinner.style.display = 'block';
  } else {
    button.disabled = false;
    btnText.style.opacity = '1';
    spinner.style.display = 'none';
  }
}

function showMessage(element, message, type) {
  element.textContent = message;
  element.className = `form-message ${type}`;

  if (type === 'success' && !isReducedMotion) {
    // Add success check animation
    element.innerHTML = `
      <span class="success-check">✓</span>
      ${message}
    `;
  }
}

function shakeForm(form) {
  if (!isReducedMotion) {
    gsap.to(form, {
      x: -10,
      duration: 0.1,
      yoyo: true,
      repeat: 5,
      ease: "power2.inOut"
    });
  }
}

function clearMessages() {
  [loginMessage, registerMessage].forEach(msg => {
    msg.textContent = '';
    msg.className = 'form-message';
  });
}

// ===== ACCESSIBILITY =====
function initializeAccessibility() {
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const activeForm = document.querySelector('.auth-form.active');
      const submitBtn = activeForm.querySelector('button[type="submit"]');

      if (document.activeElement.tagName !== 'BUTTON' && document.activeElement.type !== 'submit') {
        e.preventDefault();
        submitBtn.click();
      }
    }
  });

  // Focus management
  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', () => {
      input.closest('.form-group').classList.add('focused');
    });

    input.addEventListener('blur', () => {
      input.closest('.form-group').classList.remove('focused');
    });
  });

  // Screen reader announcements
  const announce = (message) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  // Announce form switches
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      announce(`Switched to ${btn.dataset.form} form`);
    });
  });
}

// ===== RESPONSIVE HANDLING =====
window.addEventListener('resize', () => {
  // Update particle count on resize
  const newParticleCount = window.innerWidth < 768 ? 15 : 25;

  if (particles.length !== newParticleCount) {
    // Clear existing particles
    particles.forEach(particle => {
      if (particle.element.parentNode) {
        particle.element.parentNode.removeChild(particle.element);
      }
    });
    particles = [];

    // Create new particles
    for (let i = 0; i < newParticleCount; i++) {
      particles.push(new Particle());
    }
  }
});

// ===== UTILITY FUNCTIONS =====
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
  console.error('Authentication UI Error:', e.error);
  // Could send error to monitoring service
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled Promise Rejection:', e.reason);
  // Could send error to monitoring service
});
