document.addEventListener('DOMContentLoaded', () => {
    const feed = document.getElementById('instagram-feed');
    const loader = document.getElementById('loader');

    // Configuration
    const CONFIG_PATH = '../InstagramPackage/instagram_config.json';
    
    let allPosts = []; 
    let taggedPosts = []; 
    let currentUserId = null; // Store user's own ID to detect collabs

    async function initGallery() {
        try {
            const configRes = await fetch(CONFIG_PATH);
            const config = await configRes.json();
            const { access_token } = config;

            if (access_token && access_token !== 'YOUR_ACCESS_TOKEN_HERE') {
                await fetchInstagramPosts(access_token);
            } else {
                console.warn('Access token missing.');
                renderPosts([]);
            }
        } catch (error) {
            console.error('Init Error:', error);
        }
    }

    async function fetchInstagramPosts(token) {
        const isBusinessToken = token.startsWith('EAA');
        const fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,location,owner,shortcode,children{media_url,media_type,permalink}';
        
        try {
            let businessId = null;
            if (isBusinessToken) {
                const meUrl = `https://graph.facebook.com/v21.0/me/accounts?fields=instagram_business_account&access_token=${token}`;
                const meRes = await fetch(meUrl);
                const meData = await meRes.json();
                if (meData.data) {
                    for (const account of meData.data) {
                        if (account.instagram_business_account) {
                            businessId = account.instagram_business_account.id;
                            currentUserId = businessId; // Set current user ID
                            break;
                        }
                    }
                }
            } else {
                // For Basic Display, we'll try to get the ID from /me
                const meRes = await fetch(`https://graph.instagram.com/me?fields=id&access_token=${token}`);
                const meData = await meRes.json();
                currentUserId = meData.id;
            }

            // Fetch Own Media
            const ownUrl = businessId 
                ? `https://graph.facebook.com/v21.0/${businessId}/media?fields=${fields}&access_token=${token}&limit=50`
                : `https://graph.instagram.com/me/media?fields=${fields}&access_token=${token}&limit=50`;

            const ownRes = await fetch(ownUrl);
            const ownData = await ownRes.json();
            if (ownData.data) allPosts = ownData.data;

            // Fetch Tagged, Discovered, and Mentioned Media
            if (businessId) {
                console.log('Fetching Business Discovery & Mentions...');
                try {
                    // 1. Business Discovery (miniatures_studio)
                    const discoveryUrl = `https://graph.facebook.com/v21.0/${businessId}?fields=business_discovery.username(miniatures_studio){media{id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,location,owner}}&access_token=${token}`;
                    const discRes = await fetch(discoveryUrl);
                    const discData = await discRes.json();
                    let discovered = [];
                    if (discData.business_discovery && discData.business_discovery.media) {
                        discovered = discData.business_discovery.media.data;
                    }

                    // 2. Tagged Media (Where your photo is tagged)
                    const tagUrl = `https://graph.facebook.com/v21.0/${businessId}/tags?fields=${fields}&access_token=${token}&limit=50`;
                    const tagRes = await fetch(tagUrl);
                    const tagData = await tagRes.json();
                    let tagged = tagData.data || [];

                    // 3. Mentioned Media (Where you are mentioned in the caption)
                    // Note: This often requires the app to be in "Live" mode or specific permissions
                    const mentionUrl = `https://graph.facebook.com/v21.0/${businessId}/mentioned_media?fields=${fields}&access_token=${token}&limit=50`;
                    const mentionRes = await fetch(mentionUrl);
                    const mentionData = await mentionRes.json();
                    let mentioned = mentionData.data || [];

                    // Combine all into "My Clicks"
                    taggedPosts = [...discovered, ...tagged, ...mentioned];
                    
                    // Remove duplicates by ID
                    taggedPosts = taggedPosts.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);

                } catch (e) { 
                    console.warn('Advanced fetch failed (Normal if App is in Dev mode):', e); 
                }
            }

            console.log('Total Own Posts:', allPosts.length);
            console.log('Total "My Clicks":', taggedPosts.length);
            renderPosts(allPosts); 
            
        } catch (error) {
            console.error('Fetch Error:', error);
            feed.innerHTML = `<p class="error-msg">${error.message}</p>`;
        }
    }

    function renderPosts(posts) {
        if (!posts || posts.length === 0) {
            feed.innerHTML = '<p style="text-align:center; width:100%; color:#888; padding: 40px;">No posts found for this category.</p>';
            return;
        }

        feed.innerHTML = posts.map(post => {
            const caption = post.caption || '';
            const isLong = caption.length > 100;
            const shortCaption = isLong ? caption.substring(0, 100) + '...' : caption;
            
            const locationName = post.location ? post.location.name : null;
            const locationHtml = locationName ? `<div class="ig-location"><i class="fas fa-map-marker-alt"></i> ${locationName}</div>` : '';

            // Collaboration Badge Logic
            const isCollab = post.owner && currentUserId && post.owner.id !== currentUserId;
            const collabHtml = isCollab ? `<div class="ig-collab-badge"><i class="fas fa-users"></i> Collaboration</div>` : '';

            let mediaHtml = '';
            if (post.media_type === 'VIDEO') {
                mediaHtml = `
                    <video class="ig-video" muted playsinline loop poster="${post.thumbnail_url || post.media_url}">
                        <source src="${post.media_url}" type="video/mp4">
                    </video>
                    <div class="play-overlay"><i class="fas fa-play"></i></div>`;
            } else if (post.media_type === 'CAROUSEL_ALBUM' && post.children) {
                const slides = post.children.data.map(child => `
                    <div class="carousel-slide">
                        <img src="${child.media_url}" alt="Instagram Post">
                    </div>`).join('');
                const dots = post.children.data.map((_, i) => `
                    <span class="carousel-dot ${i === 0 ? 'active' : ''}"></span>`).join('');
                mediaHtml = `
                    <div class="carousel-wrapper">
                        <div class="carousel-container">${slides}</div>
                        <div class="carousel-dots">${dots}</div>
                    </div>`;
            } else {
                mediaHtml = `<img src="${post.media_url}" alt="Instagram Post">`;
            }

            return `
                <div class="instagram-post">
                    <div class="ig-media-container">
                        ${mediaHtml}
                        ${locationHtml}
                        ${collabHtml}
                    </div>
                    <div class="ig-info">
                        <div class="description-block">
                            <p class="ig-caption">
                                ${isLong ? `<span class="caption-short">${shortCaption}</span><span class="caption-full">${caption}</span>` : caption}
                            </p>
                            ${isLong ? '<button class="read-more-btn">Read More</button>' : ''}
                        </div>
                        <div class="ig-meta">
                            <a href="${post.permalink}" target="_blank">View on Instagram</a>
                            <i class="fab fa-instagram ig-flat-icon"></i>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        initInteractions();
    }

    function initInteractions() {
        // Hashtag Filtering
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.onclick = function() {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                const tag = this.dataset.hashtag;
                if (tag === 'all') {
                    renderPosts(allPosts);
                } else if (tag === 'tags') {
                    renderPosts(taggedPosts);
                } else {
                    const filtered = allPosts.filter(p => 
                        p.caption && p.caption.toLowerCase().includes(tag.toLowerCase())
                    );
                    renderPosts(filtered);
                }
            };
        });
        // Read More
        document.querySelectorAll('.read-more-btn').forEach(btn => {
            btn.onclick = function() {
                const block = this.closest('.description-block');
                block.classList.toggle('expanded');
                this.textContent = block.classList.contains('expanded') ? 'Read Less' : 'Read More';
            };
        });

        // Videos
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.play().catch(()=>{});
                else entry.target.pause();
            });
        }, { threshold: 0.6 });
        document.querySelectorAll('.ig-video').forEach(v => videoObserver.observe(v));

        // Carousels
        document.querySelectorAll('.carousel-wrapper').forEach(wrapper => {
            const container = wrapper.querySelector('.carousel-container');
            const dots = wrapper.querySelectorAll('.carousel-dot');
            let current = 0;
            const total = dots.length;
            if (total <= 1) return;
            
            const goTo = (i) => {
                current = i;
                container.style.transform = `translateX(-${current * 100}%)`;
                dots.forEach((d, idx) => d.classList.toggle('active', idx === current));
            };
            setInterval(() => goTo((current + 1) % total), 4000);
            dots.forEach((d, i) => d.onclick = () => goTo(i));
        });
    }

    initGallery();
});
