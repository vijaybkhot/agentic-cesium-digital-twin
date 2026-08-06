import type { DisasterTwinEvent } from "../../types/disasterResilience";

interface DisasterTwinEventFeedProps {
  events: readonly DisasterTwinEvent[];
}

function formatEventTimestamp(timestamp: string): string {
  const timestampParts = timestamp.match(
    /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}):\d{2}Z$/,
  );

  return timestampParts
    ? `${timestampParts[1]} · ${timestampParts[2]} UTC`
    : timestamp;
}

export function DisasterTwinEventFeed({
  events,
}: DisasterTwinEventFeedProps) {
  const orderedEvents = [...events].sort(
    (first, second) =>
      first.timestamp.localeCompare(second.timestamp) ||
      first.id.localeCompare(second.id),
  );

  return (
    <section
      className="disaster-resilience-demo-section disaster-event-feed"
      aria-labelledby="disaster-event-feed-title"
    >
      <h2 id="disaster-event-feed-title">Illustrative twin event feed</h2>
      <p className="disaster-event-feed-note" role="note">
        Fixed local demonstration events. This feed is not live monitoring and
        makes no real forecast, prediction, or recommendation.
      </p>
      <ol className="disaster-event-feed-list">
        {orderedEvents.map((event, index) => (
          <li key={event.id} data-event-id={event.id}>
            <div className="disaster-event-feed-meta">
              <span className="disaster-event-sequence">
                {String(index + 1).padStart(2, "0")}
              </span>
              <strong>{event.source}</strong>
              {event.source === "AI Assistant" ? (
                <span className="disaster-event-mock-badge">Mock output</span>
              ) : null}
            </div>
            <time dateTime={event.timestamp}>
              {formatEventTimestamp(event.timestamp)}
            </time>
            <p>{event.message}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
