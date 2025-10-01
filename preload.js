const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openFile: () => ipcRenderer.invoke("dialog:openFile"),
  openDroppedFile: (fileData) => ipcRenderer.invoke("dialog:droppedFile", fileData)
});
