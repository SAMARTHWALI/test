<div class="ig-masonry">
    <?php
    // Ensure the library is loaded
    require_once __DIR__ . '/instagram_lib.php'; 
    
    // Default limit to 12 for masonry
    $limit = isset($ig_limit) ? $ig_limit : 12;
    $hashtag = isset($ig_hashtag) ? $ig_hashtag : null;
    
    $ig_posts = get_instagram_posts($hashtag, $limit);

    if (empty($ig_posts)) {
        echo '<p style="text-align:center; width:100%; color:#888;">No posts found.</p>';
    } else {
        foreach ($ig_posts as $post):
            $caption = htmlspecialchars($post['caption']);
            $short_caption = mb_strimwidth($caption, 0, 100, "...");
            ?>
            <div class="ig-card">
                <div class="ig-media-container">
                    <?php if ($post['type'] === 'VIDEO'): ?>
                        <video class="ig-video" muted playsinline loop
                            poster="<?php echo $post['local_thumbnail'] ?? $post['thumbnail']; ?>">
                            <source src="<?php echo $post['local_url'] ?? $post['url']; ?>" type="video/mp4">
                        </video>
                        <div class="play-overlay"><i class="fas fa-play"></i></div>
                    <?php elseif ($post['type'] === 'CAROUSEL_ALBUM' && !empty($post['children'])): ?>
                        <div class="carousel-wrapper">
                            <div class="carousel-container">
                                <?php foreach ($post['children'] as $child): ?>
                                    <div class="carousel-slide">
                                        <img src="<?php echo $child['local_url'] ?? $child['url']; ?>" alt="Instagram Post" loading="lazy">
                                    </div>
                                <?php endforeach; ?>
                            </div>
                            <div class="carousel-dots">
                                <?php foreach ($post['children'] as $i => $child): ?>
                                    <span class="carousel-dot <?php echo $i === 0 ? 'active' : ''; ?>"></span>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    <?php else: ?>
                        <img src="<?php echo $post['local_url'] ?? $post['url']; ?>"
                            alt="<?php echo $caption; ?>" loading="lazy">
                    <?php endif; ?>
                </div>
                <div class="ig-info">
                    <div class="description-block">
                        <p class="ig-caption">
                            <?php if (strlen($caption) > 100): ?>
                                <span class="caption-short"><?php echo $short_caption; ?></span>
                                <span class="caption-full"><?php echo $caption; ?></span>
                            <?php else: ?>
                                <?php echo $caption; ?>
                            <?php endif; ?>
                        </p>
                        <?php if (strlen($caption) > 100): ?>
                            <button class="read-more-btn">Read More</button>
                        <?php endif; ?>
                    </div>
                    <div class="ig-meta">
                        <a href="<?php echo $post['permalink']; ?>" target="_blank">
                            View on Instagram
                        </a>
                        <i class="fab fa-instagram ig-flat-icon"></i>
                    </div>
                </div>
            </div>
        <?php endforeach; 
    }
    ?>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
    // 1. Read More Toggle
    document.querySelectorAll('.read-more-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const block = this.closest('.description-block');
            block.classList.toggle('expanded');
            this.textContent = block.classList.contains('expanded') ? 'Read Less' : 'Read More';
        });
    });

    // 2. Video Autoplay on Scroll
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                video.play().catch(() => {});
            } else {
                video.pause();
            }
        });
    }, { threshold: 0.6 });

    document.querySelectorAll('.ig-video').forEach(video => {
        videoObserver.observe(video);
        video.addEventListener('click', () => {
            if (video.paused) video.play();
            else video.pause();
        });
    });

    // 3. Carousel Navigation
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

        setInterval(() => {
            goToSlide((currentSlide + 1) % totalSlides);
        }, 4000);
        
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => goToSlide(index));
        });
    });
});
</script>
