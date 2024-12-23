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

let selectedFileId = null;

const selectFile = (fileId) => {
  // Toggle the selected file
  const fileButton = document.getElementById(`file-${fileId}`);

  // If the file is already selected, deselect it
  if (selectedFileId === fileId) {
    fileButton.classList.remove("bg-gray-200");
    selectedFileId = null;
  } else {
    // Deselect any previously selected file
    if (selectedFileId !== null) {
      const previousButton = document.getElementById(`file-${selectedFileId}`);
      previousButton.classList.remove("bg-gray-200");
    }

    // Select the new folder
    fileButton.classList.add("bg-gray-200");
    selectedFileId = fileId;
  }
};

const showInfo = (fileId, fileSize, uploadTime) => {
  const tooltip = document.getElementById(`file-info-${fileId}`);

  tooltip.innerHTML = `
    <p>Size: ${fileSize} bytes</p>
    <p>Uploaded: ${uploadTime}</p>
  `;

  tooltip.style.display = "inline-block";

  // Hide tooltip when mouse leaves
  tooltip.addEventListener("mouseleave", () => {
    tooltip.style.display = "none";
  });
};

const hideInfo = (fileId) => {
  const tooltip = document.getElementById(`file-info-${fileId}`);
  tooltip.style.display = "none";
};

document.getElementById("download-btn").addEventListener("click", () => {
  if (selectedFileId !== null) {
    // Send the request to download the selected file
    fetch(`/file/download/${selectedFileId}`, {
      method: "GET",
    })
      .then((response) => {
        if (response.ok) {
          // Create an invisible link element to trigger the download
          const downloadLink = document.createElement("a");
          downloadLink.href = response.url; // Use the file URL from the response
          downloadLink.download = true; // This forces the download
          downloadLink.click(); // Programmatically click the link
        } else {
          alert("Failed to download the file.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred while downloading the file.");
      });
  } else {
    alert("No file selected.");
  }
});

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
  } else if (selectedFileId) {
    fetch(`/file/delete/${selectedFileId}`, {
      method: "POST",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("File deleted successfully!");
          const fileElement = document.getElementById(`file-${selectedFileId}`);
          if (fileElement) {
            fileElement.remove();
          }

          // Reset the selected folder
          selectedFileId = null;
          toggleToolbarButtons();
        } else {
          alert("Failed to delete file.");
        }
      })
      .catch((error) => console.error("Error:", error));
  }
});

document.getElementById("rename-btn").addEventListener("click", () => {
  if (selectedFolderId) {
    const newName = prompt("Please insert the new name of your folder.");

    fetch(`/folder/rename/${selectedFolderId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newName }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Folder renamed successfully!");
          const folderElement = document.querySelector(
            `#folder-${selectedFolderId}>span`
          );
          folderElement.textContent = newName;
          selectedFolderId = null;
          toggleToolbarButtons();
        } else {
          alert("Failed to delete folder.");
        }
      })
      .catch((error) => console.error("Error:", error));
  } else if (selectedFileId) {
    const newName = prompt("Please insert the new name of your file.");

    fetch(`/file/rename/${selectedFileId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newName }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("File renamed successfully!");
          const fileElement = document.querySelector(
            `#file-${selectedFileId}>span`
          );
          fileElement.textContent = newName;
          selectedFileId = null;
          toggleToolbarButtons();
        } else {
          alert("Failed to delete file.");
        }
      })
      .catch((error) => console.error("Error:", error));
  }
});

// Get modal elements
const openModalButton = document.getElementById("open-upload-modal");
const closeModalButton = document.getElementById("close-upload-modal");
const modal = document.getElementById("upload-modal");

// Show modal when the "Upload File" button is clicked
openModalButton.addEventListener("click", () => {
  modal.classList.remove("hidden");
  modal.classList.add("flex");
});

// Hide modal when the "Close" button is clicked
closeModalButton.addEventListener("click", () => {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
});

// Optional: Hide modal when clicked outside of the modal content
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
});
