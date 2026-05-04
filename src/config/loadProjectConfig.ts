import { StaticJsonProjectConfigRepository } from "../adapters/projectConfig/StaticJsonProjectConfigRepository";
import type { ProjectConfigRepository } from "../ports/ProjectConfigRepository";

export function createProjectConfigRepository(): ProjectConfigRepository {
  return new StaticJsonProjectConfigRepository("/project_config.json");
}
