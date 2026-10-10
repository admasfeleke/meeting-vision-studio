import { ShieldAlert } from 'lucide-react';
import { policyObjectOptions, scenarioOrder, scenarios } from '../lib/scenarios';
import type { ScenarioKey } from '../lib/types';

export function ScenarioPanel({
  scenario,
  policyObjects,
  onChangeScenario,
  onTogglePolicyObject,
}: {
  scenario: ScenarioKey;
  policyObjects: string[];
  onChangeScenario: (scenario: ScenarioKey) => void;
  onTogglePolicyObject: (object: string) => void;
}) {
  const active = scenarios[scenario];

  return (
    <div className="panel-block">
      <div className="panel-header compact">
        <div>
          <h2>Scenario</h2>
          <p>{active.description}</p>
        </div>
        <ShieldAlert size={18} />
      </div>

      <div className="scenario-grid">
        {scenarioOrder.map((key) => (
          <button
            key={key}
            className={`scenario-chip ${key === scenario ? 'active' : ''}`}
            aria-pressed={key === scenario}
            onClick={() => onChangeScenario(key)}
          >
            {scenarios[key].label}
          </button>
        ))}
      </div>

      <div className="policy-block">
        <p className="policy-caption">{active.policyLabel}</p>
        <div className="policy-grid">
          {policyObjectOptions.map((object) => (
            <button
              key={object}
              className={`policy-chip ${policyObjects.includes(object) ? 'active' : ''}`}
              aria-pressed={policyObjects.includes(object)}
              onClick={() => onTogglePolicyObject(object)}
            >
              {object}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
