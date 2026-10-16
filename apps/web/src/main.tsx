import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { createGame, execute } from "@spark/game-core";
import { languages } from "@spark/shared";
import { messages } from "./i18n";
import "./style.css";
function App() {
  const [state, setState] = useState(createGame);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [attempt, setAttempt] = useState(0);
  const canvas = useRef<HTMLCanvasElement>(null);
  const t = messages[state.language];
  useEffect(() => {
    document.documentElement.lang = state.language;
  }, [state.language]);
  useEffect(() => {
    const controller = new AbortController();
    let dispose: (() => void) | undefined;
    setStatus("loading");
    const element = canvas.current!;
    const lost = (event: Event) => {
      event.preventDefault();
      setStatus("error");
    };
    element.addEventListener("webglcontextlost", lost);
    import("./scene")
      .then(({ mountScene }) => mountScene(element, controller.signal))
      .then((cleanup) => {
        if (controller.signal.aborted) cleanup();
        else {
          dispose = cleanup;
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("error");
      });
    return () => {
      controller.abort();
      dispose?.();
      element.removeEventListener("webglcontextlost", lost);
    };
  }, [attempt]);
  return (
    <main>
      <header>
        <a className="brand" href="./" aria-label="Project Spark">
          <span className="logo">ϟ</span> project<span>spark</span>
          <small>{t.mark}</small>
        </a>
        <label>
          {t.language}
          <select
            value={state.language}
            onChange={(event) =>
              setState((current) =>
                execute(current, {
                  type: "set-language",
                  language: event.target.value,
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
      </header>
      <section className="intro">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
      </section>
      <section className="scene" aria-label={t.scene}>
        <div className="scene-top">
          <div>
            <p className="eyebrow">{t.preview}</p>
            <h2>{t.scene}</h2>
          </div>
          <span
            className={"status " + status}
            role="status"
            data-testid="renderer-status"
            data-status={status}
          >
            {t[status]}
          </span>
        </div>
        <div className="viewport">
          <canvas key={attempt} ref={canvas} aria-label={t.canvas} />
          {status !== "ready" && (
            <div className="overlay">
              <span className="orb">ϟ</span>
              <h2>{t[status]}</h2>
              {status === "error" && (
                <>
                  <p>{t.help}</p>
                  <button onClick={() => setAttempt((value) => value + 1)}>
                    {t.retry}
                  </button>
                </>
              )}
            </div>
          )}
          <span className="scene-caption">{t.detail}</span>
        </div>
        <div className="scene-bottom">
          <span>01 / {t.state}</span>
          <span>
            {t.revision} {state.revision.toString().padStart(2, "0")}
          </span>
        </div>
      </section>
      <section className="below">
        <div>
          <p className="eyebrow">{t.chapter}</p>
          <h2>
            {t.episode} <span>↗</span>
          </h2>
          <p>{t.description}</p>
        </div>
        <p>{t.note}</p>
      </section>
      <footer>
        <span>PROJECT SPARK © 2026</span>
        <span>{t.footer}</span>
      </footer>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
