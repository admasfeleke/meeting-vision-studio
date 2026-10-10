import { Metric } from './Primitives';
import type { VisionSource } from '../lib/types';

export function FocusSummary({ source }: { source: VisionSource }) {
  return (
    <div className="focus-summary">
      <Metric label="Status" value={source.status} />
      <Metric label="People" value={source.metrics.people} />
      <Metric label="Attention" value={`${source.metrics.attention}%`} />
      <Metric label="Email score" value={`${source.metrics.emailScore}%`} />
      <Metric label="Interaction" value={`${source.metrics.interaction}%`} />
      <Metric label="Inference" value={`${source.metrics.latencyMs} ms`} />
      {source.metrics.policyHits.length > 0 ? (
        <div className="object-list">
          {source.metrics.policyHits.map((object) => (
            <span key={object} className="policy-hit">
              {object}
            </span>
          ))}
        </div>
      ) : null}
      <div className="object-list">
        {source.metrics.objects.length === 0 ? (
          <span>No meeting objects detected yet</span>
        ) : (
          source.metrics.objects.map((object) => <span key={object}>{object}</span>)
        )}
      </div>
    </div>
  );
}
