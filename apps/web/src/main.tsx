import { PilotPanel, pilotCopy } from "./PilotPanel";
import { WorkbenchPanel, programmingCopy } from "./WorkbenchPanel";
import { repairCopy } from "./repair-i18n";
import { DiagnosticPanel } from "./DiagnosticPanel";
import { TraceRepairPanel } from "./TraceRepairPanel";
import { traceCopy } from "./trace-i18n";
import type { TraceAim } from "./game/trace-view";
import {
  FieldNotebook,
  fieldCopy,
  fieldTask,
  fieldVoltage,
} from "./FieldDiagnostics";
import { diagnosisCopy } from "./diagnosis-i18n";
import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  createGame,
  execute,
  createEpisode,
  commandEpisode,
  episodeStage,
  nearbyComponents,
  components,
  horizontalDistance,
  fieldDestinations,
  fieldTarget,
  tracePowered,
  type PadId,
} from "@spark/game-core";
import { languages } from "@spark/shared";
import { episodeCopy } from "./episode-i18n";
import { messages } from "./i18n";
import { gameplay } from "./gameplay-i18n";
import "./style.css";
import { objectiveTarget, targetBearing } from "./game/navigation";
import type { JournalStage } from "./game/engineer-motion";
import {
  difficulties,
  difficultyCopy,
  readDifficulty,
  saveDifficulty,
} from "./difficulty";
function App() {
  const [state, setState] = useState(createGame);
  const [difficulty, setDifficulty] = useState(readDifficulty);
  const guidance = useRef(difficulty);
  guidance.current = difficulty;
  const difficultyText = difficultyCopy[state.language];
  const navigation = difficulty !== "engineer";
  const [episode, setEpisode] = useState(createEpisode);
  const current = useRef(episode);
  const session = episode.session;
  const stage = episodeStage(episode);
  const e = episodeCopy[state.language];
  const field = episode.field;
  const [journalStage, setJournalStage] = useState<JournalStage>("closed");
  const traceAim = useRef<TraceAim>({ x: 0, z: 0, engaged: false });
  const playing = session.phase === "playing" && journalStage === "closed";
  const language = useRef(state.language);
  language.current = state.language;
  const fieldText = fieldCopy[state.language];
  const fieldActive = !!field && !session.repair.completed;
  const fieldOffered =
    !field && !session.diagnosis && !session.repair.completed;
  const stageLabel = fieldActive ? fieldText.stage : e.stages[stage];
  const episodeTask =
    !navigation &&
    (stage === "construction" ||
      stage === "programming" ||
      stage === "activation")
      ? difficultyText.commissioning[stage]
      : e.tasks[stage];
  const explorationTask =
    difficulty === "technician"
      ? gameplay[state.language].objectives[session.step]
      : (difficulty === "apprentice"
          ? difficultyText.detailed
          : difficultyText.exploration)[session.step];
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [attempt, setAttempt] = useState(0);
  const [mounted, setMounted] = useState(true);
  const [pilot, setPilot] = useState(false);
  const [workbench, setWorkbench] = useState(false);
  const [viewBoard, setViewBoard] = useState(false);
  const [cameraYaw, setCameraYaw] = useState(0);
  const [selected, setSelected] = useState<string>();
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const canvas = useRef<HTMLCanvasElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const activateButton = useRef<HTMLButtonElement>(null);
  const modalOpener = useRef<HTMLButtonElement | null>(null);
  const restoreModalFocus = () => {
    requestAnimationFrame(() => modalOpener.current?.focus());
  };
  const t = messages[state.language],
    g = gameplay[state.language],
    d = diagnosisCopy[state.language];
  const publish = useCallback(() => {
    setEpisode(current.current);
    setCameraYaw(Number(canvas.current?.dataset.cameraYaw ?? 0));
  }, []);
  const dispatch = useCallback(
    (command: unknown, notify = true) => {
      current.current = commandEpisode(current.current, command);
      if (notify) publish();
    },
    [publish],
  );
  useEffect(() => {
    document.documentElement.lang = state.language;
  }, [state.language]);
  useEffect(() => {
    if (episode.activated)
      menu.current?.querySelector<HTMLHeadingElement>("h2")?.focus();
  }, [episode.activated]);
  useEffect(() => {
    if (!mounted) return;
    const controller = new AbortController();
    let dispose: (() => void) | undefined;
    setStatus("loading");
    setJournalStage("closed");
    const element = canvas.current!;
    const lost = (event: Event) => {
      event.preventDefault();
      dispatch({ type: "pause" });
      setJournalStage("closed");
      setStatus("error");
      controller.abort();
      queueMicrotask(() => dispose?.());
    };
    element.addEventListener("webglcontextlost", lost);
    import("./scene")
      .then(({ mountScene }) =>
        mountScene(element, controller.signal, {
          get: () => current.current.session,
          activated: () => current.current.activated,
          field: () => current.current.field,
          language: () => language.current,
          journalStage: setJournalStage,
          traceAim: () => traceAim.current,
          journalToggle: () => {
            const { field, session } = current.current;
            if (
              !field ||
              session.phase !== (field.notebook ? "paused" : "playing")
            )
              return false;
            dispatch({ type: "field-notebook" });
            return true;
          },
          difficulty: () => guidance.current,
          fieldUse: () => {
            const { field, session } = current.current;
            if (!field) return false;
            const target = fieldTarget(field, session);
            if (target) dispatch({ type: "field-use", target: target.id });
            return true;
          },
          dispatch,
          publish,
          target: () => {
            const nearby = nearbyComponents(current.current.session);
            return (
              nearby.find((c) => c.id === selectedRef.current)?.id ??
              nearby[0]?.id
            );
          },
        }),
      )
      .then((cleanup) => {
        if (controller.signal.aborted) cleanup();
        else {
          dispose = cleanup;
          setStatus("ready");
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error("Scene initialization failed", error);
          setStatus("error");
        }
      });
    return () => {
      controller.abort();
      dispose?.();
      element.removeEventListener("webglcontextlost", lost);
    };
  }, [attempt, mounted, dispatch, publish]);
  useEffect(() => {
    if (session.phase === "playing") {
      canvas.current?.focus({ preventScroll: true });
      window.scrollTo(0, 0);
      return;
    }
    if (document.pointerLockElement === canvas.current)
      document.exitPointerLock();
    menu.current
      ?.querySelector<HTMLElement>(".diagnostic-content")
      ?.scrollTo(0, 0);
    if (document.activeElement?.tagName !== "SELECT")
      menu.current
        ?.querySelector<HTMLButtonElement>("button:not(:disabled)")
        ?.focus();
  }, [session.phase, viewBoard, journalStage]);
  const showingBoard =
    viewBoard && session.phase === "complete" && session.repair.completed;
  const showSceneMenu =
    session.phase !== "playing" &&
    !showingBoard &&
    !field?.benchOpen &&
    (!field?.notebook || journalStage === "open");
  const nearby = nearbyComponents(session);
  const target = nearby.find((c) => c.id === selected) ?? nearby[0];
  const inspected = components.find((c) => c.id === session.inspection?.id);
  const coordinate = (n: number) =>
    new Intl.NumberFormat(state.language === "lt" ? "lt-LT" : "en-GB", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(n);
  const start = () => {
    if (!mounted) {
      setMounted(true);
      current.current = createEpisode();
    }
    dispatch({ type: "start" });
  };
  const end = () => {
    current.current = createEpisode();
    publish();
    setMounted(false);
  };
  const destination = objectiveTarget(session.step);
  const fieldSite = field && fieldTarget(field, session);
  const fieldGuide = field && (fieldSite ?? fieldDestinations(field)[0]);
  const fieldGuideName =
    fieldGuide?.id === "T1"
      ? "T1"
      : fieldGuide?.id === "FEED-LINK"
        ? fieldText.patch
        : fieldGuide
          ? fieldText.labels[fieldGuide.id as PadId]
          : undefined;
  const objectiveName =
    "kind" in destination
      ? `${destination.id} · ${g.componentNames[destination.kind]}`
      : g.startPad;
  const bearing = targetBearing(
    destination.x - session.player.position.x,
    destination.z - session.player.position.z,
    cameraYaw,
  );
  return (
    <>
      {pilot && (
        <PilotPanel
          language={state.language}
          onClose={() => {
            setPilot(false);
            restoreModalFocus();
          }}
        />
      )}
      {workbench && (
        <WorkbenchPanel
          language={state.language}
          workbench={session.phase === "title" ? undefined : episode.workbench}
          onCommand={
            session.phase === "title"
              ? undefined
              : (command) => dispatch({ type: "workbench", command })
          }
          mission={
            session.phase === "title"
              ? undefined
              : {
                  scope: e.missionScope,
                  task: episodeTask,
                  scopeLabel: e.scopeLabel,
                  returnLabel: e.returnToReport,
                  nextAction:
                    stage === "activation" ? e.continueToActivation : undefined,
                }
          }
          programmingLocked={
            session.phase !== "title" && !episode.programmingUnlocked
          }
          onClose={(returnToReport) => {
            setWorkbench(false);
            if (!returnToReport) {
              restoreModalFocus();
            } else {
              setViewBoard(false);
              requestAnimationFrame(() =>
                (stage === "activation"
                  ? activateButton.current
                  : modalOpener.current
                )?.focus(),
              );
            }
          }}
        />
      )}
      <main
        inert={workbench || pilot}
        className={session.phase === "title" ? "" : "in-game"}
      >
        <header>
          <a className="brand" href="./" aria-label="Project Spark">
            <span className="logo">ϟ</span> project<span>spark</span>
            <small>0.8 DEMO</small>
          </a>
          <div className="header-actions">
            {session.phase === "title" && (
              <button
                onClick={(e) => {
                  modalOpener.current = e.currentTarget;
                  setPilot(true);
                }}
              >
                {pilotCopy[state.language].open}
              </button>
            )}
            {(session.phase === "title" ||
              (session.phase === "complete" &&
                session.repair.completed &&
                !episode.activated)) && (
              <button
                onClick={(e) => {
                  modalOpener.current = e.currentTarget;
                  setWorkbench(true);
                }}
              >
                {programmingCopy[state.language].open}
              </button>
            )}
            {playing && (
              <button onClick={() => dispatch({ type: "pause" })}>
                {g.pause}
              </button>
            )}
            <details className="difficulty-picker">
              <summary>
                {difficultyText.label}
                <span className="difficulty-current">
                  {" "}
                  · {difficultyText[difficulty]}
                </span>
              </summary>
              <fieldset aria-label={difficultyText.label}>
                {difficulties.map((value) => (
                  <label key={value}>
                    <input
                      type="radio"
                      name="difficulty"
                      checked={difficulty === value}
                      onChange={() => {
                        setDifficulty(value);
                        saveDifficulty(value);
                      }}
                    />
                    {difficultyText[value]}
                  </label>
                ))}
              </fieldset>
            </details>
            <label>
              {t.language}
              <select
                value={state.language}
                onFocus={() => dispatch({ type: "pause" })}
                onChange={(e) =>
                  setState((s) =>
                    execute(s, {
                      type: "set-language",
                      language: e.target.value,
                    }),
                  )
                }
              >
                {languages.map((language) => (
                  <option key={language} value={language}>
                    {language === "en" ? "English" : "Lietuvių"}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>
        {session.phase === "title" && (
          <section className="intro">
            <p className="eyebrow">
              {repairCopy[state.language].title} / {e.demo}
            </p>
            <h1>{t.title}</h1>
            <p>{e.intro}</p>
            <button
              className="primary demo-start"
              onClick={start}
              disabled={mounted && status !== "ready"}
            >
              {g.play}
            </button>
            <p className="demo-note">{e.reset}</p>
          </section>
        )}
        <section className="scene gameplay" aria-label={t.scene}>
          <div className="scene-top">
            <div>
              <p className="eyebrow">
                {session.step === 5
                  ? repairCopy[state.language].title
                  : g.mission}
              </p>
              <h2 aria-live="polite" aria-atomic="true">
                {session.phase === "title"
                  ? g.welcome
                  : episode.activated
                    ? e.world
                    : field && !session.repair.completed
                      ? field.benchOpen
                        ? traceCopy[state.language].title
                        : fieldTask(field, state.language, difficulty)
                      : session.repair.completed
                        ? episodeTask
                        : session.step === 5
                          ? navigation
                            ? repairCopy[state.language].intro
                            : difficultyText.terminal
                          : explorationTask}
              </h2>
              <p
                className="episode-stage"
                data-testid="episode-stage"
                data-stage={stage}
              >
                {stageLabel}
              </p>
            </div>
            <span
              role="status"
              className={"status " + status}
              data-testid="renderer-status"
              data-status={status}
            >
              {t[status]}
            </span>
          </div>
          <div className="viewport game-viewport">
            {mounted && (
              <canvas
                key={attempt}
                ref={canvas}
                tabIndex={0}
                aria-label={t.canvas}
              />
            )}
            {mounted && status !== "ready" ? (
              <div className="overlay" ref={menu}>
                <h2>{t[status]}</h2>
                {status === "error" && (
                  <>
                    <p>{t.help}</p>
                    <button onClick={() => setAttempt((a) => a + 1)}>
                      {t.retry}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <>
                {playing && field && (
                  <>
                    {navigation && fieldGuide && (
                      <div className="compass">
                        <span>{fieldText.next}</span>
                        <span>
                          <b
                            aria-hidden="true"
                            style={{
                              transform: `rotate(${targetBearing(
                                fieldGuide.x - session.player.position.x,
                                fieldGuide.z - session.player.position.z,
                                cameraYaw,
                              )}rad)`,
                            }}
                          >
                            ↑
                          </b>{" "}
                          {fieldGuideName} ·{" "}
                          {Math.round(
                            horizontalDistance(
                              session.player.position,
                              fieldGuide,
                            ),
                          )}{" "}
                          m
                        </span>
                      </div>
                    )}
                    <aside className="field-meter" aria-label={fieldText.meter}>
                      <strong>{fieldText.meter} · DC / GND</strong>
                      <output role="status">
                        {field.traceRepair &&
                        !tracePowered(field.traceRepair.stage) ? (
                          traceCopy[state.language].isolated
                        ) : (
                          <>
                            {field.last ? `${field.last} · ` : ""}
                            {fieldVoltage(
                              state.language,
                              field.last
                                ? (field.phase === "collect" ||
                                  field.phase === "located"
                                    ? field.before
                                    : field.after)[field.last]
                                : undefined,
                            )}
                          </>
                        )}
                      </output>
                      {fieldSite && (
                        <button
                          className="primary"
                          onClick={() => {
                            dispatch({
                              type: "field-use",
                              target: fieldSite.id,
                            });
                            if (fieldSite.id !== "T1")
                              canvas.current?.focus({ preventScroll: true });
                          }}
                        >
                          Q ·{" "}
                          {field.phase === "located"
                            ? fieldText.patch
                            : field.phase === "verified"
                              ? fieldText.report
                              : `${fieldText.probe} ${fieldSite.id}`}
                        </button>
                      )}
                      <button
                        aria-keyshortcuts="N"
                        onClick={() => dispatch({ type: "field-notebook" })}
                      >
                        {fieldText.title}
                        <kbd aria-hidden="true">N</kbd>
                      </button>
                    </aside>
                  </>
                )}
                {playing && !field && (
                  <>
                    {navigation && (
                      <div className="compass">
                        <span>
                          {g.north}{" "}
                          <b
                            aria-hidden="true"
                            data-testid="north-arrow"
                            style={{ transform: `rotate(${cameraYaw}rad)` }}
                          >
                            ↑
                          </b>
                        </span>
                        <span>
                          <b
                            aria-hidden="true"
                            style={{ transform: `rotate(${bearing}rad)` }}
                          >
                            ↑
                          </b>{" "}
                          {g.distance} · {objectiveName} ·{" "}
                          {Math.round(
                            horizontalDistance(
                              session.player.position,
                              destination,
                            ),
                          )}{" "}
                          m
                        </span>
                      </div>
                    )}
                    {navigation && !target && (
                      <p className="exploration-hint">{g.approach}</p>
                    )}
                    <div className="crosshair" aria-hidden="true">
                      ·
                    </div>
                    {(navigation || session.recoveries > 0) && (
                      <div
                        className="position"
                        aria-label={navigation ? g.coordinates : undefined}
                      >
                        {navigation && (
                          <>
                            {coordinate(session.player.position.x)};{" "}
                            {coordinate(session.player.position.z)}
                          </>
                        )}
                        {session.recoveries > 0 && (
                          <p>
                            {g.checkpoint} · {session.recoveries}
                          </p>
                        )}
                      </div>
                    )}
                    {target && (
                      <aside className="interaction">
                        <p>{g.nearby}</p>
                        <div className="target-list">
                          {nearby.map((c) => (
                            <button
                              aria-pressed={target.id === c.id}
                              key={c.id}
                              onClick={() => {
                                setSelected(c.id);
                                canvas.current?.focus({ preventScroll: true });
                              }}
                            >
                              {c.id} · {g.componentNames[c.kind]}
                            </button>
                          ))}
                        </div>
                        <strong>
                          {target.id} · {g.componentNames[target.kind]}
                        </strong>
                        {session.scanned.includes(target.id) && (
                          <p>{g.identified}</p>
                        )}
                        <div className="interaction-actions">
                          <button
                            onClick={() =>
                              dispatch({ type: "interact", target: target.id })
                            }
                          >
                            {g.inspect}
                          </button>
                          {target.scannable && (
                            <button
                              onClick={() =>
                                dispatch({ type: "scan", target: target.id })
                              }
                            >
                              {g.scan}
                            </button>
                          )}
                        </div>
                      </aside>
                    )}
                  </>
                )}
                {field?.benchOpen && field.traceRepair && (
                  <TraceRepairPanel
                    repair={field.traceRepair}
                    language={state.language}
                    difficulty={difficulty}
                    aim={traceAim}
                    dispatch={dispatch}
                  />
                )}
                {showingBoard && (
                  <div className="board-report" role="status">
                    <p>
                      {episode.activated
                        ? e.world
                        : repairCopy[state.language].world}
                    </p>
                    <button autoFocus onClick={() => setViewBoard(false)}>
                      {repairCopy[state.language].report}
                    </button>
                  </div>
                )}
                {showSceneMenu && (
                  <div
                    className={
                      "menu-layer " +
                      (field?.notebook
                        ? "journal-stage"
                        : session.phase === "inspecting"
                          ? "inspection-layer"
                          : "")
                    }
                  >
                    <div
                      className={
                        session.phase === "diagnosing"
                          ? "game-menu diagnostic-menu"
                          : field?.notebook
                            ? "game-menu field-journal-menu"
                            : "game-menu"
                      }
                      ref={menu}
                      role={session.phase === "title" ? "region" : "dialog"}
                      aria-modal={session.phase === "title" ? undefined : true}
                      aria-label={
                        session.phase === "title"
                          ? g.welcome
                          : session.phase === "paused"
                            ? field?.notebook
                              ? fieldText.title
                              : g.paused
                            : session.phase === "complete"
                              ? episode.activated
                                ? e.complete
                                : session.repair.completed
                                  ? repairCopy[state.language].complete
                                  : g.complete
                              : session.phase === "diagnosing"
                                ? d.title
                                : g.selected
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Tab") {
                          const buttons = Array.from(
                            e.currentTarget.querySelectorAll<HTMLElement>(
                              'button:not(:disabled), select:not(:disabled), .journal-leaf[tabindex="0"]',
                            ),
                          );
                          if (
                            e.shiftKey &&
                            document.activeElement === buttons[0]
                          ) {
                            e.preventDefault();
                            buttons.at(-1)?.focus();
                          } else if (
                            !e.shiftKey &&
                            document.activeElement === buttons.at(-1)
                          ) {
                            e.preventDefault();
                            buttons[0]?.focus();
                          }
                        }
                      }}
                    >
                      <p className="eyebrow">
                        {session.phase === "inspecting"
                          ? g.scanner
                          : session.step === 5
                            ? repairCopy[state.language].title
                            : g.mission}
                      </p>
                      <h2 tabIndex={-1}>
                        {session.phase === "title"
                          ? g.welcome
                          : session.phase === "paused"
                            ? field?.notebook
                              ? fieldText.title
                              : g.paused
                            : session.phase === "complete"
                              ? episode.activated
                                ? e.complete
                                : session.repair.completed
                                  ? repairCopy[state.language].complete
                                  : g.complete
                              : session.phase === "diagnosing"
                                ? d.title
                                : inspected
                                  ? `${inspected.id} · ${g.componentNames[inspected.kind]}`
                                  : ""}
                      </h2>
                      {session.phase === "title" && (
                        <>
                          {navigation && <p>{g.brief}</p>}
                          <p>{e.practice}</p>
                        </>
                      )}
                      {session.phase === "paused" && field?.notebook && (
                        <FieldNotebook
                          field={field}
                          language={state.language}
                          difficulty={difficulty}
                          dispatch={dispatch}
                        />
                      )}
                      {session.phase === "paused" && !field?.notebook && (
                        <>
                          <p>
                            {field
                              ? fieldTask(field, state.language, difficulty)
                              : explorationTask}
                          </p>
                          <button
                            className="primary"
                            onClick={() => dispatch({ type: "resume" })}
                          >
                            {g.resume}
                          </button>
                          <button onClick={end}>{g.leave}</button>
                        </>
                      )}
                      {session.phase === "inspecting" && inspected && (
                        <>
                          <p>{g.descriptions[inspected.kind]}</p>
                          {inspected.kind === "terminal" && (
                            <p>
                              {session.repair.completed
                                ? repairCopy[state.language].world
                                : g.terminal}
                            </p>
                          )}
                          <button
                            className="primary"
                            onClick={() =>
                              dispatch({ type: "close-inspection" })
                            }
                          >
                            {g.continue}
                          </button>
                        </>
                      )}
                      {session.phase === "diagnosing" && session.diagnosis && (
                        <DiagnosticPanel
                          session={session}
                          language={state.language}
                          showHints={navigation}
                          dispatch={dispatch}
                        />
                      )}
                      {session.phase === "complete" && (
                        <>
                          {fieldOffered && (
                            <>
                              {navigation && <p>{fieldText.brief}</p>}
                              <button
                                className="primary"
                                onClick={() =>
                                  dispatch({ type: "start-field" })
                                }
                              >
                                {fieldText.start}
                              </button>
                            </>
                          )}
                          {session.repair.completed && (
                            <section
                              className="episode-next"
                              aria-label={e.stages[stage]}
                            >
                              <p role="status">
                                {episode.activated
                                  ? field
                                    ? fieldText.completed
                                    : e.success
                                  : episodeTask}
                              </p>
                              {!episode.activated && (
                                <>
                                  <button
                                    className={
                                      stage === "activation"
                                        ? undefined
                                        : "primary"
                                    }
                                    onClick={(event) => {
                                      modalOpener.current = event.currentTarget;
                                      setWorkbench(true);
                                    }}
                                  >
                                    {e.continue}
                                  </button>
                                  <button
                                    ref={activateButton}
                                    className={
                                      stage === "activation"
                                        ? "primary"
                                        : undefined
                                    }
                                    disabled={stage !== "activation"}
                                    onClick={() =>
                                      dispatch({ type: "activate-device" })
                                    }
                                  >
                                    {e.activate}
                                  </button>
                                </>
                              )}
                            </section>
                          )}
                          {!episode.activated && (
                            <p>
                              {session.repair.completed
                                ? field
                                  ? fieldText.restored
                                  : repairCopy[state.language].success
                                : g.completedBody}
                            </p>
                          )}
                          {!field && (
                            <button
                              className={
                                episode.activated ? undefined : "primary"
                              }
                              onClick={() =>
                                dispatch({ type: "open-diagnostics" })
                              }
                            >
                              {d.open}
                            </button>
                          )}
                          <p>
                            {episode.activated
                              ? e.world
                              : session.repair.completed
                                ? repairCopy[state.language].world
                                : fieldOffered
                                  ? fieldText.choice
                                  : navigation
                                    ? g.terminal
                                    : difficultyText.terminal}
                          </p>
                          <button
                            className="primary"
                            onClick={() => {
                              setViewBoard(false);
                              dispatch({ type: "restart-episode" });
                            }}
                          >
                            {repairCopy[state.language].restart}
                          </button>
                          {session.repair.completed && (
                            <button onClick={() => setViewBoard(true)}>
                              {repairCopy[state.language].view}
                            </button>
                          )}
                          <button onClick={end}>{g.returnTitle}</button>
                        </>
                      )}
                      {session.phase !== "diagnosing" && !field?.notebook && (
                        <p className="menu-controls">
                          {fieldActive ? fieldText.controls : g.controls}
                        </p>
                      )}
                      {session.phase !== "diagnosing" && !field?.notebook && (
                        <p className="menu-controls">{g.camera}</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="scene-bottom">
            <span>{fieldActive ? fieldText.controls : g.controls}</span>
            <span>
              {session.step === 5
                ? stageLabel
                : `${g.mission} · ${session.step + 1}/6`}
            </span>
          </div>
        </section>
        <footer>
          <span>PROJECT SPARK © 2026</span>
          <span>{session.step === 5 ? d.scope : g.scanner}</span>
        </footer>
      </main>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
