import type { ProjectConfig } from "../types/projectConfig";
import type { BeliefState } from "../types/belief";

const beliefStates: BeliefState[] = ["Low", "Medium", "High"];
const modelAssetTypes = ["glb", "3d-tiles", "point-cloud", "mesh"];
const modelAssetStatuses = ["placeholder", "processing", "ready", "failed"];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasNumber(value: Record<string, unknown>, key: string): boolean {
  return typeof value[key] === "number" && Number.isFinite(value[key]);
}

function hasString(value: Record<string, unknown>, key: string): boolean {
  return typeof value[key] === "string" && value[key].length > 0;
}

function isBeliefState(value: unknown): value is BeliefState {
  return typeof value === "string" && beliefStates.includes(value as BeliefState);
}

function isOneOf(value: unknown, options: string[]): boolean {
  return typeof value === "string" && options.includes(value);
}

function validateNumberField(
  value: Record<string, unknown>,
  key: string,
  path: string,
  errors: string[],
): void {
  if (!hasNumber(value, key)) {
    errors.push(`${path}.${key} must be a number`);
  }
}

function validateStringField(
  value: Record<string, unknown>,
  key: string,
  path: string,
  errors: string[],
): void {
  if (!hasString(value, key)) {
    errors.push(`${path}.${key} must be a non-empty string`);
  }
}

function validateCoordinate(
  value: unknown,
  path: string,
  errors: string[],
  options: { requireHeight?: boolean } = {},
): void {
  if (!isObject(value)) {
    errors.push(`${path} must be an object`);
    return;
  }

  validateNumberField(value, "lat", path, errors);
  validateNumberField(value, "lon", path, errors);

  if (options.requireHeight || value.height !== undefined) {
    validateNumberField(value, "height", path, errors);
  }
}

function requireObject(
  value: Record<string, unknown>,
  key: string,
  errors: string[],
): Record<string, unknown> | null {
  if (!isObject(value[key])) {
    errors.push(`Missing or invalid object: ${key}`);
    return null;
  }

  return value[key];
}

export function validateProjectConfig(value: unknown): ProjectConfig {
  const errors: string[] = [];

  if (!isObject(value)) {
    throw new Error("Project config must be a JSON object.");
  }

  ["projectId", "projectName", "description"].forEach((key) =>
    validateStringField(value, key, "project", errors),
  );

  const scene = requireObject(value, "scene", errors);
  const center = scene ? scene.center : null;
  const camera = scene ? requireObject(scene, "camera", errors) : null;

  if (center) {
    validateCoordinate(center, "scene.center", errors, { requireHeight: true });
  }

  if (camera) {
    ["heading", "pitch", "range"].forEach((key) =>
      validateNumberField(camera, key, "scene.camera", errors),
    );
  }

  const facility = requireObject(value, "facility", errors);
  const building = facility ? requireObject(facility, "building", errors) : null;

  if (facility) {
    validateStringField(facility, "name", "facility", errors);

    if (!Array.isArray(facility.boundary) || facility.boundary.length < 3) {
      errors.push("facility.boundary must include at least three coordinates");
    } else {
      facility.boundary.forEach((coordinate, index) =>
        validateCoordinate(coordinate, `facility.boundary[${index}]`, errors),
      );
    }
  }

  if (building) {
    ["lat", "lon", "height"].forEach((key) =>
      validateNumberField(building, key, "facility.building", errors),
    );

    const dimensions = requireObject(building, "dimensions", errors);

    if (dimensions) {
      ["length", "width", "height"].forEach((key) =>
        validateNumberField(
          dimensions,
          key,
          "facility.building.dimensions",
          errors,
        ),
      );
    }
  }

  const beliefRules = requireObject(value, "beliefRules", errors);
  if (beliefRules) {
    const doseRate = requireObject(beliefRules, "doseRate", errors);
    const contamination = requireObject(beliefRules, "contamination", errors);

    ["lowMax", "mediumMax"].forEach((key) => {
      if (doseRate) {
        validateNumberField(doseRate, key, "beliefRules.doseRate", errors);
      }

      if (contamination) {
        validateNumberField(
          contamination,
          key,
          "beliefRules.contamination",
          errors,
        );
      }
    });
  }

  if (!Array.isArray(value.measurementPoints)) {
    errors.push("measurementPoints must be an array");
  } else {
    value.measurementPoints.forEach((point, index) => {
      if (!isObject(point)) {
        errors.push(`measurementPoints[${index}] must be an object`);
        return;
      }

      [
        "id",
        "name",
        "sensorType",
        "doseRateUnit",
        "contaminationUnit",
        "lastReading",
      ].forEach((key) =>
        validateStringField(
          point,
          key,
          `measurementPoints[${index}]`,
          errors,
        ),
      );

      if (!isBeliefState(point.belief)) {
        errors.push(
          `measurementPoints[${index}].belief must be Low, Medium, or High`,
        );
      }

      ["lat", "lon", "height", "doseRate", "contamination"].forEach((key) =>
        validateNumberField(point, key, `measurementPoints[${index}]`, errors),
      );
    });
  }

  if (!Array.isArray(value.annotations)) {
    errors.push("annotations must be an array");
  } else {
    value.annotations.forEach((annotation, index) => {
      if (!isObject(annotation)) {
        errors.push(`annotations[${index}] must be an object`);
        return;
      }

      ["id", "label"].forEach((key) =>
        validateStringField(annotation, key, `annotations[${index}]`, errors),
      );
      validateCoordinate(annotation, `annotations[${index}]`, errors);

      if (
        annotation.description !== undefined &&
        typeof annotation.description !== "string"
      ) {
        errors.push(`annotations[${index}].description must be a string`);
      }
    });
  }

  if (value.modelAssets !== undefined) {
    if (!Array.isArray(value.modelAssets)) {
      errors.push("modelAssets must be an array when provided");
    } else {
      value.modelAssets.forEach((asset, index) => {
        if (!isObject(asset)) {
          errors.push(`modelAssets[${index}] must be an object`);
          return;
        }

        ["assetId", "assetUrl", "sourcePipeline"].forEach((key) =>
          validateStringField(asset, key, `modelAssets[${index}]`, errors),
        );

        if (!isOneOf(asset.assetType, modelAssetTypes)) {
          errors.push(
            `modelAssets[${index}].assetType must be glb, 3d-tiles, point-cloud, or mesh`,
          );
        }

        if (!isOneOf(asset.status, modelAssetStatuses)) {
          errors.push(
            `modelAssets[${index}].status must be placeholder, processing, ready, or failed`,
          );
        }

        validateCoordinate(
          asset.spatialAnchor,
          `modelAssets[${index}].spatialAnchor`,
          errors,
          { requireHeight: true },
        );
        validateNumberField(asset, "scale", `modelAssets[${index}]`, errors);

        const orientation = requireObject(asset, "orientation", errors);

        if (orientation) {
          ["heading", "pitch", "roll"].forEach((key) =>
            validateNumberField(
              orientation,
              key,
              `modelAssets[${index}].orientation`,
              errors,
            ),
          );
        }
      });
    }
  }

  if (errors.length > 0) {
    throw new Error(`Invalid project config:\n${errors.join("\n")}`);
  }

  return value as unknown as ProjectConfig;
}
