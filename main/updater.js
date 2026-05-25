const { autoUpdater } = require("electron-updater");

function setupAutoUpdater() {

    autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.on("update-available", () => {
        console.log("Update disponível");
    });

    autoUpdater.on("update-downloaded", () => {
        console.log("Update baixado");
    });

}

module.exports = {
    setupAutoUpdater
};