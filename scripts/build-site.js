import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderBookIndexPage, renderBookPage } from "../src/components/book-page.js";
import { renderBooksList } from "../src/components/books-list.js";
import { renderSiteHeaderMarker } from "../src/components/site-header.js";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const sourceDirectory = path.join(projectRoot, "src");
const outputDirectory = path.join(projectRoot, "dist");
const postsDirectory = path.join(sourceDirectory, "blog", "posts");
const publicEntries = [
  "about",
  "assets",
  "blog",
  "books",
  "css",
  "js",
  "index.html",
  "robots.txt",
];

async function renderSharedComponents(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        await renderSharedComponents(entryPath);
        return;
      }

      if (path.extname(entry.name) !== ".html") {
        return;
      }

      const html = await readFile(entryPath, "utf8");
      const renderedHtml = renderSiteHeaderMarker(html, path.relative(outputDirectory, entryPath));

      if (renderedHtml !== html) {
        await writeFile(entryPath, renderedHtml);
      }
    }),
  );
}

export async function buildSite() {
  await rm(outputDirectory, { force: true, recursive: true });
  await mkdir(outputDirectory, { recursive: true });

  await Promise.all(
    publicEntries.map((entry) => {
      if (entry === "books") {
        return Promise.resolve();
      }

      return cp(path.join(sourceDirectory, entry), path.join(outputDirectory, entry), {
        recursive: true,
        filter: (source) => path.basename(source) !== ".DS_Store",
      });
    }),
  );

  const booksPath = path.join(sourceDirectory, "books", "books.json");
  const books = JSON.parse(await readFile(booksPath, "utf8"));

  const booksOutputDir = path.join(outputDirectory, "books");
  await mkdir(booksOutputDir, { recursive: true });

  const booksListHtml = renderBooksList({ books, language: "en" });
  await writeFile(path.join(booksOutputDir, "index.html"), booksListHtml);

  for (const book of books) {
    const bookDir = path.join(booksOutputDir, book.id);
    await mkdir(bookDir, { recursive: true });

    const indexHtml = renderBookIndexPage({ book });
    await writeFile(path.join(bookDir, "index.html"), indexHtml);

    for (const language of Object.keys(book.locales)) {
      const langDir = path.join(bookDir, language);
      await mkdir(langDir, { recursive: true });

      const bookPageHtml = renderBookPage({ book, language });
      await writeFile(path.join(langDir, "index.html"), bookPageHtml);
    }
  }

  await renderSharedComponents(outputDirectory);

  const postDirectories = (await readdir(postsDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .sort((left, right) => left.name.localeCompare(right.name));

  const posts = await Promise.all(
    postDirectories.map(async (directory) => {
      const metadataPath = path.join(postsDirectory, directory.name, "metadata.json");
      const metadata = JSON.parse(await readFile(metadataPath, "utf8"));

      if (!metadata.name || !metadata.link) {
        throw new Error(`${metadataPath} must define name and link.`);
      }

      if (
        metadata.isDescriptionVisible !== undefined &&
        typeof metadata.isDescriptionVisible !== "boolean"
      ) {
        throw new Error(`${metadataPath} must define isDescriptionVisible as a boolean.`);
      }

      return {
        title: metadata.name,
        description: metadata.description || "",
        isDescriptionVisible: metadata.isDescriptionVisible === true,
        link: metadata.link,
        cover: metadata.cover ? path.posix.join("posts", directory.name, metadata.cover) : "",
      };
    }),
  );

  const postsIndexPath = path.join(outputDirectory, "blog", "posts", "index.json");
  await writeFile(postsIndexPath, `${JSON.stringify({ posts }, null, 2)}\n`);

  console.log(`Built ${publicEntries.length} site entries and ${posts.length} blog post(s).`);
}

const isDirectExecution =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  await buildSite();
}
