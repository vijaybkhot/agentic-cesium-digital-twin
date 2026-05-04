import type {
  AgentMessage,
  AgentReviewResult,
  MissingInputSuggestion,
} from "../types/agent";
import type { ProjectConfig } from "../types/projectConfig";

export interface AgentProvider {
  generateProjectConfigFromConversation(
    messages: AgentMessage[],
  ): Promise<ProjectConfig>;
  reviewProjectConfig(config: ProjectConfig): Promise<AgentReviewResult>;
  suggestMissingInputs(
    config: Partial<ProjectConfig>,
  ): Promise<MissingInputSuggestion[]>;
}
