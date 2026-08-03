import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
  "favicon.ico",
  "index.html",
  "robots.txt",
];

export async function buildSite() {
  await rm(outputDirectory, { force: true, recursive: true });
  await mkdir(outputDirectory, { recursive: true });

  await Promise.all(
    publicEntries.map((entry) => {
      return cp(path.join(sourceDirectory, entry), path.join(outputDirectory, entry), {
        recursive: true,
        filter: (source) => path.basename(source) !== ".DS_Store",
      });
    }),
  );

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
