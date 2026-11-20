import { useEffect, useRef, type RefObject } from "react";
import {
  tracePowered,
  traceStages,
  traceTickMs,
  traceTuning,
  type TraceRepair,
} from "@spark/game-core";
import type { Language } from "@spark/shared";
import type { Difficulty } from "./difficulty";
import { traceViewHeight, type TraceAim } from "./game/trace-view";
import { traceCopy } from "./trace-i18n";

export function TraceRepairPanel({
  repair,
  language,
  difficulty,
  aim,
  dispatch,
}: {
  repair: TraceRepair;
  language: Language;
  difficulty: Difficulty;
  aim: RefObject<TraceAim>;
  dispatch: (command: unknown) => void;
}) {
  const copy = traceCopy[language];
  const [title, detail] = copy.steps[repair.stage];
  const live = tracePowered(repair.stage);
  const heat = repair.stage === "tin" || repair.stage === "solder";
  const tuning = traceTuning[difficulty];
  const route = repair.stage === "route";
  const showEnds = [
    "expose",
    "clean",
    "flux",
    "tin",
    "solder",
    "rinse",
    "seal",
  ].includes(repair.stage);
  const timer = useRef<number | undefined>(undefined);
  const pointer = useRef<number | undefined>(undefined);
  const surface = useRef<HTMLDivElement>(null);
  const sendRef = useRef<(event: unknown) => void>(() => {});
  sendRef.current = (event) =>
    dispatch({ type: "field-repair", event, difficulty });

  const contact = () =>
    sendRef.current({
      type: "contact",
      x: aim.current.x,
      z: aim.current.z,
    });
  const hold = () => {
    if (aim.current.engaged) return;
    aim.current.engaged = true;
    contact();
    timer.current = window.setInterval(contact, traceTickMs);
  };
  const stop = (type: "release" | "cancel") => {
    if (!aim.current.engaged) return;
    aim.current.engaged = false;
    window.clearInterval(timer.current);
    timer.current = undefined;
    pointer.current = undefined;
    sendRef.current({ type });
  };

  useEffect(() => {
    surface.current?.focus({ preventScroll: true });
    const blur = () => {
      if (!aim.current.engaged) return;
      aim.current.engaged = false;
      window.clearInterval(timer.current);
      timer.current = undefined;
      pointer.current = undefined;
      sendRef.current({ type: "cancel" });
    };
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("blur", blur);
      blur();
    };
  }, [aim]);

  const follow = (
    clientX: number,
    clientY: number,
    element: HTMLDivElement,
  ) => {
    const rect = element.getBoundingClientRect();
    const height = traceViewHeight(rect.width / rect.height);
    aim.current.x =
      ((clientX - rect.left - rect.width / 2) / rect.height) * height;
    aim.current.z =
      ((clientY - rect.top - rect.height / 2) / rect.height) * height;
  };

  return (
    <section
      className="trace-bench"
      role="dialog"
      aria-modal="true"
      aria-label={copy.title}
      data-stage={repair.stage}
      data-message={repair.message}
      data-heat={repair.heat}
      data-powered={live}
      data-route={repair.route}
      data-ends={repair.ends.filter(Boolean).length}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          stop("cancel");
          dispatch({ type: "close-field-repair" });
        } else if (event.key === "Tab") {
          const items = [
            ...event.currentTarget.querySelectorAll<HTMLElement>(
              "button, [tabindex='0']",
            ),
          ];
          const first = items[0];
          const last = items.at(-1);
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }}
    >
      <div
        className="trace-surface"
        data-testid="trace-surface"
        ref={surface}
        tabIndex={0}
        role="group"
        aria-label={copy.surface}
        aria-describedby="trace-controls"
        onPointerMove={(event) => {
          if (
            pointer.current !== undefined &&
            event.pointerId !== pointer.current
          )
            return;
          follow(event.clientX, event.clientY, event.currentTarget);
        }}
        onPointerDown={(event) => {
          if (event.button !== 0 || aim.current.engaged) return;
          event.preventDefault();
          event.currentTarget.focus({ preventScroll: true });
          pointer.current = event.pointerId;
          event.currentTarget.setPointerCapture(event.pointerId);
          follow(event.clientX, event.clientY, event.currentTarget);
          hold();
        }}
        onPointerUp={(event) => {
          if (event.pointerId === pointer.current) stop("release");
        }}
        onPointerCancel={() => stop("cancel")}
        onLostPointerCapture={() => stop("cancel")}
        onBlur={() => stop("cancel")}
        onKeyDown={(event) => {
          if (event.code === "Space" || event.code === "Enter") {
            event.preventDefault();
            if (!event.repeat) hold();
            return;
          }
          const directions: Record<string, [number, number]> = {
            ArrowLeft: [-1, 0],
            ArrowRight: [1, 0],
            ArrowUp: [0, -1],
            ArrowDown: [0, 1],
          };
          const movement = directions[event.key];
          if (!movement) return;
          event.preventDefault();
          aim.current.x = Math.max(
            -1.65,
            Math.min(1.65, aim.current.x + movement[0] * 0.09),
          );
          aim.current.z = Math.max(
            -1.2,
            Math.min(1.2, aim.current.z + movement[1] * 0.09),
          );
        }}
        onKeyUp={(event) => {
          if (
            (event.code === "Space" || event.code === "Enter") &&
            pointer.current === undefined
          ) {
            event.preventDefault();
            stop("release");
          }
        }}
      />
      <div className="trace-title">
        <p className="trace-step">
          {traceStages.indexOf(repair.stage) + 1} / {traceStages.length - 1}
        </p>
        <h3>{title}</h3>
        {difficulty !== "engineer" && (
          <p className="trace-instruction">{detail}</p>
        )}
      </div>
      <div className="trace-buttons">
        <button
          type="button"
          data-live={live}
          onClick={() => sendRef.current({ type: "power" })}
        >
          <strong>{live ? copy.live : copy.isolated}</strong>
          {live ? copy.off : copy.on}
        </button>
        <button
          type="button"
          onClick={() => sendRef.current({ type: "continuity" })}
        >
          {copy.continuity}
        </button>
        <button
          type="button"
          className="trace-close"
          onClick={() => dispatch({ type: "close-field-repair" })}
        >
          {copy.close}
        </button>
      </div>
      <div className="trace-status">
        <div className="trace-readouts">
          {(showEnds || route) && (
            <span>
              {route ? copy.routeProgress : copy.contacts}{" "}
              {route
                ? `${repair.route}/3`
                : `${repair.ends.filter(Boolean).length}/2`}
            </span>
          )}
          {heat && (
            <div className="trace-heat">
              <span>
                {copy.heat} {repair.heat}%
              </span>
              <meter
                aria-label={copy.heat}
                min={0}
                max={100}
                low={tuning.minimum}
                high={tuning.maximum}
                optimum={(tuning.minimum + tuning.maximum) / 2}
                value={repair.heat}
              />
              {difficulty !== "engineer" && (
                <span>
                  {copy.target} {tuning.minimum}–{tuning.maximum}%
                </span>
              )}
            </div>
          )}
        </div>
        <p role="status" className="trace-feedback">
          {copy.messages[repair.message]}
        </p>
        <p id="trace-controls">{copy.controls}</p>
        {difficulty === "apprentice" && repair.stage !== "isolate" && (
          <p className="trace-assist">{copy.guide}</p>
        )}
      </div>
    </section>
  );
}
