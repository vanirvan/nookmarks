export interface ParsedBookmark {
  url: string;
  title: string;
  collectionName: string | null;
  tags: string[];
}

/**
 * Parses a Netscape Bookmark HTML file (exported from Chrome, Firefox, Safari, Edge, etc.)
 * into a structured array of bookmark objects.
 */
export function parseNetscapeBookmarks(htmlContent: string): ParsedBookmark[] {
  if (typeof window === "undefined") {
    return [];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  const bookmarks: ParsedBookmark[] = [];
  const traversedDls = new Set<Element>();

  function traverse(dlElement: Element, currentFolderPath: string[]) {
    const children = Array.from(dlElement.children);

    for (let i = 0; i < children.length; i++) {
      const child = children[i];

      if (child.tagName === "DT") {
        const h3 = child.querySelector("h3");
        const a = child.querySelector("a");

        if (h3) {
          const folderName = h3.textContent?.trim() || "Untitled Folder";
          // Check if there is a DL within the DT, or if the next element sibling is a DL
          let nextDl: Element | null = child.querySelector("dl");
          if (!nextDl && child.nextElementSibling?.tagName === "DL") {
            nextDl = child.nextElementSibling;
          }

          if (nextDl) {
            traversedDls.add(nextDl);
            traverse(nextDl, [...currentFolderPath, folderName]);
          }
        } else if (a) {
          const url = a.getAttribute("href");
          if (url && !url.startsWith("javascript:")) {
            const title = a.textContent?.trim() || url;
            const tagsAttr = a.getAttribute("tags") || a.getAttribute("TAGS");
            const tags = tagsAttr
              ? tagsAttr
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
              : [];

            const collectionName =
              currentFolderPath.length > 0 ? currentFolderPath.join("/") : null;

            bookmarks.push({
              url,
              title,
              collectionName,
              tags,
            });
          }
        }
      } else if (child.tagName === "DL") {
        if (!traversedDls.has(child)) {
          traversedDls.add(child);
          traverse(child, currentFolderPath);
        }
      }
    }
  }

  const rootDl = doc.querySelector("dl");
  if (rootDl) {
    traverse(rootDl, []);
  } else {
    // Fallback parser: if no DL tag is found, just extract all anchor tags
    const allLinks = doc.querySelectorAll("a");
    for (const a of Array.from(allLinks)) {
      const url = a.getAttribute("href");
      if (url && !url.startsWith("javascript:")) {
        const title = a.textContent?.trim() || url;
        const tagsAttr = a.getAttribute("tags") || a.getAttribute("TAGS");
        const tags = tagsAttr
          ? tagsAttr
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [];

        bookmarks.push({
          url,
          title,
          collectionName: null,
          tags,
        });
      }
    }
  }

  return bookmarks;
}
