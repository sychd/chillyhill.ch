# Chilly Hill

A lightweight static website built with semantic HTML, CSS, and modern vanilla JavaScript.

## Structure

```text
.
├── src/                         # Public website source
│   ├── about/                   # About page
│   ├── assets/                  # Images, icons, and book files
│   ├── blog/
│   │   ├── posts/               # One directory per post
│   │   └── index.html
│   ├── books/                   # Localized book landing pages
│   ├── css/                     # Shared and page-specific styles
│   ├── js/                      # Shared and page-specific scripts
│   └── index.html               # Home page
├── scripts/                     # Build and development scripts
└── dist/                        # Generated production artifact
```

Shared design tokens live in `:root` in `src/css/main.css`. Page-specific styles should reuse those variables instead of duplicating colors, spacing, and transitions.

## Shared page components

The site header and its navigation are generated at build time by
`src/components/site-header.js`. A page declares only the active navigation item and the language
used for accessible labels:

```html
<!-- @site-header active-page="guidebook" language="en" -->
```

Supported active pages are `home`, `guidebook`, `blog`, and `about`. Build-time rendering keeps the
deployed HTML semantic and functional without client-side JavaScript. Use `npm run dev` or
`npm run build` instead of serving `src` directly.

## Development

```sh
npm install
npm run dev
```

`npm run dev` builds the site into `dist/`, serves it at `http://127.0.0.1:8080`, and rebuilds and reloads connected browsers when a file in `src/` changes.

Create a production artifact without starting the server with:

```sh
npm run build
```

Before publishing, run:

```sh
npm run lint
```

Use `npm run format` to apply the configured Biome formatting rules.

## Blog posts

Create a directory inside `src/blog/posts/` containing a `metadata.json` file and its cover image. The build scans these directories and generates `dist/blog/posts/index.json`; the generated file is not committed.

```json
{
  "name": "Post title",
  "description": "Short card description",
  "link": "https://example.com/post",
  "cover": "cover.jpg",
  "isDescriptionVisible": false
}
```

Set `isDescriptionVisible` to `true` to show the title and description below the cover. When it is
`false` or omitted, the card displays only the cover image.
