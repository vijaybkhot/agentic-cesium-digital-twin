import { formatUrbanRouteStatus } from "../../domain/urbanResilience/formatUrbanRouteStatus";
import type { UrbanResourceSite, UrbanResponseRoute } from "../../types/urbanResilience";

interface UrbanResponseContextListProps {
  routes: UrbanResponseRoute[];
  resources: UrbanResourceSite[];
}

export function UrbanResponseContextList({ routes, resources }: UrbanResponseContextListProps) {
  return (
    <section
      className="urban-resilience-demo-section urban-response-context"
      aria-labelledby="urban-response-context-title"
    >
      <h2 id="urban-response-context-title">Response context</h2>

      {routes.length === 0 && resources.length === 0 ? (
        <p className="urban-resilience-demo-empty-state" role="status">
          Loading response routes and regional staging references...
        </p>
      ) : (
        <>
          <h3 className="urban-response-subheading">Response routes ({routes.length})</h3>
          <dl className="urban-response-details">
            {routes.map((route) => (
              <div key={route.id}>
                <dt>{route.name}</dt>
                <dd>
                  <span
                    className={`urban-route-status urban-route-status-${route.status}`}
                  >
                    {formatUrbanRouteStatus(route.status)}
                  </span>
                  <span>{route.description}</span>
                </dd>
              </div>
            ))}
          </dl>

          <h3 className="urban-response-subheading">
            Regional staging references ({resources.length})
          </h3>
          <dl className="urban-response-details">
            {resources.map((resource) => (
              <div key={resource.id}>
                <dt>{resource.name}</dt>
                <dd>
                  <span>{resource.description}</span>
                </dd>
              </div>
            ))}
          </dl>
        </>
      )}

      <p className="urban-response-safety-note" role="note">
        Illustrative research context only. Route status is a judgment call
        based on this corridor&apos;s documented storm-surge/overtopping
        history, not live road-condition data. Staging references are
        approximate town centers, not official shelters.
      </p>
    </section>
  );
}
