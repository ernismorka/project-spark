import { expect, it } from "vitest";
import { repairCopy } from "../repair-i18n";
import { diagnosisCopy } from "../diagnosis-i18n";
it("provides matching English/Lithuanian repair controls and scoped explanations", () => {
  expect(Object.keys(repairCopy.lt).sort()).toEqual(
    Object.keys(repairCopy.en).sort(),
  );
  for (const language of ["en", "lt"] as const)
    for (const text of Object.values(repairCopy[language]))
      expect(text.trim().length).toBeGreaterThan(0);
  expect(repairCopy.en.explanation).toContain("half of VCC");
  expect(repairCopy.lt.explanation).toContain("pusei VCC");
  expect(repairCopy.en.success).toContain("does not prove MCU");
  expect(repairCopy.lt.success).toContain("nepatvirtina mikrovaldiklio");
  expect(diagnosisCopy.en.reference).toContain("2.50 V");
  expect(diagnosisCopy.lt.reference).toContain("2,50 V");
});
