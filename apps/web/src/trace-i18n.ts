import type { TraceMessage, TraceStage } from "@spark/game-core";

const en = {
  title: "Feed trace repair",
  surface: "Tool work area",
  controls:
    "Aim with the pointer or arrow keys. Hold to work. Keyboard: hold Space, then release.",
  close: "Leave work area",
  off: "Switch power off",
  on: "Restore power",
  continuity: "Test continuity",
  live: "POWER ON",
  isolated: "POWER OFF",
  heat: "Joint heat",
  target: "Target range",
  contacts: "Contacts",
  routeProgress: "Route anchors",
  guide:
    "Use the highlighted areas. When heating, release while the gauge is in range.",
  steps: {
    isolate: [
      "Isolate the circuit",
      "Switch the board supply off before touching the trace.",
    ],
    expose: [
      "Expose copper",
      "Hold the scraper on each end to remove its coating.",
    ],
    clean: ["Clean the copper", "Hold the cleaning swab on both exposed ends."],
    flux: ["Apply flux", "Touch the applicator to both cleaned ends."],
    tin: [
      "Tin both ends",
      "Hold the iron steady and lift it when the heat gauge enters the target range.",
    ],
    prepare: ["Prepare the jumper", "Hold the cutter on the wire in the tray."],
    route: [
      "Route the jumper",
      "Start at the upper pad, pass through the guide on the right, then reach the lower pad.",
    ],
    solder: [
      "Solder both joints",
      "Hold the iron on one joint. Lift in the target range and repeat for the other.",
    ],
    rinse: [
      "Clean the joints",
      "Use the swab at both joints to clear the flux residue.",
    ],
    continuity: [
      "Verify continuity",
      "Use the meter’s continuity check while the supply is off.",
    ],
    seal: ["Seal the joints", "Apply the protective finish over both joints."],
    restore: [
      "Restore power",
      "Switch power on, then leave for the three voltage measurements.",
    ],
    done: ["Repair sealed", "Measure all three pads again."],
  } satisfies Record<TraceStage, [string, string]>,
  messages: {
    ready: "Ready",
    "power-off":
      "Supply isolated. The trace is safe to work on in this simulation.",
    "power-on": "Power restored. Take fresh voltage readings.",
    "need-power-off": "Switch the supply off first.",
    "keep-isolated":
      "Keep the supply off until continuity is verified and the joints are sealed.",
    miss: "Off target. Reposition the tool on the exposed area.",
    lifted: "Contact was short or interrupted. Try again on the same end.",
    hot: "Too hot. Lift the iron and retry this joint.",
    release: "In range. Lift the iron now.",
    "contact-good": "Contact complete.",
    "route-order":
      "Route from the upper pad through the guide before the lower pad.",
    "continuity-open": "Open circuit. Finish both joints and test again.",
    "clean-first": "Clean both joints before recording the continuity check.",
    "continuity-pass": "Continuity confirmed with the supply off.",
  } satisfies Record<TraceMessage, string>,
};

const lt: typeof en = {
  title: "Maitinimo takelio remontas",
  surface: "Įrankio darbo sritis",
  controls:
    "Nukreipk pele arba rodyklėmis. Laikyk nuspaudęs, kad dirbtum. Klaviatūra: laikyk tarpo klavišą, tada atleisk.",
  close: "Palikti darbo sritį",
  off: "Išjungti maitinimą",
  on: "Įjungti maitinimą",
  continuity: "Tikrinti grandinės vientisumą",
  live: "MAITINIMAS ĮJUNGTAS",
  isolated: "MAITINIMAS IŠJUNGTAS",
  heat: "Jungties kaitra",
  target: "Tikslinis diapazonas",
  contacts: "Kontaktai",
  routeProgress: "Laido taškai",
  steps: {
    isolate: [
      "Atjunk maitinimą",
      "Prieš liesdamas takelį išjunk plokštės maitinimą.",
    ],
    expose: [
      "Atidenk varį",
      "Laikyk grandiklį ant abiejų galų, kad pašalintum dangą.",
    ],
    clean: [
      "Nuvalyk varį",
      "Palaikyk valymo tamponą prie abiejų atidengtų galų.",
    ],
    flux: ["Užtepk fliuso", "Priliesk aplikatoriumi abu nuvalytus galus."],
    tin: [
      "Alavuok galus",
      "Laikyk lituoklį stabiliai ir pakelk jį, kai rodmuo pasieks tinkamą diapazoną.",
    ],
    prepare: [
      "Paruošk jungiamąjį laidą",
      "Palaikyk žnyples prie laido padėkle.",
    ],
    route: [
      "Nutiesk laidą",
      "Pradėk viršuje, vesk per kreipiklį dešinėje ir užbaik apačioje.",
    ],
    solder: [
      "Sulituok abi jungtis",
      "Palaikyk lituoklį prie jungties. Pakelk tinkamame diapazone ir pakartok kitoje pusėje.",
    ],
    rinse: [
      "Nuvalyk jungtis",
      "Tamponu pašalink fliuso likučius nuo abiejų jungčių.",
    ],
    continuity: [
      "Patikrink vientisumą",
      "Vientisumą tikrink matuokliu, kai maitinimas išjungtas.",
    ],
    seal: ["Apsaugok jungtis", "Padenk abi jungtis apsaugine danga."],
    restore: [
      "Įjunk maitinimą",
      "Įjunk maitinimą, tada išmatuok įtampą visuose trijuose taškuose.",
    ],
    done: [
      "Jungtys apsaugotos",
      "Dar kartą išmatuok įtampą visuose trijuose taškuose.",
    ],
  },
  guide:
    "Dirbk pažymėtose vietose. Kaitindamas atleisk, kai rodmuo bus tinkamame diapazone.",
  messages: {
    ready: "Paruošta",
    "power-off":
      "Maitinimas atjungtas. Šiame modelyje galima dirbti prie takelio.",
    "power-on": "Maitinimas įjungtas. Atlik naujus įtampos matavimus.",
    "need-power-off": "Pirmiausia išjunk maitinimą.",
    "keep-isolated":
      "Maitinimą laikyk išjungtą, kol patikrinsi vientisumą ir apsaugosi jungtis.",
    miss: "Įrankis ne vietoje. Perkelk jį į atidengtą sritį.",
    lifted:
      "Kontaktas per trumpas arba nutrūko. Bandyk dar kartą toje pačioje vietoje.",
    hot: "Per karšta. Pakelk lituoklį ir bandyk dar kartą.",
    release: "Tinkamas diapazonas. Dabar pakelk lituoklį.",
    "contact-good": "Kontaktas apdorotas.",
    "route-order": "Vesk laidą iš viršaus per kreipiklį į apatinį tašką.",
    "continuity-open":
      "Grandinė nutrūkusi. Užbaik abi jungtis ir tikrink dar kartą.",
    "clean-first":
      "Nuvalyk abi jungtis prieš registruodamas vientisumo patikrą.",
    "continuity-pass": "Vientisumas patvirtintas išjungus maitinimą.",
  },
};

export const traceCopy = { en, lt };
