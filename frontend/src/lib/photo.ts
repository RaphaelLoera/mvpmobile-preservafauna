/** Reduz a foto (máx. 480 px, JPEG) para caber no armazenamento local e no envio. */
export function resizePhoto(file: File, max = 480): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.6));
    };
    img.onerror = () => reject(new Error("Imagem inválida"));
    img.src = url;
  });
}
