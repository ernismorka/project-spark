import type { Language, DiagnosisFault } from "@spark/shared";
const en = {
  title: "Follow the voltage",
  open: "Open terminal diagnostics",
  close: "Back to First Contact",
  scope: "DC training model · resistor network only",
  intro:
    "The controller terminal includes a small training network. Measure both test points relative to GND, then identify its single fault. This is not a simulation of the microcontroller itself.",
  reference:
    "Healthy reference: VCC 5.00 V, SENSE 2.50 V. R1 and R2 are nominally 1 kΩ. An open resistor passes no current.",
  measure: "Measure",
  unmeasured: "Not measured",
  evidence: "Test-point voltages relative to GND",
  hypothesis: "Which fault explains these readings?",
  need: "Collect both voltage readings before choosing a fault.",
  incorrect:
    "That fault does not explain both readings. Compare VCC and SENSE with the healthy reference, then try another explanation.",
  identified: "Fault identified: R1 is open.",
  explanation:
    "VCC is still 5 V, but SENSE is pulled to 0 V through R2 because R1 no longer connects it to the supply. In this ideal model, both resistor currents are zero. Diagnosis is complete; no repair has been performed.",
  limits:
    "Steady-state ideal DC only. No LED/capacitor behavior or MCU execution.",
  faults: {
    "r1-open": "R1 is open",
    "r2-open": "R2 is open",
    "source-off": "The source is at 0 V",
  },
};
const lt: typeof en = {
  title: "Sek įtampą",
  open: "Atverti terminalo diagnostiką",
  close: "Grįžti į pirmąjį kontaktą",
  scope: "Nuolatinės srovės mokomasis modelis · tik rezistoriai",
  intro:
    "Valdiklio terminale yra maža mokomoji grandinė. Išmatuok abiejų taškų įtampą GND atžvilgiu ir nustatyk vienintelį gedimą. Tai nėra paties mikrovaldiklio simuliacija.",
  reference:
    "Tvarkingos grandinės etalonas: VCC 5,00 V, SENSE 2,50 V. R1 ir R2 vardinė varža yra 1 kΩ. Per nutrūkusį rezistorių srovė neteka.",
  measure: "Matuoti",
  unmeasured: "Neišmatuota",
  evidence: "Taškų įtampos GND atžvilgiu",
  hypothesis: "Kuris gedimas paaiškina rodmenis?",
  need: "Prieš pasirinkdamas gedimą surink abu įtampos rodmenis.",
  incorrect:
    "Šis gedimas nepaaiškina abiejų rodmenų. Palygink VCC ir SENSE su tvarkingos grandinės etalonu ir bandyk kitą paaiškinimą.",
  identified: "Gedimas nustatytas: R1 nutrūkęs.",
  explanation:
    "VCC tebėra 5 V, bet R2 palaiko SENSE ties 0 V, nes R1 nebesujungia šio taško su maitinimu. Šiame idealiame modelyje srovė per abu rezistorius lygi nuliui. Diagnostika baigta; remontas neatliktas.",
  limits:
    "Tik idealus nuolatinės srovės režimas. Be šviesos diodų, kondensatorių ar mikrovaldiklio veikimo.",
  faults: {
    "r1-open": "R1 nutrūkęs",
    "r2-open": "R2 nutrūkęs",
    "source-off": "Šaltinio įtampa 0 V",
  },
};
export const diagnosisCopy: Record<Language, typeof en> = { en, lt };
export const faultChoices: readonly DiagnosisFault[] = [
  "r1-open",
  "r2-open",
  "source-off",
];
