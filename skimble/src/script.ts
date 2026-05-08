import { Readability } from "@mozilla/readability";
import { isUrlBlacklisted, isHeaderBlacklisted } from "./blacklists";
import DOMPurify from "dompurify";
import { Summarizer } from "ts-summarizer";

// TODO - need to reset the slider values when reader mode is toggled off
// TODO - move the close and collapse button all the way to the top right of the widget above the header
// TODO - add aria labels to the collapse and close buttons as well as the close button in the modal
// TODO - make a spotlight effect where the highlighted area the reading ruler is, it's not dimmed, but the rest of the overlay is dimmed when the button is toggled on
// TODO - fix the issue where the slider controls won't work on reader mode
// ! - need to make sure the CSS of the widget doesn't get modified by the website's CSS (e.g. by using more specific selectors or inline styles)
// TODO - for some reason the collapse button shrinks the width

const host = document.createElement("div");
host.id = "skimble-root";

const shadowRoot = host.attachShadow({ mode: "open" });

document.body.appendChild(host);

export function bootstrap() {
  if (isUrlBlacklisted(window.location.href)) return;

  initExtension();
}

function initExtension() {
  let readerMode = false;
  function anchorClickHandler(e: MouseEvent, id: string) {
    const overlay = shadowRoot.querySelector("#article-reader-overlay");
    // Find the header inside the overlay article container
    const articleContainer = overlay?.querySelector("div");
    const targetInOverlay = articleContainer?.querySelector(`[id="${id}"]`);

    if (overlay && targetInOverlay) {
      e.preventDefault();

      // OffsetTop is relative to the parent; scroll the overlay directly
      overlay.scrollTo({
        top: (targetInOverlay as HTMLElement).offsetTop - 20, // 20px padding from the top
        behavior: "smooth",
      });
    }
  }

  function renderArticleReaderModeUIOverlay(content: string) {
    const sanitizedContent = DOMPurify.sanitize(content);

    const readerModeOverlay = document.createElement("div");
    Object.assign(readerModeOverlay.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "#ffffff",
      zIndex: "999998",
      overflowY: "scroll",
      color: "black",
      padding: "40px 20px",
      boxSizing: "border-box",
    });

    readerModeOverlay.id = "article-reader-overlay";
    /* Prevent background scrolling when overlay is active */
    //   document.body.style.overflow = "hidden";

    const articleContainer = document.createElement("div");
    Object.assign(articleContainer.style, {
      maxWidth: "800px",
      margin: "0 auto",
      fontSize: "18px",
      lineHeight: "1.6",
      color: "#000000",
    });

    articleContainer.innerHTML = sanitizedContent;
    readerModeOverlay.appendChild(articleContainer);
    shadowRoot.appendChild(readerModeOverlay);

    showReadingRuler();
  }

  function showReadingRuler() {
    const overlay = shadowRoot.querySelector(
      "#article-reader-overlay",
    ) as HTMLElement;
    if (!overlay || shadowRoot.getElementById("reading-ruler")) return;

    const readingRuler = document.createElement("div");
    readingRuler.id = "reading-ruler";

    Object.assign(readingRuler.style, {
      position: "fixed",
      left: "0",
      width: "100%",
      height: "30px",
      backgroundColor: "rgba(255, 255, 0, 0.3)",
      pointerEvents: "none",
      zIndex: "999999",
      color: "black",
      borderTop: "2px solid black",
      borderBottom: "2px solid black",
    });

    overlay.appendChild(readingRuler);

    let savedRulerPos = localStorage.getItem("readingRulerPosition");
    let isLocked = !!savedRulerPos;

    if (isLocked && savedRulerPos) {
      readingRuler.style.position = "absolute";
      readingRuler.style.top = savedRulerPos + "px";
      readingRuler.style.backgroundColor = "rgba(0, 255, 0, 0.3)";

      setTimeout(() => {
        overlay.scrollTo({
          top: parseFloat(savedRulerPos!) - overlay.clientHeight / 2,
          behavior: "smooth",
        });
      }, 100);
    }

    overlay.addEventListener("mousemove", (e) => {
      if (!isLocked) readingRuler.style.top = e.clientY - 15 + "px";
    });

    // 3. Toggle Logic
    overlay.addEventListener("dblclick", (e) => {
      if (!isLocked) {
        // LOCKING
        const finalY = e.clientY + overlay.scrollTop - 15;

        isLocked = true;
        readingRuler.style.position = "absolute";
        readingRuler.style.top = finalY + "px";
        readingRuler.style.backgroundColor = "rgba(0, 255, 0, 0.3)";

        localStorage.setItem("readingRulerPosition", finalY.toString());
      } else {
        // UNLOCKING
        isLocked = false;
        readingRuler.style.position = "fixed";
        readingRuler.style.top = e.clientY - 15 + "px";
        readingRuler.style.backgroundColor = "rgba(255, 255, 0, 0.3)";

        localStorage.removeItem("readingRulerPosition");
      }
    });
  }

  function init(): NodeListOf<Element> {
    const mainContent = document.querySelector("main");
    if (mainContent) {
      const mainTags = mainContent.querySelectorAll("h1, h2, h3");

      if (mainTags.length > 0) return mainTags;
    }
    const tags = document.querySelectorAll("h1, h2, h3");
    return tags;
  }

  const widgetContainer = document.createElement("div");
  widgetContainer.id = "widget-container";

  shadowRoot.appendChild(widgetContainer);

  // --- Styling the Container ---
  Object.assign(widgetContainer.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    width: "22%",
    backgroundColor: "#ffffff",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "10px 15px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: "999999",
    fontFamily: "sans-serif",
    userSelect: "none",
    color: "black",
    maxHeight: "80vh",
    overflowY: "auto",
  });

  // --- Container (stacks headers vertically) ---
  const headerContainer = document.createElement("div");
  Object.assign(headerContainer.style, {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  });

  const readerControlsGroup = document.createElement("div");
  readerControlsGroup.id = "reader-controls-group";
  // Place it inside the headerContainer where you want the buttons to appear
  headerContainer.appendChild(readerControlsGroup);

  // --- Top Header ---
  const mainHeader = document.createElement("div");
  Object.assign(mainHeader.style, {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "18px",
    color: "black",
    marginTop: "10px",
    display: "flex",
    flexDirection: "row",
  });

  mainHeader.textContent = "⠿ Skimble Reader Widget";
  mainHeader.style.cursor = "move";

  const toggleDiv = document.createElement("div");
  toggleDiv.textContent = "Toggle Reader Mode";

  // use Object.assign for cleaner style application
  Object.assign(toggleDiv.style, {
    cursor: "pointer",
    padding: "5px",
    border: "1px solid #ccc",
    display: "inline-block",
    backgroundColor: "#f0f0f0", // make a little more darker
    borderRadius: "6px",
    color: "black",
    userSelect: "none",
  });

  // --- Spacing Controls Container ---
  const controlsContainer = document.createElement("div");
  Object.assign(controlsContainer.style, {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "10px",
    padding: "10px",
    backgroundColor: "#f9f9f9",
    borderRadius: "6px",
    border: "1px solid #ddd",
    color: "black",
  });

  // Helper function to create a labeled slider
  function createSlider(
    label: string,
    id: string,
    min: string,
    max: string,
    step: string,
    defaultValue: string,
  ) {
    const wrapper = document.createElement("div");
    const labelEl = document.createElement("label");

    labelEl.innerHTML = `${label}: <span id="${id}-value">${defaultValue}%</span>`;

    Object.assign(labelEl.style, {
      fontSize: "12px",
      display: "block",
      marginBottom: "4px",
      fontWeight: "bold",
    });

    const slider = document.createElement("input");
    slider.type = "range";
    slider.id = id;
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = defaultValue;
    slider.style.width = "100%";

    wrapper.appendChild(labelEl);
    wrapper.appendChild(slider);
    return { wrapper, slider };
  }

  // Create Line Spacing Slider
  const lineSpacing = createSlider(
    "Line Spacing",
    "line-height-input",
    "1",
    "3",
    "0.1",
    "1.6",
  );

  const wordSpacing = createSlider(
    "Word Spacing",
    "word-spacing-input",
    "0",
    "1",
    "0.1",
    "0",
  );

  controlsContainer.appendChild(wordSpacing.wrapper);
  controlsContainer.appendChild(lineSpacing.wrapper);

  const fontSize = createSlider(
    "Font Size",
    "font-size-input",
    "12",
    "36",
    "1",
    "18",
  );

  controlsContainer.appendChild(fontSize.wrapper);

  // Create Letter Spacing Slider
  const letterSpacing = createSlider(
    "Letter Spacing",
    "letter-spacing-input",
    "0",
    "0.5",
    "0.01",
    "0",
  );

  controlsContainer.appendChild(lineSpacing.wrapper);
  controlsContainer.appendChild(letterSpacing.wrapper);

  // --- Event Listeners to Update Styles ---
  const updateStyles = () => {
    const overlay = shadowRoot.querySelector("#article-reader-overlay");
    const article = overlay?.querySelector("div"); // This targets your articleContainer

    if (article) {
      (article as HTMLElement).style.lineHeight = lineSpacing.slider.value;
      (article as HTMLElement).style.letterSpacing =
        letterSpacing.slider.value + "em";
      (article as HTMLElement).style.fontSize = fontSize.slider.value + "px";
      (article as HTMLElement).style.wordSpacing =
        wordSpacing.slider.value + "em";

      // update the percentage labels next to sliders
      const lineHeightValue = document.getElementById(
        "line-height-input-value",
      ) as HTMLElement;
      const letterSpacingValue = document.getElementById(
        "letter-spacing-input-value",
      ) as HTMLElement;
      const fontSizeValue = document.getElementById(
        "font-size-input-value",
      ) as HTMLElement;
      const wordSpacingValue = document.getElementById(
        "word-spacing-input-value",
      ) as HTMLElement;

      if (lineHeightValue)
        lineHeightValue.textContent = lineSpacing.slider.value + "x";
      if (letterSpacingValue)
        letterSpacingValue.textContent = letterSpacing.slider.value + "em";
      if (fontSizeValue)
        fontSizeValue.textContent = fontSize.slider.value + "px";
      if (wordSpacingValue)
        wordSpacingValue.textContent = wordSpacing.slider.value + "em";
    }
  };

  lineSpacing.slider.addEventListener("input", updateStyles);
  letterSpacing.slider.addEventListener("input", updateStyles);
  fontSize.slider.addEventListener("input", updateStyles);
  wordSpacing.slider.addEventListener("input", updateStyles);

  function updateBackdropDimming() {
    const overlay = shadowRoot.querySelector(
      "#article-reader-overlay",
    ) as HTMLElement | null;

    const host = shadowRoot.host as HTMLElement;

    // Only dim if BOTH:
    // 1. modalOpen is true
    const shouldDim = modalOpen && readerMode;

    if (shouldDim) {
      host.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      host.style.position = "fixed";
      host.style.top = "0";
      host.style.left = "0";
      host.style.width = "100%";
      host.style.height = "100%";
      host.style.zIndex = "999999";

      if (overlay) {
        overlay.style.background =
          "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), #ffffff";
      }
    } else {
      host.style.backgroundColor = "transparent";
      host.style.position = "static";
      host.style.top = "";
      host.style.left = "";
      host.style.width = "auto";
      host.style.height = "auto";

      if (overlay) {
        overlay.style.background = "#ffffff";
      }
    }
  }

  function renderToggle() {
    toggleDiv.textContent = readerMode ? "Reader Mode: ON" : "Reader Mode: OFF";

    toggleDiv.setAttribute("aria-pressed", readerMode.toString());

    readerControlsGroup.innerHTML = "";

    if (readerMode) {
      // --- NEW: Jump to Reading Ruler Button ---
      const jumpBtn = document.createElement("button");
      jumpBtn.id = "jump-to-ruler-btn";
      jumpBtn.textContent = "Jump to Reading Ruler Position";
      jumpBtn.setAttribute(
        "aria-label",
        "Jump to Reading Ruler Position Button",
      );
      jumpBtn.title = "Jump to Reading Ruler Position";

      Object.assign(jumpBtn.style, {
        margin: "5px 0 10px 0",
        padding: "8px",
        border: "1px solid #ccc",
        backgroundColor: "#e0e7ff", // Light blue to distinguish from dim button
        borderRadius: "6px",
        color: "#1e1b4b",
        cursor: "pointer",
        display: "block",
        width: "100%",
      });

      jumpBtn.addEventListener("click", () => {
        const overlay = shadowRoot.querySelector(
          "#article-reader-overlay",
        ) as HTMLElement;
        const ruler = shadowRoot.getElementById("reading-ruler");

        if (overlay && ruler) {
          // Get the vertical position of the ruler relative to the scrollable overlay
          const rulerTop = parseFloat(ruler.style.top);

          overlay.scrollTo({
            top: rulerTop - overlay.clientHeight / 2, // Center the ruler in view
            behavior: "smooth",
          });
        }
      });

      readerControlsGroup.appendChild(jumpBtn);
      // --- End of Jump Button ---

      const dimBtn = document.createElement("button");
      dimBtn.id = "toggle-dimming-btn";
      dimBtn.textContent = "Toggle Background Dimming";

      Object.assign(dimBtn.style, {
        margin: "10px 0",
        padding: "8px",
        border: "1px solid #ccc",
        backgroundColor: "#f0f0f0",
        borderRadius: "6px",
        color: "black",
        cursor: "pointer",
        display: "block",
        width: "100%",
      });

      dimBtn.addEventListener("click", () => {
        modalOpen = !modalOpen;
        updateBackdropDimming();
        const ruler = shadowRoot.getElementById("reading-ruler");

        if (ruler) {
          ruler.style.backgroundColor = modalOpen
            ? "transparent"
            : localStorage.getItem("readingRulerPosition")
              ? "rgba(0, 255, 0, 0.3)"
              : "rgba(255, 255, 0, 0.3)";
        }
      });

      readerControlsGroup.appendChild(dimBtn);

      // Info Text
      const info = document.createElement("div");
      info.id = "reading-ruler-info";

      Object.assign(info.style, {
        fontSize: "13px",
        color: "#555",
        marginBottom: "10px",
        lineHeight: "1.4",
      });

      info.textContent =
        "Double-click to lock/unlock the reading ruler. Green means it's locked and your position is saved. Yellow means it's unlocked and follows your cursor.";

      readerControlsGroup.appendChild(info);

      if (!shadowRoot.getElementById("article-reader-overlay")) {
        const documentClone = document.cloneNode(true) as Document;
        const article = new Readability(documentClone).parse();
        if (article?.content) {
          renderArticleReaderModeUIOverlay(article.content);
        }
      }

      // Sliders
      readerControlsGroup.appendChild(controlsContainer);
    } else {
      shadowRoot.getElementById("article-reader-overlay")?.remove();
      shadowRoot.getElementById("reading-ruler")?.remove();
    }

    updateBackdropDimming();
    shadowRoot.host.classList.toggle("reader-mode", readerMode);
  }

  // toggle behavior
  toggleDiv.addEventListener("click", () => {
    readerMode = !readerMode;
    renderToggle();
  });

  Object.assign(toggleDiv.style, {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "5px",
    color: "black",
  });

  const header = document.createElement("div");
  Object.assign(header.style, {
    cursor: "move",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "5px",
    borderBottom: "1px solid #eee",
    color: "black",
  });

  const tocHeader = document.createElement("strong");
  tocHeader.textContent = "Contents";

  header.appendChild(tocHeader);

  const summaryContainer = document.createElement("div");

  Object.assign(summaryContainer.style, {
    fontSize: "14px",
    color: "#333",
    border: "1px solid #e5e7eb",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    padding: "12px 14px",
    maxHeight: "140px",
    overflowY: "auto",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    lineHeight: "1.5",
    width: "100%",
    boxSizing: "border-box",
    wordWrap: "break-word",
    overflowWrap: "break-word",
  });
  // align the arrow span to the right of the header
  summaryContainer.innerHTML = `
  <h2 style="
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    margin-top: -1px;
    color: #111827;
  ">
    Article Summary
    <button id="open-summary-btn" style="
      margin-left: auto;
      font-size: 13px;
      font-weight: bold;
      border: 1px solid #111827;
      border-radius: 6px;
      padding: 2px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f3f4f6;
      cursor: pointer;
      transition: all 0.2s ease;
    "
    onmouseover="this.style.backgroundColor='#e5e7eb'" 
    onmouseout="this.style.backgroundColor='#f3f4f6'"
    aria-label="Open Summary Window Button"
    title="Open Summary Window">
      ↗
    </button>
  </h2>

  <p style="
    margin: -5px 0 5px 0;
    color: #4b5563;
    font-size: 13px;
  ">
    ${getArticleSummary()}
  </p>

  <p style="
    color: #4b5563;
    font-style: italic;
    font-size: 11px;
  ">
    <span style="font-style: normal;">ⓘ</span>
    Please note that this AI-free summary has been generated automatically and may be inaccurate or incomplete.
  </p>
`;

  // --- Assemble ---
  headerContainer.appendChild(mainHeader); // Title
  headerContainer.appendChild(header); // Contents & Buttons
  headerContainer.appendChild(summaryContainer);
  headerContainer.appendChild(toggleDiv);
  headerContainer.appendChild(readerControlsGroup);

  // --- Button Container (groups both buttons) ---
  const buttonGroup = document.createElement("div");
  Object.assign(buttonGroup.style, {
    display: "flex",
    gap: "3px",
    margin: "0 0 0 auto",
  });

  function getArticleSummary() {
    const documentClone = document.cloneNode(true) as Document;
    const article = new Readability(documentClone).parse();
    const summary = Summarizer.summarize(
      DOMPurify.sanitize(article?.textContent || "No content to summarize"),
      0.5, // Summarize to 50% of original length
      5, // Maximum of 5 sentences
      {
        deduplicateSimilar: true, // Remove similar sentences
        favorPositionScore: true, // Prioritize intro/conclusion sentences
      },
    );

    return summary;
  }

  // -- Close Button ---
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
  Object.assign(closeBtn.style, {
    border: "none",
    background: "#ff4d4d",
    borderRadius: "4px",
    color: "#fff",
    width: "24px",
    height: "24px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "4px",
  });

  closeBtn.onclick = () => {
    const confirmation = confirm(
      "Are you sure you want to hide the widget? You can always reopen it by refreshing the page.",
    );
    if (!confirmation) return;
    widgetContainer.remove();
  };

  // --- Collapse Button ---
  const collapseBtn = document.createElement("button");
  collapseBtn.textContent = "-";
  Object.assign(collapseBtn.style, {
    border: "none",
    background: "#eee",
    borderRadius: "4px",
    width: "24px",
    height: "24px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    color: "black",
    justifyContent: "center",
  });

  // Add buttons to group
  buttonGroup.appendChild(collapseBtn);
  buttonGroup.appendChild(closeBtn);

  // Make sure header is flex
  Object.assign(header.style, {
    display: "flex",
    alignItems: "center",
  });

  // Append group to header
  mainHeader.appendChild(buttonGroup);
  widgetContainer.appendChild(headerContainer);
  widgetContainer.appendChild(header);

  const tableOfContentsListContainer = document.createElement("ul");
  tableOfContentsListContainer.id = "table-of-contents-list";

  Object.assign(tableOfContentsListContainer.style, {
    padding: "10px 0 0 20px",
    margin: "0",
    color: "black",
    maxHeight: "70vh",
    overflowY: "auto",
    transition: "all 0.2s ease", // Smooth opening/closing
  });

  // --- Collapse Logic ---
  let isCollapsed = false;

  collapseBtn.onclick = (e) => {
    e.stopPropagation(); // Don't trigger drag mousedown
    isCollapsed = !isCollapsed;

    if (isCollapsed) {
      // Hide the bodies, keep the head
      headerContainer.style.display = "none";
      header.style.display = "none";
      tableOfContentsListContainer.style.display = "none";
      collapseBtn.textContent = "+";
    } else {
      headerContainer.style.display = "flex";
      header.style.display = "flex";
      tableOfContentsListContainer.style.display = "block";
      collapseBtn.textContent = "-";
      widgetContainer.style.width = "22%";
    }
  };

  // --- Drag Logic ---
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  mainHeader.addEventListener("mousedown", (e) => {
    if (e.target === collapseBtn) return; // Don't drag if clicking the button
    isDragging = true;
    const rect = widgetContainer.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    widgetContainer.style.right = "auto";
    widgetContainer.style.left = `${e.clientX - offsetX}px`;
    widgetContainer.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  function buildTableOfContents(tags: NodeListOf<Element>) {
    tableOfContentsListContainer.innerHTML = "";

    if (!tags.length) return;

    widgetContainer.appendChild(mainHeader); // Add title/buttons first (Safe Zone)
    widgetContainer.appendChild(headerContainer); // Add everything else
    widgetContainer.appendChild(header);
    widgetContainer.appendChild(tableOfContentsListContainer);

    tags.forEach((tag) => {
      if (isHeaderBlacklisted(tag.textContent || "")) return;

      if (tag.textContent?.trim()) {
        const listItem = document.createElement("li");
        listItem.id = "tocListItem";
        listItem.style.marginBottom = "8px";
        const link = document.createElement("a");
        if (!tag.id) return;

        link.href = `#${tag.id}`;
        link.textContent = tag.textContent.trim();

        Object.assign(link.style, {
          color: "#007bff",
          textDecoration: "none",
          fontSize: "13px",
        });

        listItem.appendChild(link);
        tableOfContentsListContainer.appendChild(listItem);

        listItem.addEventListener("click", (e) =>
          anchorClickHandler(e, tag.id),
        );
      }
    });
  }

  let modalOpen = false;
  shadowRoot
    .querySelector("#open-summary-btn")
    ?.addEventListener("click", () => {
      if (modalOpen) return;

      // Inside shadowRoot.querySelector("#open-summary-btn")?.addEventListener("click", ...
      // Replace the manual "Background overlay" code block with:
      modalOpen = true;
      updateBackdropDimming();

      const modalContainer = document.createElement("div");
      Object.assign(modalContainer.style, {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "20px",
        backgroundColor: "#ffffff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: "1000000",
        width: "60%", // Slightly wider to accommodate side-by-side layout
        maxHeight: "50%", // Increased height for better visibility
        overflowY: "auto",
      });

      const modalHeader = document.createElement("h2");
      modalHeader.textContent = "Article Summary";
      Object.assign(modalHeader.style, {
        marginTop: "0",
        marginBottom: "20px",
        color: "#111827",
      });

      // --- NEW: Content Wrapper to hold text and sliders side-by-side ---
      const contentWrapper = document.createElement("div");
      Object.assign(contentWrapper.style, {
        display: "flex",
        flexDirection: "row",
        gap: "20px", // Spacing between text and sliders
        alignItems: "flex-start",
      });

      const textContainer = document.createElement("div");
      Object.assign(textContainer.style, {
        flex: "1", // Take up proportional space
      });

      const summaryText = document.createElement("p");
      summaryText.textContent = getArticleSummary();
      Object.assign(summaryText.style, {
        color: "#4b5563",
        fontSize: "14px",
        lineHeight: "1.5",
        margin: "0",
      });

      const slidersContainer = controlsContainer.cloneNode(true) as HTMLElement;
      Object.assign(slidersContainer.style, {
        flex: "1", // Take up proportional space
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      });

      const closeBtn = document.createElement("button");
      Object.assign(closeBtn.style, {
        position: "absolute",
        top: "10px",
        right: "10px",
        border: "none",
        background: "#ff4d4d",
        borderRadius: "4px",
        color: "#fff",
        width: "24px",
        height: "24px",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      });
      closeBtn.textContent = "×";

      closeBtn.onclick = () => {
        modalContainer.remove();
        modalOpen = false; // Set this first
        updateBackdropDimming(); // Then refresh UI
      };

      // make the slider adjust the summary text in real-time
      const lineSpacingSlider = slidersContainer.querySelector(
        "#line-height-input",
      ) as HTMLInputElement;
      const letterSpacingSlider = slidersContainer.querySelector(
        "#letter-spacing-input",
      ) as HTMLInputElement;
      const fontSizeSlider = slidersContainer.querySelector(
        "#font-size-input",
      ) as HTMLInputElement;
      const wordSpacingSlider = slidersContainer.querySelector(
        "#word-spacing-input",
      ) as HTMLInputElement;

      lineSpacingSlider.addEventListener("input", () => {
        summaryText.style.lineHeight = lineSpacingSlider.value;
      });

      letterSpacingSlider.addEventListener("input", () => {
        summaryText.style.letterSpacing = letterSpacingSlider.value + "em";
      });

      fontSizeSlider.addEventListener("input", () => {
        summaryText.style.fontSize = fontSizeSlider.value + "px";
      });

      wordSpacingSlider.addEventListener("input", () => {
        summaryText.style.wordSpacing = wordSpacingSlider.value + "em";
      });

      // Assembly
      textContainer.appendChild(summaryText);

      // Append containers to the horizontal wrapper
      contentWrapper.appendChild(textContainer);
      contentWrapper.appendChild(slidersContainer);

      modalContainer.appendChild(closeBtn);
      modalContainer.appendChild(modalHeader);
      modalContainer.appendChild(contentWrapper); // Add the wrapper to the modal

      shadowRoot.appendChild(modalContainer);
    });

  if (document.readyState === "complete") {
    buildTableOfContents(init());
  } else {
    window.addEventListener("load", () => buildTableOfContents(init()));
  }
}

bootstrap();
