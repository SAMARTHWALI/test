// Highlights Auto-Scroll Functionality
function initHighlightsAutoScroll() {
    const scrollContainer = document.querySelector('.highlights-scroll');
    if (!scrollContainer) return;

    let scrollInterval;
    let isUserScrolling = false;
    let scrollTimeout;

    // Auto-scroll function
    function autoScroll() {
        if (isUserScrolling) return;

        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        const currentScroll = scrollContainer.scrollLeft;

        // If reached the end, reset to start
        if (currentScroll >= maxScroll - 10) {
            scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            // Scroll by one card width
            scrollContainer.scrollBy({ left: 305, behavior: 'smooth' });
        }
    }

    // Start auto-scroll
    function startAutoScroll() {
        scrollInterval = setInterval(autoScroll, 3000); // Every 3 seconds
    }

    // Stop auto-scroll when user interacts
    function stopAutoScroll() {
        clearInterval(scrollInterval);
        isUserScrolling = true;

        // Resume after 5 seconds of no interaction
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isUserScrolling = false;
            startAutoScroll();
        }, 5000);
    }

    // Listen for user scroll
    scrollContainer.addEventListener('scroll', stopAutoScroll);
    scrollContainer.addEventListener('touchstart', stopAutoScroll);
    scrollContainer.addEventListener('mousedown', stopAutoScroll);

    // Start the auto-scroll
    startAutoScroll();

    // Pause when section is not visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startAutoScroll();
            } else {
                clearInterval(scrollInterval);
            }
        });
    }, { threshold: 0.3 });

    observer.observe(scrollContainer);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHighlightsAutoScroll);
} else {
    initHighlightsAutoScroll();
}

// Expose to window for main.js
window.initHighlightsAutoScroll = initHighlightsAutoScroll;
