# Chilly Hill Landing Page

Lightweight personal landing page built with HTML5, CSS3, and modern vanilla JavaScript. It has no framework or runtime dependencies.

## Project Structure

```text
.
├── index.html
├── css/main.css
├── js/main.js
├── assets/images/
├── assets/svg/
├── favicon.ico
├── robots.txt
└── README.md
```

## Add Images

Place new image files in `assets/images/`, then add their paths to the `imageSources` array in `js/main.js`.

The image rotator uses a shuffled deck: each image appears once before the list is shuffled again, and the current image is excluded when a new deck starts.

Replace `assets/images/og-image.png` when you want a custom preview image for messengers and social networks.

## Edit Text

Edit the title, greeting, intro paragraph, and footer directly in `index.html`.

## Add Contact Links

Update the anchors inside the `contact-section` in `index.html`. External links should keep `target="_blank"` and `rel="noopener noreferrer"`.

## Change Theme Colors

All main theme values are CSS custom properties at the top of `css/main.css`. Change colors, spacing, radii, layout width, and transition speeds there.

## Run Locally

Open `index.html` in a browser, or serve the folder with any static file server.
