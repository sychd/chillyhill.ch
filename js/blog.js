const postsContainer = document.querySelector("#blog-posts");

if (postsContainer) {
  void renderBlogPosts(postsContainer);
}

async function renderBlogPosts(container) {
  try {
    const listingResponse = await fetch("./posts/", { cache: "no-store" });

    if (!listingResponse.ok) {
      throw new Error(`Unable to load posts listing (${listingResponse.status})`);
    }

    const listingHtml = await listingResponse.text();
    const listingDocument = new DOMParser().parseFromString(listingHtml, "text/html");
    const postsRoot = new URL("./", listingResponse.url);
    const postUrls = [...listingDocument.querySelectorAll('a[href$="/"]')]
      .map((link) => new URL(link.getAttribute("href"), listingResponse.url))
      .filter((url) => url.pathname.startsWith(postsRoot.pathname))
      .filter((url) => url.pathname !== postsRoot.pathname)
      .map((url) => url.toString())
      .filter((url, index, urls) => urls.indexOf(url) === index);

    const posts = await Promise.all(postUrls.map(loadPost));
    const publishedPosts = posts.filter(Boolean);

    if (publishedPosts.length === 0) {
      renderStatus(container, "No posts have been published yet.");
      return;
    }

    container.replaceChildren(...publishedPosts.map(createPostCard));
  } catch (error) {
    console.error("Unable to render blog posts", error);
    renderStatus(container, "Unable to load posts right now.");
  }
}

async function loadPost(postUrl) {
  const metadataUrl = new URL("metadata.json", postUrl);
  const response = await fetch(metadataUrl, { cache: "no-store" });

  if (!response.ok) {
    return null;
  }

  const metadata = await response.json();

  return {
    title: metadata.name || "Untitled post",
    description: metadata.description || "",
    link: metadata.link || postUrl,
    cover: metadata.cover ? new URL(metadata.cover, metadataUrl).toString() : "",
  };
}

function createPostCard(post) {
  const card = document.createElement("a");
  card.className = "post-card";
  card.href = post.link;

  if (new URL(card.href).origin !== globalThis.location.origin) {
    card.target = "_blank";
    card.rel = "noopener noreferrer";
  }

  if (post.cover) {
    const image = document.createElement("img");
    image.className = "post-card-image";
    image.src = post.cover;
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    card.append(image);
  }

  const body = document.createElement("div");
  body.className = "post-card-body";

  const title = document.createElement("h2");
  title.className = "post-card-title";
  title.textContent = post.title;
  body.append(title);

  if (post.description) {
    const description = document.createElement("p");
    description.className = "post-card-description";
    description.textContent = post.description;
    body.append(description);
  }

  card.append(body);
  return card;
}

function renderStatus(container, message) {
  const status = document.createElement("p");
  status.className = "blog-empty-state";
  status.textContent = message;
  container.replaceChildren(status);
}
