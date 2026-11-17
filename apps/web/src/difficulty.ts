export const difficulties = ["apprentice", "technician", "engineer"] as const;
export type Difficulty = (typeof difficulties)[number];
const key = "project-spark:difficulty";

export function readDifficulty(): Difficulty {
  try {
    const saved = localStorage.getItem(key);
    return difficulties.find((value) => value === saved) ?? "technician";
  } catch {
    return "technician";
  }
}

export function saveDifficulty(difficulty: Difficulty) {
  try {
    localStorage.setItem(key, difficulty);
  } catch {
    // The current session still uses the selection when storage is unavailable.
  }
}

export const difficultyCopy = {
  en: {
    label: "Difficulty",
    apprentice: "Apprentice (Easy)",
    technician: "Technician (Normal)",
    engineer: "Engineer (Hard)",
    exploration: [
      "Leave the pad",
      "Inspect R1",
      "Identify a component",
      "Reach U1",
      "Use T1",
      "First Contact complete",
    ],
    detailed: [
      "Walk along the copper trace toward the beacon. Use WASD to move.",
      "Approach the striped resistor and use E to inspect it.",
      "Find the blue capacitor and use F to identify it.",
      "Follow the beacon toward the large black microcontroller.",
      "Approach the blue-screen terminal and use E.",
      "First Contact complete",
    ],
    field: {
      collect: "Collect evidence.",
      located: "Repair the trace.",
      recheck: "Verify the repair.",
      verified: "Report to T1.",
    },
    probeHelp:
      "Walk up to each highlighted pad and press Q. Compare all three readings in the notebook.",
    repairHelp:
      "Follow the highlighted junction. Press Q beside the gap, then revisit each pad.",
    incorrect: "Diagnosis rejected.",
    terminal: "Investigate the fault.",
    commissioning: {
      construction:
        "Prove the 1 kΩ SENSE–GND branch with the default controller.",
      programming: "Prove OUT is ON with ABOVE 1.",
      activation: "Activate at T1.",
    },
  },
  lt: {
    label: "Sudėtingumas",
    apprentice: "Mokinys (lengvas)",
    technician: "Technikas (įprastas)",
    engineer: "Inžinierius (sunkus)",
    exploration: [
      "Palik pradinę aikštelę",
      "Apžiūrėk R1",
      "Atpažink komponentą",
      "Pasiek U1",
      "Naudok T1",
      "Pirmasis kontaktas baigtas",
    ],
    detailed: [
      "Eik vario takeliu švyturio link. Judėk klavišais WASD.",
      "Prieik prie dryžuoto rezistoriaus ir apžiūrėk jį klavišu E.",
      "Rask mėlyną kondensatorių ir atpažink jį klavišu F.",
      "Sek švyturiu link didelio juodo mikrovaldiklio.",
      "Prieik prie terminalo su mėlynu ekranu ir paspausk E.",
      "Pirmasis kontaktas baigtas",
    ],
    field: {
      collect: "Surink matavimus.",
      located: "Sujunk takelį.",
      recheck: "Patikrink remontą.",
      verified: "Grįžk į T1.",
    },
    probeHelp:
      "Prieik prie kiekvieno pažymėto taško ir paspausk Q. Palygink visus tris rodmenis užrašuose.",
    repairHelp:
      "Sek pažymėta jungtimi. Prie trūkio paspausk Q, tada vėl aplankyk matavimo taškus.",
    incorrect: "Diagnozė atmesta.",
    terminal: "Ištirk gedimą.",
    commissioning: {
      construction: "Patikrink 1 kΩ SENSE–GND šaką pradine programa.",
      programming: "Patvirtink, kad su ABOVE 1 išvestis OUT įjungta.",
      activation: "Aktyvink per T1.",
    },
  },
} as const;
