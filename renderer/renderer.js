const urlInput =
    document.getElementById("url");

const searchButton =
    document.getElementById("searchVideo");

const searchText =
    document.getElementById("searchText");

const preview =
    document.getElementById("preview");

const thumb =
    document.getElementById("thumb");

const title =
    document.getElementById("title");

const description =
    document.getElementById("description");

const mp3Button =
    document.getElementById("mp3");

const mp4Button =
    document.getElementById("mp4");

const visitButton =
    document.getElementById("visit");

const progressContainer =
    document.getElementById("progressContainer");

const progressBar =
    document.getElementById("progressBar");

const progressText =
    document.getElementById("progressText");

const resetButton =
    document.getElementById("reset");

const version =
    document.getElementById("version");

let currentUrl = "";

// =========================
// VERSION
// =========================

async function loadVersion() {

    const ytVersion =
        await window.api.getVersion();

    version.innerText =
        ytVersion;

}

loadVersion();

// =========================
// SEARCH VIDEO
// =========================

searchButton.addEventListener(
    "click",
    async () => {

        const url =
            urlInput.value.trim();

        if (!url) return;

        currentUrl = url;

        searchText.innerText =
            "Procurando...";

        searchButton.disabled = true;

        try {

            const info =
                await window.api.getVideoInfo(url);

            thumb.src =
                info.thumbnail;

            title.innerText =
                info.title;

            description.innerText =
                `Duração: ${info.duration}`;

            preview.classList.remove(
                "hidden"
            );

        } catch {

            alert(
                "Erro ao buscar vídeo."
            );

        }

        searchText.innerText =
            "🔎 Procurar vídeo";

        searchButton.disabled =
            false;

    }
);

// =========================
// DOWNLOAD
// =========================

async function download(format) {

    progressContainer.classList.remove(
        "hidden"
    );

    resetButton.classList.add(
        "hidden"
    );

    await window.api.downloadVideo({

        url: currentUrl,
        format

    });

}

mp3Button.addEventListener(
    "click",
    () => {

        download("mp3");

    }
);

mp4Button.addEventListener(
    "click",
    () => {

        download("mp4");

    }
);

// =========================
// PROGRESS
// =========================

window.api.onProgress(
    (progress) => {

        progressBar.style.width =
            progress + "%";

        progressText.innerText =
            progress + "%";

        if (progress >= 100) {

            resetButton.classList.remove(
                "hidden"
            );

        }

    }
);

// =========================
// RESET
// =========================

resetButton.addEventListener(
    "click",
    () => {

        // INPUT

        urlInput.value = "";

        // PREVIEW

        preview.classList.add(
            "hidden"
        );

        // PROGRESS

        progressContainer.classList.add(
            "hidden"
        );

        progressBar.style.width =
            "0%";

        progressText.innerText =
            "0%";

        // RESET BUTTON SOME

        resetButton.classList.add(
            "hidden"
        );

        // LIMPA VIDEO

        thumb.src = "";

        title.innerText = "";

        description.innerText = "";

        // VOLTA TOPO

        window.scrollTo({

            top: 0,
            behavior: "smooth"

        });

    }
);

// =========================
// VISIT URL
// =========================

visitButton.addEventListener(
    "click",
    () => {

        if (currentUrl) {

            window.open(
                currentUrl,
                "_blank"
            );

        }

    }
);