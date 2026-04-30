document.addEventListener('DOMContentLoaded', () => {
    const feed = document.getElementById('instagram-feed');
    const loader = document.getElementById('loader');

    // Configuration
    const CONFIG_PATH = '../InstagramPackage/instagram_config.json';
    
    async function initGallery() {
        try {
            // 1. Load Config
            const configRes = await fetch(CONFIG_PATH);
            const config = await configRes.json();
            
            const { access_token, primary_hashtag } = config;

            // 2. Fetch from Instagram if token is provided
            if (access_token && access_token !== 'YOUR_ACCESS_TOKEN_HERE') {
                await fetchInstagramPosts(access_token, primary_hashtag);
            } else {
                console.warn('Instagram Access Token not found. Using mock data.');
                renderPosts(getMockPosts());
            }
        } catch (error) {
            console.error('Error initializing gallery:', error);
            renderPosts(getMockPosts());
        }
    }

    async function fetchInstagramPosts(token, hashtag) {
        const isBusinessToken = token.startsWith('EAA');
        const fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,children{media_url,media_type,permalink}';
        
        try {
            let finalUrl = '';
            
            if (isBusinessToken) {
                // --- BUSINESS API FLOW ---
                // 1. Find Business ID via /me/accounts
                const meUrl = `https://graph.facebook.com/v21.0/me/accounts?fields=instagram_business_account&access_token=${token}`;
                const meRes = await fetch(meUrl);
                const meData = await meRes.json();
                
                let businessId = null;
                let pagesFound = [];
                if (meData.data && meData.data.length > 0) {
                    for (const account of meData.data) {
                        pagesFound.push(`${account.name} (Linked IG: ${account.instagram_business_account ? 'YES' : 'NO'})`);
                        if (account.instagram_business_account) {
                            businessId = account.instagram_business_account.id;
                            break;
                        }
                    }
                }
                
                if (!businessId) {
                    const pagesList = pagesFound.length > 0 ? pagesFound.join(', ') : 'None';
                    const rawResponse = JSON.stringify(meData);
                    throw new Error(`No Instagram Business Account linked to your Facebook Pages found. Pages checked: [${pagesList}]. Raw Response: ${rawResponse}`);
                }
                
                finalUrl = `https://graph.facebook.com/v21.0/${businessId}/media?fields=${fields}&access_token=${token}&limit=50`;
            } else {
                // --- BASIC DISPLAY API FLOW ---
                finalUrl = `https://graph.instagram.com/me/media?fields=${fields}&access_token=${token}&limit=20`;
            }

            const res = await fetch(finalUrl);
            const data = await res.json();

            if (data.data) {
                let posts = data.data;
                
                // Optional hashtag filtering
                const isPlaceholder = hashtag === '#YourBrandName' || hashtag === '#YourBrandPortfolio';
                if (hashtag && !isPlaceholder && hashtag.trim() !== "") {
                    posts = posts.filter(post => 
                        post.caption && post.caption.toLowerCase().includes(hashtag.toLowerCase())
                    );
                }

                if (posts.length === 0) {
                    feed.innerHTML = '<p class="error-msg">No posts found.</p>';
                    return;
                }

                renderPosts(posts.map(post => ({
                    id: post.id,
                    image: post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url,
                    link: post.permalink,
                    caption: post.caption || '',
                    type: post.media_type,
                    children: post.children ? post.children.data : []
                })));
            } else if (data.error) {
                throw new Error(data.error.message || 'Instagram API Error');
            }
        } catch (error) {
            console.error('Instagram API Fetch Error:', error);
            feed.innerHTML = `<div class="error-msg">
                <p><strong>API Error:</strong> ${error.message}</p>
                <p style="font-size: 0.8rem; margin-top: 10px;">Token Type Detected: ${isBusinessToken ? 'Business (Facebook)' : 'Basic Display'}</p>
            </div>`;
        }
    }


    function renderPosts(posts) {
        feed.innerHTML = posts.map((post, index) => {
            let mediaHtml = `<img src="${post.image}" alt="Instagram Post">`;
            let badgeHtml = '';

            if (post.type === 'VIDEO') {
                badgeHtml = '<div class="video-badge"><i class="fas fa-play"></i></div>';
            } else if (post.type === 'CAROUSEL_ALBUM') {
                badgeHtml = '<div class="video-badge"><i class="fas fa-images"></i></div>';
            }

            return `
                <div class="instagram-post fade-up" style="animation-delay: ${index * 0.1}s">
                    ${mediaHtml}
                    ${badgeHtml}
                    <div class="post-overlay">
                        <div class="post-caption">${truncateCaption(post.caption)}</div>
                        <div class="post-stats">
                            <span><i class="fab fa-instagram"></i> Open Post</span>
                        </div>
                        <a href="${post.link || 'https://www.instagram.com/_p_a_t_r_i_o_t_____/'}" target="_blank" class="post-link">View Details</a>
                    </div>
                </div>
            `;
        }).join('');

        // Trigger animations
        setTimeout(() => {
            const items = document.querySelectorAll('.instagram-post');
            items.forEach(item => item.classList.add('visible'));
        }, 100);
    }


    function truncateCaption(text) {
        if (!text) return '';
        return text.length > 80 ? text.substring(0, 80) + '...' : text;
    }

    function getMockPosts() {
        return [
            { id: 1, image: 'https://picsum.photos/600/600?random=1', likes: '1.2k', comments: '45', caption: 'Exploring new horizons in full-stack development. #CodingLife #WebDev' },
            { id: 2, image: 'https://picsum.photos/600/600?random=2', likes: '890', comments: '32', caption: 'Clean code is not just a habit, it\'s a lifestyle. #SoftwareEngineering' },
            { id: 3, image: 'https://picsum.photos/600/600?random=3', likes: '2.1k', comments: '112', caption: 'New project launch! Scalable CRM systems for modern businesses. #Fintech' },
            { id: 4, image: 'https://picsum.photos/600/600?random=4', likes: '1.5k', comments: '56', caption: 'Automating the future, one API at a time. #Automation #Tech' },
            { id: 5, image: 'https://picsum.photos/600/600?random=5', likes: '940', comments: '28', caption: 'Coffee, Code, Repeat. The developer\'s ritual. #WorkHard' },
            { id: 6, image: 'https://picsum.photos/600/600?random=6', likes: '1.7k', comments: '78', caption: 'Secure integrations are the backbone of trust in digital finance. #Security' }
        ];
    }

    initGallery();
});

