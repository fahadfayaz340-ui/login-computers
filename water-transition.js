// Liquid Water Page Transition Effect for Login Computers
// Pure vanilla JS & SVG morphing, high performance, zero external dependencies

(function () {
    // 1. Create HTML overlay elements and inject into the document
    const overlay = document.createElement('div');
    overlay.id = 'water-transition-overlay';
    overlay.innerHTML = `
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
                <linearGradient id="water-transition-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#00f2fe" />
                    <stop offset="50%" stop-color="#4f46e5" />
                    <stop offset="100%" stop-color="#9b51e0" />
                </linearGradient>
            </defs>
            <path id="water-transition-path" fill="url(#water-transition-grad)" d="M 0 100 Q 50 100 100 100 L 100 100 L 0 100 Z"></path>
        </svg>
    `;
    
    // Style overlay container
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.zIndex = '99999';
    overlay.style.pointerEvents = 'none';
    overlay.style.display = 'none'; // Hidden by default
    
    document.body.appendChild(overlay);

    const path = document.getElementById('water-transition-path');

    // Linear interpolation helper
    function lerp(start, end, amt) {
        return (1 - amt) * start + amt * end;
    }

    // Easing function (easeInOutCubic) for liquid feel
    function easeInOutCubic(x) {
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    function animateWave(targetSection) {
        overlay.style.display = 'block';
        overlay.style.pointerEvents = 'auto'; // Block clicks during transition

        let start = null;
        const duration = 650; // duration for wave cover/reveal (ms)

        function stepCover(timestamp) {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1.0);
            const eased = easeInOutCubic(progress);

            // Edge of wave rises from bottom (100) to top (0)
            const yEdge = lerp(100, 0, eased);
            // Center control point dips upwards ahead of edges to form wave crest
            let yControl;
            if (progress < 0.5) {
                yControl = lerp(100, -35, eased * 2);
            } else {
                yControl = lerp(-35, 0, (eased - 0.5) * 2);
            }

            // Draw path covering bottom half
            path.setAttribute('d', `M 0 100 L 0 ${yEdge} Q 50 ${yControl} 100 ${yEdge} L 100 100 Z`);

            if (progress < 1.0) {
                requestAnimationFrame(stepCover);
            } else {
                // Screen is fully covered! Perform instantaneous scroll to target
                if (targetSection) {
                    const navbar = document.getElementById('navbar');
                    const navbarHeight = navbar ? navbar.clientHeight : 70;
                    const targetTop = targetSection.offsetTop - navbarHeight;
                    window.scrollTo({
                        top: targetTop,
                        behavior: 'instant'
                    });
                }
                
                // Pause briefly at peak block, then reveal
                setTimeout(() => {
                    start = null;
                    requestAnimationFrame(stepReveal);
                }, 80);
            }
        }

        function stepReveal(timestamp) {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1.0);
            const eased = easeInOutCubic(progress);

            // Bottom edge sweeps up to top (revealing from bottom up)
            const yEdge = lerp(100, 0, eased);
            // Control point dips downwards as it rises
            let yControl;
            if (progress < 0.5) {
                yControl = lerp(100, 135, eased * 2);
            } else {
                yControl = lerp(135, 0, (eased - 0.5) * 2);
            }

            // Path fills top half, leaving bottom exposed
            path.setAttribute('d', `M 0 0 L 100 0 L 100 ${yEdge} Q 50 ${yControl} 0 ${yEdge} Z`);

            if (progress < 1.0) {
                requestAnimationFrame(stepReveal);
            } else {
                // Done! Hide overlay
                overlay.style.display = 'none';
                overlay.style.pointerEvents = 'none';
                // Reset path back to original state at bottom
                path.setAttribute('d', 'M 0 100 Q 50 100 100 100 L 100 100 L 0 100 Z');
            }
        }

        requestAnimationFrame(stepCover);
    }

    // Attach click interceptors to smooth transition internal page links
    document.addEventListener('click', (e) => {
        // Find anchor links
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        // Filter for local page hashes (excluding external links, phone calls, WhatsApp, directions)
        if (href && href.startsWith('#') && !link.classList.contains('no-transition')) {
            const targetId = href.slice(1);
            const targetSection = document.getElementById(targetId || 'hero');
            if (targetSection) {
                e.preventDefault();
                animateWave(targetSection);
            }
        }
    });
})();
