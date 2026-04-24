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
    position: "fixed",
    top: "20px",
    right: "20px",
    width: "250px",
    maxHeight: "80vh",
    backgroundColor: "white",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "15px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: "999999",
    overflowY: "auto",
    fontFamily: "sans-serif"
});

const title = document.createElement("strong");
title.textContent = "Page Contents";
tableOfContentsDiv.appendChild(title);

const tableOfContentsListContainer = document.createElement("ul");
tableOfContentsListContainer.id = "table-of-contents-list";
tableOfContentsListContainer.style.paddingLeft = "20px";
tableOfContentsListContainer.style.marginTop = "10px";

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
    