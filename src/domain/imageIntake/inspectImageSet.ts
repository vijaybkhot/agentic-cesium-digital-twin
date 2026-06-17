import type { InspectedImage } from "../../types/imageIntake";
import { inspectImageFile } from "./inspectImageFile";

const supportedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
]);

export async function inspectImageSet(files: File[]): Promise<{
  images: InspectedImage[];
  unsupportedFileCount: number;
  failedImageCount: number;
}> {
  const supportedFiles = files.filter((file) =>
    supportedImageTypes.has(file.type),
  );
  const unsupportedFileCount = files.length - supportedFiles.length;
  const results = await Promise.allSettled(
    supportedFiles.map((file) => inspectImageFile(file)),
  );
  const images: InspectedImage[] = [];
  let failedImageCount = 0;

  results.forEach((result) => {
    if (result.status === "fulfilled") {
      images.push(result.value);
      return;
    }

    failedImageCount += 1;
    console.warn(result.reason);
  });

  return {
    images,
    unsupportedFileCount,
    failedImageCount,
  };
}
