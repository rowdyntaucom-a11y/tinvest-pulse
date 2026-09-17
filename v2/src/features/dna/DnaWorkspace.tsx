import { WorldSessionStage } from "../world/WorldSessionStage";
import type { WorldState } from "./worldState";

export function DnaWorkspace({ state }: { state: WorldState }) {
  return (
    <div className="dna-layout">
      <section className="world-panel world-panel--view">
        <div className="world-panel__head">
          <div>
            <span className="eyebrow">QVANIX DNA</span>
            <h2>ЖИВОЙ МИР</h2>
          </div>
          <div className="dna-state" aria-label={`Уровень ${state.level}`}>
            <span>УРОВЕНЬ {state.level}</span>
          </div>
        </div>
        <div className="world-frame">
          <WorldSessionStage state={state} />
        </div>
      </section>
    </div>
  );
}
