import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  createGame,
  execute,
  createSession,
  commandSession,
  nearbyComponents,
  components,
  horizontalDistance,
} from "@spark/game-core";
import { languages, type ExplorationCommand } from "@spark/shared";
import { messages } from "./i18n";
import { gameplay } from "./gameplay-i18n";
import "./style.css";
function App() {
  const [state, setState] = useState(createGame);
  const [session, setSession] = useState(createSession);
  const current = useRef(session);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [attempt, setAttempt] = useState(0);
  const [mounted, setMounted] = useState(true);
  const [selected, setSelected] = useState<string>();
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const canvas = useRef<HTMLCanvasElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const t = messages[state.language],
    g = gameplay[state.language];
  const publish = useCallback(() => setSession(current.current), []);
  const dispatch = useCallback(
    (command: ExplorationCommand, notify = true) => {
      current.current = commandSession(current.current, command);
      if (notify) publish();
    },
    [publish],
  );
  useEffect(() => {
    document.documentElement.lang = state.language;
  }, [state.language]);
  useEffect(() => {
    if (!mounted) return;
    const controller = new AbortController();
    let dispose: (() => void) | undefined;
    setStatus("loading");
    const element = canvas.current!;
    const lost = (event: Event) => {
      event.preventDefault();
      dispatch({ type: "pause" });
      setStatus("error");
      queueMicrotask(() => dispose?.());
    };
    element.addEventListener("webglcontextlost", lost);
    import("./scene")
      .then(({ mountScene }) =>
        mountScene(element, controller.signal, {
          get: () => current.current,
          dispatch,
          publish,
          target: () => {
            const nearby = nearbyComponents(current.current);
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
    if (document.activeElement?.tagName !== "SELECT")
      menu.current
        ?.querySelector<HTMLButtonElement>("button")
        ?.focus({ preventScroll: true });
  }, [session.phase]);
  const nearby = nearbyComponents(session);
  const target = nearby.find((c) => c.id === selected) ?? nearby[0];
  const inspected = components.find((c) => c.id === session.inspection?.id);
  const start = () => {
    if (!mounted) {
      setMounted(true);
      current.current = createSession();
    }
    dispatch({ type: "start" });
  };
  const end = () => {
    current.current = createSession();
    publish();
    setMounted(false);
  };
  const destination =
    session.step === 0
      ? { x: 0, z: 27 }
      : session.step === 1
        ? components[0]
        : session.step === 2
          ? components[1]
          : session.step === 3
            ? { x: 0, z: -17 }
            : components[4];
  return (
    <main className={session.phase === "title" ? "" : "in-game"}>
      <header>
        <a className="brand" href="./" aria-label="Project Spark">
          <span className="logo">ϟ</span> project<span>spark</span>
          <small>M1</small>
        </a>
        <div className="header-actions">
          {session.phase === "playing" && (
            <button onClick={() => dispatch({ type: "pause" })}>
              {g.pause}
            </button>
          )}
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
          <p className="eyebrow">{g.mission} / M1</p>
          <h1>{t.title}</h1>
          <p>{g.brief}</p>
        </section>
      )}
      <section className="scene gameplay" aria-label={t.scene}>
        <div className="scene-top">
          <div>
            <p className="eyebrow">{g.mission}</p>
            <h2>
              {session.phase === "title"
                ? g.welcome
                : g.objectives[session.step]}
            </h2>
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
              {session.phase === "playing" && (
                <>
                  <div className="compass">
                    <span>{g.north} ↑</span>
                    <span>
                      {g.distance} ·{" "}
                      {Math.round(
                        horizontalDistance(
                          session.player.position,
                          destination,
                        ),
                      )}{" "}
                      m
                    </span>
                  </div>
                  <div className="crosshair" aria-hidden="true">
                    ·
                  </div>
                  <div className="position" aria-label={g.coordinates}>
                    {session.player.position.x.toFixed(1)},{" "}
                    {session.player.position.z.toFixed(1)}
                    {session.recoveries > 0 && (
                      <p>
                        {g.checkpoint} · {session.recoveries}
                      </p>
                    )}
                  </div>
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
              {session.phase !== "playing" && (
                <div
                  className={
                    "menu-layer " +
                    (session.phase === "inspecting" ? "inspection-layer" : "")
                  }
                >
                  <div
                    className="game-menu"
                    ref={menu}
                    role="dialog"
                    aria-modal="true"
                    aria-label={
                      session.phase === "title"
                        ? g.welcome
                        : session.phase === "paused"
                          ? g.paused
                          : session.phase === "complete"
                            ? g.complete
                            : g.selected
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Tab") {
                        const buttons = Array.from(
                          e.currentTarget.querySelectorAll<HTMLButtonElement>(
                            "button",
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
                      {session.phase === "inspecting" ? g.scanner : g.mission}
                    </p>
                    <h2>
                      {session.phase === "title"
                        ? g.welcome
                        : session.phase === "paused"
                          ? g.paused
                          : session.phase === "complete"
                            ? g.complete
                            : inspected
                              ? `${inspected.id} · ${g.componentNames[inspected.kind]}`
                              : ""}
                    </h2>
                    {session.phase === "title" && (
                      <>
                        <p>{g.brief}</p>
                        <button className="primary" onClick={start}>
                          {g.play}
                        </button>
                      </>
                    )}
                    {session.phase === "paused" && (
                      <>
                        <p>{g.objectives[session.step]}</p>
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
                        {inspected.kind === "terminal" && <p>{g.terminal}</p>}
                        <button
                          className="primary"
                          onClick={() => dispatch({ type: "close-inspection" })}
                        >
                          {g.continue}
                        </button>
                      </>
                    )}
                    {session.phase === "complete" && (
                      <>
                        <p>{g.completedBody}</p>
                        <p>{g.terminal}</p>
                        <button
                          className="primary"
                          onClick={() => {
                            current.current = createSession();
                            dispatch({ type: "start" });
                          }}
                        >
                          {g.restart}
                        </button>
                        <button onClick={end}>{g.returnTitle}</button>
                      </>
                    )}
                    <p className="menu-controls">{g.controls}</p>
                    <p className="menu-controls">{g.camera}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="scene-bottom">
          <span>{g.controls}</span>
          <span>{session.step + 1}/6</span>
        </div>
      </section>
      <footer>
        <span>PROJECT SPARK © 2026</span>
        <span>{g.scanner}</span>
      </footer>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
