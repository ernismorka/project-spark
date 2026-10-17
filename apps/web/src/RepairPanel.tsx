import { diagnosticPoints } from "@spark/game-core";
import type { ExplorationCommand, Language, Session } from "@spark/shared";
import { repairCopy } from "./repair-i18n";
import { diagnosisCopy } from "./diagnosis-i18n";
export function RepairPanel({
  session,
  language,
  dispatch,
}: {
  session: Session;
  language: Language;
  dispatch: (c: ExplorationCommand) => void;
}) {
  const t = repairCopy[language];
  const repaired = session.repair.r1 === "restored";
  const ready = diagnosticPoints.every((p) =>
    Object.hasOwn(session.repair.readings, p),
  );
  const format = (v: number) =>
    new Intl.NumberFormat(language === "lt" ? "lt-LT" : "en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v) + " V";
  return (
    <section className="repair-panel" aria-label={t.title}>
      <h3>{t.title}</h3>
      <p>{t.intro}</p>
      {!repaired ? (
        <>
          <p>{t.action}</p>
          <button
            className="primary"
            onClick={() => dispatch({ type: "repair-r1", target: "R1" })}
          >
            {t.repair}
          </button>
        </>
      ) : (
        <>
          <p role="status">{t.repaired}</p>
          <p>{t.explanation}</p>
          <table>
            <caption>{diagnosisCopy[language].evidence}</caption>
            <thead>
              <tr>
                <th scope="col"> </th>
                <th scope="col">{t.before}</th>
                <th scope="col">{t.after}</th>
              </tr>
            </thead>
            <tbody>
              {diagnosticPoints.map((p) => (
                <tr key={p}>
                  <th scope="row">{p}</th>
                  <td>{format(session.diagnosis!.readings[p])}</td>
                  <td>
                    <output aria-label={p + " after V"}>
                      {Object.hasOwn(session.repair.readings, p)
                        ? format(session.repair.readings[p])
                        : diagnosisCopy[language].unmeasured}
                    </output>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="fault-options">
            {diagnosticPoints.map((p) => (
              <button
                key={p}
                disabled={
                  Object.hasOwn(session.repair.readings, p) ||
                  session.repair.completed
                }
                onClick={() => dispatch({ type: "measure-repair", target: p })}
              >
                {t.measure} {p}
              </button>
            ))}
          </div>
          {!session.repair.completed && (
            <>
              <p>{ready ? t.pending : t.need}</p>
              <button
                className="primary"
                disabled={!ready}
                onClick={() => dispatch({ type: "verify-repair" })}
              >
                {t.verify}
              </button>
            </>
          )}
          {session.repair.completed && (
            <div className="diagnosis-feedback success" role="status">
              <h3>{t.complete}</h3>
              <p>{t.success}</p>
              <p>{t.world}</p>
            </div>
          )}
        </>
      )}
      <p className="model-limits">{t.reset}</p>
    </section>
  );
}
