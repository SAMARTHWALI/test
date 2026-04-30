<?php
/**
 * Generic Instagram Integration
 * Fetches and caches recent posts from Instagram with support for Images, Reels, and Carousels.
 */

function get_instagram_posts($hashtag = null, $limit = 20)
{
    // 1. Load Configuration
    // Try to find instagram_config.json in the same directory or parent directory
    $config_path = __DIR__ . '/instagram_config.json';
    if (!file_exists($config_path)) {
        $config_path = __DIR__ . '/../instagram_config.json';
    }
    
    $config = [];
    if (file_exists($config_path)) {
        $config = json_decode(file_get_contents($config_path), true);
    }

    $access_token = trim($config['access_token'] ?? '');
    $page_id = trim($config['page_id'] ?? '');
    $cache_duration = $config['cache_duration'] ?? 3600;
    $config_hashtag = $config['primary_hashtag'] ?? null;

    // Use config hashtag if none provided and no specific hashtag argued
    if (!$hashtag) {
        $hashtag = $config_hashtag;
    }

    // Define paths for cache and images relative to this file's generic location
    $cache_dir = __DIR__ . '/../cache';
    $img_dir = __DIR__ . '/../assets/img/ig';
    $public_img_path = '/assets/img/ig'; // URL path to images

    $cache_key = $hashtag ? 'instagram_cache_' . preg_replace('/[^a-z0-9]/', '', strtolower($hashtag)) : 'instagram_cache_all';
    $cache_file = $cache_dir . '/' . $cache_key . '.json';

    // Return cached JSON if valid
    if (file_exists($cache_file) && (time() - filemtime($cache_file) < $cache_duration)) {
        $cached_data = json_decode(file_get_contents($cache_file), true);
        if (!empty($cached_data)) {
            return array_slice($cached_data, 0, $limit);
        }
    }

    $all_posts = [];

    // 2. Fetch from Instagram API
    if (!empty($access_token)) {
        
        // --- APPROACH A: Instagram Business API (graph.facebook.com) ---
        // This is for Business/Creator accounts linked to a Facebook Page.
        $ig_business_id = null;

        // Try to find the Business ID via /me/accounts (more reliable for User Tokens)
        $me_accounts_url = "https://graph.facebook.com/v21.0/me/accounts?fields=instagram_business_account,id&access_token={$access_token}";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $me_accounts_url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        $me_response = curl_exec($ch);
        curl_close($ch);

        if ($me_response) {
            $me_data = json_decode($me_response, true);
            if (isset($me_data['data']) && !empty($me_data['data'])) {
                foreach ($me_data['data'] as $account) {
                    if (isset($account['instagram_business_account']['id'])) {
                        $ig_business_id = $account['instagram_business_account']['id'];
                        break;
                    }
                }
            }
        }

        // Fallback to direct Page ID if provided and /me/accounts failed
        if (!$ig_business_id && !empty($page_id) && $page_id !== 'YOUR_FACEBOOK_PAGE_ID') {
            $page_url = "https://graph.facebook.com/v21.0/{$page_id}?fields=instagram_business_account&access_token={$access_token}";
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $page_url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            $page_response = curl_exec($ch);
            curl_close($ch);
            if ($page_response) {
                $page_data = json_decode($page_response, true);
                $ig_business_id = $page_data['instagram_business_account']['id'] ?? null;
            }
        }

        // If we found a Business ID, fetch posts
        if ($ig_business_id) {
            $fields = "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,children{media_url,media_type,permalink}";
            $api_url = "https://graph.facebook.com/v21.0/{$ig_business_id}/media?fields={$fields}&access_token={$access_token}&limit=50";

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $api_url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            $response = curl_exec($ch);
            curl_close($ch);

            if ($response) {
                $data = json_decode($response, true);
                if (isset($data['data'])) {
                    foreach ($data['data'] as $item) {
                        $all_posts[] = format_ig_post($item, $hashtag);
                    }
                }
            }
        }

        // --- APPROACH B: Instagram Basic Display API (graph.instagram.com) ---
        // Fallback if Business API didn't return posts (e.g. if token is a Basic Display token)
        if (empty($all_posts)) {
            $fields = "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,children{media_url,media_type,permalink}";
            $basic_url = "https://graph.instagram.com/me/media?fields={$fields}&access_token={$access_token}&limit=50";
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $basic_url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            $basic_response = curl_exec($ch);
            curl_close($ch);

            if ($basic_response) {
                $basic_data = json_decode($basic_response, true);
                if (isset($basic_data['data'])) {
                    foreach ($basic_data['data'] as $item) {
                        $all_posts[] = format_ig_post($item, $hashtag);
                    }
                } else if (isset($basic_data['error'])) {
                     error_log("Instagram API Final Error: " . $basic_data['error']['message']);
                }
            }
        }
    }

    // Filter out nulls from the post formatting
    $all_posts = array_filter($all_posts);

    // 3. Fallback / Mock logic (ONLY if API returned 0 posts after filtering)
    if (empty($all_posts)) {
        // You can add generic mock data here if you wish, or return empty.
        // For the package, we'll return empty to encourage fixing the API/Token.
        // To use the user's "Nice" mock data:
        /*
        $mock_posts = [ ... ];
        foreach ($mock_posts as $post) { if (!$hashtag || stripos($post['caption'], $hashtag) !== false) { $all_posts[] = $post; } }
        */
    }

    // 4. Process and Download Media Locally for SEO and Performance
    if (!is_dir($img_dir)) {
        mkdir($img_dir, 0755, true);
    }

    $processed_posts = [];
    foreach ($all_posts as $post) {
        $ext = $post['type'] === 'VIDEO' ? 'mp4' : 'jpg';
        $local_filename = $post['id'] . '.' . $ext;
        $local_path = $img_dir . '/' . $local_filename;
        $public_path = $public_img_path . '/' . $local_filename;

        // Download main media if it doesn't exist
        if (!file_exists($local_path)) {
            $media_data = @file_get_contents($post['url']);
            if ($media_data) {
                file_put_contents($local_path, $media_data);
            }
        }

        // Handle thumbnail for videos
        if ($post['type'] === 'VIDEO') {
            $thumb_filename = $post['id'] . '_thumb.jpg';
            $thumb_path = $img_dir . '/' . $thumb_filename;
            if (!file_exists($thumb_path)) {
                $thumb_data = @file_get_contents($post['thumbnail']);
                if ($thumb_data) {
                    file_put_contents($thumb_path, $thumb_data);
                }
            }
            $post['local_thumbnail'] = $public_img_path . '/' . $thumb_filename;
        }

        $post['local_url'] = file_exists($local_path) ? $public_path : $post['url'];

        // Handle child media (for carousels)
        if (!empty($post['children'])) {
            foreach ($post['children'] as $i => &$child) {
                $c_ext = $child['type'] === 'VIDEO' ? 'mp4' : 'jpg';
                $c_filename = $post['id'] . '_c' . $i . '.' . $c_ext;
                $c_path = $img_dir . '/' . $c_filename;
                if (!file_exists($c_path)) {
                    $c_data = @file_get_contents($child['url']);
                    if ($c_data) {
                        file_put_contents($c_path, $c_data);
                    }
                }
                $child['local_url'] = file_exists($c_path) ? $public_img_path . '/' . $c_filename : $child['url'];
            }
        }

        // Clean caption for SEO (Remove hashtags for the visible description)
        $clean_caption = preg_replace('/#\w+/', '', $post['caption']);
        $post['display_caption'] = trim(preg_replace('/\s+/', ' ', $clean_caption));

        $processed_posts[] = $post;
    }

    // Save to cache
    if (!is_dir($cache_dir)) {
        mkdir($cache_dir, 0755, true);
    }

    if (!empty($processed_posts)) {
        file_put_contents($cache_file, json_encode($processed_posts));
    }

    return array_slice($processed_posts, 0, $limit);
}

/**
 * Helper to format raw API item into standard post array
 */
function format_ig_post($item, $hashtag) {
    $caption = $item['caption'] ?? '';

    // Hashtag filtering (case-insensitive) - only filter if hashtag is provided
    if ($hashtag && stripos($caption, $hashtag) === false) {
        return null;
    }

    $post = [
        'id' => $item['id'],
        'type' => $item['media_type'],
        'url' => $item['media_url'] ?? '',
        'thumbnail' => $item['thumbnail_url'] ?? ($item['media_url'] ?? ''),
        'permalink' => $item['permalink'] ?? '',
        'caption' => $caption,
        'timestamp' => $item['timestamp'] ?? '',
        'children' => []
    ];

    if ($item['media_type'] === 'CAROUSEL_ALBUM' && isset($item['children']['data'])) {
        foreach ($item['children']['data'] as $child) {
            $post['children'][] = [
                'url' => $child['media_url'],
                'type' => $child['media_type']
            ];
        }
    }

    return $post;
}
?>
