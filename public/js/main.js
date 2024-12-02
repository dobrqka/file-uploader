document.getElementById("new-folder-btn").addEventListener("click", () => {
  const folderName = prompt("Enter the folder name:");

  if (!folderName) {
    alert("Folder name is required!");
    return;
  }

  fetch("/folder/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ folder: folderName }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Folder created successfully!");

        const folderList = document.getElementById("folder-list");
        const newFolderItem = document.createElement("li");
        newFolderItem.classList.add(
          "flex",
          "items-center",
          "text-red-900",
          "mb-4"
        );

        const folderIcon = document.createElement("i");
        folderIcon.classList.add("fas", "fa-folder", "mr-4");

        const folderNameSpan = document.createElement("span");
        folderNameSpan.classList.add("text-lg", "font-medium", "text-red-900");
        folderNameSpan.textContent = folderName;

        newFolderItem.appendChild(folderIcon);
        newFolderItem.appendChild(folderNameSpan);
        folderList.appendChild(newFolderItem);
      } else {
        alert("Failed to create folder.");
      }
    })
    .catch((error) => console.error("Error:", error));
});

let selectedFolderId = null;

const toggleToolbarButtons = () => {
  const toolbarButtons = document.querySelectorAll(".toolbar-button");

  if (selectedFolderId === null) {
    // Disable all toolbar buttons if no folder is selected
    toolbarButtons.forEach((button) => {
      button.disabled = true;
    });
  } else {
    // Enable all toolbar buttons if a folder is selected
    toolbarButtons.forEach((button) => {
      button.disabled = false;
    });
  }
};

const selectFolder = (folderId) => {
  // Toggle the selected folder
  const folderButton = document.getElementById(`folder-${folderId}`);

  // If the folder is already selected, deselect it
  if (selectedFolderId === folderId) {
    folderButton.classList.remove("bg-gray-200");
    selectedFolderId = null;
  } else {
    // Deselect any previously selected folder
    if (selectedFolderId !== null) {
      const previousButton = document.getElementById(
        `folder-${selectedFolderId}`
      );
      previousButton.classList.remove("bg-gray-200");
    }

    // Select the new folder
    folderButton.classList.add("bg-gray-200");
    selectedFolderId = folderId;
  }

  // Enable/Disable toolbar buttons based on selection
  toggleToolbarButtons();
};

document.getElementById("delete-btn").addEventListener("click", () => {
  if (selectedFolderId) {
    fetch(`/folder/delete/${selectedFolderId}`, {
      method: "POST",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Folder deleted successfully!");
          const folderElement = document.getElementById(
            `folder-${selectedFolderId}`
          );
          if (folderElement) {
            folderElement.remove();
          }

          // Reset the selected folder
          selectedFolderId = null;
          toggleToolbarButtons();
        } else {
          alert("Failed to delete folder.");
        }
      })
      .catch((error) => console.error("Error:", error));
  }
});
