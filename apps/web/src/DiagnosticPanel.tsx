import { RepairPanel } from "./RepairPanel";
import { diagnosticPoints } from "@spark/game-core";
import type { Session, ExplorationCommand, Language } from "@spark/shared";
import { diagnosisCopy, faultChoices } from "./diagnosis-i18n";
export function DiagnosticPanel({
  session,
  language,
  dispatch,
}: {
  session: Session;
  language: Language;
  dispatch: (c: ExplorationCommand) => void;
}) {
  const state = session.diagnosis!;
  const t = diagnosisCopy[language];
  const ready = diagnosticPoints.every((p) => Object.hasOwn(state.readings, p));
  const identified = state.outcome === "identified";
  const format = (v: number) =>
    new Intl.NumberFormat(language === "lt" ? "lt-LT" : "en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);
  return (
    <div className="diagnostics">
      <div className="diagnostic-content">
        <p>{t.intro}</p>
        <svg viewBox="0 0 520 145" role="img" aria-label={t.scope}>
          <g fill="none" stroke="#d7ee91" strokeWidth="3">
            <path d="M55 105V35H150m70 0h70m0 0h70m0 0h80v70H55" />
            <circle cx="55" cy="70" r="21" fill="#17343e" />
            <path d="M45 64h20m-10-10v20m-10 10h20" />

            <rect x="150" y="23" width="70" height="24" fill="#17343e" />
            <rect x="360" y="23" width="70" height="24" fill="#17343e" />
            <path d="M440 105v14m-16 0h32m-27 7h22m-17 7h12" />
          </g>
          <g fill="#edf3ee" fontSize="13" fontFamily="inherit">
            <text x="25" y="18">
              V1 · 5 V
            </text>
            <text x="154" y="17">
              R1 · 1 kΩ
            </text>
            <text x="364" y="17">
              R2 · 1 kΩ
            </text>
            <text x="92" y="67">
              VCC
            </text>
            <text x="253" y="18">
              SENSE
            </text>
            <text x="320" y="128">
              GND
            </text>
          </g>
          <circle cx="110" cy="35" r="5" fill="#f4bd6b" />
          <circle cx="290" cy="35" r="5" fill="#f4bd6b" />
        </svg>
        <p className="reference">{t.reference}</p>
        <fieldset>
          <legend>{t.evidence}</legend>
          <div className="measurement-grid">
            {diagnosticPoints.map((point) => (
              <div key={point}>
                <strong>{point}</strong>
                <output aria-label={`${point} V`}>
                  {Object.hasOwn(state.readings, point)
                    ? `${format(state.readings[point])} V`
                    : t.unmeasured}
                </output>
                <button
                  disabled={Object.hasOwn(state.readings, point) || identified}
                  onClick={() =>
                    dispatch({ type: "measure-node", target: point })
                  }
                >
                  {t.measure} {point}
                </button>
              </div>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>{t.hypothesis}</legend>
          {!ready && <p>{t.need}</p>}
          <div className="fault-options">
            {faultChoices.map((fault) => (
              <button
                key={fault}
                disabled={!ready || identified}
                onClick={() => dispatch({ type: "submit-diagnosis", fault })}
              >
                {t.faults[fault]}
              </button>
            ))}
          </div>
        </fieldset>
        <div
          role="status"
          className={
            identified ? "diagnosis-feedback success" : "diagnosis-feedback"
          }
        >
          {state.outcome === "incorrect" ? (
            t.incorrect
          ) : identified ? (
            <>
              <strong>{t.identified}</strong>
              <p>{t.explanation}</p>
            </>
          ) : null}
        </div>
        {identified && (
          <RepairPanel
            session={session}
            language={language}
            dispatch={dispatch}
          />
        )}
        <p className="model-limits">{t.limits}</p>
      </div>
      <button
        className="primary"
        onClick={() => dispatch({ type: "close-diagnostics" })}
      >
        {t.close}
      </button>
    </div>
  );
}
