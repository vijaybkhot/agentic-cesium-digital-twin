import type { AgentProvider } from "../../ports/AgentProvider";
import type {
  AgentMessage,
  AgentReviewResult,
  MissingInputSuggestion,
} from "../../types/agent";
import type { ProjectConfig } from "../../types/projectConfig";

export class MockAgentProvider implements AgentProvider {
  constructor(private readonly fallbackConfig: ProjectConfig) {}

  async generateProjectConfigFromConversation(
    _messages: AgentMessage[],
  ): Promise<ProjectConfig> {
    return this.fallbackConfig;
  }

  async reviewProjectConfig(config: ProjectConfig): Promise<AgentReviewResult> {
    return {
      isValid: true,
      summary: `Mock review complete for ${config.projectName}.`,
      warnings: [],
      config,
    };
  }

  async suggestMissingInputs(
    config: Partial<ProjectConfig>,
  ): Promise<MissingInputSuggestion[]> {
    if (config.projectId && config.projectName) {
      return [];
    }

    return [
      {
        field: "projectId/projectName",
        reason: "A future provider needs stable project identity fields.",
        suggestedQuestion: "What should this digital twin project be called?",
      },
    ];
  }
}
