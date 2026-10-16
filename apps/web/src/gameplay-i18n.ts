import type { ComponentKind, Language } from "@spark/shared";
type Copy = {
  north: string;
  play: string;
  pause: string;
  resume: string;
  paused: string;
  welcome: string;
  brief: string;
  mission: string;
  objectives: readonly string[];
  inspect: string;
  scan: string;
  continue: string;
  complete: string;
  completedBody: string;
  terminal: string;
  controls: string;
  camera: string;
  selected: string;
  nearby: string;
  scanner: string;
  checkpoint: string;
  leave: string;
  returnTitle: string;
  restart: string;
  distance: string;
  coordinates: string;
  componentNames: Record<ComponentKind, string>;
  descriptions: Record<ComponentKind, string>;
};
const en: Copy = {
  north: "N",
  play: "Begin exploration",
  pause: "Pause",
  resume: "Resume exploration",
  paused: "Taking a breather",
  welcome: "Welcome, engineer.",
  brief:
    "You are inside a silent device. Follow the copper traces, get to know its components, and find the controller terminal. Look for the gold beacon.",
  mission: "First Contact",
  objectives: [
    "Leave the starting pad. Walk along the copper traces.",
    "Find R1, the striped resistor. Approach it and press E.",
    "Scan a different component with F. Look for the blue capacitor C1.",
    "Follow the traces north to the central microcontroller U1.",
    "Approach terminal T1 beside the controller and press E.",
    "First Contact complete",
  ],
  inspect: "E · Inspect",
  scan: "F · Identify",
  continue: "Continue exploring",
  complete: "First contact made.",
  completedBody:
    "You identified the components and reached the controller. The real repair is still ahead.",
  terminal:
    "The controller is malfunctioning. Open the terminal diagnostics to investigate a separate DC training circuit. Repair and MCU execution are not available.",
  controls:
    "WASD · Walk   Shift · Run   Space · Jump   E · Inspect   F · Identify   Esc · Pause",
  camera:
    "Click the board to capture the mouse, or drag to orbit. Scroll to zoom. Esc releases the mouse.",
  selected: "Selected component",
  nearby: "Nearby · select a component",
  scanner: "Identification only · no electrical measurements",
  checkpoint: "Returned to the starting checkpoint",
  leave: "End session",
  returnTitle: "Return to title",
  restart: "Explore again",
  distance: "Beacon",
  coordinates: "Board position",
  componentNames: {
    resistor: "Resistor",
    capacitor: "Electrolytic capacitor",
    led: "LED",
    microcontroller: "Microcontroller",
    terminal: "Controller terminal",
  },
  descriptions: {
    resistor:
      "A resistor limits current flowing through a circuit. Its colored bands encode its nominal resistance and tolerance. This prototype does not measure resistance.",
    capacitor:
      "A capacitor stores energy in an electric field. This cylindrical electrolytic type is polarized: its stripe typically marks the negative terminal.",
    led: "An LED emits light when appropriately powered in the forward direction. It needs current limiting. The color shown here is illustrative, not a live circuit measurement.",
    microcontroller:
      "A microcontroller combines a processor, memory and input/output peripherals in one integrated circuit. It can control a device using a program; none is executed in this prototype.",
    terminal:
      "A service terminal provides information about the controller. It is an interface, not a simulated electrical component.",
  },
};
const lt: Copy = {
  north: "Š",
  play: "Pradėti tyrinėjimą",
  pause: "Pristabdyti",
  resume: "Tęsti tyrinėjimą",
  paused: "Trumpa pertrauka",
  welcome: "Sveikas, inžinieriau.",
  brief:
    "Esi tylaus įrenginio viduje. Sek vario takeliais, susipažink su komponentais ir surask valdiklio terminalą. Ieškok auksinio švyturio.",
  mission: "Pirmasis kontaktas",
  objectives: [
    "Palik pradinę aikštelę. Eik vario takeliais.",
    "Surask R1 – dryžuotą rezistorių. Prieik ir spausk E.",
    "Atpažink kitą komponentą su F. Ieškok mėlyno kondensatoriaus C1.",
    "Sek takeliais į šiaurę iki centrinio mikrovaldiklio U1.",
    "Prieik prie terminalo T1 šalia valdiklio ir spausk E.",
    "Pirmasis kontaktas užbaigtas",
  ],
  inspect: "E · Apžiūrėti",
  scan: "F · Atpažinti",
  continue: "Tęsti tyrinėjimą",
  complete: "Kontaktas užmegztas.",
  completedBody:
    "Atpažinai komponentus ir pasiekei valdiklį. Tikrasis remontas dar laukia.",
  terminal:
    "Valdiklis neveikia tinkamai. Terminalo diagnostikoje gali ištirti atskirą mokomąją nuolatinės srovės grandinę. Remontas ir mikrovaldiklio programos vykdymas neprieinami.",
  controls:
    "WASD · Eiti   Shift · Bėgti   Space · Šokti   E · Apžiūrėti   F · Atpažinti   Esc · Pauzė",
  camera:
    "Spustelk plokštę pelei užfiksuoti arba tempk vaizdui pasukti. Slink ratuką masteliui keisti. Esc atlaisvina pelę.",
  selected: "Pasirinktas komponentas",
  nearby: "Netoliese · pasirink komponentą",
  scanner: "Tik atpažinimas · be elektros matavimų",
  checkpoint: "Grįžai į pradinį kontrolinį tašką",
  leave: "Baigti sesiją",
  returnTitle: "Grįžti į pradžią",
  restart: "Tyrinėti dar kartą",
  distance: "Švyturys",
  coordinates: "Vieta plokštėje",
  componentNames: {
    resistor: "Rezistorius",
    capacitor: "Elektrolitinis kondensatorius",
    led: "Šviesos diodas",
    microcontroller: "Mikrovaldiklis",
    terminal: "Valdiklio terminalas",
  },
  descriptions: {
    resistor:
      "Rezistorius riboja grandine tekančią srovę. Spalvotos juostos žymi jo vardinę varžą ir toleranciją. Šis prototipas varžos nematuoja.",
    capacitor:
      "Kondensatorius kaupia energiją elektriniame lauke. Šis cilindrinis elektrolitinis tipas yra poliarizuotas: juosta paprastai žymi neigiamą išvadą.",
    led: "Šviesos diodas skleidžia šviesą, kai tinkamai maitinamas tiesiogine kryptimi. Jam reikia srovės ribojimo. Spalva čia iliustracinė, o ne veikiančios grandinės matavimas.",
    microcontroller:
      "Mikrovaldiklis vienoje mikroschemoje jungia procesorių, atmintį ir įvesties bei išvesties periferiją. Jis gali valdyti įrenginį pagal programą; šiame prototipe ji nevykdoma.",
    terminal:
      "Aptarnavimo terminalas pateikia informaciją apie valdiklį. Tai sąsaja, o ne simuliuojamas elektros komponentas.",
  },
};
export const gameplay: Record<Language, Copy> = { en, lt };
