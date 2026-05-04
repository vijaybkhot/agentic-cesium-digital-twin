import type { ProjectConfig } from "../../types/projectConfig";

interface ToolbarProps {
  config: ProjectConfig | null;
}

export function Toolbar({ config }: ToolbarProps) {
  return (
    <div className="toolbar">
      <strong>{config?.projectName ?? "Agentic Cesium Digital Twin"}</strong>
      <span>{config?.description ?? "Config-driven Cesium viewer"}</span>
    </div>
  );
}
