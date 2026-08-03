export const READER_RENDER_OPTIONS = Object.freeze({
  width: "100%",
  height: "100%",
  manager: "default",
  flow: "paginated",
  spread: "none",
  allowScriptedContent: false,
});

export const READER_THEME = {
  html: {
    width: "100% !important",
    "max-width": "100% !important",
    "overflow-x": "hidden !important",
  },
  body: {
    width: "100% !important",
    "max-width": "48rem !important",
    "box-sizing": "border-box !important",
    "margin-left": "auto !important",
    "margin-right": "auto !important",
    "padding-left": "clamp(1.25rem, 6vw, 4rem) !important",
    "padding-right": "clamp(1.25rem, 6vw, 4rem) !important",
    "overflow-wrap": "anywhere",
  },
  "section.level1:not(.toc-title):not(.unlisted)": {
    "padding-top": "clamp(3rem, 8vh, 5rem)",
  },
  "section.level1:not(.toc-title):not(.unlisted)::before": {
    display: "block",
    width: "4rem",
    height: "1px",
    margin: "0 auto clamp(2.5rem, 6vh, 4rem)",
    background: "#d8dde5",
    content: '""',
  },
  "section.level1:not(.toc-title):not(.unlisted) > h1:first-child": {
    "margin-bottom": "clamp(2rem, 5vh, 3.5rem)",
  },
};

export function resizeRenditionToContainer(rendition, container) {
  const width = Math.floor(container?.clientWidth ?? 0);
  const height = Math.floor(container?.clientHeight ?? 0);

  if (!rendition || width <= 0 || height <= 0) return false;

  rendition.resize(width, height);
  return true;
}
