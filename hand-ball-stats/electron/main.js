import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';

// Configure fluent-ffmpeg to use the static binary
ffmpeg.setFfmpegPath(ffmpegStatic);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 1280,
    minHeight: 720,
    webPreferences: {
      nodeIntegration: true, // We are leaving these slightly open for local desktop usage, but ideally we should use contextIsolation
      contextIsolation: false,
    }
  });

  // Make the application start maximized/fullscreen
  win.maximize();

  // Force strict fullscreen on macOS so all views inherit the full window size
  win.setFullScreen(true);

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  setupIPCHandlers();
});

function setupIPCHandlers() {
  ipcMain.handle('export-videos', async (event, { videoPath, events, mode }) => {
    if (!videoPath || !fs.existsSync(videoPath)) {
      throw new Error('Caminho do vídeo inválido ou vídeo não encontrado.');
    }

    if (!events || events.length === 0) {
      throw new Error('Nenhum evento para exportar.');
    }

    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Selecione a pasta de destino para a exportação',
      properties: ['openDirectory', 'createDirectory']
    });

    if (canceled || filePaths.length === 0) {
      return { status: 'canceled' };
    }

    const targetDir = filePaths[0];

    // Convert generic events into processable clips
    // Format: { startTime: string, duration: number, name: string }
    const clips = events.map((e, index) => {
      const start = Math.max(0, e.timestamp - 1); // 1 sec padding before
      const end = e.endTime ? e.endTime + 1 : e.timestamp + 5; // 1 sec padding after, or generic 5s duration
      const duration = end - start;
      const safeActionName = e.action ? e.action.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'evento';
      const clipName = `clip_${index + 1}_${safeActionName}.mp4`;
      return { start, duration, name: clipName };
    });

    try {
      if (mode === 'separate') {
        await exportSeparateVideos(videoPath, targetDir, clips, event.sender);
      } else if (mode === 'single') {
        await exportSingleVideo(videoPath, targetDir, clips, event.sender);
      }
      return { status: 'success', targetDir };
    } catch (error) {
      console.error('Export Error:', error);
      throw error;
    }
  });
}

function exportSeparateVideos(sourcePath, targetDir, clips, sender) {
  return new Promise(async (resolve, reject) => {
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const outputPath = path.join(targetDir, clip.name);

      sender.send('export-progress', {
        step: `A exportar clipe ${i + 1} de ${clips.length}...`,
        progress: (i / clips.length) * 100
      });

      await new Promise((res, rej) => {
        ffmpeg(sourcePath)
          .setStartTime(clip.start)
          .setDuration(clip.duration)
          .output(outputPath)
          .on('end', res)
          .on('error', rej)
          .run();
      });
    }
    sender.send('export-progress', { step: 'Concluído!', progress: 100 });
    resolve();
  });
}

function exportSingleVideo(sourcePath, targetDir, clips, sender) {
  return new Promise(async (resolve, reject) => {
    try {
      sender.send('export-progress', { step: 'A extrair clipes temporários...', progress: 10 });

      const tempFiles = [];
      const listFilePath = path.join(targetDir, 'concat_list.txt');
      let listContent = '';

      for (let i = 0; i < clips.length; i++) {
        const clip = clips[i];
        const tempOutputPath = path.join(targetDir, `temp_${clip.name}`);
        tempFiles.push(tempOutputPath);

        // Escape path for ffmpeg concat demuxer
        const escapedPath = tempOutputPath.replace(/'/g, "'\\''");
        listContent += `file '${escapedPath}'\n`;

        await new Promise((res, rej) => {
          ffmpeg(sourcePath)
            .setStartTime(clip.start)
            .setDuration(clip.duration)
            // Use same codecs to avoid re-encoding issues during concat
            .videoCodec('libx264')
            .audioCodec('aac')
            .output(tempOutputPath)
            .on('end', res)
            .on('error', rej)
            .run();
        });
      }

      fs.writeFileSync(listFilePath, listContent);

      sender.send('export-progress', { step: 'A fundir clipes num único vídeo...', progress: 80 });

      const finalOutputPath = path.join(targetDir, 'analise_completa.mp4');

      await new Promise((res, rej) => {
        ffmpeg()
          .input(listFilePath)
          .inputOptions(['-f', 'concat', '-safe', '0'])
          .outputOptions('-c', 'copy')
          .output(finalOutputPath)
          .on('end', res)
          .on('error', rej)
          .run();
      });

      // Cleanup
      sender.send('export-progress', { step: 'A limpar ficheiros temporários...', progress: 95 });
      if (fs.existsSync(listFilePath)) fs.unlinkSync(listFilePath);
      tempFiles.forEach(tf => {
        if (fs.existsSync(tf)) fs.unlinkSync(tf);
      });

      sender.send('export-progress', { step: 'Concluído!', progress: 100 });
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
