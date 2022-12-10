/**
 * Listener that receives a message with a list of image
 * URL's to display from popup.
 */
chrome.runtime.onMessage
    .addListener((message,sender,sendResponse) => {
        addImagesToContainer(message)
        sendResponse("OK");
    });

/**
 * Function that used to display an UI to display a list
 * of images
 * @param {} urls - Array of image URLs
 */
function addImagesToContainer(urls) {
    if (!urls || !urls.length) {
        return;
    }
    const container = document.querySelector(".container");
    urls.forEach(url => addImageNode(container, url))
}

/**
 * Function dynamically add a DIV with image and checkbox to
 * select it to the container DIV
 * @param {*} container - DOM node of a container div
 * @param {*} url - URL of image
 */
function addImageNode(container, url) {
    const div = document.createElement("div");
    div.className = "imageDiv";
    const img = document.createElement("img");
    img.src = url;
    div.appendChild(img);
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.setAttribute("url",url);
    div.appendChild(checkbox);
    container.appendChild(div)
}

/**
 * The "Select All" checkbox "onChange" event listener
 * Used to check/uncheck all image checkboxes
*/
document.getElementById("selectAll")
         .addEventListener("change", (event) => {
    const items = document.querySelectorAll(".container input");
    for (let item of items) {
        item.checked = event.target.checked;
    };
});

/**
 * The "Download" button "onClick" event listener
 * Used to compress all selected images to a ZIP-archive
 * and download this ZIP-archive
 */
document.getElementById("downloadBtn")
        .addEventListener("click", async() => {
            try {
                const urls = getSelectedUrls();
                const archive = await createArchive(urls);
                downloadArchive(archive);
            } catch (err) {
                alert(err.message)
            }
        })

/**
 * Function used to get URLs of all selected image
 * checkboxes
 * @returns Array of URL string
 */
function getSelectedUrls() {
    const urls =
        Array.from(document.querySelectorAll(".container input"))
             .filter(item=>item.checked)
             .map(item=>item.getAttribute("url"));
    if (!urls || !urls.length) {
        throw new Error("Please, select at least one image");
    }
    return urls;
}

/**
 * Function used to download all image files, identified
 * by `urls`, and compress them to a ZIP
 * @param {} urls - list of URLs of files to download
 * @returns a BLOB of generated ZIP-archive
 */
async function createArchive(urls) {
    const zip = new JSZip();
    for (let index in urls) {
        try {
            const url = urls[index];
            const response = await fetch(url);
            const blob = await response.blob();
            zip.file(checkAndGetFileName(index, blob),blob);
        } catch (err) {
            console.error(err);
        }
    };
    return zip.generateAsync({
        type:'blob',
        compression: "DEFLATE",
        compressionOptions: {
            level: 9
        }
    });
}

/**
 * Function used to return a file name for
 * image blob only if it has a correct image type
 * and positive size. Otherwise throws an exception.
 * @param {} index - An index of URL in an input
 * @param {*} blob - BLOB with a file content
 * @returns
 */
function checkAndGetFileName(index, blob) {
    let name = parseInt(index)+1;
    const [type, extension] = blob.type.split("/");
    if (type != "image" || blob.size <= 0) {
        throw Error("Incorrect content");
    }
    return name+"."+extension.split("+").shift();
}

/**
 * Triggers browser "Download file" action
 * using a content of a file, provided by
 * "archive" parameter
 * @param {} archive - BLOB of file to download
 */
function downloadArchive(archive) {
    const link = window.document.createElement('a');
    link.href = window.URL.createObjectURL(archive);
    link.download = "images.zip";
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(link.href);
    document.body.removeChild(link);
}
