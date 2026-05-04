import type { ProjectConfig } from "./projectConfig";

export interface AgentMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AgentReviewResult {
  isValid: boolean;
  summary: string;
  warnings: string[];
  config?: ProjectConfig;
}

export interface MissingInputSuggestion {
  field: string;
  reason: string;
  suggestedQuestion: string;
}
