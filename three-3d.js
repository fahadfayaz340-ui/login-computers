// Three.js 3D Interactive Hero Engine for Login Computers
// Scoped to Hero Canvas with high-contrast, non-intrusive presentation

(function () {
    // 1. Reduced Motion & WebGL Detection
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    function isWebGLSupported() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    if (!isWebGLSupported()) return;

    // 2. Locate Hero Canvas
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const heroSection = canvas.closest('.hero-section') || canvas.parentElement;
    if (!heroSection) return;

    canvas.style.pointerEvents = 'none';

    // 3. Setup Three.js Scene
    const scene = new THREE.Scene();
    
    let width = heroSection.offsetWidth || window.innerWidth;
    let height = heroSection.offsetHeight || 400;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 6.5;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xf8fafc, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x2a7d6e, 2.0);
    dirLight1.position.set(5, 5, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x0284c7, 1.5);
    dirLight2.position.set(-5, -3, 2);
    scene.add(dirLight2);

    // 5. Materials
    const techMetalMaterial = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.3,
        metalness: 0.7
    });

    const glowTealMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a7d6e,
        emissive: 0x2a7d6e,
        emissiveIntensity: 0.8,
        roughness: 0.2
    });

    // 6. Build 3D Hero Laptop Model
    function createLaptop() {
        const laptopGroup = new THREE.Group();

        // Base Case
        const baseGeom = new THREE.BoxGeometry(2.6, 0.1, 1.8);
        const baseMesh = new THREE.Mesh(baseGeom, techMetalMaterial);
        baseMesh.position.y = -0.05;
        laptopGroup.add(baseMesh);

        // Trackpad
        const padGeom = new THREE.PlaneGeometry(0.6, 0.4);
        const padMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
        const padMesh = new THREE.Mesh(padGeom, padMat);
        padMesh.rotation.x = -Math.PI / 2;
        padMesh.position.set(0, 0.051, 0.6);
        laptopGroup.add(padMesh);

        // PCB / Circuit
        const pcbGeom = new THREE.BoxGeometry(2.4, 0.03, 1.4);
        const pcbMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.6 });
        const pcbMesh = new THREE.Mesh(pcbGeom, pcbMat);
        pcbMesh.position.y = 0.08;
        laptopGroup.add(pcbMesh);

        // Hardware Chips (CPU & RAM)
        const cpuGeom = new THREE.BoxGeometry(0.4, 0.04, 0.4);
        const cpuMesh = new THREE.Mesh(cpuGeom, glowTealMaterial);
        cpuMesh.position.set(-0.5, 0.12, -0.2);
        laptopGroup.add(cpuMesh);

        const ramGeom = new THREE.BoxGeometry(0.7, 0.03, 0.2);
        const ramMesh = new THREE.Mesh(ramGeom, glowTealMaterial);
        ramMesh.position.set(0.5, 0.12, -0.3);
        laptopGroup.add(ramMesh);

        // Screen Lid
        const screenLid = new THREE.Group();
        screenLid.position.set(0, 0.05, -0.9);

        const lidGeom = new THREE.BoxGeometry(2.6, 1.7, 0.08);
        const lidMesh = new THREE.Mesh(lidGeom, techMetalMaterial);
        lidMesh.position.set(0, 0.85, 0);
        screenLid.add(lidMesh);

        // Screen Display Texture
        const canvasTex = document.createElement('canvas');
        canvasTex.width = 512;
        canvasTex.height = 320;
        const ctx = canvasTex.getContext('2d');
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 512, 320);
        ctx.fillStyle = '#2a7d6e';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('LOGIN COMPUTERS', 30, 60);
        ctx.fillStyle = '#10b981';
        ctx.font = '18px monospace';
        ctx.fillText('DIAGNOSTICS: 100% OK', 30, 110);
        ctx.fillText('CHADOORA TECH HUB', 30, 150);

        const texture = new THREE.CanvasTexture(canvasTex);
        const displayGeom = new THREE.PlaneGeometry(2.4, 1.5);
        const displayMat = new THREE.MeshBasicMaterial({ map: texture });
        const displayMesh = new THREE.Mesh(displayGeom, displayMat);
        displayMesh.position.set(0, 0.85, 0.042);
        screenLid.add(displayMesh);

        screenLid.rotation.x = Math.PI / 2.2;
        laptopGroup.add(screenLid);

        return laptopGroup;
    }

    const laptop = createLaptop();
    scene.add(laptop);

    // 7. Ambient Particle Field
    const particleCount = 80;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        particlePositions[i] = (Math.random() - 0.5) * 12;
        particlePositions[i + 1] = (Math.random() - 0.5) * 8;
        particlePositions[i + 2] = (Math.random() - 0.5) * 8;
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
        color: 0x2a7d6e,
        size: 0.06,
        transparent: true,
        opacity: 0.6
    });
    const particleSystem = new THREE.Points(particleGeom, particleMat);
    scene.add(particleSystem);

    // 8. Interactive Mouse & Scroll Handling
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    window.addEventListener('mousemove', (e) => {
        targetMouseX = (e.clientX / window.innerWidth - 0.5) * 0.8;
        targetMouseY = (e.clientY / window.innerHeight - 0.5) * 0.8;
    });

    // 9. Animation Loop
    let clock = new THREE.Clock();

    function tick() {
        let elapsed = clock.getElapsedTime();
        let scrollY = window.scrollY || window.pageYOffset;
        let heroHeight = heroSection.offsetHeight || 500;

        // Smooth mouse interpolation
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;

        // Scale down / fade out as user scrolls past hero section
        let fadeFactor = Math.max(0, 1 - (scrollY / (heroHeight * 0.8)));
        
        if (laptop) {
            laptop.rotation.y = elapsed * 0.3 + mouseX;
            laptop.rotation.x = Math.sin(elapsed * 0.5) * 0.1 + mouseY;
            laptop.position.y = Math.sin(elapsed * 1.5) * 0.1;
            laptop.scale.set(fadeFactor, fadeFactor, fadeFactor);
        }

        if (particleSystem) {
            particleSystem.rotation.y = elapsed * 0.05;
            particleMat.opacity = 0.6 * fadeFactor;
        }

        renderer.render(scene, camera);
        requestAnimationFrame(tick);
    }

    // 10. Handle Resize
    function onResize() {
        width = heroSection.offsetWidth || window.innerWidth;
        height = heroSection.offsetHeight || 400;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    window.addEventListener('resize', onResize);
    onResize();

    requestAnimationFrame(tick);
})();
