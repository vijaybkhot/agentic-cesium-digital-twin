import exifr from "exifr";
import type {
  ImageGpsMetadata,
  InspectedImage,
} from "../../types/imageIntake";

const lowResolutionWidth = 1280;
const lowResolutionHeight = 720;

function createImageId(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function isJpegImage(file: File): boolean {
  return file.type === "image/jpeg" || /\.jpe?g$/i.test(file.name);
}

async function inspectGpsMetadata(file: File): Promise<ImageGpsMetadata> {
  if (!isJpegImage(file)) {
    return { status: "unknown" };
  }

  try {
    const gps = await exifr.gps(file);

    if (
      Number.isFinite(gps?.latitude) &&
      Number.isFinite(gps?.longitude)
    ) {
      return {
        status: "present",
        latitude: gps.latitude,
        longitude: gps.longitude,
      };
    }

    return { status: "missing" };
  } catch (error) {
    console.warn(`Could not read GPS metadata for ${file.name}.`, error);
    return { status: "unknown" };
  }
}

function inspectImageDimensions(file: File): Promise<{
  width: number;
  height: number;
  megapixels: number;
  isLowResolution: boolean;
}> {
  if (!file.type.startsWith("image/")) {
    return Promise.reject(
      new Error(`${file.name} is not a supported browser image file.`),
    );
  }

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

export async function inspectImageFile(file: File): Promise<InspectedImage> {
  const [dimensions, gps] = await Promise.all([
    inspectImageDimensions(file),
    inspectGpsMetadata(file),
  ]);

  return {
    id: createImageId(file),
    fileName: file.name,
    fileType: file.type,
    fileSizeBytes: file.size,
    ...dimensions,
    gps,
  };
}
