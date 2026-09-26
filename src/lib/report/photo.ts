export async function preparePhoto(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw Error(
      "Choose a JPG, PNG, or WebP image. If your phone uses HEIC, export it as JPG first.",
    );
  if (file.size > 10 * 1024 * 1024)
    throw Error("This photo is too large. Choose an image smaller than 10 MB.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode().catch(() => {
      throw Error("This image could not be read. Please choose another photo.");
    });
    if (
      !image.naturalWidth ||
      image.naturalWidth * image.naturalHeight > 60_000_000
    )
      throw Error(
        "Image dimensions are too large. Please choose a smaller photo.",
      );
    const scale = Math.min(
      1,
      1280 / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx)
      throw Error("Photo processing is unavailable. Try another browser.");
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}
