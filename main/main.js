const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const {

    startDownload,
    getYtDlpVersion,
    getVideoInfo

} = require("./downloader");

const { setupAutoUpdater } = require("./updater");

let mainWindow;

function createWindow() {

    mainWindow = new BrowserWindow({

        width: 1200,
        height: 800,

        icon: path.join(
            __dirname,
            "../assets/logo.ico"
        ),

        webPreferences: {

            preload: path.join(
                __dirname,
                "../preload/preload.js"
            ),

            contextIsolation: true,
            nodeIntegration: false

        }

    });

    mainWindow.loadFile(
        path.join(
            __dirname,
            "../renderer/index.html"
        )
    );

}

app.whenReady().then(() => {

    createWindow();
    setupAutoUpdater();

});

// =========================
// VERSION
// =========================

ipcMain.handle(
    "get-version",
    async () => {

        return await getYtDlpVersion();

    }
);

// =========================
// VIDEO INFO
// =========================

ipcMain.handle(
    "get-video-info",
    async (event, url) => {

        return await getVideoInfo(url);

    }
);

// =========================
// DOWNLOAD
// =========================

ipcMain.handle(
    "download-video",
    async (event, data) => {

        return await startDownload(
            data,
            (progress) => {

                mainWindow.webContents.send(
                    "download-progress",
                    progress
                );

            }
        );

    }
);