import * as pc from "playcanvas";
export function createGeometry(root: pc.Entity) {
  const materials: pc.StandardMaterial[] = [];
  const material = (color: string, glow = false) => {
    const m = new pc.StandardMaterial();
    m.diffuse = new pc.Color().fromString(color);
    if (glow) {
      m.emissive = m.diffuse.clone();
      m.emissiveIntensity = 0.5;
    }
    m.shininess = 30;
    m.update();
    materials.push(m);
    return m;
  };
  const palette = {
    board: material("#17665c"),
    edge: material("#113d40"),
    copper: material("#dfb96d"),
    ink: material("#b2dbb4"),
    chip: material("#23313e"),
    silver: material("#b6cbd0"),
    blue: material("#5cacc2"),
    red: material("#fa927d", true),
    suit: material("#f3c85c"),
    visor: material("#153b50"),
    white: material("#f0edcf"),
    brown: material("#9b5b37"),
  };
  const shape = (
    type: "box" | "cylinder" | "sphere" | "cone",
    p: [number, number, number],
    s: [number, number, number],
    m: pc.StandardMaterial,
    parent = root,
  ) => {
    const e = new pc.Entity();
    e.addComponent("render", { type, material: m });
    e.setLocalPosition(...p);
    e.setLocalScale(...s);
    parent.addChild(e);
    return e;
  };
  return {
    palette,
    shape,
    dispose: () => materials.forEach((m) => m.destroy()),
  };
}
export type Geometry = ReturnType<typeof createGeometry>;
