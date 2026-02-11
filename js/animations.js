document.addEventListener('DOMContentLoaded', () => {
    // Basic Intersection Observer for fade-ups and slide-ins
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-up, .slide-in-left, .slide-in-right');
    animatedElements.forEach(el => observer.observe(el));
});

// Function to re-initialize animations after dynamic content load
window.initAnimations = () => {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Re-select elements as they might have been injected recently
    setTimeout(() => {
        const animatedElements = document.querySelectorAll('.fade-up, .slide-in-left, .slide-in-right');
        animatedElements.forEach(el => observer.observe(el));
    }, 100); // Small delay to ensure DOM is ready
};
