import { CloseCode } from "@colyseus/sdk";
import { components } from "@spark/game-core";
import { diagnosisCopy } from "./diagnosis-i18n";
import { useEffect, useRef, useState } from "react";
import type { Room } from "@colyseus/sdk";
import type { PilotState } from "@spark/game-core";
import type { Language } from "@spark/shared";
import { connectRoom } from "./pilot-network";
const copy = {
  en: {
    open: "Cooperative pilot",
    title: "Two engineers · one circuit",
    create: "Create private room",
    join: "Join room",
    code: "Room code",
    close: "Return to adventure",
    leave: "Leave room",
    connected: "Connected",
    reconnecting: "Reconnecting · seat held for 20 seconds",
    closed: "Disconnected",
    failed:
      "Connection failed. Start the local server or check the room code/available seats.",
    analyst: "Analyst",
    engineer: "Engineer",
    waiting: "Waiting for partner",
    range: "Move inside the T1 ring to interact.",
    help: "Separate local pilot: first start pnpm dev:server from the source checkout; the demo launcher does not start it. Open two local browser windows. Focus the board and move with WASD or arrow keys. Work within 5 m of T1. Both players must be connected. Analyst measures VCC, diagnoses and verifies; engineer measures SENSE and repairs. No single player can finish alone.",
    measure: "Measure",
    diagnose: "Diagnose R1 open",
    repair: "Restore R1",
    verify: "Verify shared repair",
    complete: "Cooperative circuit restored",
    fault: "R1 open",
    restored: "R1 restored · verify both points",
    identified: "R1 fault identified",
    evidence: "Shared measurements",
    notMeasured: "Not measured",
    online: "online",
    offline: "reconnecting",
    reconnect: "Reconnect transport",
    limits:
      "Private local pilot. Room code is an invitation, not an account. Expired or intentional departure resets the shared task; transient reconnect preserves it. No chat or public matchmaking.",
    movement: "Cooperative board",
    you: "you",
    before: "Before repair",
    after: "After repair",
    cooldown: "Preparing the next action…",
  },
  lt: {
    open: "Bendradarbiavimo bandymas",
    title: "Du inžinieriai · viena grandinė",
    create: "Sukurti privatų kambarį",
    join: "Prisijungti",
    code: "Kambario kodas",
    close: "Grįžti į nuotykį",
    leave: "Išeiti iš kambario",
    connected: "Prisijungta",
    reconnecting: "Jungiamasi iš naujo · vieta saugoma 20 sekundžių",
    closed: "Atsijungta",
    failed:
      "Prisijungti nepavyko. Paleisk vietinį serverį arba patikrink kodą ir laisvas vietas.",
    analyst: "Analitikas",
    engineer: "Inžinierius",
    waiting: "Laukiama partnerio",
    range: "Prieš veikdamas įeik į T1 žiedą.",
    help: "Atskiras vietinis bandymas: pirmiausia projekto šaltinių aplanke paleisk pnpm dev:server; demonstracijos paleidiklis jo nepaleidžia. Atverk du vietinius naršyklės langus. Pasirink plokštę ir judėk WASD arba rodyklėmis. Dirbk ne toliau kaip 5 m nuo T1. Abu žaidėjai turi būti prisijungę. Analitikas matuoja VCC, nustato gedimą ir tikrina; inžinierius matuoja SENSE ir remontuoja. Vienas žaidėjas užbaigti negali.",
    measure: "Matuoti",
    diagnose: "Nustatyti R1 nutrūkimą",
    repair: "Atkurti R1",
    verify: "Patvirtinti bendrą remontą",
    complete: "Bendra grandinė atkurta",
    fault: "R1 nutrūkęs",
    restored: "R1 atkurtas · patikrink abu taškus",
    identified: "R1 gedimas nustatytas",
    evidence: "Bendri matavimai",
    notMeasured: "Neišmatuota",
    online: "prisijungęs",
    offline: "jungiasi iš naujo",
    reconnect: "Atkurti ryšį",
    limits:
      "Privatus vietinis bandymas. Kambario kodas yra kvietimas, o ne paskyra. Išėjus ar pasibaigus laikui bendra užduotis atkuriama; trumpai nutrūkus ryšiui ji išlieka. Be pokalbių ir viešos paieškos.",
    movement: "Bendra plokštė",
    you: "tu",
    before: "Prieš remontą",
    after: "Po remonto",
    cooldown: "Ruošiamas kitas veiksmas…",
  },
};
export const pilotCopy = copy;
export function PilotPanel({
  language,
  onClose,
}: {
  language: Language;
  onClose: () => void;
}) {
  const t = copy[language],
    connection = useRef<Room | null>(null),
    keys = useRef(new Set<string>()),
    seq = useRef(0),
    alive = useRef(true),
    generation = useRef(0),
    revision = useRef(-1);
  const actionTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const actionPending = useRef(false);
  const [cooldown, setCooldown] = useState(false);
  const [state, setState] = useState<PilotState | null>(null),
    [id, setId] = useState(""),
    [code, setCode] = useState(""),
    [status, setStatus] = useState("closed"),
    [error, setError] = useState(false),
    [busy, setBusy] = useState(false);
  const send = (c: { type: string } & Record<string, unknown>) => {
    const action = c.type !== "move";
    if (action && actionPending.current) return;
    if (connection.current?.connection.isOpen) {
      connection.current.send("command", { ...c, sequence: ++seq.current });
      if (action) {
        // Keep ordinary UI actions outside the authority's 120 ms rate window.
        actionPending.current = true;
        setCooldown(true);
        actionTimer.current = setTimeout(() => {
          actionPending.current = false;
          setCooldown(false);
        }, 200);
      }
    }
  };
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      generation.current++;
      clearTimeout(actionTimer.current);
      void connection.current?.leave();
    };
  }, []);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (
        ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(
          (e.target as HTMLElement)?.tagName,
        )
      )
        return;
      if (
        [
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
        ].includes(e.code)
      ) {
        e.preventDefault();
        keys.current.add(e.code);
      }
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.code);
    const blur = () => {
      keys.current.clear();
      send({ type: "move", x: 0, z: 0 });
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    const timer = setInterval(() => {
      const k = keys.current;
      send({
        type: "move",
        x:
          Number(k.has("KeyD") || k.has("ArrowRight")) -
          Number(k.has("KeyA") || k.has("ArrowLeft")),
        z:
          Number(k.has("KeyS") || k.has("ArrowDown")) -
          Number(k.has("KeyW") || k.has("ArrowUp")),
      });
    }, 50);
    return () => {
      clearInterval(timer);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);
  const connect = async (join: boolean) => {
    const attempt = ++generation.current;
    setBusy(true);
    setError(false);
    revision.current = -1;
    seq.current = 0;
    try {
      const room = await connectRoom(
        join ? code : undefined,
        (s, playerId) => {
          if (
            !alive.current ||
            generation.current !== attempt ||
            s.revision < revision.current
          )
            return;
          revision.current = s.revision;
          setState(s);
          setId(playerId);
          seq.current = Math.max(
            seq.current,
            s.players.find((p) => p.id === playerId)?.sequence ?? 0,
          );
        },
        (s) => {
          if (alive.current && generation.current === attempt) {
            if (s !== "connected") keys.current.clear();
            setStatus(s);
          }
        },
      );
      if (!alive.current || generation.current !== attempt) {
        void room.leave();
        return;
      }
      connection.current = room;
      setCode(room.roomId);
    } catch {
      if (alive.current && generation.current === attempt) setError(true);
    } finally {
      if (alive.current && generation.current === attempt) setBusy(false);
    }
  };
  const me = state?.players.find((p) => p.id === id),
    repaired = state?.mission.repair.r1 === "restored",
    connectedReady =
      state?.players.length === 2 &&
      state.players.every((p) => p.connected) &&
      status === "connected";
  const near =
    !!me &&
    Math.hypot(me.explorer.position.x, me.explorer.position.z + 18) <= 5 &&
    Math.abs(me.explorer.position.y) <= 2;
  const ready = connectedReady && near && !cooldown;
  const readings = repaired
    ? state?.mission.repair.readings
    : state?.mission.diagnosis?.readings;
  const coordinate = (n: number) =>
    new Intl.NumberFormat(language === "lt" ? "lt-LT" : "en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  const format = (n: number) => coordinate(n) + " V";
  return (
    <section
      className="workbench pilot"
      role="dialog"
      aria-modal="true"
      aria-label={t.open}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
          return;
        }
        if (e.key === "Tab") {
          const items = Array.from(
            e.currentTarget.querySelectorAll<HTMLElement>(
              "button:not(:disabled),input,svg",
            ),
          );
          if (e.shiftKey && document.activeElement === items[0]) {
            e.preventDefault();
            items.at(-1)?.focus();
          } else if (!e.shiftKey && document.activeElement === items.at(-1)) {
            e.preventDefault();
            items[0]?.focus();
          }
        }
      }}
    >
      <header>
        <h2>{t.title} · M5</h2>
        <button autoFocus onClick={onClose}>
          {t.close}
        </button>
      </header>
      <p>{t.help}</p>
      <p>{t.limits}</p>
      {!connection.current ? (
        <>
          <label>
            {t.code}
            <input
              maxLength={32}
              value={code}
              onChange={(e) => setCode(e.target.value.trim())}
            />
          </label>
          <button disabled={busy} onClick={() => void connect(false)}>
            {t.create}
          </button>
          <button
            disabled={busy || !/^[A-Za-z0-9_-]{6,32}$/.test(code)}
            onClick={() => void connect(true)}
          >
            {t.join}
          </button>
        </>
      ) : (
        <>
          <p>
            {t.code}: <output aria-label={t.code}>{code}</output>
          </p>
          <p role="status">
            {status === "connected"
              ? t.connected
              : status === "reconnecting"
                ? t.reconnecting
                : t.closed}
          </p>
          <button
            disabled={status !== "connected"}
            onClick={() =>
              connection.current?.connection.close(CloseCode.MAY_TRY_RECONNECT)
            }
          >
            {t.reconnect}
          </button>
          <button
            onClick={() => {
              generation.current++;
              void connection.current?.leave();
              connection.current = null;
              keys.current.clear();
              setState(null);
              setStatus("closed");
            }}
          >
            {t.leave}
          </button>
        </>
      )}
      {error && <p role="alert">{t.failed}</p>}
      {state && (
        <>
          <ul>
            {state.players.map((p) => (
              <li key={p.id}>
                {p.role === "analyst" ? t.analyst : t.engineer}{" "}
                {p.id === id ? "(" + t.you + ")" : ""} ·{" "}
                {p.connected ? t.online : t.offline} ·{" "}
                <output aria-label={p.role + " position"}>
                  {coordinate(p.explorer.position.x)};{" "}
                  {coordinate(p.explorer.position.z)}
                </output>
              </li>
            ))}
          </ul>
          {!connectedReady ? (
            <p>{t.waiting}</p>
          ) : !near ? (
            <p>{t.range}</p>
          ) : null}
          <svg
            tabIndex={0}
            role="img"
            aria-label={t.movement}
            viewBox="-24 -40 48 80"
            className="pilot-board"
            onBlur={() => {
              keys.current.clear();
              send({ type: "move", x: 0, z: 0 });
            }}
          >
            <rect x="-24" y="-40" width="48" height="80" fill="#17665c" />
            <path d="M0 -35V35M-18 -18H18" stroke="#dfb96d" strokeWidth=".5" />
            <rect x="-4.5" y="-28.5" width="9" height="7" fill="#23313e" />
            <text x="-3" y="-24" fontSize="2" fill="white">
              U1
            </text>
            <circle
              cx="0"
              cy="-18"
              r="5"
              fill="none"
              stroke="#d7ee91"
              strokeDasharray="1 1"
            />
            <rect
              x="-1.2"
              y="-18.7"
              width="2.4"
              height="1.4"
              fill={
                state.mission.repair.completed
                  ? "#83f2ad"
                  : repaired
                    ? "#f3c85c"
                    : "#23313e"
              }
            />
            <text x="2" y="-18" fontSize="2" fill="white">
              T1
            </text>
            {components
              .filter((c) => !["T1", "U1"].includes(c.id))
              .map((c) => (
                <g key={c.id}>
                  <circle cx={c.x} cy={c.z} r="2" fill="#b6cbd0" />
                  <text x={c.x + 2} y={c.z} fontSize="2" fill="white">
                    {c.id}
                  </text>
                </g>
              ))}
            {state.players.map((p) => (
              <g key={p.id} opacity={p.connected ? 1 : 0.35}>
                <circle
                  cx={p.explorer.position.x}
                  cy={p.explorer.position.z}
                  r="1.4"
                  fill={p.role === "analyst" ? "#f3c85c" : "#5cacc2"}
                />
                <text
                  x={p.explorer.position.x + 1.2}
                  y={p.explorer.position.z}
                  fontSize="2.2"
                  fill="white"
                >
                  {p.role === "analyst" ? "A" : "E"}
                </text>
              </g>
            ))}
          </svg>
          <h3>
            {state.mission.repair.completed
              ? t.complete
              : repaired
                ? t.restored
                : state.mission.diagnosis?.outcome === "identified"
                  ? t.identified
                  : t.fault}
          </h3>
          <p role="status">
            {cooldown && !state.mission.repair.completed ? t.cooldown : ""}
          </p>
          <h4>
            {t.evidence} · {repaired ? t.after : t.before}
          </h4>
          {["VCC", "SENSE"].map((p) => (
            <p key={p}>
              {p}:{" "}
              <output aria-label={"Shared " + p}>
                {Object.hasOwn(readings ?? {}, p)
                  ? format(readings![p])
                  : t.notMeasured}
              </output>
            </p>
          ))}
          {me && (
            <>
              <button
                disabled={
                  !ready ||
                  Object.hasOwn(
                    readings ?? {},
                    me.role === "analyst" ? "VCC" : "SENSE",
                  ) ||
                  state.mission.repair.completed
                }
                onClick={() =>
                  send({
                    type: "measure",
                    target: me.role === "analyst" ? "VCC" : "SENSE",
                  })
                }
              >
                {t.measure} {me.role === "analyst" ? "VCC" : "SENSE"}
              </button>
              {me.role === "analyst" ? (
                <>
                  <button
                    disabled={
                      !ready ||
                      !Object.hasOwn(
                        state.mission.diagnosis?.readings ?? {},
                        "VCC",
                      ) ||
                      !Object.hasOwn(
                        state.mission.diagnosis?.readings ?? {},
                        "SENSE",
                      ) ||
                      state.mission.diagnosis?.outcome === "identified"
                    }
                    onClick={() => send({ type: "diagnose", fault: "r1-open" })}
                  >
                    {t.diagnose}
                  </button>
                  {(["r2-open", "source-off"] as const).map((fault) => (
                    <button
                      key={fault}
                      disabled={
                        !ready ||
                        repaired ||
                        state.mission.diagnosis?.outcome === "identified" ||
                        !Object.hasOwn(
                          state.mission.diagnosis?.readings ?? {},
                          "VCC",
                        ) ||
                        !Object.hasOwn(
                          state.mission.diagnosis?.readings ?? {},
                          "SENSE",
                        )
                      }
                      onClick={() => send({ type: "diagnose", fault })}
                    >
                      {diagnosisCopy[language].faults[fault]}
                    </button>
                  ))}
                  {state.mission.diagnosis?.outcome === "incorrect" && (
                    <p role="status">{diagnosisCopy[language].incorrect}</p>
                  )}
                  <button
                    disabled={
                      !ready ||
                      !repaired ||
                      state.mission.repair.completed ||
                      !Object.hasOwn(readings ?? {}, "VCC") ||
                      !Object.hasOwn(readings ?? {}, "SENSE")
                    }
                    onClick={() => send({ type: "verify" })}
                  >
                    {t.verify}
                  </button>
                </>
              ) : (
                <button
                  disabled={
                    !ready ||
                    state.mission.diagnosis?.outcome !== "identified" ||
                    repaired
                  }
                  onClick={() => send({ type: "repair" })}
                >
                  {t.repair}
                </button>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
