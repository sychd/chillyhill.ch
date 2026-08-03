import path from "node:path";
import { fileURLToPath } from "node:url";
import browserSyncFactory from "browser-sync";
import { buildSite } from "./build-site.js";

const REBUILD_DEBOUNCE_MS = 100;
const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const outputDirectory = path.join(projectRoot, "dist");
const browserSync = browserSyncFactory.create("chillyhill-dev");
const sourcePattern = path.join(projectRoot, "src", "**", "*");

let rebuildTimer = null;
let buildQueue = Promise.resolve();

const rebuildAndReload = async (eventName, changedPath) => {
  console.log(`[dev] ${eventName}: ${path.relative(projectRoot, changedPath)}`);

  try {
    await buildSite();
    browserSync.reload();
  } catch (error) {
    console.error("[dev] Build failed. Waiting for the next file change.", error);
  }
};

const scheduleRebuild = (eventName, changedPath) => {
  clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(() => {
    buildQueue = buildQueue.then(() => rebuildAndReload(eventName, changedPath));
  }, REBUILD_DEBOUNCE_MS);
};

await buildSite();

await new Promise((resolve, reject) => {
  browserSync.init(
    {
      server: { baseDir: outputDirectory },
      host: "127.0.0.1",
      port: 8080,
      open: false,
      notify: false,
      ui: false,
      ghostMode: false,
    },
    (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    },
  );
});

browserSync.watch(sourcePattern, { ignoreInitial: true }).on("all", scheduleRebuild);
