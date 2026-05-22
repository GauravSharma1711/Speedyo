type Area = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<{ url: string; blob: Blob }> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Canvas context not available");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  if (rotation !== 0) {
    const maxSize = Math.max(image.width, image.height);
    const safeArea = Math.floor((maxSize * 2) / (Math.sqrt(2) + 1));
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = safeArea;
    tempCanvas.height = safeArea;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) throw new Error("Canvas context not available");
    tempCtx.translate(safeArea / 2, safeArea / 2);
    tempCtx.rotate((rotation * Math.PI) / 180);
    tempCtx.drawImage(image, -image.width / 2, -image.height / 2);
    const data = tempCtx.getImageData(0, 0, safeArea, safeArea);
    ctx.putImageData(
      data,
      Math.round(-pixelCrop.x - safeArea / 2 + image.width / 2),
      Math.round(-pixelCrop.y - safeArea / 2 + image.height / 2)
    );
  } else {
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create blob"));
          return;
        }
        const url = URL.createObjectURL(blob);
        resolve({ url, blob });
      },
      "image/webp",
      0.92
    );
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });
}