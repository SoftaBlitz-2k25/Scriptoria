const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true
    }
  });

  win.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// Open File dialog
ipcMain.handle("dialog:openFile", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [{ name: "PDF Files", extensions: ["pdf"] }],
    properties: ["openFile"]
  });
  if (canceled) return null;
  return filePaths[0];
});

// Handle dropped file
ipcMain.handle("dialog:droppedFile", async (event, fileData) => {
  if (!fileData || !fileData.path) return null;

  // Only check extension
  if (!fileData.name.toLowerCase().endsWith(".pdf")) return null;

  return fileData.path;
});
