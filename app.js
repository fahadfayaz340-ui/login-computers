/* ==========================================================================
   Login Computers | AGY — Interactive Engine & Three.js 3D System
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Global State
  const state = {
    mouseX: 0,
    mouseY: 0,
    targetMouseX: 0,
    targetMouseY: 0,
    scrollY: window.scrollY
  };

  // Track global cursor position
  window.addEventListener('mousemove', (e) => {
    state.targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
    state.targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener('scroll', () => {
    state.scrollY = window.scrollY;
  });

  /* ------------------------------------------------------------------------
     1. WebGL Background Particle Engine (Three.js)
     ------------------------------------------------------------------------ */
  function initBackgroundCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || !window.THREE) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Create Particle Constellation
    const particleCount = 180;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorBlue = new THREE.Color(0x00f0ff);
    const colorViolet = new THREE.Color(0xa855f7);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 250;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 250;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

      const mixedColor = Math.random() > 0.5 ? colorBlue : colorViolet;
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    let clock = new THREE.Clock();

    function animateBg() {
      requestAnimationFrame(animateBg);

      const elapsedTime = clock.getElapsedTime();

      // Particle rotation
      particleSystem.rotation.y = elapsedTime * 0.02 + state.mouseX * 0.1;
      particleSystem.rotation.x = elapsedTime * 0.01 + state.mouseY * 0.1;

      // Mouse lerp
      state.mouseX += (state.targetMouseX - state.mouseX) * 0.05;
      state.mouseY += (state.targetMouseY - state.mouseY) * 0.05;

      renderer.render(scene, camera);
    }
    animateBg();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  /* ------------------------------------------------------------------------
     2. Hero Section Interactive 3D Abstract Object (Three.js)
     ------------------------------------------------------------------------ */
  function initHero3DObject() {
    const canvas = document.getElementById('hero-3d-canvas');
    if (!canvas || !window.THREE) return;

    const heroWrapper = canvas.parentElement;
    let width = heroWrapper.offsetWidth || window.innerWidth;
    let height = heroWrapper.offsetHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 7.5;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const blueLight = new THREE.PointLight(0x00f0ff, 4, 20);
    blueLight.position.set(4, 4, 5);
    scene.add(blueLight);

    const violetLight = new THREE.PointLight(0xa855f7, 4, 20);
    violetLight.position.set(-4, -4, 3);
    scene.add(violetLight);

    // Hero Group
    const heroGroup = new THREE.Group();

    // Outer Wireframe Icosahedron
    const outerGeo = new THREE.IcosahedronGeometry(2.4, 2);
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0x181820,
      wireframe: true,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.25
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    heroGroup.add(outerMesh);

    // Inner Glowing Core Sphere
    const innerGeo = new THREE.IcosahedronGeometry(1.2, 3);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0xa855f7,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    heroGroup.add(innerMesh);

    // Orbiting Rings
    const ringGroup = new THREE.Group();
    const nodeCount = 8;
    const ringGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.0
    });

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const nodeMesh = new THREE.Mesh(ringGeo, nodeMat);
      nodeMesh.position.x = Math.cos(angle) * 3.2;
      nodeMesh.position.y = Math.sin(angle) * 3.2;
      ringGroup.add(nodeMesh);
    }
    ringGroup.rotation.x = Math.PI / 3;
    heroGroup.add(ringGroup);

    scene.add(heroGroup);

    let clock = new THREE.Clock();

    function animateHero() {
      requestAnimationFrame(animateHero);

      const time = clock.getElapsedTime();

      outerMesh.rotation.x = time * 0.15;
      outerMesh.rotation.y = time * 0.2;

      innerMesh.rotation.x = -time * 0.25;
      innerMesh.rotation.y = -time * 0.3;

      ringGroup.rotation.z = time * 0.3;

      heroGroup.position.y = Math.sin(time * 1.2) * 0.15;

      heroGroup.rotation.y += (state.mouseX * 0.8 - heroGroup.rotation.y) * 0.05;
      heroGroup.rotation.x += (-state.mouseY * 0.6 - heroGroup.rotation.x) * 0.05;

      const scrollFactor = state.scrollY * 0.001;
      heroGroup.rotation.z = scrollFactor * 1.2;
      heroGroup.position.z = -scrollFactor * 2;

      renderer.render(scene, camera);
    }
    animateHero();

    window.addEventListener('resize', () => {
      width = heroWrapper.offsetWidth || window.innerWidth;
      height = heroWrapper.offsetHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
  }

  initBackgroundCanvas();
  initHero3DObject();

  /* ------------------------------------------------------------------------
     3. Navbar Scroll & Mobile Drawer Behavior
     ------------------------------------------------------------------------ */
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('mobile-open');
      });
    });
  }

  /* ------------------------------------------------------------------------
     4. Services Grid 3D Card Tilt & Mouse Glow Effect
     ------------------------------------------------------------------------ */
  const tiltCards = document.querySelectorAll('.3d-tilt-card');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  });

  /* ------------------------------------------------------------------------
     5. Scroll-Triggered Staggered Animations
     ------------------------------------------------------------------------ */
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.service-card, .timeline-item, .estimator-wrapper, .contact-grid, .about-grid').forEach((el, idx) => {
    el.classList.add('fade-in-element');
    el.style.transitionDelay = `${(idx % 4) * 0.12}s`;
    scrollObserver.observe(el);
  });

  /* ------------------------------------------------------------------------
     6. Horizontal Project Timeline Controls & Scroll Track
     ------------------------------------------------------------------------ */
  const timelineTrackWrapper = document.querySelector('.timeline-track-wrapper');
  const prevBtn = document.getElementById('timeline-prev');
  const nextBtn = document.getElementById('timeline-next');

  if (timelineTrackWrapper && prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      timelineTrackWrapper.scrollBy({ left: -440, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      timelineTrackWrapper.scrollBy({ left: 440, behavior: 'smooth' });
    });
  }

  /* ------------------------------------------------------------------------
     7. Interactive Repair & Cost Estimator Engine
     ------------------------------------------------------------------------ */
  const estState = {
    device: 'Laptop / Notebook',
    service: 'SSD Speed Upgrade (256GB / 512GB)',
    servicePrice: 2500,
    tier: 'Standard Genuine OEM',
    tierAdd: 0,
    speedMultiplier: 1.0,
    speedLabel: '24 - 48 Hours'
  };

  const totalPriceEl = document.getElementById('total-price');
  const timelineValEl = document.getElementById('est-timeline-val');
  const sumDeviceEl = document.getElementById('sum-device');
  const sumServiceEl = document.getElementById('sum-service');
  const sumTierEl = document.getElementById('sum-tier');
  const whatsappBookBtn = document.getElementById('btn-whatsapp-book');

  function calculateEstimate() {
    const rawTotal = Math.round((estState.servicePrice + estState.tierAdd) * estState.speedMultiplier);

    if (totalPriceEl) {
      const currentPrice = parseInt(totalPriceEl.textContent.replace(/,/g, ''), 10) || 0;
      animatePrice(currentPrice, rawTotal);
    }

    if (sumDeviceEl) sumDeviceEl.textContent = estState.device;
    if (sumServiceEl) sumServiceEl.textContent = estState.service;
    if (sumTierEl) sumTierEl.textContent = estState.tier;

    if (timelineValEl) {
      timelineValEl.textContent = estState.speedLabel;
    }

    // Build WhatsApp Message Payload for 9906405769
    if (whatsappBookBtn) {
      const message = encodeURIComponent(
        `Hi Login Computers! I calculated an estimate on your website and would like to book a slot:\n\n` +
        `📱 *Device Type:* ${estState.device}\n` +
        `🛠️ *Service Required:* ${estState.service}\n` +
        `⚙️ *Component Grade:* ${estState.tier}\n` +
        `⏱️ *Turnaround Speed:* ${estState.speedLabel}\n` +
        `💰 *Estimated Starting Price:* ₹${rawTotal.toLocaleString('en-IN')}\n\n` +
        `Please confirm repair turnaround and schedule!`
      );
      whatsappBookBtn.href = `https://wa.me/919906405769?text=${message}`;
    }
  }

  function animatePrice(start, end) {
    const duration = 600;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const val = Math.round(start + (end - start) * easeProgress);

      if (totalPriceEl) totalPriceEl.textContent = val.toLocaleString('en-IN');

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  }

  // Event Listeners for Estimator Buttons
  document.querySelectorAll('.est-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.group;
      document.querySelectorAll(`.est-opt-btn[data-group="${group}"]`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (group === 'device') {
        estState.device = btn.dataset.name;
      } else if (group === 'service') {
        estState.service = btn.dataset.name;
        estState.servicePrice = parseInt(btn.dataset.price, 10);
      } else if (group === 'tier') {
        estState.tier = btn.dataset.name;
        estState.tierAdd = parseInt(btn.dataset.add, 10);
      } else if (group === 'speed') {
        estState.speedMultiplier = parseFloat(btn.dataset.mult);
        estState.speedLabel = btn.dataset.mult > 1 ? 'Same-Day Express' : btn.dataset.mult < 1 ? '3 - 4 Days' : '24 - 48 Hours';
      }

      calculateEstimate();
    });
  });

  calculateEstimate();

  /* ------------------------------------------------------------------------
     8. Modal System for Showcase Details
     ------------------------------------------------------------------------ */
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalContent = document.getElementById('modal-content');
  const modalClose = document.getElementById('modal-close');

  const showcaseDetailsMap = {
    supernova: {
      title: 'SUPERNOVA RTX Gaming Build',
      tag: 'Custom Gaming Rig in Chadoora',
      desc: 'Liquid-cooled dual-chamber Gaming PC with RTX GPU, high-speed DDR5 RAM, 1000W Gold PSU, and customized cable routing.',
      metrics: ['4K 144Hz Gaming', '100% Genuine Parts', 'Warranty Support'],
      tech: ['Intel i7/i9', 'RTX 40-Series', 'DDR5 6000MHz', 'Custom ARGB']
    },
    cctv: {
      title: 'Commercial 4K CCTV Network',
      tag: 'Chadoora Security Installation',
      desc: '16-channel 4K HD outdoor & indoor security camera setup with night-vision infrared sensors and remote mobile streaming.',
      metrics: ['16 Camera Nodes', '24/7 Phone Stream', '1 Year Warranty'],
      tech: ['4K HD Cameras', '16-Channel NVR', 'CAT6 Cabling', 'Mobile App']
    },
    upgrade: {
      title: 'Ultra-Speed Laptop Upgrade',
      tag: 'NVMe SSD & 32GB RAM Overhaul',
      desc: 'Resurrected a slow laptop by upgrading HDD to 1TB NVMe M.2 SSD + DDR4 RAM expansion, boosting boot time from 2 mins to 4 seconds.',
      metrics: ['3500 MB/s Read Speed', '4 Sec Instant Boot', 'Zero Data Loss'],
      tech: ['NVMe M.2 SSD', 'DDR4 3200MHz', 'Thermal Compound']
    },
    motherboard: {
      title: 'Chip-Level Motherboard Repair',
      tag: 'Micro-Soldering Diagnostic Lab',
      desc: 'Replaced shorted charging IC and power delivery MOSFETs on dead Gaming Laptop motherboard, saving owner ₹45,000 replacement fee.',
      metrics: ['Saved Original Board', 'Micro-Soldered', 'Stress Tested'],
      tech: ['Micro-Soldering', 'Power IC Swap', 'Ultrasonic Clean']
    }
  };

  function openModal(html) {
    if (modalContent && modalBackdrop) {
      modalContent.innerHTML = html;
      modalBackdrop.classList.add('active');
      if (window.lucide) lucide.createIcons();
    }
  }

  function closeModal() {
    if (modalBackdrop) {
      modalBackdrop.classList.remove('active');
    }
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  document.querySelectorAll('.btn-project-detail').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.modal;
      const data = showcaseDetailsMap[key];
      if (!data) return;

      const html = `
        <div class="modal-project">
          <div class="section-tag">[ ${data.tag} ]</div>
          <h2 style="font-family: var(--font-heading); font-size: 2rem; color: #fff; margin-bottom: 12px;">${data.title}</h2>
          <p style="color: var(--text-muted); line-height: 1.6; margin-bottom: 24px;">${data.desc}</p>
          
          <div style="display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;">
            ${data.metrics.map(m => `<span style="background: rgba(0, 240, 255, 0.1); color: var(--accent-electric-blue); font-family: var(--font-mono); font-size: 0.8rem; padding: 6px 14px; border-radius: var(--radius-full); border: 1px solid rgba(0, 240, 255, 0.2);">${m}</span>`).join('')}
          </div>

          <div style="margin-bottom: 30px;">
            <div style="font-family: var(--font-heading); color: #fff; font-weight: 700; margin-bottom: 8px;">Key Specs:</div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              ${data.tech.map(t => `<span style="background: rgba(255,255,255,0.05); color: var(--text-muted); font-family: var(--font-mono); font-size: 0.75rem; padding: 4px 10px; border-radius: var(--radius-sm);">${t}</span>`).join('')}
            </div>
          </div>

          <a href="https://wa.me/919906405769?text=Hi%20Login%20Computers!%20I'm%20interested%20in%20${encodeURIComponent(data.title)}" target="_blank" class="btn btn-whatsapp btn-glow btn-full">
            <i data-lucide="message-square"></i>
            <span>Inquire via WhatsApp (9906405769)</span>
          </a>
        </div>
      `;
      openModal(html);
    });
  });

  /* ------------------------------------------------------------------------
     9. Contact Form WhatsApp Handler
     ------------------------------------------------------------------------ */
  window.handleFormSubmit = function() {
    const name = document.getElementById('form-name').value;
    const phone = document.getElementById('form-phone').value;
    const service = document.getElementById('form-service').value;
    const message = document.getElementById('form-message').value;

    const waText = encodeURIComponent(
      `Hi Login Computers! I sent an inquiry from your website:\n\n` +
      `👤 *Name:* ${name}\n` +
      `📞 *Phone:* ${phone}\n` +
      `🛠️ *Service Type:* ${service}\n` +
      `📝 *Details:* ${message}\n\n` +
      `Please let me know diagnostic status & pricing!`
    );

    const waUrl = `https://wa.me/919906405769?text=${waText}`;
    window.open(waUrl, '_blank');
  };
});
