const { spawn } = require("child_process");
const { dialog } = require("electron");

const path = require("path");
const fs = require("fs");
const os = require("os");

// =========================
// PATHS
// =========================

const ytDlpPath = path.join(
    __dirname,
    "../tools/yt-dlp.exe"
);

const ffmpegPath = path.join(
    __dirname,
    "../tools/ffmpeg.exe"
);

const downloadsPath = path.join(
    os.homedir(),
    "Downloads"
);

// =========================
// CREATE DOWNLOAD FOLDER
// =========================

if (!fs.existsSync(downloadsPath)) {

    fs.mkdirSync(
        downloadsPath,
        { recursive: true }
    );

}

// =========================
// FORMAT DURATION
// =========================

function formatDuration(seconds) {

    if (!seconds) {
        return "Desconhecida";
    }

    const totalSeconds =
        Number(seconds);

    const minutes =
        Math.floor(totalSeconds / 60);

    const remainingSeconds =
        totalSeconds % 60;

    // =====================
    // LESS THAN 1 MIN
    // =====================

    if (minutes <= 0) {

        return `${remainingSeconds}s`;

    }

    // =====================
    // MINUTES + SECONDS
    // =====================

    return `${minutes}m ${remainingSeconds}s`;

}

// =========================
// GET YT-DLP VERSION
// =========================

function getYtDlpVersion() {

    return new Promise((resolve) => {

        const process = spawn(
            ytDlpPath,
            ["--version"]
        );

        let version = "";

        process.stdout.on("data", (data) => {

            version += data.toString();

        });

        process.on("close", () => {

            resolve(
                version.trim()
            );

        });

    });

}

// =========================
// GET VIDEO INFO
// =========================

function getVideoInfo(url) {

    return new Promise((resolve, reject) => {

        const args = [

            url,

            "--dump-json",

            "--no-playlist"

        ];

        const process = spawn(
            ytDlpPath,
            args
        );

        let json = "";

        process.stdout.on("data", (data) => {

            json += data.toString();

        });

        process.stderr.on("data", (data) => {

            console.log(
                data.toString()
            );

        });

        process.on("close", () => {

            try {

                const info =
                    JSON.parse(json);

                resolve({

                    title:
                        info.title ||

                        "Vídeo sem título",

                    thumbnail:
                        info.thumbnail ||

                        "",

                    duration:
                        formatDuration(
                            info.duration
                        )

                });

            }

            catch {

                reject(
                    "Erro ao buscar vídeo"
                );

            }

        });

    });

}

// =========================
// START DOWNLOAD
// =========================

function startDownload(data, onProgress) {

    return new Promise((resolve, reject) => {

        const outputTemplate = path.join(
            downloadsPath,
            "%(title)s.%(ext)s"
        );

        let args = [];

        let extension =
            data.format === "mp3"
                ? "mp3"
                : "mp4";

        // =====================
        // MP3
        // =====================

        if (data.format === "mp3") {

            args = [

                data.url,

                "-x",

                "--audio-format",
                "mp3",

                "--ffmpeg-location",
                ffmpegPath,

                "-o",
                outputTemplate,

                "--newline",

                "--progress",

                "--no-playlist"

            ];

        }

        // =====================
        // MP4
        // =====================

        else {

            args = [

                data.url,

                "-f",
                "mp4",

                "--ffmpeg-location",
                ffmpegPath,

                "-o",
                outputTemplate,

                "--newline",

                "--progress",

                "--no-playlist"

            ];

        }

        const process = spawn(
            ytDlpPath,
            args
        );

        let downloadedFile = "";

        // =====================
        // STDOUT
        // =====================

        process.stdout.on("data", async (data) => {

            const text =
                data.toString();

            console.log(text);

            // =================
            // PROGRESS
            // =================

            const progressMatch =
                text.match(/(\d+(?:\.\d+)?)%/);

            if (progressMatch) {

                const progress =
                    Math.floor(
                        Number(
                            progressMatch[1]
                        )
                    );

                onProgress(progress);

            }

            // =================
            // FILE NAME
            // =================

            const destinationMatch =
                text.match(
                    /\[download\] Destination: (.*)/
                );

            if (destinationMatch) {

                downloadedFile =
                    destinationMatch[1];

            }

        });

        // =====================
        // STDERR
        // =====================

        process.stderr.on("data", (data) => {

            const text =
                data.toString();

            console.log(text);

            // =================
            // MP3 FFmpeg Progress
            // =================

            const progressMatch =
                text.match(/(\d+(?:\.\d+)?)%/);

            if (progressMatch) {

                const progress =
                    Math.floor(
                        Number(
                            progressMatch[1]
                        )
                    );

                onProgress(progress);

            }

        });

        // =====================
        // CLOSE
        // =====================

        process.on("close", async (code) => {

            if (code !== 0) {

                reject(
                    "Erro download"
                );

                return;

            }

            // =================
            // FORCE 100%
            // =================

            onProgress(100);

            // =================
            // FALLBACK FILE
            // =================

            if (!downloadedFile) {

                const files =
                    fs.readdirSync(
                        downloadsPath
                    );

                const filtered =
                    files.filter(file =>

                        file.endsWith(
                            "." + extension
                        )

                    );

                if (filtered.length > 0) {

                    filtered.sort((a, b) => {

                        const aTime =
                            fs.statSync(
                                path.join(
                                    downloadsPath,
                                    a
                                )
                            ).mtime.getTime();

                        const bTime =
                            fs.statSync(
                                path.join(
                                    downloadsPath,
                                    b
                                )
                            ).mtime.getTime();

                        return bTime - aTime;

                    });

                    downloadedFile =
                        path.join(
                            downloadsPath,
                            filtered[0]
                        );

                }

            }

            // =================
            // SAVE DIALOG
            // =================

            const saveResult =
                await dialog.showSaveDialog({

                    title:
                        "Salvar arquivo convertido",

                    defaultPath:
                        downloadedFile,

                    filters: [

                        {

                            name:
                                extension.toUpperCase(),

                            extensions: [
                                extension
                            ]

                        }

                    ]

                });

            // USER CANCEL

            if (saveResult.canceled) {

                resolve(
                    "cancelado"
                );

                return;

            }

            try {

                // MOVE FILE

                fs.renameSync(

                    downloadedFile,

                    saveResult.filePath

                );

                resolve({

                    success: true,

                    path:
                        saveResult.filePath

                });

            }

            catch (error) {

                reject(error);

            }

        });

    });

}

module.exports = {

    startDownload,
    getYtDlpVersion,
    getVideoInfo

};