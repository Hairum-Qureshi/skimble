import isUrlBlacklisted from "./url_blacklist";

function init(): NodeListOf<Element> {
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

// --- Header / Drag Handle ---
const header = document.createElement("div");
Object.assign(header.style, {
  cursor: "move",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingBottom: "5px",
  borderBottom: "1px solid #eee",
});

const title = document.createElement("strong");
title.textContent = "⠿ Contents";
header.appendChild(title);

// -- Close Button ---
const closeBtn = document.createElement("button");
closeBtn.textContent = "×"; // Multiplication sign (close icon)
Object.assign(closeBtn.style, {
  border: "none",
  background: "#ff4d4d", // light red background for close button
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
    "Are you sure you want to close the table of contents? You can always reopen it by refreshing the page.",
  );
  if (!confirmation) return;
  tableOfContentsDiv.remove();
};

// --- Collapse Button ---
const collapseBtn = document.createElement("button");
collapseBtn.textContent = "-"; // Minus sign
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

// --- Build Function ---
function buildTableOfContents(tags: NodeListOf<Element>) {
  tableOfContentsListContainer.innerHTML = "";

  if (!tags.length || isUrlBlacklisted(window.location.href)) return;

  tableOfContentsDiv.appendChild(tableOfContentsListContainer);
  document.body.appendChild(tableOfContentsDiv);

  tags.forEach((tag) => {
    if (tag.textContent?.trim()) {
      const listItem = document.createElement("li");
      listItem.style.marginBottom = "8px";
      const link = document.createElement("a");
      link.href = tag.id ? `#${tag.id}` : "javascript:void(0)";
      link.textContent = tag.textContent.trim();
      Object.assign(link.style, {
        color: "#007bff",
        textDecoration: "none",
        fontSize: "13px",
      });
      listItem.appendChild(link);
      tableOfContentsListContainer.appendChild(listItem);
    }
  });
}

if (document.readyState === "complete") {
  buildTableOfContents(init());
} else {
  window.addEventListener("load", () => buildTableOfContents(init()));
}
