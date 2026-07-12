// Three.js 3D Interactive Scene for Login Computers
// Implements scroll-driven 3D animations, interactive models, and particles

(function () {
    // 1. WebGL Support Detection
    function isWebGLSupported() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    if (!isWebGLSupported()) {
        console.warn("WebGL not supported. 3D experience disabled.");
        return;
    }

    // 2. Add fixed canvas in the background
    const canvas = document.createElement('canvas');
    canvas.id = 'webgl-canvas';
    // Style the canvas
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '0'; // Sits behind the text, in front of the body background
    canvas.style.pointerEvents = 'none'; // Don't block clicks on links
    canvas.style.transition = 'opacity 1s ease';
    canvas.style.opacity = '0'; // Start hidden for fade-in

    // Insert after body opening
    document.body.insertBefore(canvas, document.body.firstChild);
    document.body.classList.add('webgl-active');

    // 3. Setup Three.js Scene
    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 6.5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true, // Transparent background so CSS background is visible
        antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0x0f0b24, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f2fe, 1.8); // Cyber Cyan
    dirLight1.position.set(5, 5, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x9b51e0, 1.5); // Cosmic Purple
    dirLight2.position.set(-5, -3, 2);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xff007f, 1.5, 10); // Cyber Pink accent
    pointLight.position.set(0, 0, 2);
    scene.add(pointLight);

    // 5. Materials Utilities
    const techMetalMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1636,
        roughness: 0.2,
        metalness: 0.8,
        flatShading: true
    });

    const glowCyanMaterial = new THREE.MeshStandardMaterial({
        color: 0x00f2fe,
        emissive: 0x00f2fe,
        emissiveIntensity: 1.5,
        roughness: 0.1
    });

    const glowPurpleMaterial = new THREE.MeshStandardMaterial({
        color: 0x9b51e0,
        emissive: 0x9b51e0,
        emissiveIntensity: 1.5,
        roughness: 0.1
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.25,
        roughness: 0.1,
        transmission: 0.6,
        thickness: 0.5
    });

    // 6. Create Canvas Textures for screens
    function createScreenTexture(title, statusText) {
        const textCanvas = document.createElement('canvas');
        textCanvas.width = 512;
        textCanvas.height = 512;
        const ctx = textCanvas.getContext('2d');

        // Draw Cyber Background
        ctx.fillStyle = '#0a0814';
        ctx.fillRect(0, 0, 512, 512);

        // Tech Grid lines
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.15)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 512; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 512);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(512, i);
            ctx.stroke();
        }

        // Draw text
        ctx.fillStyle = '#00f2fe';
        ctx.font = 'bold 36px monospace';
        ctx.shadowColor = '#00f2fe';
        ctx.shadowBlur = 10;
        ctx.fillText('> ' + title, 40, 80);

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#9b51e0';
        ctx.font = '28px monospace';
        ctx.fillText('STATUS: ' + statusText, 40, 150);

        ctx.fillStyle = '#ffffff';
        ctx.font = '20px monospace';
        ctx.fillText('SYS_LOAD: SECURE', 40, 210);
        ctx.fillText('HARDWARE: EXPLODED_VIEW', 40, 250);
        ctx.fillText('IP_LOC: CHADOORA_BUDGAM', 40, 290);
        ctx.fillText('HOTLINE: 9906405769', 40, 330);

        // Simulated binary stream
        ctx.fillStyle = 'rgba(0, 242, 254, 0.4)';
        ctx.font = '16px monospace';
        for (let y = 380; y < 480; y += 22) {
            let binary = '';
            for (let i = 0; i < 28; i++) binary += Math.random() > 0.5 ? '1' : '0';
            ctx.fillText(binary, 40, y);
        }

        const texture = new THREE.CanvasTexture(textCanvas);
        return texture;
    }

    // 7. Models Instantiation

    // LAPTOP MODEL (Keychron Style Exploded Components)
    function createLaptop() {
        const laptopGroup = new THREE.Group();

        // 1. Bottom Case Group
        const bottomGroup = new THREE.Group();
        bottomGroup.name = 'bottomCase';
        const baseGeom = new THREE.BoxGeometry(2.6, 0.1, 1.8);
        const baseMesh = new THREE.Mesh(baseGeom, techMetalMaterial);
        baseMesh.position.y = -0.05;
        bottomGroup.add(baseMesh);
        
        // Trackpad
        const padGeom = new THREE.PlaneGeometry(0.6, 0.4);
        const padMat = new THREE.MeshStandardMaterial({ color: 0x0f0c22, roughness: 0.5 });
        const padMesh = new THREE.Mesh(padGeom, padMat);
        padMesh.rotation.x = -Math.PI / 2;
        padMesh.position.set(0, 0.051, 0.6);
        bottomGroup.add(padMesh);
        laptopGroup.add(bottomGroup);

        // 2. PCB (Motherboard) Group
        const pcbGroup = new THREE.Group();
        pcbGroup.name = 'pcb';
        pcbGroup.position.y = 0.08;
        const pcbGeom = new THREE.BoxGeometry(2.4, 0.03, 1.4);
        const pcbMat = new THREE.MeshStandardMaterial({ color: 0x052e16, roughness: 0.6 });
        const pcbMesh = new THREE.Mesh(pcbGeom, pcbMat);
        pcbGroup.add(pcbMesh);
        
        // Circuit traces (wireframe box underneath to look like circuits)
        const traceGeom = new THREE.BoxGeometry(2.38, 0.032, 1.38);
        const traceMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, wireframe: true, transparent: true, opacity: 0.5 });
        const traces = new THREE.Mesh(traceGeom, traceMat);
        pcbGroup.add(traces);
        laptopGroup.add(pcbGroup);

        // 3. Hardware Chips Group (CPU, RAM, SSD)
        const hardwareGroup = new THREE.Group();
        hardwareGroup.name = 'hardware';
        hardwareGroup.position.y = 0.12;
        
        // CPU chip
        const cpuGeom = new THREE.BoxGeometry(0.4, 0.05, 0.4);
        const cpuMesh = new THREE.Mesh(cpuGeom, new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 0.8 }));
        cpuMesh.position.set(-0.6, 0.02, -0.2);
        
        const cpuGlow = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.3), glowCyanMaterial);
        cpuMesh.add(cpuGlow);
        hardwareGroup.add(cpuMesh);

        // RAM Stick
        const ramGeom = new THREE.BoxGeometry(0.7, 0.04, 0.25);
        const ramMesh = new THREE.Mesh(ramGeom, new THREE.MeshStandardMaterial({ color: 0x0a1c10 }));
        ramMesh.position.set(0.5, 0.02, -0.3);
        const ramGlow = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.04), glowPurpleMaterial);
        ramGlow.position.z = 0.11;
        ramMesh.add(ramGlow);
        hardwareGroup.add(ramMesh);

        // SSD Drive
        const ssdGeom = new THREE.BoxGeometry(0.6, 0.03, 0.35);
        const ssdMesh = new THREE.Mesh(ssdGeom, new THREE.MeshStandardMaterial({ color: 0x111111 }));
        ssdMesh.position.set(0.5, 0.02, 0.2);
        hardwareGroup.add(ssdMesh);
        laptopGroup.add(hardwareGroup);

        // 4. Top Plate (Chassis Top Cover) Group
        const plateGroup = new THREE.Group();
        plateGroup.name = 'topPlate';
        plateGroup.position.y = 0.16;
        const plateGeom = new THREE.BoxGeometry(2.6, 0.03, 1.8);
        const plateMesh = new THREE.Mesh(plateGeom, techMetalMaterial);
        plateGroup.add(plateMesh);
        laptopGroup.add(plateGroup);

        // 5. Keycaps Group
        const keycapsGroup = new THREE.Group();
        keycapsGroup.name = 'keycaps';
        keycapsGroup.position.y = 0.20;
        const keysGeom = new THREE.BoxGeometry(2.2, 0.05, 0.9);
        const keysMat = new THREE.MeshStandardMaterial({ color: 0x070514, roughness: 0.8 });
        const keysMesh = new THREE.Mesh(keysGeom, keysMat);
        keysMesh.position.set(0, 0, -0.15);
        keycapsGroup.add(keysMesh);
        laptopGroup.add(keycapsGroup);

        // 6. Screen Lid Group (rotates on hinge)
        const screenLidGroup = new THREE.Group();
        screenLidGroup.name = 'screenLid';
        screenLidGroup.position.set(0, 0.05, -0.9); // Pivot at hinge

        const lidMeshGeom = new THREE.BoxGeometry(2.6, 1.7, 0.06);
        const lidMesh = new THREE.Mesh(lidMeshGeom, techMetalMaterial);
        lidMesh.position.set(0, 0.85, 0.03); // Offset relative to hinge pivot
        screenLidGroup.add(lidMesh);
        
        // Screen display panel
        const displayGeom = new THREE.PlaneGeometry(2.4, 1.5);
        const displayMat = new THREE.MeshBasicMaterial({
            map: createScreenTexture('LOGIN_COMPUTERS', 'DIAGNOSTIC_READY'),
            side: THREE.DoubleSide
        });
        const displayMesh = new THREE.Mesh(displayGeom, displayMat);
        displayMesh.position.set(0, 0.85, 0.07);
        displayMesh.name = 'displayScreen';
        screenLidGroup.add(displayMesh);
        
        laptopGroup.add(screenLidGroup);

        laptopGroup.name = 'laptop';
        return laptopGroup;
    }

    // DESKTOP MODEL
    function createDesktop() {
        const desktopGroup = new THREE.Group();

        // Monitor Base Stand
        const standBaseGeom = new THREE.CylinderGeometry(0.5, 0.6, 0.05, 16);
        const standBase = new THREE.Mesh(standBaseGeom, techMetalMaterial);
        standBase.position.y = -1.1;
        desktopGroup.add(standBase);

        const standPoleGeom = new THREE.BoxGeometry(0.15, 0.8, 0.15);
        const standPole = new THREE.Mesh(standPoleGeom, techMetalMaterial);
        standPole.position.y = -0.7;
        standPole.position.z = -0.15;
        standPole.rotation.x = 0.1;
        desktopGroup.add(standPole);

        // Monitor Border/Chassis
        const monChassisGeom = new THREE.BoxGeometry(3.0, 1.9, 0.1);
        const monChassis = new THREE.Mesh(monChassisGeom, techMetalMaterial);
        monChassis.position.y = -0.1;
        desktopGroup.add(monChassis);

        // Screen
        const monScreenGeom = new THREE.PlaneGeometry(2.8, 1.7);
        const monScreenMat = new THREE.MeshBasicMaterial({
            map: createScreenTexture('LOGIN_WORKSTATION', 'ONLINE_SERVICE'),
            side: THREE.DoubleSide
        });
        const monScreen = new THREE.Mesh(monScreenGeom, monScreenMat);
        monScreen.position.set(0, -0.1, 0.06);
        desktopGroup.add(monScreen);

        // CPU Tower Case
        const cpuGroup = new THREE.Group();
        cpuGroup.position.set(2.2, -0.4, -0.5);

        const cpuCaseGeom = new THREE.BoxGeometry(1.0, 1.6, 1.6);
        const cpuCase = new THREE.Mesh(cpuCaseGeom, techMetalMaterial);
        cpuGroup.add(cpuCase);

        // Glass side panel
        const glassPanelGeom = new THREE.PlaneGeometry(1.58, 1.58);
        const glassPanel = new THREE.Mesh(glassPanelGeom, glassMaterial);
        glassPanel.position.set(0.51, 0, 0);
        glassPanel.rotation.y = Math.PI / 2;
        cpuGroup.add(glassPanel);

        // Motherboard inside CPU (glowing circuit plane)
        const moboGeom = new THREE.PlaneGeometry(1.4, 1.4);
        const moboMat = new THREE.MeshStandardMaterial({
            color: 0x052e16,
            roughness: 0.4,
            metalness: 0.1
        });
        const mobo = new THREE.Mesh(moboGeom, moboMat);
        mobo.position.set(0.4, 0, 0);
        mobo.rotation.y = Math.PI / 2;
        cpuGroup.add(mobo);

        // Inside GPU
        const gpuGeom = new THREE.BoxGeometry(0.15, 0.3, 1.1);
        const gpuMat = new THREE.MeshStandardMaterial({ color: 0x080614, roughness: 0.2 });
        const gpu = new THREE.Mesh(gpuGeom, gpuMat);
        gpu.position.set(0.3, -0.2, 0);
        
        const gpuGlowGeom = new THREE.BoxGeometry(0.02, 0.05, 0.8);
        const gpuGlow = new THREE.Mesh(gpuGlowGeom, glowPurpleMaterial);
        gpuGlow.position.x = 0.11;
        gpu.add(gpuGlow);
        cpuGroup.add(gpu);

        // CPU Cooler fan (pulsing glow)
        const coolerGeom = new THREE.TorusGeometry(0.18, 0.04, 8, 24);
        const cooler = new THREE.Mesh(coolerGeom, glowCyanMaterial);
        cooler.position.set(0.35, 0.15, 0);
        cooler.rotation.y = Math.PI / 2;
        cpuGroup.add(cooler);

        // Front fan panels
        for (let i = 0; i < 3; i++) {
            const fanRingGeom = new THREE.TorusGeometry(0.14, 0.03, 8, 24);
            const fanRing = new THREE.Mesh(fanRingGeom, glowCyanMaterial);
            fanRing.position.set(-0.51, 0.5 - i * 0.45, 0);
            fanRing.rotation.y = Math.PI / 2;
            fanRing.name = `front-fan-${i}`;
            cpuGroup.add(fanRing);
        }

        desktopGroup.add(cpuGroup);
        desktopGroup.name = 'desktop';
        return desktopGroup;
    }

    // GAMING PC RIG MODEL
    function createGamingPC() {
        const gamingGroup = new THREE.Group();

        // Big Tower Case
        const caseGeom = new THREE.BoxGeometry(1.6, 2.4, 2.2);
        const caseMesh = new THREE.Mesh(caseGeom, techMetalMaterial);
        gamingGroup.add(caseMesh);

        // Glass side panel
        const glassGeom = new THREE.PlaneGeometry(2.18, 2.38);
        const glassSide = new THREE.Mesh(glassGeom, glassMaterial);
        glassSide.position.set(0.81, 0, 0);
        glassSide.rotation.y = Math.PI / 2;
        gamingGroup.add(glassSide);

        // Cyberpunk inner framing
        const wireframeGeom = new THREE.BoxGeometry(1.62, 2.42, 2.22);
        const wireframeMat = new THREE.MeshBasicMaterial({ color: 0x9b51e0, wireframe: true });
        const wireframe = new THREE.Mesh(wireframeGeom, wireframeMat);
        gamingGroup.add(wireframe);

        // Liquid Cooling Pump
        const pumpGeom = new THREE.CylinderGeometry(0.25, 0.25, 0.15, 16);
        const pumpMat = new THREE.MeshStandardMaterial({ color: 0x0d0a21, roughness: 0.1 });
        const pump = new THREE.Mesh(pumpGeom, pumpMat);
        pump.position.set(0.5, 0.3, 0);
        pump.rotation.z = Math.PI / 2;
        
        // Liquid glow logo on pump
        const logoGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.02, 16);
        const logoMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
        const logo = new THREE.Mesh(logoGeom, logoMat);
        logo.position.y = 0.08;
        pump.add(logo);
        gamingGroup.add(pump);

        // Dual Liquid tubes
        for (let i = 0; i < 2; i++) {
            const tubeGeom = new THREE.TorusGeometry(0.4, 0.05, 8, 24, Math.PI);
            const tubeMat = new THREE.MeshStandardMaterial({
                color: 0x00f2fe,
                emissive: 0x00f2fe,
                emissiveIntensity: 1.0,
                transparent: true,
                opacity: 0.8
            });
            const tube = new THREE.Mesh(tubeGeom, tubeMat);
            tube.position.set(0.5, 0.3 + i * 0.15, 0.4);
            tube.rotation.y = Math.PI / 2;
            tube.rotation.z = -Math.PI / 4;
            gamingGroup.add(tube);
        }

        // High-end GPU
        const gpuGroup = new THREE.Group();
        gpuGroup.position.set(0.4, -0.4, 0.1);
        
        const gpuBodyGeom = new THREE.BoxGeometry(0.2, 0.4, 1.6);
        const gpuBody = new THREE.Mesh(gpuBodyGeom, new THREE.MeshStandardMaterial({ color: 0x050410, roughness: 0.3 }));
        gpuGroup.add(gpuBody);

        const gpuGlowGeom = new THREE.BoxGeometry(0.02, 0.08, 1.4);
        const gpuGlow = new THREE.Mesh(gpuGlowGeom, glowPurpleMaterial);
        gpuGlow.position.x = 0.11;
        gpuBody.add(gpuGlow);

        // GPU fan rings
        for (let i = 0; i < 2; i++) {
            const gpuFanGeom = new THREE.TorusGeometry(0.12, 0.02, 8, 16);
            const gpuFan = new THREE.Mesh(gpuFanGeom, glowCyanMaterial);
            gpuFan.position.set(0.12, 0, -0.35 + i * 0.7);
            gpuFan.rotation.y = Math.PI / 2;
            gpuGroup.add(gpuFan);
        }
        gamingGroup.add(gpuGroup);

        // Hyper RAM modules (RGB glowing sticks)
        for (let i = 0; i < 4; i++) {
            const ramGeom = new THREE.BoxGeometry(0.04, 0.5, 0.12);
            const ram = new THREE.Mesh(ramGeom, techMetalMaterial);
            ram.position.set(0.55, 0.6, -0.4 + i * 0.08);
            
            const ramRGBGeom = new THREE.BoxGeometry(0.02, 0.48, 0.03);
            const ramRGB = new THREE.Mesh(ramRGBGeom, glowCyanMaterial);
            ramRGB.position.set(0.022, 0, 0);
            ramRGB.name = `ram-rgb-${i}`;
            ram.add(ramRGB);
            gamingGroup.add(ram);
        }

        // Gaming front fans with dynamic RGB spinning
        const frontFansGroup = new THREE.Group();
        frontFansGroup.position.set(-0.81, 0, 0);

        for (let i = 0; i < 3; i++) {
            const fanGroup = new THREE.Group();
            fanGroup.position.y = 0.7 - i * 0.7;

            const ringGeom = new THREE.TorusGeometry(0.24, 0.04, 8, 32);
            const ringMat = new THREE.MeshStandardMaterial({
                color: 0x9b51e0,
                emissive: 0x9b51e0,
                emissiveIntensity: 1.2
            });
            const ring = new THREE.Mesh(ringGeom, ringMat);
            ring.rotation.y = Math.PI / 2;
            fanGroup.add(ring);

            // Fan blades
            const bladesGroup = new THREE.Group();
            bladesGroup.name = `blades`;
            bladesGroup.rotation.y = Math.PI / 2;
            
            const bladeGeom = new THREE.BoxGeometry(0.02, 0.45, 0.06);
            const bladeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 });
            for (let j = 0; j < 4; j++) {
                const blade = new THREE.Mesh(bladeGeom, bladeMat);
                blade.rotation.x = (j * Math.PI) / 4;
                bladesGroup.add(blade);
            }
            fanGroup.add(bladesGroup);
            frontFansGroup.add(fanGroup);
        }
        gamingGroup.add(frontFansGroup);

        gamingGroup.name = 'gaming';
        gamingGroup.position.y = 0.2;
        return gamingGroup;
    }

    // FLOATING TECH COMPONENTS (RAM, SSD, CPU)
    function createFloatingComponents() {
        const floatGroup = new THREE.Group();

        // 1. RAM stick
        const ramStick = new THREE.Group();
        ramStick.position.set(-1.8, 0.8, 0);
        ramStick.name = 'float-ram';
        
        const boardGeom = new THREE.BoxGeometry(1.6, 0.04, 0.4);
        const boardMat = new THREE.MeshStandardMaterial({ color: 0x052312, roughness: 0.8 });
        const board = new THREE.Mesh(boardGeom, boardMat);
        ramStick.add(board);
        
        const contactGeom = new THREE.BoxGeometry(1.5, 0.02, 0.04);
        const contactMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 1.0 }); // gold contacts
        const contact = new THREE.Mesh(contactGeom, contactMat);
        contact.position.z = -0.21;
        ramStick.add(contact);

        for (let i = 0; i < 4; i++) {
            const chipGeom = new THREE.BoxGeometry(0.24, 0.03, 0.28);
            const chipMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
            const chip = new THREE.Mesh(chipGeom, chipMat);
            chip.position.set(-0.5 + i * 0.35, 0.03, 0.04);
            ramStick.add(chip);
        }

        const barGeom = new THREE.BoxGeometry(1.6, 0.05, 0.06);
        const bar = new THREE.Mesh(barGeom, glowCyanMaterial);
        bar.position.z = 0.21;
        ramStick.add(bar);
        floatGroup.add(ramStick);

        // 2. NVMe SSD
        const ssdDrive = new THREE.Group();
        ssdDrive.position.set(1.5, 0.5, 0.5);
        ssdDrive.name = 'float-ssd';

        const ssdBoardGeom = new THREE.BoxGeometry(1.2, 0.03, 0.5);
        const ssdBoard = new THREE.Mesh(ssdBoardGeom, new THREE.MeshStandardMaterial({ color: 0x0a0c10 }));
        ssdDrive.add(ssdBoard);

        const controllerGeom = new THREE.BoxGeometry(0.25, 0.04, 0.25);
        const controller = new THREE.Mesh(controllerGeom, new THREE.MeshStandardMaterial({ color: 0xa0a0a0, metalness: 0.9 }));
        controller.position.set(-0.3, 0.035, 0);
        ssdDrive.add(controller);

        const flashGeom = new THREE.BoxGeometry(0.35, 0.035, 0.35);
        const flash1 = new THREE.Mesh(flashGeom, new THREE.MeshStandardMaterial({ color: 0x111111 }));
        flash1.position.set(0.1, 0.033, 0.04);
        const flash2 = new THREE.Mesh(flashGeom, new THREE.MeshStandardMaterial({ color: 0x111111 }));
        flash2.position.set(0.45, 0.033, -0.04);
        ssdDrive.add(flash1);
        ssdDrive.add(flash2);

        const ssdPinGeom = new THREE.BoxGeometry(0.04, 0.02, 0.4);
        const ssdPin = new THREE.Mesh(ssdPinGeom, contactMat);
        ssdPin.position.x = -0.61;
        ssdDrive.add(ssdPin);
        
        floatGroup.add(ssdDrive);

        // 3. CPU Intel-style Square Chip
        const cpuChip = new THREE.Group();
        cpuChip.position.set(0, -1.0, 0.3);
        cpuChip.name = 'float-cpu';

        const substrateGeom = new THREE.BoxGeometry(0.9, 0.04, 0.9);
        const substrate = new THREE.Mesh(substrateGeom, boardMat);
        cpuChip.add(substrate);

        const capGeom = new THREE.BoxGeometry(0.72, 0.04, 0.72);
        const cap = new THREE.Mesh(capGeom, new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 0.9, roughness: 0.2 }));
        cap.position.y = 0.04;
        cpuChip.add(cap);

        const goldRingGeom = new THREE.TorusGeometry(0.24, 0.02, 4, 16);
        const goldRing = new THREE.Mesh(goldRingGeom, glowPurpleMaterial);
        goldRing.position.y = 0.06;
        goldRing.rotation.x = Math.PI / 2;
        cpuChip.add(goldRing);
        floatGroup.add(cpuChip);

        floatGroup.name = 'floating-components';
        scene.add(floatGroup);
        return floatGroup;
    }

    // CYBER NODE CONSTELLATION
    function createConstellation() {
        const particleCount = 200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 12; // X
            positions[i + 1] = (Math.random() - 0.5) * 8; // Y
            positions[i + 2] = (Math.random() - 0.5) * 8; // Z
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0x00f2fe,
            size: 0.06,
            transparent: true,
            opacity: 0.8
        });

        const points = new THREE.Points(geometry, material);
        
        // Lines linking particles
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x9b51e0,
            transparent: true,
            opacity: 0.15
        });
        
        const lineGeometry = new THREE.BufferGeometry();
        const linePositions = [];
        const posArray = points.geometry.attributes.position.array;

        // Connect particles that are close to each other
        for (let i = 0; i < particleCount; i++) {
            const xi = posArray[i * 3];
            const yi = posArray[i * 3 + 1];
            const zi = posArray[i * 3 + 2];

            for (let j = i + 1; j < particleCount; j++) {
                const xj = posArray[j * 3];
                const yj = posArray[j * 3 + 1];
                const zj = posArray[j * 3 + 2];

                const dist = Math.sqrt(
                    (xi - xj) ** 2 +
                    (yi - yj) ** 2 +
                    (zi - zj) ** 2
                );

                if (dist < 1.6) {
                    linePositions.push(xi, yi, zi);
                    linePositions.push(xj, yj, zj);
                }
            }
        }

        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        const lines = new THREE.LineSegments(lineGeometry, lineMaterial);

        const constellationGroup = new THREE.Group();
        constellationGroup.add(points);
        constellationGroup.add(lines);
        constellationGroup.name = 'constellation';
        scene.add(constellationGroup);
        return constellationGroup;
    }

    // Add models to scene
    const laptop = createLaptop();
    const desktop = createDesktop();
    const gamingPC = createGamingPC();
    
    // Position models centered in parent groups
    const models = [laptop, desktop, gamingPC];
    models.forEach(model => {
        scene.add(model);
        model.scale.set(0.001, 0.001, 0.001); // Hide initially
    });

    const floatingParts = createFloatingComponents();
    const constellation = createConstellation();

    // Set initial active model
    let activeModel = laptop;
    let activeModelName = 'laptop';
    laptop.scale.set(1.0, 1.0, 1.0);

    // Switch model function
    function switchModel(modelType) {
        if (modelType === activeModelName) return;

        const nextModel = modelType === 'laptop' ? laptop : (modelType === 'gaming' ? gamingPC : desktop);
        
        // Outward transition for current
        gsapFadeModel(activeModel, 0.001);
        
        // Inward transition for next
        gsapFadeModel(nextModel, 1.0);

        activeModel = nextModel;
        activeModelName = modelType;
    }

    // Smooth model scaling simulation
    function gsapFadeModel(model, targetScale) {
        let currentScale = model.scale.x;
        const duration = 25; // steps
        let step = 0;

        function animateScale() {
            step++;
            const t = step / duration;
            // Smooth easeOutCubic
            const ease = 1 - Math.pow(1 - t, 3);
            const scale = currentScale + (targetScale - currentScale) * ease;
            model.scale.set(scale, scale, scale);

            if (step < duration) {
                requestAnimationFrame(animateScale);
            }
        }
        animateScale();
    }

    // Connect to select element
    const deviceSelect = document.getElementById('device-type');
    if (deviceSelect) {
        deviceSelect.addEventListener('change', (e) => {
            switchModel(e.target.value);
        });
        // Read initial state
        setTimeout(() => {
            switchModel(deviceSelect.value);
        }, 100);
    }

    // 8. Scroll Tracker
    let scrollY = window.scrollY;
    
    // Get section tops dynamically
    const heroSec = document.getElementById('hero');
    const servicesSec = document.getElementById('services');
    const estimatorSec = document.getElementById('estimator');
    const aboutSec = document.getElementById('about');

    let sectionTops = { hero: 0, services: 800, estimator: 1800, about: 2800 };

    function updateSectionTops() {
        sectionTops.hero = 0;
        if (servicesSec) sectionTops.services = servicesSec.offsetTop;
        if (estimatorSec) sectionTops.estimator = estimatorSec.offsetTop;
        if (aboutSec) sectionTops.about = aboutSec.offsetTop;
    }
    updateSectionTops();
    window.addEventListener('resize', updateSectionTops);

    // Mouse positions (parallax)
    let mouseX = 0;
    let mouseY = 0;
    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Slide number element
    const slideNumEl = document.getElementById('slide-number');

    // 9. Animation Render Loop
    let lastTime = 0;
    
    // Smooth scroll variable
    let smoothScrollY = window.scrollY;

    // Camera targets
    const targetCameraPos = new THREE.Vector3(0, 0, 6.5);
    const currentCameraPos = new THREE.Vector3(0, 0, 6.5);

    // Active Model targets
    const targetModelPos = new THREE.Vector3(2.4, 0, 0);
    const currentModelPos = new THREE.Vector3(2.4, 0, 0);

    const targetModelRot = new THREE.Vector3(0.1, -0.4, 0);
    const currentModelRot = new THREE.Vector3(0.1, -0.4, 0);

    // Floating parts targets
    const targetFloatPos = new THREE.Vector3(0, 0, -20);
    const currentFloatPos = new THREE.Vector3(0, 0, -20);
    let targetFloatScale = 0.001;
    let currentFloatScale = 0.001;

    // Constellation targets
    let targetConstellationScale = 0.001;
    let currentConstellationScale = 0.001;

    // Fade canvas in once rendering starts
    setTimeout(() => {
        canvas.style.opacity = '1';
    }, 500);

    function tick(time) {
        const elapsed = time * 0.001;
        const delta = elapsed - lastTime;
        lastTime = elapsed;

        // Smooth scroll interpolation
        smoothScrollY += (window.scrollY - smoothScrollY) * 0.1;

        // Layout configurations based on screen width (Mobile responsiveness)
        updateSectionTops();

        const sTop = smoothScrollY;
        const maxScroll = (document.documentElement.scrollHeight - window.innerHeight) || 1;

        // Update fixed slide indicator
        if (slideNumEl) {
            let slideStr = '001';
            if (sTop < sectionTops.services - 100) {
                slideStr = '001';
            } else if (sTop >= sectionTops.services - 100 && sTop < sectionTops.estimator - 100) {
                slideStr = '002';
            } else if (sTop >= sectionTops.estimator - 100 && sTop < sectionTops.about - 100) {
                slideStr = '003';
            } else {
                slideStr = '004';
            }
            slideNumEl.innerText = `${slideStr} / 004`;
        }

        const isMobile = window.innerWidth < 768;

        // Reset exploded parts variables
        let explosionProgress = 0;

        // Determine state and interpolate targets based on scroll position
        if (sTop < sectionTops.services) {
            // STATE 0: Hero Section (Home) -> laptop is normal, closed, or open but assembled
            const t = Math.max(0, Math.min(sTop / sectionTops.services, 1.0));
            explosionProgress = t; // Let laptop explode as we scroll down to services!

            // Camera
            targetCameraPos.set(0, 0, 6.5);

            // Active model positions (slide from right to left as we scroll to services)
            if (isMobile) {
                targetModelPos.set(0, -1.0, 0);
                targetModelRot.set(0.1, -0.3 + elapsed * 0.08, 0);
            } else {
                const xPos = 2.4 - t * 4.8; // Slide from 2.4 to -2.4
                targetModelPos.set(xPos, -0.2, 0);
                targetModelRot.set(0.1, -0.5 + t * 1.5 + elapsed * 0.05, 0);
            }

            // Floating components: Hidden
            targetFloatPos.set(0, 0, -10);
            targetFloatScale = 0.001;

            // Constellation: Hidden
            targetConstellationScale = 0.001;

        } else if (sTop >= sectionTops.services && sTop < sectionTops.estimator) {
            // STATE 1: Services Section -> Exploded view is maximum!
            const t = Math.max(0, Math.min((sTop - sectionTops.services) / (sectionTops.estimator - sectionTops.services), 1.0));
            explosionProgress = 1.0; // Max exploded status

            // Camera
            targetCameraPos.set(0, 0, 6.8);

            // Model sits on left, floating components fly in on right
            if (isMobile) {
                targetModelPos.set(0, -2.0, -2);
                targetModelRot.set(0.2, 0.4 + elapsed * 0.1, 0);
                
                targetFloatPos.set(0, 0.8, -0.5);
                targetFloatScale = 0.6;
            } else {
                targetModelPos.set(-2.4, -0.5, 0);
                targetModelRot.set(0.2, 1.0 + elapsed * 0.08, 0);

                // Floating parts slide into center-right (x = 2.2)
                targetFloatPos.set(2.2, 0.1, 0);
                targetFloatScale = 1.0;
            }

            targetConstellationScale = 0.001;

        } else if (sTop >= sectionTops.estimator && sTop < sectionTops.about) {
            // STATE 2: Estimator Section -> Fades back together or transitions
            const t = Math.max(0, Math.min((sTop - sectionTops.estimator) / (sectionTops.about - sectionTops.estimator), 1.0));
            explosionProgress = 1.0 - t; // Assemble back together!

            // Camera
            targetCameraPos.set(0, 0, 6.5);

            // Active model sits next to calculator on desktop (left x = -2.4)
            if (isMobile) {
                targetModelPos.set(0, -1.2, 0);
                targetModelRot.set(0.1, 0.2 + elapsed * 0.1, 0);
            } else {
                targetModelPos.set(-2.4, -0.2, 0);
                targetModelRot.set(0.1, 0.4 + elapsed * 0.05, 0);
            }

            // Floating components: Hidden
            targetFloatScale = 0.001;
            targetFloatPos.set(0, 0, -10);

            // Constellation begins to fade in
            targetConstellationScale = t * 1.0;

        } else {
            // STATE 3: About / Contact Section (End of Page)
            const t = Math.max(0, Math.min((sTop - sectionTops.about) / (maxScroll - sectionTops.about || 1), 1.0));
            explosionProgress = 0; // Assembled

            // Model moves deep into background center
            targetModelPos.set(0, 0.5, -4);
            targetModelRot.set(elapsed * 0.1, elapsed * 0.15, 0);

            // Floating components: Hidden
            targetFloatScale = 0.001;

            // Constellation completely visible and rotating
            targetConstellationScale = 1.2;
            targetCameraPos.set(0, 0, 7.5);
        }

        // Apply Lerp for smooth transitions
        currentCameraPos.lerp(targetCameraPos, 0.05);
        camera.position.copy(currentCameraPos);

        currentModelPos.lerp(targetModelPos, 0.05);
        currentModelRot.lerp(targetModelRot, 0.05);

        // Position models
        models.forEach(model => {
            model.position.copy(currentModelPos);
            // Combine scroll rotation, time rotation, and mouse parallax
            model.rotation.set(
                currentModelRot.x + (mouseY * 0.25),
                currentModelRot.y + (mouseX * 0.25),
                currentModelRot.z
            );
        });

        // Exploded laptop mesh controls
        const bottom = laptop.getObjectByName('bottomCase');
        const pcb = laptop.getObjectByName('pcb');
        const hardware = laptop.getObjectByName('hardware');
        const topPlate = laptop.getObjectByName('topPlate');
        const keycaps = laptop.getObjectByName('keycaps');
        const screenLid = laptop.getObjectByName('screenLid');

        const exp = explosionProgress;

        if (bottom) bottom.position.y = -0.05 - exp * 0.4;
        if (pcb) pcb.position.y = 0.08 - exp * 0.1;
        if (hardware) {
            hardware.position.y = 0.12 + exp * 0.25;
            // Let hardware parts slide out horizontally too!
            const cpu = hardware.children[0];
            const ram = hardware.children[1];
            const ssd = hardware.children[2];
            if (cpu) cpu.position.set(-0.6 - exp * 0.5, 0.02, -0.2 - exp * 0.3);
            if (ram) ram.position.set(0.5 + exp * 0.6, 0.02, -0.3 - exp * 0.2);
            if (ssd) ssd.position.set(0.5 + exp * 0.6, 0.02, 0.2 + exp * 0.3);
        }
        if (topPlate) topPlate.position.y = 0.16 + exp * 0.6;
        if (keycaps) keycaps.position.y = 0.20 + exp * 1.1;
        if (screenLid) {
            screenLid.position.set(0, 0.05 + exp * 0.8, -0.9 - exp * 0.5);
            // Rotate the screen open wider
            screenLid.rotation.x = Math.PI / 1.8 + exp * 0.4; // opens from 100deg to 125deg
        }

        // Position & Scale floating parts
        currentFloatPos.lerp(targetFloatPos, 0.05);
        currentFloatScale += (targetFloatScale - currentFloatScale) * 0.05;
        
        floatingParts.position.copy(currentFloatPos);
        floatingParts.scale.set(currentFloatScale, currentFloatScale, currentFloatScale);

        // Position & Scale constellation
        currentConstellationScale += (targetConstellationScale - currentConstellationScale) * 0.05;
        constellation.scale.set(currentConstellationScale, currentConstellationScale, currentConstellationScale);
        constellation.rotation.y = elapsed * 0.03;
        constellation.rotation.x = elapsed * 0.01;

        // Individual component animations
        // 1. Spinning fans in Gaming PC
        const gamingBlades = gamingPC.getObjectByName('blades');
        if (gamingBlades) {
            gamingBlades.children.forEach(bGroup => {
                bGroup.rotation.x += 0.25; // Super-fast spinning fans
            });
        }

        // 2. Front fans in Desktop CPU case
        for (let i = 0; i < 3; i++) {
            const fan = desktop.getObjectByName(`front-fan-${i}`);
            if (fan) fan.rotation.z += 0.1;
        }

        // 3. Floating parts individual rotations & sinus hovers
        const floatRam = floatingParts.getObjectByName('float-ram');
        if (floatRam) {
            floatRam.position.y = 0.8 + Math.sin(elapsed * 2) * 0.15;
            floatRam.rotation.y = elapsed * 0.8;
            floatRam.rotation.x = Math.sin(elapsed) * 0.2;
        }

        const floatSsd = floatingParts.getObjectByName('float-ssd');
        if (floatSsd) {
            floatSsd.position.y = 0.3 + Math.sin(elapsed * 1.5) * 0.12;
            floatSsd.rotation.y = -elapsed * 0.5;
            floatSsd.rotation.z = Math.cos(elapsed * 0.7) * 0.15;
        }

        const floatCpu = floatingParts.getObjectByName('float-cpu');
        if (floatCpu) {
            floatCpu.position.y = -0.5 + Math.sin(elapsed * 1.8) * 0.1;
            floatCpu.rotation.y = elapsed * 0.6;
            floatCpu.rotation.x = Math.cos(elapsed) * 0.18;
        }

        // 4. Gaming PC RAM RGB color cycles
        for (let i = 0; i < 4; i++) {
            const rgbBar = gamingPC.getObjectByName(`ram-rgb-${i}`);
            if (rgbBar) {
                const hue = (elapsed * 0.1 + i * 0.15) % 1.0;
                rgbBar.material.color.setHSL(hue, 1.0, 0.5);
                rgbBar.material.emissive.setHSL(hue, 1.0, 0.5);
            }
        }

        renderer.render(scene, camera);
        requestAnimationFrame(tick);
    }

    // 10. Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    // Start rendering
    requestAnimationFrame(tick);
})();
