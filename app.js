/* ==========================================================================
   AGY — Creative Digital Agency Interactive Engine & 3D WebGL
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

    // Animation Loop
    let clock = new THREE.Clock();

    function animateBg() {
      requestAnimationFrame(animateBg);

      const elapsedTime = clock.getElapsedTime();

      // Smooth subtle particle rotation
      particleSystem.rotation.y = elapsedTime * 0.02 + state.mouseX * 0.1;
      particleSystem.rotation.x = elapsedTime * 0.01 + state.mouseY * 0.1;

      // Smooth mouse interpolation
      state.mouseX += (state.targetMouseX - state.mouseX) * 0.05;
      state.mouseY += (state.targetMouseY - state.mouseY) * 0.05;

      renderer.render(scene, camera);
    }
    animateBg();

    // Resize Handler
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

    // Group for Masterpiece Geometric Object
    const heroGroup = new THREE.Group();

    // 1. Outer Wireframe Icosahedron
    const outerGeo = new THREE.IcosahedronGeometry(2.4, 2);
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0x181820,
      wireframe: true,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.2
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    heroGroup.add(outerMesh);

    // 2. Inner Glowing Core Sphere
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

    // 3. Orbiting Geometric Ring Nodes
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

    // Animation Loop
    let clock = new THREE.Clock();

    function animateHero() {
      requestAnimationFrame(animateHero);

      const time = clock.getElapsedTime();

      // Continuous organic rotation & floating float animation
      outerMesh.rotation.x = time * 0.15;
      outerMesh.rotation.y = time * 0.2;

      innerMesh.rotation.x = -time * 0.25;
      innerMesh.rotation.y = -time * 0.3;

      ringGroup.rotation.z = time * 0.3;

      // Levitation sine wave
      heroGroup.position.y = Math.sin(time * 1.2) * 0.15;

      // Mouse Parallax smooth lerp
      heroGroup.rotation.y += (state.mouseX * 0.8 - heroGroup.rotation.y) * 0.05;
      heroGroup.rotation.x += (-state.mouseY * 0.6 - heroGroup.rotation.x) * 0.05;

      // Scroll dynamics
      const scrollFactor = state.scrollY * 0.001;
      heroGroup.rotation.z = scrollFactor * 1.2;
      heroGroup.position.z = -scrollFactor * 2;

      renderer.render(scene, camera);
    }
    animateHero();

    // Resize Handler
    window.addEventListener('resize', () => {
      width = heroWrapper.offsetWidth || window.innerWidth;
      height = heroWrapper.offsetHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
  }

  // Execute WebGL canvas renders
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

      // Set CSS variables for radial mouse border glow
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // Calculate 3D tilt
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

  document.querySelectorAll('.service-card, .timeline-item, .estimator-wrapper, .contact-grid').forEach((el, idx) => {
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
     7. Interactive Project Cost Estimator Calculator Engine
     ------------------------------------------------------------------------ */
  const estState = {
    basePrice: 6000,
    baseWeeks: 4,
    complexityMultiplier: 1.2,
    complexityLabel: 'Advanced 3D (WebGL)',
    modulesPrice: 1200,
    modulesWeeks: 1,
    paceMultiplier: 1.0,
    selectedScopeName: '3D Web Experience Core',
    selectedModules: ['SEO & Analytics Engine']
  };

  const totalPriceEl = document.getElementById('total-price');
  const timelineValEl = document.getElementById('est-timeline-val');
  const breakdownListEl = document.getElementById('summary-breakdown-list');
  const complexityBadge = document.getElementById('complexity-badge');
  const complexityRange = document.getElementById('complexity-range');

  function calculateEstimate() {
    // Math logic
    const total = Math.round((estState.basePrice * estState.complexityMultiplier + estState.modulesPrice) * estState.paceMultiplier);
    const totalWeeks = Math.max(2, Math.round((estState.baseWeeks + estState.modulesWeeks) * (estState.paceMultiplier < 1 ? 1.1 : estState.paceMultiplier > 1 ? 0.75 : 1.0)));

    // Animate Number Counter
    if (totalPriceEl) {
      const currentPrice = parseInt(totalPriceEl.textContent.replace(/,/g, ''), 10) || 0;
      animatePrice(currentPrice, total);
    }

    if (timelineValEl) {
      timelineValEl.textContent = `${totalWeeks} - ${totalWeeks + 1} Weeks`;
    }

    // Render Breakdown List
    if (breakdownListEl) {
      breakdownListEl.innerHTML = '';
      
      const items = [
        estState.selectedScopeName,
        estState.complexityLabel,
        ...estState.selectedModules
      ];

      items.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<i data-lucide="check"></i> <span>${item}</span>`;
        breakdownListEl.appendChild(li);
      });

      if (window.lucide) lucide.createIcons();
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

      totalPriceEl.textContent = val.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  }

  // Handle Option Buttons (Scope & Pace)
  document.querySelectorAll('.est-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.group;
      document.querySelectorAll(`.est-opt-btn[data-group="${group}"]`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (group === 'type') {
        estState.basePrice = parseInt(btn.dataset.price, 10);
        estState.baseWeeks = parseInt(btn.dataset.weeks, 10);
        estState.selectedScopeName = btn.querySelector('span').textContent + ' Core';
      } else if (group === 'pace') {
        estState.paceMultiplier = parseFloat(btn.dataset.multiplier);
      }

      calculateEstimate();
    });
  });

  // Handle Complexity Range Slider
  if (complexityRange) {
    const labels = [
      { mult: 0.85, label: 'Standard 2D UI' },
      { mult: 1.0, label: 'Subtle Micro-UI Animations' },
      { mult: 1.25, label: 'Advanced 3D (WebGL)' },
      { mult: 1.6, label: 'Custom GLSL Shader Engine' }
    ];

    complexityRange.addEventListener('input', (e) => {
      const idx = parseInt(e.target.value, 10) - 1;
      const selected = labels[idx];
      estState.complexityMultiplier = selected.mult;
      estState.complexityLabel = selected.label;
      
      if (complexityBadge) {
        complexityBadge.textContent = selected.label;
      }

      calculateEstimate();
    });
  }

  // Handle Checkboxes
  document.querySelectorAll('.est-checkbox').forEach(chk => {
    chk.addEventListener('change', () => {
      let sumPrice = 0;
      let sumWeeks = 0;
      const selectedMods = [];

      document.querySelectorAll('.est-checkbox:checked').forEach(c => {
        sumPrice += parseInt(c.dataset.price, 10);
        sumWeeks += parseInt(c.dataset.weeks, 10);
        const text = c.closest('.est-check-card').querySelector('.check-text').textContent.split(' (')[0];
        selectedMods.push(text);
      });

      estState.modulesPrice = sumPrice;
      estState.modulesWeeks = sumWeeks;
      estState.selectedModules = selectedMods;

      calculateEstimate();
    });
  });

  // Initial Calculation
  calculateEstimate();

  /* ------------------------------------------------------------------------
     8. Modal System for Case Studies & Proposal Request
     ------------------------------------------------------------------------ */
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalContent = document.getElementById('modal-content');
  const modalClose = document.getElementById('modal-close');

  const projectDetailsMap = {
    nebula: {
      title: 'NEBULA-X Spatial Configurator',
      tag: '3D & WebGL Engine',
      desc: 'Built a full WebGL interactive hardware configurator allowing global architecture firms to customize high-end modular fittings in real time.',
      metrics: ['+490% Conversion Surge', '60 FPS on Mobile', '3.8M Impressions'],
      tech: ['Three.js', 'Custom Shaders', 'WebGPU', 'GLTF Pipeline']
    },
    quantum: {
      title: 'QUANTUM PROTOCOL Analytics',
      tag: 'FinTech Spatial Interface',
      desc: 'Engineered a spatial data visualization platform for institutional trading desks, rendering 50,000+ real-time tick transactions per second.',
      metrics: ['<15ms Render Latency', '$2.4B Volume Tracked', 'Zero Memory Leak'],
      tech: ['React', 'Three.js', 'WebSockets', 'Canvas 2D/3D']
    },
    synthesis: {
      title: 'SYNTHESIS AI Generative Studio',
      tag: 'AI + Web Canvas Studio',
      desc: 'Created an intelligent web canvas where designers collaborate with generative AI models to craft kinetic design systems and code.',
      metrics: ['120K+ Generated Components', '4.9/5 Rating', '85% Faster Prototyping'],
      tech: ['Next.js', 'TypeScript', 'Web Workers', 'Gemini AI API']
    },
    vortex: {
      title: 'VORTEX HYPERCAR Showroom',
      tag: 'Photorealistic WebGL Showroom',
      desc: 'Constructed an immersive 3D automotive showroom with real-time ray-traced reflections, metallic lacquer shaders, and interior customization.',
      metrics: ['4K HDR Material Fidelity', '12 Min Session Length', 'Award Winning WebGL'],
      tech: ['Three.js', 'HDR Environment Maps', 'Post-Processing Shaders']
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

  // Handle Case Study Clicks
  document.querySelectorAll('.btn-project-detail').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.modal;
      const data = projectDetailsMap[key];
      if (!data) return;

      const html = `
        <div class="modal-project">
          <div class="section-tag">[ ${data.tag} ]</div>
          <h2 style="font-family: var(--font-heading); font-size: 2rem; color: #fff; margin-bottom: 12px;">${data.title}</h2>
          <p style="color: var(--text-muted); line-height: 1.6; margin-bottom: 24px;">${data.desc}</p>
          
          <div style="display: flex; gap: 12px; margin-bottom: 24px;">
            ${data.metrics.map(m => `<span style="background: rgba(0, 240, 255, 0.1); color: var(--accent-electric-blue); font-family: var(--font-mono); font-size: 0.8rem; padding: 6px 14px; border-radius: var(--radius-full); border: 1px solid rgba(0, 240, 255, 0.2);">${m}</span>`).join('')}
          </div>

          <div style="margin-bottom: 30px;">
            <div style="font-family: var(--font-heading); color: #fff; font-weight: 700; margin-bottom: 8px;">Built With:</div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              ${data.tech.map(t => `<span style="background: rgba(255,255,255,0.05); color: var(--text-muted); font-family: var(--font-mono); font-size: 0.75rem; padding: 4px 10px; border-radius: var(--radius-sm);">${t}</span>`).join('')}
            </div>
          </div>

          <button class="btn btn-primary btn-glow btn-full" onclick="document.getElementById('modal-backdrop').classList.remove('active'); location.href='#contact';">
            <span>Discuss Similar Project</span>
            <i data-lucide="arrow-right"></i>
          </button>
        </div>
      `;
      openModal(html);
    });
  });

  // Proposal Button Click
  const btnProposal = document.getElementById('btn-request-proposal');
  if (btnProposal) {
    btnProposal.addEventListener('click', () => {
      const price = totalPriceEl.textContent;
      const timeline = timelineValEl.textContent;

      const html = `
        <div class="modal-proposal text-center">
          <div class="section-tag">[ DISCOVERY CALL ]</div>
          <h2 style="font-family: var(--font-heading); font-size: 2rem; color: #fff; margin-bottom: 12px;">Reserve Your Project Spot</h2>
          <p style="color: var(--text-muted); margin-bottom: 20px;">Your calculated scope estimate: <strong style="color: var(--accent-electric-blue);">$${price} USD</strong> (${timeline})</p>
          
          <p style="font-size: 0.9rem; color: var(--text-dim); margin-bottom: 24px;">Our lead 3D architect will review your configuration and prepare a custom technical roadmap.</p>
          
          <button class="btn btn-primary btn-glow btn-full" onclick="document.getElementById('modal-backdrop').classList.remove('active'); location.href='#contact';">
            <span>Proceed to Contact Form</span>
            <i data-lucide="send"></i>
          </button>
        </div>
      `;
      openModal(html);
    });
  }

  /* ------------------------------------------------------------------------
     9. Form Submission Handler
     ------------------------------------------------------------------------ */
  window.handleFormSubmit = function() {
    const statusEl = document.getElementById('form-status');
    const btnSubmit = document.getElementById('btn-form-submit');
    const name = document.getElementById('form-name').value;

    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.querySelector('span').textContent = 'Transmitting...';
    }

    setTimeout(() => {
      if (statusEl) {
        statusEl.style.color = 'var(--accent-electric-blue)';
        statusEl.textContent = `Thank you, ${name}! Your inquiry has been received. Our team will respond within 6 hours.`;
      }
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.querySelector('span').textContent = 'Message Transmitted ✓';
      }
      document.getElementById('contact-form').reset();
    }, 1200);
  };
});
