import type { InspectedImage } from "../../types/imageIntake";

const lowResolutionWidth = 1280;
const lowResolutionHeight = 720;

function createImageId(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export function inspectImageFile(file: File): Promise<InspectedImage> {
  if (!file.type.startsWith("image/")) {
    return Promise.reject(
      new Error(`${file.name} is not a supported browser image file.`),
    );
  }

  // TODO: Add EXIF/GPS metadata extraction in a future backend or dedicated browser parser.
  const objectUrl = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    const image = new Image();
    const cleanup = () => {
      image.onload = null;
      image.onerror = null;
      URL.revokeObjectURL(objectUrl);
    };

    image.onload = () => {
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;
      const megapixels = (width * height) / 1_000_000;

      cleanup();
      resolve({
        id: createImageId(file),
        fileName: file.name,
        fileType: file.type,
        fileSizeBytes: file.size,
        width,
        height,
        megapixels,
        isLowResolution:
          width < lowResolutionWidth || height < lowResolutionHeight,
      });
    };

    image.onerror = () => {
      cleanup();
      reject(new Error(`Could not read image dimensions for ${file.name}.`));
    };

    image.src = objectUrl;
  });
}
