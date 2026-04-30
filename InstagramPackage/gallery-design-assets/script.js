/* 
   Krushika Gallery Design - Consolidated Script
   Handles Video Autoplay, Carousel Navigation, and Read-More Toggles.
*/

document.addEventListener('DOMContentLoaded', () => {
    initGalleryInteractions();
});

function initGalleryInteractions() {
    
    // 1. Read More Toggle (Expand/Collapse Captions)
    document.querySelectorAll('.read-more-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const block = this.closest('.description-block');
            block.classList.toggle('expanded');
            this.textContent = block.classList.contains('expanded') ? 'Read Less' : 'Read More';
        });
    });

    // 2. Video Autoplay on Scroll (Intersection Observer)
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                video.play().catch(() => { /* Handle potential browser block */ });
            } else {
                video.pause();
                video.currentTime = 0;
            }
        });
    }, { threshold: 0.6 });

    document.querySelectorAll('.ig-video').forEach(video => {
        videoObserver.observe(video);

        const container = video.closest('.ig-media-container');
        const overlay = container.querySelector('.play-overlay');

        const togglePlay = () => {
            if (video.paused) {
                video.play().catch(() => { });
                if (overlay) overlay.style.display = 'none';
            } else {
                video.pause();
                if (overlay) overlay.style.display = 'flex';
            }
        };

        if (overlay) {
            overlay.style.pointerEvents = 'auto'; // Ensure clickable
            overlay.addEventListener('click', (e) => {
                e.stopPropagation();
                togglePlay();
            });
        }

        video.addEventListener('click', togglePlay);

        // UI Syncing
        video.addEventListener('play', () => { if (overlay) overlay.style.display = 'none'; });
        video.addEventListener('pause', () => { if (overlay) overlay.style.display = 'flex'; });
    });

    // 3. Carousel Autoplay & Navigation
    document.querySelectorAll('.carousel-wrapper').forEach(wrapper => {
        const container = wrapper.querySelector('.carousel-container');
        const dots = wrapper.querySelectorAll('.carousel-dot');
        const slides = wrapper.querySelectorAll('.carousel-slide');
        let currentSlide = 0;
        const totalSlides = slides.length;

        if (totalSlides <= 1) return;

        function goToSlide(index) {
            currentSlide = index;
            container.style.transform = `translateX(-${currentSlide * 100}%)`;
            dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
        }

        // Auto-scroll every 4 seconds
        setInterval(() => {
            let nextSlide = (currentSlide + 1) % totalSlides;
            goToSlide(nextSlide);
        }, 4000);
        
        // Manual Dot Navigation (Optional - Add event listeners to dots if needed)
        dots.forEach((dot, index) => {
            dot.style.cursor = 'pointer';
            dot.addEventListener('click', () => goToSlide(index));
        });
    });
}
