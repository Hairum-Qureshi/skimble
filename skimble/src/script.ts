import { Readability } from "@mozilla/readability";
import { isUrlBlacklisted, isHeaderBlacklisted } from "./blacklists";
import DOMPurify from "dompurify";

// TODO - need to make all the links black when isArticleReaderModeActive is true
let readerMode = false;

function anchorClickHandler(e: MouseEvent, id: string) {
  const overlay = document.querySelector("#article-reader-overlay");
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
  document.body.appendChild(readerModeOverlay);

  showReadingRuler();
}

function showReadingRuler() {
  const overlay = document.querySelector(
    "#article-reader-overlay",
  ) as HTMLElement;
  if (!overlay || document.getElementById("reading-ruler")) return;

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

// --- Styling the Container ---
Object.assign(widgetContainer.style, {
  position: "fixed",
  top: "20px",
  right: "20px",
  width: "250px",
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

// --- Top Header ---
const mainHeader = document.createElement("div");
Object.assign(mainHeader.style, {
  textAlign: "center",
  fontWeight: "bold",
  fontSize: "18px",
  color: "black",
  marginTop: "10px",
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
  const overlay = document.querySelector("#article-reader-overlay");
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
    if (fontSizeValue) fontSizeValue.textContent = fontSize.slider.value + "px";
    if (wordSpacingValue)
      wordSpacingValue.textContent = wordSpacing.slider.value + "em";
  }
};

lineSpacing.slider.addEventListener("input", updateStyles);
letterSpacing.slider.addEventListener("input", updateStyles);
fontSize.slider.addEventListener("input", updateStyles);
wordSpacing.slider.addEventListener("input", updateStyles);

// update UI based on state
function renderToggle() {
  toggleDiv.textContent = readerMode ? "Reader Mode: ON" : "Reader Mode: OFF";
  toggleDiv.setAttribute("aria-pressed", readerMode.toString());

  // Check if the text container already exists, otherwise create it
  let readingRulerTextContainer = document.querySelector(
    "#reading-ruler-info",
  ) as HTMLElement;
  if (!readingRulerTextContainer) {
    readingRulerTextContainer = document.createElement("div");
    readingRulerTextContainer.id = "reading-ruler-info";
    Object.assign(readingRulerTextContainer.style, {
      fontSize: "13px",
      color: "#555",
      marginBottom: "5px",
      lineHeight: "1.4",
    });
    headerContainer.appendChild(readingRulerTextContainer);
  }

  // Update text based on state
  readingRulerTextContainer.textContent = readerMode
    ? "Double-click to lock/unlock the reading ruler. It's locked when it's green. It's unlocked when it's yellow."
    : "Activate reader mode to show the reading ruler and/or view your last saved position.";

  if (readerMode) {
    const documentClone = document.cloneNode(true) as Document;
    const article = new Readability(documentClone).parse();
    if (article && article.content) {
      renderArticleReaderModeUIOverlay(article.content);
      headerContainer.appendChild(controlsContainer);
    }
  } else {
    document.querySelector("#article-reader-overlay")?.remove();
    headerContainer.removeChild(controlsContainer);
  }

  document.body.classList.toggle("reader-mode", readerMode);
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
  margin: "5px 0 10px 0",
  color: "black",
});

toggleDiv.appendChild(mainHeader);

// --- Bottom Header / Drag Handle ---
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

// --- Assemble ---
headerContainer.appendChild(mainHeader); // Title
headerContainer.appendChild(header); // Contents & Buttons
headerContainer.appendChild(toggleDiv);

// --- Button Container (groups both buttons) ---
const buttonGroup = document.createElement("div");
Object.assign(buttonGroup.style, {
  display: "flex",
  marginLeft: "auto", // pushes group to the right side
});

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
header.appendChild(buttonGroup);
header.appendChild(closeBtn);
header.appendChild(collapseBtn);
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
    tableOfContentsListContainer.style.display = "none";
    collapseBtn.textContent = "+";
  } else {
    tableOfContentsListContainer.style.display = "block";
    header.style.borderBottom = "1px solid #eee";
    collapseBtn.textContent = "-";
    widgetContainer.style.width = "250px";
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

  if (!tags.length || isUrlBlacklisted(window.location.href)) return;

  widgetContainer.appendChild(tableOfContentsListContainer);
  document.body.appendChild(widgetContainer);

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

      listItem.addEventListener("click", (e) => anchorClickHandler(e, tag.id));
    }
  });
}

if (document.readyState === "complete") {
  buildTableOfContents(init());
} else {
  window.addEventListener("load", () => buildTableOfContents(init()));
}
