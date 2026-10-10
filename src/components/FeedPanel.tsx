import { Camera, Clapperboard, MonitorPlay, Pause, Play, RotateCcw } from 'lucide-react';
import { IconButton } from './Primitives';
import { SourceTile } from './SourceTile';
import type { LayerKey, VisionSource } from '../lib/types';

export function FeedPanel({
  sources,
  isAnalyzing,
  layers,
  selectedSourceId,
  onRegisterVideo,
  onSelectSource,
  onRenameSource,
  onStopSource,
  onToggleAnalyzing,
  onResetSession,
  onAddCamera,
  onUploadClick,
}: {
  sources: VisionSource[];
  isAnalyzing: boolean;
  layers: Record<LayerKey, boolean>;
  selectedSourceId?: string;
  onRegisterVideo: (sourceId: string, video: HTMLVideoElement | null) => void;
  onSelectSource: (id: string) => void;
  onRenameSource: (id: string, label: string) => void;
  onStopSource: (id: string) => void;
  onToggleAnalyzing: () => void;
  onResetSession: () => void;
  onAddCamera: () => void;
  onUploadClick: () => void;
}) {
  return (
    <section className="feed-panel" aria-label="Camera feeds">
      <div className="panel-header">
        <div>
          <h2>Sources</h2>
          <p>
            {sources.length === 0
              ? 'Connect a camera or upload a clip.'
              : 'Monitor live and uploaded feeds.'}
          </p>
        </div>
        <div className="icon-row">
          <IconButton
            label={isAnalyzing ? 'Pause analysis' : 'Resume analysis'}
            onClick={onToggleAnalyzing}
          >
            {isAnalyzing ? <Pause size={18} /> : <Play size={18} />}
          </IconButton>
          <IconButton label="Reset session" onClick={onResetSession}>
            <RotateCcw size={18} />
          </IconButton>
        </div>
      </div>

      {sources.length === 0 ? (
        <div className="empty-state">
          <MonitorPlay size={48} />
          <h2>Start with a live camera</h2>
          <p>Use one webcam for the fastest demo, then add more sources as the studio grows.</p>
          <div className="empty-actions">
            <button className="primary-button" onClick={onAddCamera}>
              <Camera size={18} />
              Add camera
            </button>
            <button className="secondary-button" onClick={onUploadClick}>
              <Clapperboard size={18} />
              Try upload
            </button>
          </div>
        </div>
      ) : (
        <div className="source-grid">
          {sources.map((source) => (
            <SourceTile
              key={source.id}
              source={source}
              selected={selectedSourceId === source.id}
              layers={layers}
              onRegisterVideo={onRegisterVideo}
              onSelect={() => onSelectSource(source.id)}
              onRename={(label) => onRenameSource(source.id, label)}
              onStop={() => onStopSource(source.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
