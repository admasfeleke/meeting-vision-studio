import { Eye, EyeOff, Settings2 } from 'lucide-react';
import type { LayerKey } from '../lib/types';

const layerDescriptions: Record<LayerKey, string> = {
  people: 'Person boxes',
  objects: 'Object boxes',
  attention: 'Attention badges',
  humor: 'Playful labels',
};

export function LayersPanel({
  layers,
  onToggle,
}: {
  layers: Record<LayerKey, boolean>;
  onToggle: (key: LayerKey) => void;
}) {
  return (
    <div className="panel-block">
      <div className="panel-header compact">
        <div>
          <h2>Layers</h2>
          <p>Toggle overlays and interpretation.</p>
        </div>
        <Settings2 size={18} />
      </div>
      <div className="layer-list">
        {Object.entries(layers).map(([key, enabled]) => (
          <button
            className={`layer-toggle ${enabled ? 'enabled' : ''}`}
            key={key}
            aria-pressed={enabled}
            onClick={() => onToggle(key as LayerKey)}
          >
            {enabled ? <Eye size={17} /> : <EyeOff size={17} />}
            <span>{layerDescriptions[key as LayerKey]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
