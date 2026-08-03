# Chilly Hill

A lightweight static website built with semantic HTML, CSS, and modern vanilla JavaScript.

## Structure

```text
.
├── about/                       # About page
├── assets/                      # Images, icons, and book files
├── blog/
│   ├── posts/                   # One directory per post
│   └── index.html
├── books/                       # Localized book landing pages
├── css/                         # Shared and page-specific styles
├── js/                          # Shared and page-specific scripts
├── scripts/                     # Static site build
└── index.html                   # Home page
```

Shared design tokens live in `:root` in `css/main.css`. Page-specific styles should reuse those variables instead of duplicating colors, spacing, and transitions.

## Development

```sh
npm install
npm run dev
```

`npm run dev` builds the site into `dist/` and serves it at `http://127.0.0.1:8080`.

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

Create a directory inside `blog/posts/` containing a `metadata.json` file and its cover image. The build scans these directories and generates `dist/blog/posts/index.json`; the generated file is not committed.

```json
{
  "name": "Post title",
  "description": "Short card description",
  "link": "https://example.com/post",
  "cover": "cover.jpg"
}
```

## Book files

Book pages expect PDF and ePub files in `assets/books/magic-mushrooms-guidebook/`. Keep the existing language suffixes (`en`, `de`, `ru`, and `uk`) when adding the final files.
