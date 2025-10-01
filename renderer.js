import * as pdfjsLib from "./build/pdf.mjs";

// PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = "./build/pdf.worker.mjs";

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null;

const scale = 1.5,
      canvas = document.querySelector("#pdf-render"),
      ctx = canvas.getContext("2d");

// Load PDF
function loadPDF(filePath) {
  // Convert Windows path to file URL for PDF.js
  const fileUrl = filePath.startsWith("file://")
    ? filePath
    : `file://${filePath.replace(/\\/g, "/")}`;
  pdfjsLib.getDocument(fileUrl).promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;
    pageNum = 1;
    document.querySelector("#page-count").textContent = pdfDoc.numPages;
    renderPage(pageNum);
  }).catch(err => {
    alert("Error loading PDF: " + err.message);
  });
}

// Render page
function renderPage(num) {
  pageIsRendering = true;

  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderCtx = { canvasContext: ctx, viewport };

    page.render(renderCtx).promise.then(() => {
      pageIsRendering = false;
      if (pageNumIsPending !== null) {
        renderPage(pageNumIsPending);
        pageNumIsPending = null;
      }
    });

    document.querySelector("#page-num").textContent = num;
  });
}

// Queue render
function queueRenderPage(num) {
  if (pageIsRendering) pageNumIsPending = num;
  else renderPage(num);
}

// Prev/Next buttons
document.querySelector("#prev").addEventListener("click", () => {
  if (pageNum <= 1) return;
  pageNum--;
  queueRenderPage(pageNum);
});

document.querySelector("#next").addEventListener("click", () => {
  if (pageNum >= pdfDoc.numPages) return;
  pageNum++;
  queueRenderPage(pageNum);
});

// Open PDF button
document.querySelector("#open").addEventListener("click", async () => {
  const filePath = await window.electronAPI.openFile();
  if (filePath) loadPDF(filePath);
});

// Drag & Drop
const dropArea = document.querySelector("#drop-area");

dropArea.addEventListener("dragover", e => {
  e.preventDefault();
  dropArea.style.borderColor = "blue";
});

dropArea.addEventListener("dragleave", () => {
  dropArea.style.borderColor = "#666";
});

dropArea.addEventListener("drop", async e => {
  e.preventDefault();
  dropArea.style.borderColor = "#666";

  const file = e.dataTransfer.files[0];
  if (!file) return alert("No file detected.");

  // Send only minimal data to main process
  const fileData = { name: file.name, path: file.path };
  const filePath = await window.electronAPI.openDroppedFile(fileData);

  if (filePath) {
    loadPDF(filePath);
  } else {
    alert("Please drop a valid PDF file.");
  }
});
