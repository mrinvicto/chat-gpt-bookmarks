const observer = new MutationObserver(() => {

    injectBookmarkOption();
    // Find all group/sidebar containers
    const groups = document.querySelectorAll('div[class*="group/sidebar"]');

    groups.forEach(group => {
    const target = Array.from(
        group.querySelectorAll('div.bg-token-sidebar-surface-primary')
    )[1]
    // .find(div => div.textContent.trim() === "Today");

    if (target) {
        // Check if a div with the specific id already exists
        const existingDiv = document.getElementById('inserted-div-id');
        if (existingDiv) {
            return;
        }

        // Get the grandparent (parent of the parent)
        const grandparent = target.parentElement?.parentElement;

        if (grandparent) {
        // Create a new div
        const newDiv = document.createElement('div');
        newDiv.id = "inserted-div-id"; // Assign an id to the new div
        newDiv.innerHTML = getBookmarksDivContent();
        // newDiv.textContent = "✨ This was inserted by your extension";
        // newDiv.style.backgroundColor = "#d1e7dd";
        // newDiv.style.padding = "8px";
        // newDiv.style.marginBottom = "4px";
        // newDiv.style.border = "1px solid #0f5132";
        // newDiv.style.borderRadius = "4px";
        // newDiv.style.color = "#0f5132";

        // Check if grandparent has a valid parent (the correct container to insert into)
        const grandparentParent = grandparent.parentElement;

        if (grandparentParent) {
            // Insert the new div before the grandparent
            grandparentParent.insertBefore(newDiv, grandparent);
        } else {
            console.error("❌ Grandparent's parent is not available.");
        }
        } else {
        console.error("❌ Grandparent element is not available.");
        }
    } else {
        console.error("❌ 'Today' div not found.");
    }
    });
});

observer.observe(document.body, { childList: true, subtree: true });

const getBookmarksDivContent = () => {
    return `

    <div class="relative mt-5 first:mt-0 last:mb-5">
        <div class="bg-token-sidebar-surface-primary sticky top-0 z-20">
            <span class="flex h-9 items-center">
                <h3 class="px-2 text-xs font-semibold text-ellipsis overflow-hidden break-all pt-3 pb-2 text-token-text-primary">Bookmarks</h3>
            </span>
        </div>
        <ol>
            ${getListOfBookmarksHtml().join("")}    
        </ol>
    </div>

    `;
}

const getListOfBookmarksHtml = () => {
    return getListOfAllBookmarks().map((bookmark, index) => {
        return `
            <li class="relative" data-testid="history-item-3">
                <div draggable="true" class="no-draggable group rounded-lg active:opacity-90 bg-[var(--item-background-color)] h-9 text-sm screen-arch:bg-transparent relative" style="--item-background-color: var(--sidebar-surface-primary);">
                    <a class="motion-safe:group-active:screen-arch:scale-[98%] motion-safe:group-active:screen-arch:transition-transform motion-safe:group-active:screen-arch:duration-100 flex items-center gap-2 p-2" data-history-item-link="true" href="${bookmark.url}" data-discover="true" style="mask-image: var(--sidebar-mask);">
                    <div class="relative grow overflow-hidden whitespace-nowrap" dir="auto" title="${bookmark.title}">${bookmark.title}</div>
                    </a>
                </div>
            </li>
        `
    });
}

const getListOfAllBookmarks = () => {
    const storedBookmarks = localStorage.getItem("chatGPTBookmarks");
    if (storedBookmarks) {
        return JSON.parse(storedBookmarks);
    }
    return [];  
}

function injectBookmarkOption() {
    const menu = document.querySelector('div[role="menu"]');
    if (!menu) return;
  
    if (document.getElementById('bookmark-convo-option')) return;
  
    // Try to find an existing item to clone
    const existingItem = menu.querySelector('[role="menuitem"]');
    if (!existingItem) return;
    // Clone the existing item
    const bookmarkDiv = existingItem.cloneNode(true);
    bookmarkDiv.id = 'bookmark-convo-option';
    bookmarkDiv.textContent = '🔖 Bookmark';
  
    // Replace click handler
    bookmarkDiv.onclick = () => {
        const localBookmarkLinkString = sessionStorage.getItem('localBookmarkLink');
        if(!localBookmarkLinkString) {
            alert("No bookmark link found");
        }
     
        const newBookmark = JSON.parse(localBookmarkLinkString);
        const {url, title} = newBookmark;
    
        const bookmarks = JSON.parse(localStorage.getItem('chatGPTBookmarks') || '[]');
        const alreadyExists = bookmarks.some(b => b.url === url);
    
        if (!alreadyExists) {
          bookmarks.push(newBookmark);
          localStorage.setItem('chatGPTBookmarks', JSON.stringify(bookmarks));
          alert(`🔖 Bookmarked: ${title}`);
          deleteBookmarkListFromUI();
        } else {
          alert(`✅ Already bookmarked: ${title}`);
        }
      };
  
    // Add it to the menu
    existingItem.parentNode.appendChild(bookmarkDiv);
  }

  function trackChatClickEvents() {
    // Select all 3-dot buttons in sidebar (menu triggers)
    document.body.addEventListener('click', function (e) {
      const button = e.target.closest('button');
      if (!button) return;
  
      // Look for the nearest parent <li> with an <a> tag (chat entry)
      const chatListItem = button.closest('li');
      if (!chatListItem) return;
  
      const link = chatListItem.querySelector('a');
      if (link && link.href) {
        sessionStorage.setItem('localBookmarkLink', JSON.stringify({url: link.href, title: link.childNodes[0].innerText}))
      }
    });
  }

  trackChatClickEvents();
  
  const deleteBookmarkListFromUI = () => {
    const element = document.getElementById("inserted-div-id");
    if (element) {
      element.remove();
    }    
  }