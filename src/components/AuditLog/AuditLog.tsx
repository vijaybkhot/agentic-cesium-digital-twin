import type { AuditEvent } from "../../types/audit";

interface AuditLogProps {
  events: AuditEvent[];
}

export function AuditLog({ events }: AuditLogProps) {
  return (
    <ul className="audit-log">
      {events.map((event) => (
        <li key={event.id}>
          {new Date(event.timestamp).toLocaleTimeString()}: {event.message}
        </li>
      ))}
    </ul>
  );
}
