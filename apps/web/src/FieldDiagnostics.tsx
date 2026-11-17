import { useState } from "react";
import { fieldPads, type FieldState } from "@spark/game-core";
import type { Language } from "@spark/shared";
import { difficultyCopy, type Difficulty } from "./difficulty";

const en = {
  start: "Pick up multimeter",
  brief:
    "Take the meter to three probe pads. All DC readings use the board’s fixed GND reference.",
  title: "Field notebook",
  stage: "Field diagnostics",
  controls:
    "WASD · Walk   Shift · Run   Space · Jump   Q · Use meter or repair   Esc · Pause",
  choice:
    "The controller is malfunctioning. Investigate on the board with the multimeter or use the terminal diagnostics.",
  restored:
    "You bridged the supply trace and verified the circuit with fresh readings.",
  completed:
    "You located the trace break, verified the repair and commissioned the controller. Replay starts with a fresh fault.",
  meter: "Handheld multimeter",
  collect: "Find the probe pads and record all three voltages.",
  ready: "Open the notebook and locate the break from the readings.",
  located: "Trace localized. Follow the beacon and bridge the break.",
  recheck: "Trace bridged. Measure all three pads again.",
  verified: "Repair verified. Return to T1 to commission the device.",
  probe: "Probe pad",
  patch: "Bridge trace",
  report: "Return to T1 report",
  close: "Back to the board",
  next: "Next location",
  before: "Before",
  after: "After",
  healthy: "Healthy",
  point: "Probe pad",
  fault: "Suspect segment",
  source: "Power source",
  feed: "Supply trace between P1 and P2",
  divider: "Divider between P2 and P3",
  choose: "Choose…",
  upstream: "Upstream evidence",
  downstream: "Downstream evidence",
  diagnose: "Check diagnosis",
  incorrect:
    "Look for voltage on one side of a link and zero on the other. Check the two supply pads.",
  labels: { P1: "P1 · Supply", P2: "P2 · R1 feed", P3: "P3 · Divider output" },
};
const lt: typeof en = {
  start: "Paimti multimetrą",
  brief:
    "Nunešk multimetrą prie trijų matavimo taškų. Nuolatinė įtampa matuojama plokštės GND atžvilgiu.",
  title: "Matavimų užrašai",
  stage: "Diagnostika plokštėje",
  controls:
    "WASD · Eiti   Shift · Bėgti   Space · Šokti   Q · Matuoti ar taisyti   Esc · Pristabdyti",
  choice:
    "Valdiklis sugedęs. Ieškok gedimo plokštėje multimetru arba naudok terminalo diagnostiką.",
  restored:
    "Sujungei maitinimo takelį ir naujais matavimais patvirtinai remontą.",
  completed:
    "Nustatei takelio trūkį, patvirtinai remontą ir parengei valdiklį. Pakartojus gedimas atkuriamas.",
  meter: "Nešiojamasis multimetras",
  collect: "Surask matavimo taškus ir užrašyk visas tris įtampas.",
  ready: "Atsiversk užrašus ir pagal matavimus nustatyk trūkį.",
  located: "Trūkio vieta nustatyta. Sek švyturiu ir sujunk takelį.",
  recheck: "Takelis sujungtas. Dar kartą išmatuok visus tris taškus.",
  verified: "Remontas patvirtintas. Grįžk į T1 parengti įrenginio.",
  probe: "Matuoti įtampą",
  patch: "Sujungti takelį",
  report: "Grįžti į T1 ataskaitą",
  close: "Grįžti į plokštę",
  next: "Kita vieta",
  before: "Prieš",
  after: "Po",
  healthy: "Normali",
  point: "Matavimo taškas",
  fault: "Įtariama gedimo vieta",
  source: "Maitinimo šaltinis",
  feed: "Maitinimo takelis tarp P1 ir P2",
  divider: "Daliklis tarp P2 ir P3",
  choose: "Pasirink…",
  upstream: "Matavimas prieš trūkį",
  downstream: "Matavimas už trūkio",
  diagnose: "Tikrinti diagnozę",
  incorrect:
    "Ieškok įtampos vienoje jungties pusėje ir nulio kitoje. Palygink abu maitinimo taškus.",
  labels: {
    P1: "P1 · Maitinimas",
    P2: "P2 · R1 įvadas",
    P3: "P3 · Daliklio išėjimas",
  },
};
export const fieldCopy = { en, lt };
const voltageFormat = {
  en: new Intl.NumberFormat("en", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
  lt: new Intl.NumberFormat("lt", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
};

export function fieldVoltage(language: Language, value: number | undefined) {
  return value === undefined
    ? "—"
    : voltageFormat[language].format(value) + " V";
}

export function fieldTask(
  field: FieldState,
  language: Language,
  difficulty: Difficulty,
) {
  const copy = fieldCopy[language];
  const guidance = difficultyCopy[language];
  if (difficulty === "engineer") return guidance.field[field.phase];
  if (
    field.phase === "collect" &&
    fieldPads.every(({ id }) => field.before[id] !== undefined)
  )
    return copy.ready;
  if (difficulty === "apprentice") {
    if (field.phase === "collect") return guidance.probeHelp;
    if (field.phase === "located") return guidance.repairHelp;
  }
  return copy[field.phase];
}

export function FieldNotebook({
  field,
  language,
  difficulty,
  dispatch,
}: {
  field: FieldState;
  language: Language;
  difficulty: Difficulty;
  dispatch: (command: unknown) => void;
}) {
  const copy = fieldCopy[language];
  const showHints = difficulty !== "engineer";
  const [fault, setFault] = useState("");
  const [upstream, setUpstream] = useState("");
  const [downstream, setDownstream] = useState("");
  const ready = fieldPads.every(({ id }) => field.before[id] !== undefined);
  return (
    <div className="field-notebook">
      <button
        className="primary"
        onClick={() => dispatch({ type: "field-notebook" })}
      >
        {copy.close}
      </button>
      <p role="status">{fieldTask(field, language, difficulty)}</p>
      <table>
        <thead>
          <tr>
            <th scope="col">{copy.point}</th>
            {showHints && <th scope="col">{copy.healthy}</th>}
            <th scope="col">{copy.before}</th>
            <th scope="col">{copy.after}</th>
          </tr>
        </thead>
        <tbody>
          {fieldPads.map(({ id }) => (
            <tr key={id}>
              <th scope="row">{copy.labels[id]}</th>
              {showHints && (
                <td>{fieldVoltage(language, id === "P3" ? 2.5 : 5)}</td>
              )}
              <td>{fieldVoltage(language, field.before[id])}</td>
              <td>{fieldVoltage(language, field.after[id])}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {field.phase === "collect" && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            dispatch({ type: "field-diagnose", fault, upstream, downstream });
          }}
        >
          <label>
            {copy.fault}
            <select
              disabled={!ready}
              value={fault}
              onChange={(event) => setFault(event.target.value)}
            >
              <option value="">{copy.choose}</option>
              <option value="source">{copy.source}</option>
              <option value="feed">{copy.feed}</option>
              <option value="divider">{copy.divider}</option>
            </select>
          </label>
          {[
            { label: copy.upstream, value: upstream, set: setUpstream },
            { label: copy.downstream, value: downstream, set: setDownstream },
          ].map(({ label, value, set }) => (
            <label key={label}>
              {label}
              <select
                disabled={!ready}
                value={value}
                onChange={(event) => set(event.target.value)}
              >
                <option value="">{copy.choose}</option>
                {fieldPads.map(({ id }) => (
                  <option key={id} value={id}>
                    {copy.labels[id]}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <button
            disabled={
              !ready ||
              !fault ||
              !upstream ||
              !downstream ||
              upstream === downstream
            }
          >
            {copy.diagnose}
          </button>
          {field.incorrect && (
            <p role="status">
              {showHints ? copy.incorrect : difficultyCopy[language].incorrect}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
