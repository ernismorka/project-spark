import type { Language } from "@spark/shared";
import type { EpisodeStage } from "@spark/game-core";
type Copy = {
  intro: string;
  practice: string;
  missionScope: string;
  continue: string;
  activate: string;
  complete: string;
  success: string;
  world: string;
  stages: Record<EpisodeStage, string>;
  tasks: Record<EpisodeStage, string>;
};
const en: Copy = {
  intro:
    "Restore this device in one episode: explore, diagnose and verify its DC repair, then build and program the terminal controller before activation.",
  practice:
    "Title workbench is independent practice. Episode construction unlocks at T1 after verified repair; practice does not award mission progress.",
  missionScope:
    "This commissioning network is separate from the verified diagnostic divider. Accepted circuit/program edits persist when you close this panel. Edits invalidate affected proof. OUT and the final device display are abstract status responses, not MCU or LED physics. Replay/end/reload reset the episode.",
  continue: "Continue at T1: construction and programming",
  activate: "Activate device",
  complete: "Device activated · episode complete",
  success:
    "You explored the board, diagnosed and verified R1, built the parallel branch and commissioned a bounded controller. The service display is now active. Replay starts a fresh fault and clears all commissioning evidence.",
  world: "Device active · controller commissioning verified",
  stages: {
    exploration: "Explore the PCB",
    diagnosis: "Diagnose and verify R1",
    construction: "Build the terminal circuit",
    programming: "Commission the controller",
    activation: "Activate at T1",
    complete: "Episode complete",
  },
  tasks: {
    exploration: "Follow the beacon and learn the components to reach T1.",
    diagnosis:
      "First measure, identify R1, restore its connection and verify both fresh measurements. Construction stays locked until verification.",
    construction:
      "Repair verified. Next, connect R3 = 1 kΩ from SENSE to GND. Keep READ SENSE / ABOVE 2 / WRITE OUT and run to record the lower voltage and OFF response. Programming unlocks after this proof.",
    programming:
      "Construction proven. Change the program to READ SENSE / ABOVE 1 / WRITE OUT using blocks or text, then run. The same solved voltage should now produce ON.",
    activation:
      "Controller run accepted. Return to the terminal report and choose Activate device. Current circuit and program will be checked again.",
    complete:
      "All episode objectives are complete. View the active service display or replay.",
  },
};
const lt: Copy = {
  intro:
    "Atkurk įrenginį viename epizode: tyrinėk, nustatyk gedimą ir patvirtink nuolatinės srovės grandinės remontą, tada sukonstruok ir suprogramuok terminalo valdiklį prieš aktyvindamas.",
  practice:
    "Pradžios dirbtuvė skirta atskirai praktikai. Epizodo konstravimas atrakinamas T1 po patvirtinto remonto; praktika užduoties pažangos nesuteikia.",
  missionScope:
    "Ši parengimo grandinė atskira nuo patikrinto diagnostinio daliklio. Priimti grandinės ir programos pakeitimai išlieka uždarius šį langą. Pakeitimai panaikina susijusį patvirtinimą. OUT ir galutinis ekranas yra abstraktūs būsenos indikatoriai, o ne mikrovaldiklio ar diodo fizika. Pakartojus, baigus sesiją ar perkrovus epizodas atkuriamas.",
  continue: "Tęsti T1: konstravimas ir programavimas",
  activate: "Aktyvinti įrenginį",
  complete: "Įrenginys aktyvintas · epizodas užbaigtas",
  success:
    "Ištyrinėjai plokštę, nustatei ir patvirtinai R1 remontą, pridėjai lygiagrečią šaką ir parengei ribotą valdiklį. Aptarnavimo ekranas aktyvus. Pakartojus atkuriamas gedimas ir išvalomi parengimo įrodymai.",
  world: "Įrenginys aktyvus · valdiklio parengimas patvirtintas",
  stages: {
    exploration: "Tyrinėk plokštę",
    diagnosis: "Nustatyk ir patvirtink R1",
    construction: "Konstruok terminalo grandinę",
    programming: "Parenk valdiklį",
    activation: "Aktyvink per T1",
    complete: "Epizodas užbaigtas",
  },
  tasks: {
    exploration:
      "Sek švyturiu ir susipažink su komponentais, kad pasiektum T1.",
    diagnosis:
      "Pirmiausia išmatuok, nustatyk R1 gedimą, atkurk jungtį ir patvirtink abu naujus matavimus. Konstravimas lieka užrakintas iki patvirtinimo.",
    construction:
      "Remontas patvirtintas. Prijunk R3 = 1 kΩ tarp SENSE ir GND. Palik READ SENSE / ABOVE 2 / WRITE OUT ir vykdyk, kad užfiksuotum mažesnę įtampą bei IŠJUNGTA būseną. Tada bus atrakintas programavimas.",
    programming:
      "Konstravimas patvirtintas. Blokais ar tekstu pakeisk programą į READ SENSE / ABOVE 1 / WRITE OUT ir vykdyk. Ta pati apskaičiuota įtampa dabar turi duoti ĮJUNGTA būseną.",
    activation:
      "Valdiklio vykdymas priimtas. Grįžk į terminalo ataskaitą ir pasirink Aktyvinti įrenginį. Dabartinė grandinė ir programa bus patikrintos dar kartą.",
    complete:
      "Visos epizodo užduotys atliktos. Apžiūrėk aktyvų ekraną arba pakartok.",
  },
};
export const episodeCopy: Record<Language, Copy> = { en, lt };
