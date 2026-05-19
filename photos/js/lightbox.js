/**
 * Simple reusable lightbox for photo album pages.
 *
 * Usage on an album page:
 *   1. Include this script: <script src="../js/lightbox.js"></script>
 *   2. Put your photos in a container with class "photo-grid"
 *   3. Each <img> can have a data-caption="..." attribute
 *
 * The script will automatically make the grid images open in a nice full-screen lightbox
 * with keyboard navigation.
 */
(function () {
  "use strict";

  let lightboxEl = null;
  let currentImages = [];
  let currentIndex = 0;

  function createLightbox() {
    if (lightboxEl) return lightboxEl;

    const html = `
      <div id="lightbox" aria-hidden="true">
        <div class="lightbox-content">
          <button class="lightbox-close" aria-label="Close">×</button>
          <button class="lightbox-nav prev" aria-label="Previous">‹</button>
          <button class="lightbox-nav next" aria-label="Next">›</button>

          <img id="lightbox-image" alt="" />
          <div id="lightbox-caption" class="lightbox-caption"></div>
        </div>
      </div>
    `;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = html.trim();
    const el = wrapper.firstElementChild;
    document.body.appendChild(el);

    // Cache elements (IDs match the CSS written for the photos feature)
    el._img = el.querySelector("#lightbox-image");
    el._caption = el.querySelector("#lightbox-caption");
    el._close = el.querySelector(".lightbox-close");
    el._prev = el.querySelector(".lightbox-nav.prev");
    el._next = el.querySelector(".lightbox-nav.next");

    // Event listeners
    el._close.addEventListener("click", closeLightbox);
    el._prev.addEventListener("click", (e) => {
      e.stopPropagation();
      showPrev();
    });
    el._next.addEventListener("click", (e) => {
      e.stopPropagation();
      showNext();
    });

    el.addEventListener("click", (e) => {
      if (e.target === el) closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
      if (!el.classList.contains("open")) return;

      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowRight") {
        showNext();
      } else if (e.key === "ArrowLeft") {
        showPrev();
      }
    });

    // Click on the main image to go to next (convenience)
    el._img.addEventListener("click", showNext);

    lightboxEl = el;
    return el;
  }

  function openLightbox(images, startIndex) {
    const lb = createLightbox();
    currentImages = images;
    currentIndex = startIndex;

    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    updateLightbox();
  }

  function updateLightbox() {
    if (!lightboxEl || !currentImages.length) return;

    const photo = currentImages[currentIndex];
    lightboxEl._img.src = photo.full || photo.src;
    lightboxEl._caption.textContent = photo.caption || "";
  }

  function showNext() {
    if (!currentImages.length) return;
    currentIndex = (currentIndex + 1) % currentImages.length;
    updateLightbox();
  }

  function showPrev() {
    if (!currentImages.length) return;
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    updateLightbox();
  }

  function closeLightbox() {
    if (!lightboxEl) return;
    lightboxEl.classList.remove("open");
    lightboxEl.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // Collect all images from a .photo-grid (or any container)
  function collectImagesFromGrid(gridEl) {
    const imgs = Array.from(gridEl.querySelectorAll("img"));
    return imgs.map((img) => ({
      src: img.src,
      full: img.dataset.full || img.src,           // allow data-full for higher-res version
      caption: img.dataset.caption || img.alt || ""
    }));
  }

  // Auto-wire any .photo-grid on the page
  function autoInit() {
    const grids = document.querySelectorAll(".photo-grid");
    if (!grids.length) return;

    grids.forEach((grid) => {
      const images = collectImagesFromGrid(grid);

      const imgElements = grid.querySelectorAll("img");
      imgElements.forEach((img, idx) => {
        img.style.cursor = "zoom-in";
        img.addEventListener("click", () => {
          openLightbox(images, idx);
        });
      });
    });
  }

  // Bootstrap
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInit);
  } else {
    autoInit();
  }

  // Expose a tiny public API in case someone wants manual control
  window.PhotoLightbox = {
    open: openLightbox,
    close: closeLightbox
  };
})();
