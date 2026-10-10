import { Download, Grid2X2 } from 'lucide-react';
import { useRef } from 'react';
import { useVisionStudio } from './hooks/useVisionStudio';
import { Metric } from './components/Primitives';
import { TopBar } from './components/TopBar';
import { FeedPanel } from './components/FeedPanel';
import { LayersPanel } from './components/LayersPanel';
import { ScenarioPanel } from './components/ScenarioPanel';
import { FocusSummary } from './components/FocusSummary';
import { TimelinePanel } from './components/TimelinePanel';

export function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const studio = useVisionStudio();

  return (
    <main className="studio-shell">
      <TopBar
        cameraDevices={studio.cameraDevices}
        selectedDeviceId={studio.selectedDeviceId}
        onSelectDevice={studio.setSelectedDeviceId}
        onAddCamera={studio.addCamera}
        onUploadClick={() => fileInputRef.current?.click()}
        onUploadFile={studio.addUpload}
        fileInputRef={fileInputRef}
      />

      <section className="metric-strip" aria-label="Session summary">
        <Metric
          label="Sources"
          value={`${studio.globalMetrics.active}/${studio.globalMetrics.sources}`}
        />
        <Metric label="People" value={studio.globalMetrics.people} />
        <Metric
          label={studio.activeScenario.attentionLabel}
          value={`${studio.globalMetrics.attention}%`}
        />
        <Metric label="Interaction" value={`${studio.globalMetrics.interaction}%`} />
        <Metric label="Email score" value={`${studio.globalMetrics.emailScore}%`} />
        <Metric
          label={studio.activeScenario.policyLabel}
          value={studio.globalMetrics.policyHits.length}
        />
        <Metric label="Events" value={studio.globalMetrics.events} />
        <Metric label="Model" value={studio.modelStatus} />
      </section>

      <section className="workspace">
        <FeedPanel
          sources={studio.sources}
          isAnalyzing={studio.isAnalyzing}
          layers={studio.layers}
          selectedSourceId={studio.selectedSource?.id}
          onRegisterVideo={studio.registerVideo}
          onSelectSource={studio.setSelectedSourceId}
          onRenameSource={studio.renameSource}
          onStopSource={studio.stopSource}
          onToggleAnalyzing={() => studio.setIsAnalyzing((value) => !value)}
          onResetSession={studio.resetSession}
          onAddCamera={studio.addCamera}
          onUploadClick={() => fileInputRef.current?.click()}
        />

        <aside className="inspector" aria-label="Studio inspector">
          <ScenarioPanel
            scenario={studio.scenario}
            policyObjects={studio.policyObjects}
            onChangeScenario={studio.changeScenario}
            onTogglePolicyObject={studio.togglePolicyObject}
          />
          <LayersPanel layers={studio.layers} onToggle={studio.toggleLayer} />

          <div className="panel-block">
            <div className="panel-header compact">
              <div>
                <h2>Focus</h2>
                <p>{studio.selectedSource ? studio.selectedSource.label : 'No source selected'}</p>
              </div>
              <Grid2X2 size={18} />
            </div>
            {studio.selectedSource ? (
              <FocusSummary source={studio.selectedSource} />
            ) : (
              <p className="muted">Add a source to inspect its metrics.</p>
            )}
          </div>

          <TimelinePanel events={studio.events} />

          <button
            className="report-button"
            disabled={studio.events.length === 0}
            onClick={studio.exportReport}
          >
            <Download size={18} />
            Export JSON report
          </button>
        </aside>
      </section>
    </main>
  );
}
