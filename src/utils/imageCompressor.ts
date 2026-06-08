/**
 * Utility to compress and resize images on the client side before uploading to backend APIs.
 * Prevents payload size limits (e.g. WAF 403 or Express limit/Cloud Run 413) from being exceeded.
 * Uses a dynamic feed-back loop to downsample further if the base64 string size exceeds safe limits.
 */
export async function compressImage(
  file: File,
  maxWidth: number = 720,
  maxHeight: number = 720,
  quality: number = 0.40
): Promise<string> {
  const maxBase64Length = 120000; // ~90KB, extremely safe size to bypass WAFs and proxies
  let currentWidth = maxWidth;
  let currentHeight = maxHeight;
  let currentQuality = quality;

  // Read the file original data first
  const fileDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = (err) => reject(err);
    i.src = fileDataUrl;
  });

  let attempts = 0;
  const maxAttempts = 3;
  let latestBase64 = fileDataUrl;

  while (attempts < maxAttempts) {
    attempts++;
    
    let width = img.width;
    let height = img.height;

    // Apply scale calculations preserving aspect ratio
    if (width > height) {
      if (width > currentWidth) {
        height = Math.round((height * currentWidth) / width);
        width = currentWidth;
      }
    } else {
      if (height > currentHeight) {
        width = Math.round((width * currentHeight) / height);
        height = currentHeight;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      // Fallback if context is null
      return fileDataUrl;
    }

    ctx.drawImage(img, 0, 0, width, height);

    // Convert the canvas content to a base64 compressed JPEG
    latestBase64 = canvas.toDataURL("image/jpeg", currentQuality);

    console.log(`[Compression] Attempt ${attempts}: size=${latestBase64.length} chars, w=${width}, h=${height}, q=${currentQuality}`);

    if (latestBase64.length <= maxBase64Length) {
      // Size is safe, stop compression and return
      return latestBase64;
    }

    // Otherwise, downsample further for the next attempt
    currentWidth = Math.round(currentWidth * 0.8);
    currentHeight = Math.round(currentHeight * 0.8);
    currentQuality = Math.max(0.15, currentQuality - 0.1);
  }

  // If we couldn't get it under the limit after max attempts, return the smallest we got
  return latestBase64;
}

/**
 * Converts a standard Data URL (base64 string) into a binary Blob object on the client side.
 */
export function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

