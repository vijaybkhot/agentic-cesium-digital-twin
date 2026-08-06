import type { DisasterRouteStatus } from "../../types/disasterResilience";

export function formatDisasterRouteStatus(
  status: DisasterRouteStatus,
): string {
  switch (status) {
    case "open":
      return "Open";
    case "at-risk":
      return "At Risk";
    case "not-recommended":
      return "Not recommended";
  }
}
