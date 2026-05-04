import type { ProjectConfig } from "../types/projectConfig";

export interface ProjectConfigRepository {
  loadProjectConfig(): Promise<ProjectConfig>;
}
