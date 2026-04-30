# Gallery Design & Layout Package

This package contains the exactly same post design and masonry layout used in the Krushika Community project. It is designed to be easily portable to any other project.

## 📁 Package Contents

- **`structure.html`**: A complete HTML template demonstrating the masonry grid and all post types (Static Image, Video with Autoplay, and Carousel Album).
- **`styles.css`**: Consolidated CSS containing the design system, masonry layout, and card styles.
- **`script.js`**: Reusable JavaScript for:
  - Video intersection observer (autoplay on scroll).
  - Multi-slide carousel logic.
  - "Read More" caption toggles.

## 🚀 How to Use

1.  **Copy Files**: Copy `styles.css` and `script.js` into your new project's assets folder.
2.  **Include Dependencies**: This design requires Google Fonts (Outfit) and Font Awesome 6. Add these to your `<head>`:
    ```html
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    ```
3.  **Link Gallery Assets**:
    ```html
    <link rel="stylesheet" href="styles.css">
    <script src="script.js" defer></script>
    ```
4.  **HTML Structure**: Follow the structure in `structure.html`. The main container must have the class `ig-masonry`.

## 🛠 Extension & Customization

- **Masonry Columns**: You can change the number of columns in `styles.css` under the `.ig-masonry` selector.
- **Colors**: All theme colors are defined as CSS variables at the top of `styles.css` (`:root`).
- **Responsive Points**: Standard breakpoints (1200px, 992px, 576px) are already handled for the grid layout.

## 📸 Media Types Supported

1.  **Static Images**: Use standard `<img>` inside `.ig-media-container`.
2.  **Videos**: Use `<video class="ig-video" muted playsinline loop>` with an optional `<div class="play-overlay">` for UI feedback.
3.  **Carousels**: Wrap slides inside `.carousel-wrapper > .carousel-container`.

---
*Created for the Krushika project - Ready for reuse.*
