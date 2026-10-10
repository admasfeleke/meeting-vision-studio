import { Radio } from 'lucide-react';
import type { StudioEvent } from '../lib/types';

export function TimelinePanel({ events }: { events: StudioEvent[] }) {
  return (
    <div className="panel-block timeline-block">
      <div className="panel-header compact">
        <div>
          <h2>Timeline</h2>
          <p>Detected studio moments.</p>
        </div>
        <Radio size={18} />
      </div>
      <div className="timeline">
        {events.length === 0 ? (
          <p className="muted">Events will appear once analysis starts.</p>
        ) : (
          events.map((event) => (
            <article className="timeline-event" key={event.id}>
              {event.snapshot ? <img src={event.snapshot} alt="" /> : null}
              <span>
                {event.timestamp} · {event.confidence}% · {event.type}
              </span>
              <strong>{event.sourceLabel}</strong>
              <p>{event.label}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
