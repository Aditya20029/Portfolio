// Portfolio Website JavaScript
// Main functionality and animations (FIXED)

document.addEventListener('DOMContentLoaded', function() {
    initThemeToggle();          // ✅ must run early
    applySavedTheme();          // ✅ actually apply theme class
    initNavigation();
    initAnimations();
    initPageSpecificFeatures();
    initImageFallbacks();       // ✅ fix broken images everywhere
});

/* =========================
   1) NAVIGATION
========================= */
function initNavigation() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });

        // Close after click
        mobileMenu.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => mobileMenu.classList.add('hidden'));
        });
    }

    // Smooth scrolling for anchor links (only for same-page anchors)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    updateActiveNavigation();
}

/* =========================
   2) ANIMATIONS
========================= */
function initAnimations() {
    if (typeof IntersectionObserver === 'undefined' || typeof anime === 'undefined') return;

    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const element = entry.target;

            if (element.classList.contains('fade-in-up')) {
                anime({ targets: element, opacity: [0, 1], translateY: [30, 0], duration: 800, easing: 'easeOutQuart' });
            }

            if (element.classList.contains('fade-in-left')) {
                anime({ targets: element, opacity: [0, 1], translateX: [-30, 0], duration: 800, easing: 'easeOutQuart' });
            }

            if (element.classList.contains('fade-in-right')) {
                anime({ targets: element, opacity: [0, 1], translateX: [30, 0], duration: 800, easing: 'easeOutQuart' });
            }

            if (element.classList.contains('stagger-item')) {
                const parent = element.parentElement;
                const items = parent ? parent.querySelectorAll('.stagger-item') : [];
                const index = Array.from(items).indexOf(element);

                anime({
                    targets: element,
                    opacity: [0, 1],
                    translateY: [20, 0],
                    duration: 600,
                    delay: Math.max(index, 0) * 100,
                    easing: 'easeOutQuart'
                });
            }

            observer.unobserve(element);
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .stagger-item')
        .forEach(el => observer.observe(el));
}

/* =========================
   3) PAGE ROUTING
========================= */
function initPageSpecificFeatures() {
    const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

    switch(currentPage) {
        case 'index.html':
        case '':
            initHomePage();
            break;
        case 'projects.html':
            initProjectsPage();
            break;
        case 'skills.html':
            initSkillsPage();
            break;
        case 'contact.html':
            initContactPage();
            break;
    }
}

/* =========================
   4) HOME PAGE
========================= */
function initHomePage() {
    // Typewriter effect (UPDATED for Aditya)
    if (document.getElementById('typed-text') && typeof Typed !== 'undefined') {
        new Typed('#typed-text', {
            strings: [
                'Aditya Velpula',
                'a Data Analyst',
                'an AWS Analytics Builder',
                'a Python + SQL Engineer',
                'a Machine Learning Enthusiast'
            ],
            typeSpeed: 60,
            backSpeed: 35,
            backDelay: 1600,
            loop: true,
            showCursor: true,
            cursorChar: '|'
        });
    }

    // Animated counters
    const counters = document.querySelectorAll('.counter');
    if (counters.length && typeof anime !== 'undefined') {
        const counterObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'), 10) || 0;

                anime({
                    targets: counter,
                    innerHTML: [0, target],
                    duration: 1600,
                    round: 1,
                    easing: 'easeOutQuart'
                });

                counterObserver.unobserve(counter);
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => counterObserver.observe(counter));
    }

    // Projects carousel
    if (document.getElementById('projects-carousel') && typeof Splide !== 'undefined') {
        new Splide('#projects-carousel', {
            type: 'loop',
            perPage: 2,
            perMove: 1,
            gap: '2rem',
            autoplay: true,
            interval: 4500,
            pauseOnHover: true,
            breakpoints: {
                1024: { perPage: 2 },
                768: { perPage: 1, gap: '1rem' }
            }
        }).mount();
    }
}

