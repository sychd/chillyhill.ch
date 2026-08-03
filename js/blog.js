const postsContainer = document.querySelector("#blog-posts");

if (postsContainer) {
  void renderBlogPosts(postsContainer);
}

async function renderBlogPosts(container) {
  try {
    const listingResponse = await fetch("./posts/", { cache: "no-store" });

    if (!listingResponse.ok) {
      throw new Error(
        `Unable to load posts listing (${listingResponse.status})`,
      );
    }

    const listingHtml = await listingResponse.text();
    const parser = new DOMParser();
    const listingDocument = parser.parseFromString(listingHtml, "text/html");
    const postsRoot = new URL("./", listingResponse.url);

    const postLinks = [...listingDocument.querySelectorAll("a[href]")]
      .map((anchor) => anchor.getAttribute("href"))
      .filter((href) => typeof href === "string")
      .map((href) => new URL(href, listingResponse.url))
      .filter(
        (url) =>
          url.pathname !== postsRoot.pathname &&
          url.pathname !== new URL("../", listingResponse.url).pathname,
      )
      .filter((url) => url.pathname.endsWith("/"))
      .map((url) => url.toString())
      .filter((href, index, all) => all.indexOf(href) === index);

    const posts = await Promise.all(
      postLinks.map(async (postUrl) => {
        const metadataUrl = new URL("./metadata.json", postUrl);
        const metadataResponse = await fetch(metadataUrl, {
          cache: "no-store",
        });

        if (!metadataResponse.ok) {
          return null;
        }

        const metadata = await metadataResponse.json();

        return {
          title: metadata.name || "Untitled post",
          description: metadata.description || "",
          link: metadata.link || postUrl,
          cover: metadata.cover
            ? new URL(metadata.cover, metadataUrl).toString()
            : "",
        };
      }),
    );

    const validPosts = posts.filter(Boolean);

    if (!validPosts.length) {
      container.innerHTML =
        '<p class="blog-empty-state">No posts have been published yet.</p>';
      return;
    }

    const cardElements = validPosts.map((post) => {
      const cardLink = document.createElement("a");
      cardLink.className = "post-card";
      cardLink.href = post.link;
      cardLink.setAttribute("aria-label", post.title);

      if (/^https?:\/\//i.test(post.link)) {
        cardLink.target = "_blank";
        cardLink.rel = "noopener noreferrer";
      }

      const media = document.createElement("div");
      media.className = "post-card-media";

      const image = document.createElement("img");
      image.className = "post-card-image";
      image.src = post.cover;
      image.alt = post.title;
      image.loading = "lazy";

      media.append(image);

      const body = document.createElement("div");
      body.className = "post-card-body";

      const title = document.createElement("h2");
      title.className = "post-card-title";
      title.textContent = post.title;

      //   const description = document.createElement("p");
      //   description.className = "post-card-description";
      //   description.textContent = post.description;
      //   body.append(title, description);

      cardLink.append(media, body);

      return cardLink;
    });

    container.replaceChildren(...cardElements);
  } catch (error) {
    console.error("Unable to render blog posts", error);
    container.innerHTML =
      '<p class="blog-empty-state">Unable to load posts right now.</p>';
  }
}
