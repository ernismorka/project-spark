import * as pc from "playcanvas";
import terminalShell from "../assets/terminal-shell.json";

export function createGeometry(
  root: pc.Entity,
  device: pc.GraphicsDevice,
  batchGroupId: number,
) {
  const materials: pc.StandardMaterial[] = [];
  const material = (color: string, glow = false, finish = 0.14) => {
    const m = new pc.StandardMaterial();
    m.diffuse = new pc.Color().fromString(color);
    if (glow) {
      m.emissive = m.diffuse.clone();
      m.emissiveIntensity = 0.5;
    }
    m.specular.set(finish, finish, finish);
    m.shininess = 38;
    m.update();
    materials.push(m);
    return m;
  };
  const terminal = material("#ffffff", false, 0.24);
  terminal.diffuseVertexColor = true;
  terminal.update();
  const palette = {
    terminal,
    healthy: material("#83f2ad", true),
    board: material("#206f61", false, 0.07),
    edge: material("#14383a"),
    copper: material("#d89759", false, 0.34),
    ink: material("#b2dbb4"),
    chip: material("#29364a"),
    silver: material("#b6cbd0", false, 0.3),
    blue: material("#479bb5", false, 0.26),
    red: material("#fa927d", true),
    suit: material("#f3c85c"),
    visor: material("#153b50"),
    white: material("#f0edcf"),
    brown: material("#9b5b37"),
  };
  let terminalMesh: pc.Mesh | undefined;
  const shape = (
    type: "box" | "cylinder" | "sphere" | "cone" | "terminal",
    p: [number, number, number],
    s: [number, number, number],
    m: pc.StandardMaterial,
    parent = root,
  ) => {
    const e = new pc.Entity();
    if (type === "terminal") {
      terminalMesh ??= pc.Mesh.fromGeometry(
        device,
        Object.assign(new pc.Geometry(), terminalShell),
      );
      e.addComponent("render", {
        meshInstances: [new pc.MeshInstance(terminalMesh, m, e)],
      });
    } else e.addComponent("render", { type, material: m });
    if (parent === root) e.render!.batchGroupId = batchGroupId;
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
