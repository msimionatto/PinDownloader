const {

    contextBridge,
    ipcRenderer

} = require("electron");

contextBridge.exposeInMainWorld("api", {

    getVersion: () =>
        ipcRenderer.invoke(
            "get-version"
        ),

    getVideoInfo: (url) =>
        ipcRenderer.invoke(
            "get-video-info",
            url
        ),

    downloadVideo: (data) =>
        ipcRenderer.invoke(
            "download-video",
            data
        ),

    onProgress: (callback) =>

        ipcRenderer.on(
            "download-progress",
            (_, progress) => {

                callback(progress);

            }
        )

});