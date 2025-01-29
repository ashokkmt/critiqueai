const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("eval_file");

// Highlight the drop zone when dragging
dropZone.addEventListener("dragover", function (e) {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", function () {
    dropZone.classList.remove("dragover");
});

// Assign file to input and submit form on drop
dropZone.addEventListener("drop", function (e) {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        fileInput.closest("form").submit();
    }
});

// Click to select file
dropZone.addEventListener("click", function () {
    fileInput.click();
});

// Submit form programmatically
fileInput.addEventListener("change", function () {
    this.closest("form").submit();
});
