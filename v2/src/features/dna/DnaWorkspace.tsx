import { WorldSessionStage } from "../world/WorldSessionStage";
import type { WorldState } from "./worldState";

export function DnaWorkspace({ state }: { state: WorldState }) {
  return (
    <div className="dna-layout">
      <section className="world-panel world-panel--view">
        <div className="world-panel__head">
          <div>
            <span className="eyebrow">QVANIX DNA · PIXIJS / WEBGL</span>
            <h2>ЖИВОЙ МИР</h2>
          </div>
          <div className="dna-state">
            <span>УРОВЕНЬ {state.level}</span>
            <strong>XP CORE</strong>
            <small>
              WorldState v{state.version} · сигналы {Math.round(state.qualityCoverage * 100)}%
            </small>
          </div>
        </div>
        <div className="world-frame">
          <WorldSessionStage state={state} />
        </div>
        <div className="dna-next">
          <span>СЛЕДУЮЩИЙ ЭТАП</span>
          <strong>XP Engine → WorldState → события мира → renderer</strong>
          <p>
            Renderer получает уже разрешённое состояние мира и не считает финансовые метрики внутри Pixi. Погода, время суток и semantic events пока не меняют арт до отдельного production mapping.
          </p>
        </div>
      </section>
    </div>
  );
}
