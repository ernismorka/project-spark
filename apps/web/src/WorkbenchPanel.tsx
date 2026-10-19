import { useState } from "react";
import {
  createWorkbench,
  workbenchChallenge,
  commandWorkbench,
  printProgram,
  type Instruction,
  type Workbench,
} from "@spark/game-core";
import type { Language } from "@spark/shared";
const copy = {
  en: {
    open: "Open creative workbench",
    title: "Creative programming",
    close: "Return to adventure",
    scope:
      "Build an ideal DC resistor network and program a bounded virtual controller. OUT is an abstract logical indicator, not a simulated MCU pin or LED. Closing resets this workbench.",
    circuit: "Circuit builder",
    part: "Resistor",
    from: "From node",
    to: "To node",
    ohms: "Resistance (Ω)",
    save: "Connect resistor",
    remove: "Remove",
    blocks: "Blocks",
    text: "Text",
    apply: "Apply text",
    run: "Run controller",
    reset: "Reset workbench",
    add: "Add block",
    del: "Delete block",
    limit:
      "Maximum 8 resistors, 32 instructions and 128 execution steps. REPEAT N repeats the entire prefix N times; each loop counter is local to a run. ABOVE uses a strict comparison. WRITE sets OUT from a nonzero register.",
    error: "Run failed",
    program:
      "Invalid program. Use READ SENSE, ABOVE 0–5, WRITE OUT or REPEAT 1–128, one per line.",
    budget: "Execution budget exhausted; output was cleared.",
    fault:
      "Circuit cannot be solved. Connect SENSE to the source or ground through a resistor.",
    output: "Virtual output",
    on: "ON",
    off: "OFF",
    trace: "Execution trace",
    step: "Step",
    value: "Register",
    task: "Challenge: keep the default program, add R3 = 1 kΩ from SENSE to GND and run. Explain why OUT changes. Remove R3 and run to compare.",
    success:
      "Challenge complete: the added branch lowered SENSE below the threshold. Remove R3 to restore the original divider.",
    instruction: "Instruction",
    parameter: "Parameter",
    unrun: "Not run",
  },
  lt: {
    open: "Atverti kūrybinę dirbtuvę",
    title: "Kūrybinis programavimas",
    close: "Grįžti į nuotykį",
    scope:
      "Konstruok idealią nuolatinės srovės rezistorių grandinę ir programuok ribotą virtualų valdiklį. OUT yra loginis indikatorius, o ne simuliuojamas mikrovaldiklio išvadas ar šviesos diodas. Uždarius dirbtuvė atkuriama.",
    circuit: "Grandinės konstravimas",
    part: "Rezistorius",
    from: "Pradžios mazgas",
    to: "Pabaigos mazgas",
    ohms: "Varža (Ω)",
    save: "Prijungti rezistorių",
    remove: "Pašalinti",
    blocks: "Blokai",
    text: "Tekstas",
    apply: "Taikyti tekstą",
    run: "Vykdyti valdiklį",
    reset: "Atkurti dirbtuvę",
    add: "Pridėti bloką",
    del: "Ištrinti bloką",
    limit:
      "Daugiausia 8 rezistoriai, 32 instrukcijos ir 128 vykdymo žingsniai. REPEAT N pakartoja visą ankstesnę seką N kartų; kiekvieno vykdymo skaitikliai atskiri. ABOVE tikrina griežtą nelygybę. WRITE nustato OUT pagal nenulinį registrą.",
    error: "Vykdymas nepavyko",
    program:
      "Netinkama programa. Naudok READ SENSE, ABOVE 0–5, WRITE OUT arba REPEAT 1–128, po vieną eilutėje.",
    budget: "Viršytas žingsnių skaičius; išvestis išvalyta.",
    fault:
      "Grandinės išspręsti negalima. Prijunk SENSE prie šaltinio arba žemės per rezistorių.",
    output: "Virtuali išvestis",
    on: "ĮJUNGTA",
    off: "IŠJUNGTA",
    trace: "Vykdymo seka",
    step: "Žingsnis",
    value: "Registras",
    task: "Užduotis: palik pradinę programą, pridėk R3 = 1 kΩ tarp SENSE ir GND ir vykdyk. Paaiškink OUT pokytį. Pašalink R3 ir palygink.",
    success:
      "Užduotis atlikta: papildoma šaka sumažino SENSE žemiau slenksčio. Pašalink R3, kad atkurtum pradinį daliklį.",
    instruction: "Instrukcija",
    parameter: "Parametras",
    unrun: "Nevykdyta",
  },
};
export { copy as programmingCopy };
export function WorkbenchPanel({
  language,
  onClose,
  workbench,
  onCommand,
  missionScope,
  missionTask,
  programmingLocked = false,
}: {
  language: Language;
  onClose: () => void;
  workbench?: Workbench;
  onCommand?: (command: unknown) => void;
  missionScope?: string;
  missionTask?: string;
  programmingLocked?: boolean;
}) {
  const [local, setLocal] = useState(createWorkbench);
  const state = workbench ?? local;
  const [mode, setMode] = useState<"blocks" | "text">("blocks");
  const [source, setSource] = useState(printProgram(state.program));
  const [id, setId] = useState("R3"),
    [a, setA] = useState("SENSE"),
    [b, setB] = useState("GND"),
    [ohms, setOhms] = useState(1000);
  const t = copy[language];
  const send = (c: unknown) =>
    onCommand ? onCommand(c) : setLocal((s) => commandWorkbench(s, c));
  const program = (p: readonly Instruction[]) => {
    send({ type: "set-program", program: p });
    setSource(printProgram(p));
  };
  const format = (n: number) =>
    new Intl.NumberFormat(language === "lt" ? "lt-LT" : "en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  const challenge = workbenchChallenge(state);
  return (
    <section
      className="workbench"
      role="dialog"
      aria-modal="true"
      aria-label={t.title}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
        if (e.key === "Tab") {
          const items = Array.from(
            e.currentTarget.querySelectorAll<HTMLElement>(
              "button:not(:disabled),input,select,textarea,summary",
            ),
          );
          const first = items[0],
            last = items.at(-1);
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }}
    >
      <header>
        <h2>
          {t.title} · {onCommand ? "T1" : "M4"}
        </h2>
        <button autoFocus onClick={onClose}>
          {t.close}
        </button>
      </header>
      <p>{missionScope ?? t.scope}</p>
      <p>{missionTask ?? t.task}</p>
      <div className="workbench-grid">
        <section>
          <h3>{t.circuit}</h3>
          <p>V1: VCC → GND · 5 V</p>
          <ul>
            {state.parts.map((p) => (
              <li key={p.id}>
                {p.id}: {p.a} → {p.b} · {p.ohms} Ω{" "}
                <button onClick={() => send({ type: "remove", id: p.id })}>
                  {t.remove} {p.id}
                </button>
              </li>
            ))}
          </ul>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send({ type: "part", part: { id, a, b, ohms } });
            }}
          >
            <label>
              {t.part}
              <select value={id} onChange={(e) => setId(e.target.value)}>
                {Array.from({ length: 8 }, (_, i) => (
                  <option key={i}>R{i + 1}</option>
                ))}
              </select>
            </label>
            <label>
              {t.from}
              <select value={a} onChange={(e) => setA(e.target.value)}>
                {["VCC", "SENSE", "GND"].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
            <label>
              {t.to}
              <select value={b} onChange={(e) => setB(e.target.value)}>
                {["VCC", "SENSE", "GND"].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
            <label>
              {t.ohms}
              <input
                type="number"
                min="1"
                max="1000000"
                required
                value={ohms}
                onChange={(e) => setOhms(e.target.valueAsNumber)}
              />
            </label>
            <button disabled={a === b}>{t.save}</button>
          </form>
        </section>
        <section>
          <fieldset
            className="program-editor"
            aria-label={`${t.blocks} / ${t.text}`}
            disabled={programmingLocked}
          >
            <h3>
              {t.blocks} / {t.text}
            </h3>
            <button
              aria-pressed={mode === "blocks"}
              onClick={() => {
                setMode("blocks");
                if (state.error === "program")
                  send({ type: "set-program", program: state.program });
              }}
            >
              {t.blocks}
            </button>
            <button
              aria-pressed={mode === "text"}
              onClick={() => {
                setSource(printProgram(state.program));
                setMode("text");
              }}
            >
              {t.text}
            </button>
            {mode === "text" ? (
              <>
                <label>
                  {t.text}
                  <textarea
                    maxLength={2048}
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    spellCheck={false}
                  />
                </label>
                <button onClick={() => send({ type: "text", text: source })}>
                  {t.apply}
                </button>
              </>
            ) : (
              <>
                <ol>
                  {state.program.map((i, index) => (
                    <li key={index}>
                      <label>
                        {t.instruction} {index + 1}
                        <select
                          value={i.op}
                          onChange={(e) => {
                            const op = e.target.value;
                            program(
                              state.program.map((p, j) =>
                                j !== index
                                  ? p
                                  : op === "above"
                                    ? { op, volts: 2 }
                                    : op === "repeat"
                                      ? { op, count: 2 }
                                      : op === "read"
                                        ? { op: "read" }
                                        : { op: "write" },
                              ),
                            );
                          }}
                        >
                          <option value="read">READ SENSE</option>
                          <option value="above">ABOVE</option>
                          <option value="write">WRITE OUT</option>
                          <option value="repeat">REPEAT</option>
                        </select>
                      </label>
                      {(i.op === "above" || i.op === "repeat") && (
                        <label>
                          {t.parameter} {index + 1}
                          <input
                            type="number"
                            min={i.op === "repeat" ? 1 : 0}
                            max={i.op === "repeat" ? 128 : 5}
                            step={i.op === "repeat" ? 1 : 0.1}
                            value={i.op === "above" ? i.volts : i.count}
                            onChange={(e) =>
                              program(
                                state.program.map((p, j) =>
                                  j !== index
                                    ? p
                                    : i.op === "above"
                                      ? {
                                          op: "above",
                                          volts: e.target.valueAsNumber,
                                        }
                                      : {
                                          op: "repeat",
                                          count: e.target.valueAsNumber,
                                        },
                                ),
                              )
                            }
                          />
                        </label>
                      )}
                      <button
                        disabled={state.program.length === 1}
                        onClick={() =>
                          program(state.program.filter((_, j) => j !== index))
                        }
                      >
                        {t.del} {index + 1}
                      </button>
                    </li>
                  ))}
                </ol>
                <button
                  disabled={state.program.length >= 32}
                  onClick={() => program([...state.program, { op: "read" }])}
                >
                  {t.add}
                </button>
              </>
            )}
            <p>{t.limit}</p>
          </fieldset>
        </section>
      </div>
      <button
        onClick={() => {
          if (mode === "text") send({ type: "text", text: source });
          send({ type: "run" });
        }}
      >
        {t.run}
      </button>
      <button
        onClick={() => {
          const s = createWorkbench();
          send({ type: "reset" });
          setSource(printProgram(s.program));
        }}
      >
        {t.reset}
      </button>
      {state.error && (
        <p role="alert">
          {t.error}:{" "}
          {state.error === "program"
            ? t.program
            : state.error === "budget"
              ? t.budget
              : t.fault}
        </p>
      )}
      <p role="status">
        {t.output}:{" "}
        <strong data-output={String(state.output)}>
          {state.output ? t.on : t.off}
        </strong>{" "}
        · SENSE:{" "}
        <output aria-label="Workbench SENSE">
          {state.result?.ok
            ? format(state.result.voltages.SENSE) + " V"
            : t.unrun}
        </output>
      </p>
      {challenge && !missionTask && <p role="status">{t.success}</p>}
      {missionTask && (
        <p role="status" className="commission-task">
          {missionTask}
        </p>
      )}
      <details>
        <summary>
          {t.trace} ({state.trace.length}/128)
        </summary>
        <ol>
          {state.trace.map((row) => (
            <li key={row.step}>
              {t.step} {row.step} · {row.op} · {t.value}: {format(row.value)} ·
              OUT {row.output ? "1" : "0"}
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}