/* =========================
   5) PROJECTS PAGE (FIXED)
   - Pills work
   - Search works
   - Sort works
   - Hides layout properly
========================= */
function initProjectsPage() {
    const searchInput = document.getElementById('search-input');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sort-select');
    const projectsGrid = document.getElementById('projects-grid');
    const noResults = document.getElementById('no-results');

    if (!projectsGrid) return;

    let currentFilter = 'all';
    let currentSort = (sortSelect?.value || 'date');

    const getCards = () => Array.from(document.querySelectorAll('.project-card'));

    // IMPORTANT: make hidden remove layout
    function hideCard(card) {
        card.classList.add('hidden');
        card.style.display = 'none'; // ✅ removes layout gap
    }

    function showCard(card) {
        card.classList.remove('hidden');
        card.style.display = 'block';
    }

    function filterProjects() {
        const searchTerm = (searchInput?.value || '').toLowerCase().trim();
        const cards = getCards();

        let visibleCount = 0;

        cards.forEach(card => {
            const title = (card.getAttribute('data-name') || '').toLowerCase();
            const tech = (card.getAttribute('data-tech') || '').toLowerCase();

            const matchesSearch = !searchTerm || title.includes(searchTerm) || tech.includes(searchTerm);
            const matchesFilter = currentFilter === 'all' || tech.includes(currentFilter);

            if (matchesSearch && matchesFilter) {
                showCard(card);
                visibleCount++;
            } else {
                hideCard(card);
            }
        });

        if (noResults) {
            noResults.classList.toggle('hidden', visibleCount !== 0);
        }

        // Animate visible cards
        if (typeof anime !== 'undefined') {
            const visibleCards = cards.filter(c => c.style.display !== 'none');
            anime({
                targets: visibleCards,
                opacity: [0, 1],
                scale: [0.98, 1],
                duration: 500,
                delay: anime.stagger(90),
                easing: 'easeOutQuart'
            });
        }
    }

    function sortProjects() {
        const cards = getCards();

        cards.sort((a, b) => {
            const aName = a.getAttribute('data-name') || '';
            const bName = b.getAttribute('data-name') || '';
            const aTech = a.getAttribute('data-tech') || '';
            const bTech = b.getAttribute('data-tech') || '';

            if (currentSort === 'name') return aName.localeCompare(bName);
            if (currentSort === 'tech') return aTech.localeCompare(bTech);
            return 0; // date: keep original order
        });

        cards.forEach(card => projectsGrid.appendChild(card));
        filterProjects(); // keep filters applied after sort
    }

    // Search
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterProjects, 80));
    }

    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            currentFilter = this.getAttribute('data-filter') || 'all';
            filterProjects();
        });
    });

    // Sort
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            currentSort = this.value;
            sortProjects();
        });
    }

    // Initial
    filterProjects();
}

