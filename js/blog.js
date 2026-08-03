const postsContainer = document.querySelector("#blog-posts");

if (postsContainer) {
  void renderBlogPosts(postsContainer);
}

async function renderBlogPosts(container) {
  try {
    const response = await fetch("./posts/index.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Unable to load posts (${response.status})`);
    }

    const { posts } = await response.json();

    if (posts.length === 0) {
      renderStatus(container, "No posts have been published yet.");
      return;
    }

    container.replaceChildren(...posts.map(createPostCard));
  } catch (error) {
    console.error("Unable to render blog posts", error);
    renderStatus(container, "Unable to load posts right now.");
  }
}

function createPostCard(post) {
  const card = document.createElement("a");
  card.className = "post-card";
  card.href = post.link;

  if (new URL(card.href).origin !== globalThis.location.origin) {
    card.target = "_blank";
    card.rel = "noopener noreferrer";
  }

  if (!post.isDescriptionVisible) {
    card.setAttribute("aria-label", post.title);
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

  if (post.isDescriptionVisible) {
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
  }

  return card;
}

function renderStatus(container, message) {
  const status = document.createElement("p");
  status.className = "blog-empty-state";
  status.textContent = message;
  container.replaceChildren(status);
}
