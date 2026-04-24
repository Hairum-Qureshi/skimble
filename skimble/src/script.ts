function init(): NodeListOf<Element> {
  const tags = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
  return tags;
}

if (document.readyState === "complete") {
  buildTableOfContents(init());
} else {
  window.addEventListener("load", () => buildTableOfContents(init()));
}

const tableOfContentsDiv = document.createElement("div");
tableOfContentsDiv.id = "table-of-contents";

// --- Styling the Container ---
Object.assign(tableOfContentsDiv.style, {
    position: "fixed", // Crucial for dragging relative to viewport
    top: "20px",
    right: "20px",
    width: "250px",
    maxHeight: "80vh",
    backgroundColor: "#ffffff",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "15px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: "999999",
    overflowY: "auto",
    userSelect: "none" // Prevents text highlighting while dragging
});

// --- Drag Handle (The Title) ---
const dragHandle = document.createElement("div");
dragHandle.style.cursor = "move";
dragHandle.style.borderBottom = "1px solid #eee";
dragHandle.style.marginBottom = "10px";
dragHandle.style.paddingBottom = "5px";

const title = document.createElement("strong");
title.textContent = "⠿ Page Contents"; // Added a drag icon hint
dragHandle.appendChild(title);
tableOfContentsDiv.appendChild(dragHandle);

const tableOfContentsListContainer = document.createElement("ul");
tableOfContentsListContainer.id = "table-of-contents-list";
tableOfContentsListContainer.style.listStyle = "none";
tableOfContentsListContainer.style.padding = "0";

// --- Drag Logic ---
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

dragHandle.addEventListener("mousedown", (e) => {
    isDragging = true;
    // Calculate where the mouse is relative to the div's top-left corner
    const rect = tableOfContentsDiv.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    
    dragHandle.style.backgroundColor = "#f0f0f0";
});

document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    // Calculate new position
    let newX = e.clientX - offsetX;
    let newY = e.clientY - offsetY;

    // Update styles (using 'left' instead of 'right' for easier math)
    tableOfContentsDiv.style.right = "auto"; 
    tableOfContentsDiv.style.left = `${newX}px`;
    tableOfContentsDiv.style.top = `${newY}px`;
});

document.addEventListener("mouseup", () => {
    isDragging = false;
    dragHandle.style.backgroundColor = "transparent";
});

function buildTableOfContents(tags: NodeListOf<Element>) {

    tags.forEach((tag) => {
        if (tag.id) {
            const listItem = document.createElement("li");
            listItem.style.marginBottom = "5px";

            const link = document.createElement("a");
            
            link.href = tag.id ? `#${tag.id}` : "javascript:void(0)";
            link.textContent = tag.textContent.trim();
            
            Object.assign(link.style, {
                color: "#007bff",
                textDecoration: "none",
                fontSize: "14px"
            });

            listItem.appendChild(link);
            tableOfContentsListContainer.appendChild(listItem);
        }
    });
}

tableOfContentsDiv.appendChild(tableOfContentsListContainer);
document.body.appendChild(tableOfContentsDiv);