/* =========================
   6) SKILLS PAGE
========================= */
function initSkillsPage() {
    const skillCategories = document.querySelectorAll('.skill-category[data-category]');
    const skillsContainers = document.querySelectorAll('[id$="-skills"]');

    // Radar chart (keep if present)
    if (document.getElementById('skills-radar') && typeof echarts !== 'undefined') {
        const radarChart = echarts.init(document.getElementById('skills-radar'));

        const option = {
            title: { text: 'Skills Overview', left: 'center' },
            tooltip: {},
            radar: {
                indicator: [
                    { name: 'Python', max: 100 },
                    { name: 'SQL', max: 100 },
                    { name: 'R', max: 100 },
                    { name: 'AWS', max: 100 },
                    { name: 'ML', max: 100 },
                    { name: 'Visualization', max: 100 }
                ],
                radius: '60%'
            },
            series: [{
                type: 'radar',
                data: [{
                    value: [90, 90, 82, 80, 84, 78],
                    name: 'Skill Strength',
                    areaStyle: { opacity: 0.18 }
                }]
            }]
        };

        radarChart.setOption(option);
        window.addEventListener('resize', () => radarChart.resize());
    }

    // Category switching (bars)
    skillCategories.forEach(category => {
        category.addEventListener('click', function() {
            const targetCategory = this.getAttribute('data-category');

            skillCategories.forEach(cat => cat.classList.remove('active'));
            this.classList.add('active');

            skillsContainers.forEach(container => { container.style.display = 'none'; });

            const targetContainer = document.getElementById(`${targetCategory}-skills`);
            if (targetContainer) {
                targetContainer.style.display = 'block';

                const skillBars = targetContainer.querySelectorAll('.skill-progress');
                skillBars.forEach(bar => (bar.style.width = '0%'));

                setTimeout(() => {
                    skillBars.forEach((bar, index) => {
                        const width = bar.getAttribute('data-width') || '0';
                        if (typeof anime !== 'undefined') {
                            anime({
                                targets: bar,
                                width: `${width}%`,
                                duration: 900,
                                delay: index * 90,
                                easing: 'easeOutQuart'
                            });
                        } else {
                            bar.style.width = `${width}%`;
                        }
                    });
                }, 120);
            }
        });
    });

    // Initialize first category
    if (skillCategories.length > 0) skillCategories[0].click();
}

/* =========================
   7) CONTACT PAGE
========================= */
function initContactPage() {
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const successMessage = document.getElementById('success-message');

    if (!contactForm) return;

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateContactForm()) submitForm();
    });

    function validateContactForm() {
        let isValid = true;
        const fields = ['name', 'email', 'subject', 'message'];

        fields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            const errorElement = document.getElementById(`${fieldName}-error`);
            if (!field || !errorElement) return;

            if (!field.value.trim()) {
                showFieldError(field, errorElement, 'This field is required');
                isValid = false;
            } else if (fieldName === 'email' && !isValidEmail(field.value)) {
                showFieldError(field, errorElement, 'Please enter a valid email address');
                isValid = false;
            } else {
                clearFieldError(field, errorElement);
            }
        });

        return isValid;
    }

    function showFieldError(field, errorElement, message) {
        field.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    function clearFieldError(field, errorElement) {
        field.classList.remove('error');
        errorElement.classList.remove('show');
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function submitForm() {
        if (!submitBtn) return;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        setTimeout(() => {
            if (successMessage) successMessage.classList.add('show');
            contactForm.reset();

            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';

            setTimeout(() => {
                if (successMessage) successMessage.classList.remove('show');
            }, 4500);
        }, 900);
    }
}

/* =========================
   8) THEME (FIXED)
========================= */
function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;

    themeToggle.addEventListener('click', toggleTheme);
    updateThemeIcon();
}

function applySavedTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.toggle('dark', theme === 'dark');
    updateThemeIcon();
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;
    const isDark = document.documentElement.classList.contains('dark');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
}

/* =========================
   9) IMAGE FALLBACKS (FIXED)
========================= */
function initImageFallbacks() {
    const FALLBACKS = {
        hero: "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?auto=format&fit=crop&w=1600&q=80",
        profile: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
        project: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
        cert: "https://images.unsplash.com/photo-1556155092-8707de31f9c4?auto=format&fit=crop&w=600&q=80"
    };

    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            const alt = (img.getAttribute('alt') || '').toLowerCase();
            if (alt.includes('profile')) img.src = FALLBACKS.profile;
            else if (alt.includes('hero')) img.src = FALLBACKS.hero;
            else if (alt.includes('cert')) img.src = FALLBACKS.cert;
            else img.src = FALLBACKS.project;

            img.style.objectFit = 'cover';
        });
    });
}

/* =========================
   10) UTILITIES
========================= */
function updateActiveNavigation() {
    const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = (link.getAttribute('href') || '').toLowerCase();

        if ((currentPage === 'index.html' || currentPage === '') && (href === 'index.html' || href === '#home')) {
            link.classList.add('active');
        } else if (href === currentPage) {
            link.classList.add('active');
        }
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error || e.message);
});
