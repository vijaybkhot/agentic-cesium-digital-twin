import type { ProjectConfigRepository } from "../../ports/ProjectConfigRepository";
import type { ProjectConfig } from "../../types/projectConfig";
import { validateProjectConfig } from "../../config/validateProjectConfig";

export class StaticJsonProjectConfigRepository implements ProjectConfigRepository {
  constructor(private readonly configUrl: string) {}

  async loadProjectConfig(): Promise<ProjectConfig> {
    const response = await fetch(this.configUrl);

    if (!response.ok) {
      throw new Error(
        `Could not load project config from ${this.configUrl}: ${response.status} ${response.statusText}`,
      );
    }

    const json = await response.json();
    return validateProjectConfig(json);
  }
}
