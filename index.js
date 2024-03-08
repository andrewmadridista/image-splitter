window.onload = onDocumentLoad;

const CONVERT_TO_BLOB_OPTIONS = { type: "image/jpeg", quality: 1};

function getFileName(file) {
   const name = file.name || file.fileName;

   return name.split(".")[0] || file.lastModified.toString();
}

function onDocumentLoad() {
    const fileInput = document.getElementById("file-input");
    const fileUploadDropZone = document.getElementById("file-upload-drop-zone");

    fileUploadDropZone.addEventListener("drop", onDrop);
    fileUploadDropZone.addEventListener("drop", onDragEnd);
    fileUploadDropZone.addEventListener("dragover", onDragover);
    fileUploadDropZone.addEventListener("dragenter", ondDragEnter);
    fileUploadDropZone.addEventListener("dragleave", onDragEnd);


    fileInput.addEventListener("change", onFileUpload);

    function ondDragEnter() {
        fileUploadDropZone.classList.add("dragging");
    }

    function onDragEnd(event) {
        event.preventDefault();
        
        fileUploadDropZone.classList.remove("dragging");
    }

    function isFileImage(file) {
        return file && file['type'].split('/')[0] === 'image';
    }
    
    function getWrapperDiv(contentToWrap, className) {
        const wrapperDiv = document.createElement("section");
        wrapperDiv.classList.add(className);
    
        contentToWrap.forEach(element => wrapperDiv.appendChild(element))
    
        return wrapperDiv;
    }
    
    function createImage(dataUri, className) {
        const image = new Image()
        image.src = dataUri;
        image.classList.add(className);
    
        return image
    }
    
    function createFileDownloadLink({fileName, fileUri, className, linkText}) {
        const link = document.createElement("a");
        link.href = fileUri;
        link.download = fileName;
        link.classList.add(className);
        link.text = linkText;
    
        return link
    }
    
    function onDrop(event) {
    
        // Prevent default behavior (Prevent file from being opened)
        event.preventDefault();
      
        if (event.dataTransfer.items) {
            const dropItem = event.dataTransfer.items[0];
            if(dropItem.kind === "file") {
                const file = dropItem.getAsFile();
                processFile(file)
            }
        } else {
          const file = event.dataTransfer.files[0];
          processFile(file)
        }
    }
    
    function onDragover(event) {
        event.preventDefault();
    }
    
    function onFileUpload() {
    
        const file = this.files[0];
    
        processFile(file)
    }
    
    function processFile(file) {
    
    
        if(!isFileImage(file)) {
            displayUploadError();
        }
    
        getImageDataUrl(file)
        .then(splitImage)
        .then(([leftBlob, rightBlob ]) => {
            const resultDiv = document.getElementById("result");
            const leftUrl = URL.createObjectURL(leftBlob);
            const rightUrl = URL.createObjectURL(rightBlob);
    
            const leftImage = createImage(leftUrl, "result-image")
            const rightImage = createImage(rightUrl, "result-image")
    
            const leftLink = createFileDownloadLink({
                fileName: `${getFileName(file)}-left`,
                fileUri: leftUrl,
                className: "download-link",
                linkText: "Download left part"
            });
            const rightLink = createFileDownloadLink({
                fileName: `${getFileName(file)}-right`,
                fileUri: rightUrl,
                className: "download-link",
                linkText: "Download right part"
            });
    
            const leftImageWrapper = getWrapperDiv([leftImage, leftLink], "image-wrapper");
            const rightImageWrapper = getWrapperDiv([rightImage, rightLink], "image-wrapper");
    
            resultDiv.appendChild(leftImageWrapper)
            resultDiv.appendChild(rightImageWrapper)
        })
        .catch((error) => {
            console.error(error);
            displayUploadError();
        })
    }
    
    function splitImage(image) {
        const croppedWidth = Math.floor(image.naturalWidth / 2);
        const croppedHeight = image.naturalHeight;
    
        const canvas = new OffscreenCanvas(croppedWidth, croppedHeight);
        const canvasContext = canvas.getContext("2d");
        
        canvasContext.drawImage(image, 0, 0, croppedWidth, croppedHeight, 0, 0, croppedWidth, croppedHeight);
        const leftPartBlobPromise = canvas.convertToBlob(CONVERT_TO_BLOB_OPTIONS);
    
        canvasContext.reset();
    
        canvasContext.drawImage(image, croppedWidth, 0, croppedWidth, croppedHeight, 0, 0, croppedWidth, croppedHeight);
        const rightPartBlobPromise = canvas.convertToBlob(CONVERT_TO_BLOB_OPTIONS);
    
        return Promise.all([leftPartBlobPromise, rightPartBlobPromise]);
    }
    
    function displayUploadError() {
        console.error("Upload has failed!");
    }
    
    function getImageDataUrl(file) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.addEventListener("load", () => {
            const image = new Image();
            image.src = fileReader.result;

            image.addEventListener("load", () => resolve(image));
        });

        fileReader.addEventListener("error", () => {
            reject(new Error("file read error"));
        });

        fileReader.readAsDataURL(file);
    });

    }
}

