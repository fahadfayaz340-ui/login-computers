/* ==========================================================================
   LOGIN COMPUTERS - Main JavaScript Logic & Micro-Interactions
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCanvasHero();
  initStatsCounter();
  initShopStatus();
  initFAQAccordion();
  initContactForm();
  initNewsletterForm();
  initPortfolioFilter();
  lucide.createIcons();
});

/* --------------------------------------------------
   1. Navbar & Mobile Menu Handler
-------------------------------------------------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      navToggle.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
      });
    });
  }
}

/* --------------------------------------------------
   2. Interactive Canvas Hero Particle Network
-------------------------------------------------- */
function initCanvasHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let mouse = { x: null, y: null, radius: 140 };

  function resize() {
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2.5 + 1;
      this.speedX = (Math.random() - 0.5) * 1.2;
      this.speedY = (Math.random() - 0.5) * 1.2;
      this.color = '#2a7d6e';
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < 0 || this.x > width) this.speedX *= -1;
      if (this.y < 0 || this.y > height) this.speedY *= -1;

      // Mouse attraction effect
      if (mouse.x && mouse.y) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
          let force = (mouse.radius - distance) / mouse.radius;
          this.x -= (dx / distance) * force * 2;
          this.y -= (dy / distance) * force * 2;
        }
      }
    }

    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Generate particles based on canvas area
  const count = Math.floor((width * height) / 18000);
  for (let i = 0; i < Math.min(count, 50); i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        let dx = particles[i].x - particles[j].x;
        let dy = particles[i].y - particles[j].y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          ctx.strokeStyle = `rgba(42, 125, 110, ${1 - dist / 130})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* --------------------------------------------------
   3. Animated Statistics Counter
-------------------------------------------------- */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if (!statNumbers.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const targetVal = parseInt(target.getAttribute('data-target'), 10);
        const prefix = target.getAttribute('data-prefix') || '';
        const suffix = target.getAttribute('data-suffix') || '';
        let current = 0;
        const increment = Math.ceil(targetVal / 50);

        const timer = setInterval(() => {
          current += increment;
          if (current >= targetVal) {
            target.textContent = prefix + targetVal + suffix;
            clearInterval(timer);
          } else {
            target.textContent = prefix + current + suffix;
          }
        }, 30);

        obs.unobserve(target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(stat => observer.observe(stat));
}

/* --------------------------------------------------
   4. Shop Open/Closed Live Indicator
-------------------------------------------------- */
function initShopStatus() {
  const statusBadges = document.querySelectorAll('.status-badge');
  if (!statusBadges.length) return;

  const now = new Date();
  const day = now.getDay(); // 0 is Sunday, 1-6 Mon-Sat
  const hour = now.getHours();

  let isOpen = false;
  if (day >= 1 && day <= 6) { // Mon-Sat
    if (hour >= 9 && hour < 19) { // 9 AM to 7 PM
      isOpen = true;
    }
  }

  statusBadges.forEach(badge => {
    if (isOpen) {
      badge.innerHTML = `<span class="badge-dot"></span> Open Now (09:00 AM - 07:00 PM)`;
    } else {
      badge.style.background = '#fef2f2';
      badge.style.color = '#991b1b';
      badge.style.borderColor = '#fecaca';
      badge.innerHTML = `<span class="badge-dot" style="background:#ef4444;box-shadow:0 0 8px #ef4444;"></span> Closed Now (Opens Mon-Sat 9AM)`;
    }
  });
}

/* --------------------------------------------------
   5. Accordion FAQ Handler
-------------------------------------------------- */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------
   6. Contact Form & WhatsApp Submission
-------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    const service = document.getElementById('contact-service').value;
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !phone || !message) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    const encodedText = encodeURIComponent(
      `Hello Login Computers!\n\n` +
      `*Name:* ${name}\n` +
      `*Phone:* ${phone}\n` +
      `*Query Category:* ${service}\n` +
      `*Details:* ${message}`
    );

    const waUrl = `https://wa.me/919906405769?text=${encodedText}`;
    
    showToast('Redirecting to WhatsApp...', 'success');
    setTimeout(() => {
      window.open(waUrl, '_blank');
      form.reset();
    }, 1200);
  });
}

/* --------------------------------------------------
   7. Newsletter Subscription Form
-------------------------------------------------- */
function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = form.querySelector('.newsletter-input');
    if (emailInput && emailInput.value.includes('@')) {
      showToast('Thank you for subscribing to Login Computers updates!', 'success');
      emailInput.value = '';
    } else {
      showToast('Please enter a valid email address.', 'error');
    }
  });
}

/* --------------------------------------------------
   8. Portfolio Category Filter
-------------------------------------------------- */
function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      portfolioItems.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          item.style.display = 'block';
          setTimeout(() => item.style.opacity = '1', 50);
        } else {
          item.style.opacity = '0';
          setTimeout(() => item.style.display = 'none', 300);
        }
      });
    });
  });
}

/* --------------------------------------------------
   9. Global Toast Notification System
-------------------------------------------------- */
function showToast(message, type = 'info') {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info'}"></i>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
