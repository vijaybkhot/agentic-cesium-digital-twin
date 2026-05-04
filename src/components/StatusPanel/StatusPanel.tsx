interface StatusPanelProps {
  isLoading: boolean;
  error: string | null;
}

export function StatusPanel({ isLoading, error }: StatusPanelProps) {
  if (!isLoading && !error) {
    return null;
  }

  return (
    <div className="status-panel">
      {isLoading ? "Loading project config..." : error}
    </div>
  );
}
