<div class="ig-grid">
    <?php
    // Ensure the library is loaded
    // Adjust the path to 'includes/instagram_lib.php' as needed for your file structure
    require_once __DIR__ . '/includes/instagram_lib.php'; 
    
    // Default limit to 4 if not set
    $limit = isset($ig_limit) ? $ig_limit : 4;
    $hashtag = isset($ig_hashtag) ? $ig_hashtag : null;
    
    $ig_posts = get_instagram_posts($hashtag, $limit);

    if (empty($ig_posts)) {
        echo '<p style="text-align:center; width:100%; color:#888;">No posts found.</p>';
    } else {
        foreach ($ig_posts as $post):
            ?>
            <div class="ig-card h-entry">
                <div class="ig-media-container">
                    <?php if ($post['type'] === 'VIDEO'): ?>
                        <video class="ig-video" muted playsinline data-autoplay="true" loop
                            poster="<?php echo $post['local_thumbnail'] ?? $post['thumbnail']; ?>">
                            <source src="<?php echo $post['local_url'] ?? $post['url']; ?>" type="video/mp4">
                        </video>
                        <div class="play-overlay"><i class="fas fa-play"></i> ▶</div>
                    <?php elseif ($post['type'] === 'CAROUSEL_ALBUM' && !empty($post['children'])): ?>
                        <div class="carousel-wrapper" data-slides="<?php echo count($post['children']); ?>">
                            <div class="carousel-container">
                                <?php foreach ($post['children'] as $child): ?>
                                    <div class="carousel-slide">
                                        <img src="<?php echo $child['local_url'] ?? $child['url']; ?>" alt="Instagram Post"
                                            loading="lazy">
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
                            alt="<?php echo htmlspecialchars($post['display_caption']); ?>" loading="lazy">
                    <?php endif; ?>
                </div>
                <div class="ig-info">
                    <p class="ig-caption">
                        <?php echo mb_strimwidth(htmlspecialchars($post['display_caption']), 0, 80, "..."); ?>
                    </p>
                    <div class="ig-meta">
                        <a href="<?php echo $post['permalink']; ?>" target="_blank">
                            View Post
                        </a>
                        <a href="<?php echo $post['permalink']; ?>" target="_blank" class="ig-flat-icon">
                            <i class="fab fa-instagram"></i>
                        </a>
                    </div>
                </div>
            </div>
        <?php endforeach; 
    }
    ?>
</div>

<!-- Optional: Simple Script for Videos and Carousels if strictly needed inline, 
     but ideally this should be in your main JS file -->
<script>
document.addEventListener('DOMContentLoaded', () => {
    // Auto-play videos on hover (optional)
    const videos = document.querySelectorAll('.ig-video');
    videos.forEach(video => {
        video.parentElement.addEventListener('mouseenter', () => video.play());
        video.parentElement.addEventListener('mouseleave', () => video.pause());
    });
});
</script>
