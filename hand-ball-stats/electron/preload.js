const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  exportVideos: (args) => ipcRenderer.invoke('export-videos', args),
  onExportProgress: (callback) => {
    ipcRenderer.on('export-progress', (_event, value) => callback(value));
  },
  removeExportProgressListener: () => {
    ipcRenderer.removeAllListeners('export-progress');
  }
});
