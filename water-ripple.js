// WebGL Water Ripple Background Effect for Login Computers
// Pure vanilla WebGL, high performance, zero external dependencies

(function () {
    const heroSection = document.getElementById('hero');
    if (!heroSection) return;

    // Create Canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'hero-water-canvas';
    
    // Style Canvas to sit nicely in the background
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '1';
    canvas.style.pointerEvents = 'none'; // Keep interactive buttons clickable
    
    // Insert canvas inside the hero section, before container
    heroSection.insertBefore(canvas, heroSection.firstChild);

    // Initialize WebGL
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
        console.warn('WebGL not supported. Falling back to CSS gradients.');
        canvas.style.display = 'none';
        return;
    }

    // Shader sources
    const vsSource = `
        attribute vec2 position;
        varying vec2 vUv;
        void main() {
            vUv = position * 0.5 + 0.5;
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    const fsSource = `
        precision mediump float;
        varying vec2 vUv;
        uniform vec2 uResolution;
        uniform float uTime;

        // Configuration
        #define MAX_RIPPLES 25
        uniform vec4 uRipples[MAX_RIPPLES]; // x, y = normalized pos, z = start_time (sec), w = duration (sec)

        void main() {
            vec2 uv = vUv;
            // Handle aspect ratio for circular ripples
            vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
            vec2 totalOffset = vec2(0.0);
            
            for (int i = 0; i < MAX_RIPPLES; i++) {
                vec4 r = uRipples[i];
                float duration = r.w;
                if (duration <= 0.0) continue;
                
                float age = uTime - r.z;
                if (age < 0.0 || age > duration) continue;
                
                vec2 diff = (uv - r.xy) * aspect;
                float dist = length(diff);
                
                float waveSpeed = 0.65; // Speed of ripple wave expansion
                float waveFront = age * waveSpeed;
                
                if (dist > waveFront) continue; // Wave hasn't reached here yet
                
                float d = waveFront - dist;
                float waveLength = 0.12; // Width of the wave packet
                
                if (d < waveLength) {
                    float progress = d / waveLength; // 0 to 1
                    // Custom wave shape: sine wave that fades at edges
                    float amplitude = sin(progress * 3.14159 * 2.0) * (1.0 - progress);
                    amplitude *= (1.0 - age / duration); // Fade out over time
                    amplitude *= (1.0 - dist / 0.7);     // Fade out over distance
                    amplitude *= 0.016;                   // Base ripple strength
                    
                    vec2 dir = dist > 0.0 ? normalize(diff) : vec2(1.0, 0.0);
                    totalOffset += dir * amplitude;
                }
            }
            
            vec2 distortedUv = uv + totalOffset;
            
            // Base background color matching the original dark purple (#0a0814)
            vec3 baseBg = vec3(0.039, 0.031, 0.078);
            
            // Theme Neon Radial Glows:
            // 1. Cyber Cyan Glow (left side)
            float glow1 = 1.0 - length((distortedUv - vec2(0.15, 0.75)) * aspect);
            vec3 cyanGlow = vec3(0.0, 0.95, 1.0) * max(0.0, glow1) * 0.15;
            
            // 2. Cosmic Purple Glow (right side)
            float glow2 = 1.0 - length((distortedUv - vec2(0.85, 0.25)) * aspect);
            vec3 purpleGlow = vec3(0.61, 0.32, 0.88) * max(0.0, glow2) * 0.18;
            
            // Interactive mouse hover glow: tracking the latest added ripple
            vec4 latestRipple = uRipples[0];
            float mouseGlow = 0.0;
            if (latestRipple.w > 0.0) {
                float rAge = uTime - latestRipple.z;
                if (rAge >= 0.0 && rAge < latestRipple.w) {
                    float mouseGlowDist = length((distortedUv - latestRipple.xy) * aspect);
                    mouseGlow = smoothstep(0.25, 0.0, mouseGlowDist) * (1.0 - rAge / latestRipple.w) * 0.06;
                }
            }
            vec3 lightGlow = vec3(0.0, 0.95, 1.0) * mouseGlow;

            // Tech grid lines matching the digital/cyber workspace aesthetic
            vec2 gridUv = fract(distortedUv * vec2(28.0, 28.0 * (uResolution.y / uResolution.x)));
            float gridLine = smoothstep(0.965, 0.985, gridUv.x) + smoothstep(0.965, 0.985, gridUv.y);
            vec3 gridColor = vec3(0.0, 0.95, 1.0) * gridLine * 0.035;
            
            // Tech grid intersections dot glows
            float intersectionDot = smoothstep(0.94, 0.98, gridUv.x) * smoothstep(0.94, 0.98, gridUv.y);
            vec3 dotColor = vec3(0.0, 0.95, 1.0) * intersectionDot * 0.12;

            vec3 finalColor = baseBg + cyanGlow + purpleGlow + lightGlow + gridColor + dotColor;
            
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    // Helper: compile shader
    function compileShader(source, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    // Compile and link program
    const vs = compileShader(vsSource, gl.VERTEX_SHADER);
    const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program linking error:', gl.getProgramInfoLog(program));
        return;
    }

    gl.useProgram(program);

    // Buffers and geometry
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const vertices = new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uResolutionLocation = gl.getUniformLocation(program, 'uResolution');
    const uTimeLocation = gl.getUniformLocation(program, 'uTime');
    const uRipplesLocation = gl.getUniformLocation(program, 'uRipples');

    // Ripple array management
    const maxRipples = 25;
    const ripples = [];
    for (let i = 0; i < maxRipples; i++) {
        ripples.push([0.0, 0.0, -999.0, 0.0]); // x, y, start_time, duration
    }
    let currentRippleIndex = 0;

    function addRipple(x, y, duration = 1.4) {
        ripples[currentRippleIndex] = [x, y, performance.now() / 1000, duration];
        // Rotate newest to index 0 so shader can highlight it for mouseGlow
        // To keep it simple, we rotate the array so index 0 is always the most recent
        currentRippleIndex = (currentRippleIndex + 1) % maxRipples;
    }

    // Listen to mouse events on the hero section
    let lastMouseMoveTime = 0;
    const throttleTime = 70; // ms

    heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const now = performance.now();
        if (now - lastMouseMoveTime > throttleTime) {
            const x = (e.clientX - rect.left) / rect.width;
            const y = 1.0 - ((e.clientY - rect.top) / rect.height);
            addRipple(x, y, 1.2);
            lastMouseMoveTime = now;
        }
    });

    heroSection.addEventListener('mousedown', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = 1.0 - ((e.clientY - rect.top) / rect.height);
        // Create large ripples on click
        addRipple(x, y, 2.0);
        addRipple(x + 0.01, y - 0.01, 1.8);
    });

    // Handle touch events for mobile compatibility
    heroSection.addEventListener('touchmove', (e) => {
        if (e.touches.length === 0) return;
        const touch = e.touches[0];
        const rect = heroSection.getBoundingClientRect();
        const now = performance.now();
        if (now - lastMouseMoveTime > throttleTime) {
            const x = (touch.clientX - rect.left) / rect.width;
            const y = 1.0 - ((touch.clientY - rect.top) / rect.height);
            addRipple(x, y, 1.2);
            lastMouseMoveTime = now;
        }
    }, { passive: true });

    // Handle window resizing
    function resizeCanvas() {
        const width = heroSection.clientWidth;
        const height = heroSection.clientHeight;
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            gl.viewport(0, 0, width, height);
        }
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Render loop
    function render(now) {
        const timeSeconds = now / 1000;
        
        resizeCanvas(); // Ensure canvas size matches actual bounds

        gl.uniform2f(uResolutionLocation, canvas.width, canvas.height);
        gl.uniform1f(uTimeLocation, timeSeconds);

        // Flatten the ripples array to pass as uniform
        const flatRipples = new Float32Array(maxRipples * 4);
        // We want the most recent ripple to be at index 0 for uRipples[0] mouseGlow tracking
        // So we sort/order them by time
        const sortedRipples = [...ripples].sort((a, b) => b[2] - a[2]);
        
        for (let i = 0; i < maxRipples; i++) {
            const r = sortedRipples[i];
            const baseIdx = i * 4;
            flatRipples[baseIdx] = r[0];
            flatRipples[baseIdx + 1] = r[1];
            flatRipples[baseIdx + 2] = r[2];
            flatRipples[baseIdx + 3] = r[3];
        }

        gl.uniform4fv(uRipplesLocation, flatRipples);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
})();
