import type { UrbanRouteStatus } from "../../types/urbanResilience";

export function formatUrbanRouteStatus(status: UrbanRouteStatus): string {
  switch (status) {
    case "open":
      return "Open";
    case "at-risk":
      return "At Risk";
    case "not-recommended":
      return "Not recommended";
  }
}
