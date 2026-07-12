// JavaScript for Login Computers - Chadoora, Budgam

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Mobile Menu Navigation
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('open');
            navMenu.classList.toggle('active');
        });

        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('open');
                navMenu.classList.remove('active');
            });
        });
    }

    // 3. Navbar Scroll Class & Active Link Tracking
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section');

    const handleScroll = () => {
        // Sticky compact navbar on scroll
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active link tracking
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    // 4. Interactive Price Estimator
    const deviceTypeSelect = document.getElementById('device-type');
    const serviceNeededSelect = document.getElementById('service-needed');
    const priceDisplay = document.getElementById('estimated-price');
    const whatsappBtn = document.getElementById('estimator-whatsapp-btn');

    // Base multipliers or prices (adjust as needed)
    const deviceMultipliers = {
        laptop: 1.0,
        desktop: 0.9, // Slightly cheaper components for desktop standardly
        gaming: 1.25  // Premium gaming parts / labor
    };

    const updatePrice = () => {
        if (!deviceTypeSelect || !serviceNeededSelect || !priceDisplay) return;

        const selectedOption = serviceNeededSelect.options[serviceNeededSelect.selectedIndex];
        const basePrice = parseInt(selectedOption.getAttribute('data-price')) || 0;
        const deviceType = deviceTypeSelect.value;
        const multiplier = deviceMultipliers[deviceType] || 1.0;

        const calculatedPrice = Math.round(basePrice * multiplier);
        
        // Premium Animate Count Up/Down for Price Display
        animatePriceValue(parseInt(priceDisplay.innerText), calculatedPrice, 400);

        // Update WhatsApp pre-filled link
        const deviceLabel = deviceTypeSelect.options[deviceTypeSelect.selectedIndex].text;
        const serviceLabel = selectedOption.text;
        const messageText = `Hi Login Computers! I checked your Estimator on the website and would like to book this service:
- Device: ${deviceLabel}
- Service: ${serviceLabel}
- Estimated Starting Cost: ₹${calculatedPrice}

Please confirm my booking and share the next available slot. Thank you!`;
        
        whatsappBtn.href = `https://wa.me/919906405769?text=${encodeURIComponent(messageText)}`;
    };

    // Price animation function
    const animatePriceValue = (start, end, duration) => {
        if (start === end) return;
        const range = end - start;
        let current = start;
        const increment = end > start ? Math.ceil(range / 15) : Math.floor(range / 15);
        const stepTime = Math.abs(Math.floor(duration / 15));
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                priceDisplay.innerText = end;
                clearInterval(timer);
            } else {
                priceDisplay.innerText = current;
            }
        }, stepTime);
    };

    if (deviceTypeSelect && serviceNeededSelect) {
        deviceTypeSelect.addEventListener('change', updatePrice);
        serviceNeededSelect.addEventListener('change', updatePrice);
        updatePrice(); // Run once at load
    }

    // 5. Contact Form Submission with Custom Toast and WhatsApp Redirection
    const contactForm = document.getElementById('contact-form');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    const showToast = (message, duration = 3000) => {
        if (!toast || !toastMessage) return;
        toastMessage.innerText = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    };

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('contact-name').value;
            const phone = document.getElementById('contact-phone').value;
            const queryTypeSelect = document.getElementById('contact-subject');
            const queryType = queryTypeSelect.options[queryTypeSelect.selectedIndex].text;
            const message = document.getElementById('contact-message').value;

            // Pre-filled text to open in WhatsApp
            const messageToSend = `Hi Login Computers! I am reaching out to you from your website contact form:
- Name: ${name}
- Phone: ${phone}
- Service Interested In: ${queryType}
- Message Details: ${message}`;

            showToast("Connecting to WhatsApp... Redirecting you now!");

            // Open WhatsApp link in new tab after showing toast for 1.5s
            setTimeout(() => {
                const whatsappUrl = `https://wa.me/919906405769?text=${encodeURIComponent(messageToSend)}`;
                window.open(whatsappUrl, '_blank');
                contactForm.reset();
            }, 1500);
        });
    }
});
