import { Readability } from "@mozilla/readability";
import { isUrlBlacklisted, isHeaderBlacklisted } from "./blacklists";
import DOMPurify from "dompurify";

// TODO - need to make all the links black when isArticleReaderModeActive is true

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
    padding: "40px 20px",
    boxSizing: "border-box",
  });

  readerModeOverlay.id = "article-reader-overlay";
  /* Prevent background scrolling when overlay is active */
  document.body.style.overflow = "hidden";

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

const tableOfContentsDiv = document.createElement("div");
tableOfContentsDiv.id = "table-of-contents";

// --- Styling the Container ---
Object.assign(tableOfContentsDiv.style, {
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
  margin: "10px 0 15px 0",
});

mainHeader.textContent = "Skimble Reader Widget";

// --- Bottom Header / Drag Handle ---
const header = document.createElement("div");
Object.assign(header.style, {
  cursor: "move",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingBottom: "5px",
  borderBottom: "1px solid #eee",
});

const tocHeader = document.createElement("strong");
tocHeader.textContent = "⠿ Contents";

header.appendChild(tocHeader);

// --- Assemble ---
headerContainer.appendChild(mainHeader);
headerContainer.appendChild(header);

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
  marginLeft: "60px",
});

closeBtn.onclick = () => {
  const confirmation = confirm(
    "Are you sure you want to hide the widget? You can always reopen it by refreshing the page.",
  );
  if (!confirmation) return;
  tableOfContentsDiv.remove();
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
  justifyContent: "center",
});

header.appendChild(closeBtn);
header.appendChild(collapseBtn);
tableOfContentsDiv.appendChild(headerContainer);
tableOfContentsDiv.appendChild(header);

const tableOfContentsListContainer = document.createElement("ul");
tableOfContentsListContainer.id = "table-of-contents-list";

Object.assign(tableOfContentsListContainer.style, {
  padding: "10px 0 0 20px",
  margin: "0",
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
    tableOfContentsDiv.style.width = "250px";
  }
};

// --- Drag Logic ---
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

header.addEventListener("mousedown", (e) => {
  if (e.target === collapseBtn) return; // Don't drag if clicking the button
  isDragging = true;
  const rect = tableOfContentsDiv.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  tableOfContentsDiv.style.right = "auto";
  tableOfContentsDiv.style.left = `${e.clientX - offsetX}px`;
  tableOfContentsDiv.style.top = `${e.clientY - offsetY}px`;
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

function buildTableOfContents(tags: NodeListOf<Element>) {
  tableOfContentsListContainer.innerHTML = "";

  if (!tags.length || isUrlBlacklisted(window.location.href)) return;

  const documentClone = document.cloneNode(true) as Document;
  const article = new Readability(documentClone).parse();
  if (article && article.content)
    renderArticleReaderModeUIOverlay(article.content);

  tableOfContentsDiv.appendChild(tableOfContentsListContainer);
  document.body.appendChild(tableOfContentsDiv);

  tags.forEach((tag) => {
    if (isHeaderBlacklisted(tag.textContent || "")) return;

    if (tag.textContent?.trim()) {
      const listItem = document.createElement("li");
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

      listItem.addEventListener("click", (e) => {
        e.preventDefault();

        const overlay = document.getElementById("article-reader-overlay");
        // Find the header inside the overlay article container
        const articleContainer = overlay?.querySelector("div");
        const targetInOverlay = articleContainer?.querySelector(
          `[id="${tag.id}"]`,
        );

        if (overlay && targetInOverlay) {
          // OffsetTop is relative to the parent; scroll the overlay directly
          overlay.scrollTo({
            top: (targetInOverlay as HTMLElement).offsetTop - 20, // 20px padding from the top
            behavior: "smooth",
          });
        }
      });
    }
  });
}

if (document.readyState === "complete") {
  buildTableOfContents(init());
} else {
  window.addEventListener("load", () => buildTableOfContents(init()));
}
