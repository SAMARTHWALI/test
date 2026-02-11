document.addEventListener('DOMContentLoaded', () => {
    const sections = [
        { id: 'navbar-container', file: 'sections/navbar.html' },
        { id: 'hero-container', file: 'sections/hero.html' },
        { id: 'services-container', file: 'sections/services.html' },
        { id: 'experience-container', file: 'sections/experience.html' },
        { id: 'projects-container', file: 'sections/projects.html' },
        { id: 'skills-container', file: 'sections/skills.html' },
        { id: 'highlights-container', file: 'sections/highlights.html' },
        { id: 'contact-container', file: 'sections/contact.html' },
        { id: 'footer-container', file: 'sections/footer.html' }
    ];

    const loadSection = async (section) => {
        try {
            const response = await fetch(section.file);
            if (!response.ok) throw new Error(`Failed to load ${section.file}`);
            const html = await response.text();
            document.getElementById(section.id).innerHTML = html;
        } catch (error) {
            console.error(error);
        }
    };

    Promise.all(sections.map(loadSection))
        .then(() => {
            // Hide loader after all sections are loaded
            const loader = document.getElementById('loader');
            if (loader) {
                setTimeout(() => {
                    loader.classList.add('hidden');
                }, 500);
            }

            // Initialize other scripts
            if (window.initAnimations) window.initAnimations();
            if (window.initNavbar) window.initNavbar();
            if (window.initScroll) window.initScroll();
            if (window.initForm) window.initForm();
            if (window.initProjects) window.initProjects();
            if (window.initHighlightsAutoScroll) window.initHighlightsAutoScroll();
        });
});
