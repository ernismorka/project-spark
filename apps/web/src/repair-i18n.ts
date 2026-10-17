import type { Language } from "@spark/shared";
export const repairCopy = {
  en: {
    view: "View restored board",
    report: "Return to terminal report",
    title: "The Dark Circuit",
    intro:
      "Restore the terminal's failed DC training network. Diagnose, reconnect R1, then measure again to prove the repair.",
    repair: "Restore R1 connection",
    repaired: "R1 connection restored. Verification required.",
    action:
      "The terminal service tool reconnects the open R1 branch at its nominal resistance. No other component is changed.",
    before: "Before repair",
    after: "After repair",
    measure: "Remeasure",
    verify: "Verify repair",
    need: "Measure both points again before verifying.",
    explanation:
      "Reconnecting R1 closes the current path through R1 and R2. Equal resistances divide the supply equally: SENSE returns to half of VCC. These readings are recalculated by the DC solver.",
    complete: "The Dark Circuit complete",
    success:
      "You diagnosed R1 using evidence, restored its connection and verified the divider. The green terminal beacon confirms this DC training network is healthy. It does not prove MCU firmware or LED operation.",
    pending:
      "The terminal beacon is amber: connection restored, measurements still need verification.",
    world: "Terminal status: green — circuit verified",
    restart: "Replay The Dark Circuit",
    reset:
      "Replay resets exploration, the R1 fault, evidence and completion. Progress is kept only in this session; reloading or ending the session starts over.",
  },
  lt: {
    view: "Apžiūrėti atkurtą plokštę",
    report: "Grįžti į terminalo ataskaitą",
    title: "Tamsioji grandinė",
    intro:
      "Atkurk sugedusią terminalo nuolatinės srovės mokomąją grandinę. Nustatyk gedimą, atkurk R1 jungtį ir matavimais patvirtink remontą.",
    repair: "Atkurti R1 jungtį",
    repaired: "R1 jungtis atkurta. Reikia patikros.",
    action:
      "Terminalo remonto įrankis sujungia nutrūkusią R1 šaką su vardine varža. Kiti komponentai nekeičiami.",
    before: "Prieš remontą",
    after: "Po remonto",
    measure: "Matuoti iš naujo",
    verify: "Patvirtinti remontą",
    need: "Prieš patvirtindamas iš naujo išmatuok abu taškus.",
    explanation:
      "Atkūrus R1 jungtį, srovės kelias per R1 ir R2 užsidaro. Vienodos varžos padalija maitinimo įtampą pusiau: SENSE įtampa lygi pusei VCC. Šiuos rodmenis iš naujo apskaičiuoja nuolatinės srovės sprendiklis.",
    complete: "Tamsioji grandinė užbaigta",
    success:
      "Remdamasis matavimais nustatei R1 gedimą, atkūrei jungtį ir patikrinai daliklį. Žalias terminalo švyturys patvirtina, kad ši mokomoji grandinė tvarkinga. Tai nepatvirtina mikrovaldiklio programos ar šviesos diodo veikimo.",
    pending:
      "Terminalo švyturys geltonas: jungtis atkurta, bet matavimus dar reikia patvirtinti.",
    world: "Terminalo būsena: žalia — grandinė patikrinta",
    restart: "Kartoti Tamsiąją grandinę",
    reset:
      "Kartojimas atkuria tyrinėjimą, R1 gedimą, matavimus ir užbaigimą. Pažanga saugoma tik šiame seanse; perkrovus puslapį ar baigus seansą viskas pradedama iš naujo.",
  },
} satisfies Record<Language, Record<string, string>>;
