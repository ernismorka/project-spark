import * as pc from "playcanvas";
import terminalShell from "../assets/terminal-shell.json";

export function createGeometry(
  root: pc.Entity,
  device: pc.GraphicsDevice,
  batchGroupId: number,
) {
  const materials: pc.StandardMaterial[] = [];
  const meshes: pc.Mesh[] = [];
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
  const background = material("#000000");
  background.useLighting = false;
  background.emissive.set(1, 1, 1);
  background.emissiveVertexColor = true;
  background.update();
  const palette = {
    terminal,
    background,
    healthy: material("#83f2ad", true),
    solderHeat: material("#ff8849", true),
    solderSpark: material("#ffe49b", true),
    traceFlux: material("#e8aa67", false, 0.42),
    traceSeal: material("#477487", false, 0.33),
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
    busCopper: material("#d27b42", false, 0.42),
    busEdge: material("#61372b", false, 0.19),
    busMask: material("#235e58", false, 0.16),
    oxide: material("#774c43", false, 0.12),
    toolCase: material("#b86835", false, 0.22),
  };
  const solid = (
    parent: pc.Entity,
    outline: readonly (readonly [number, number])[],
    low: number,
    top: number,
    center: [number, number],
    face: pc.StandardMaterial,
    edge: pc.StandardMaterial,
  ) => {
    const entity = new pc.Entity("machined copper");
    const topPositions = [center[0], top, center[1]];
    const sidePositions: number[] = [];
    const topIndices: number[] = [];
    const sideIndices: number[] = [];
    for (let i = 0; i < outline.length; i++) {
      const [x, z] = outline[i];
      const [nextX, nextZ] = outline[(i + 1) % outline.length];
      topPositions.push(x, top, z);
      topIndices.push(0, ((i + 1) % outline.length) + 1, i + 1);
      const base = i * 4;
      sidePositions.push(
        x,
        low,
        z,
        nextX,
        low,
        nextZ,
        nextX,
        top,
        nextZ,
        x,
        top,
        z,
      );
      sideIndices.push(base, base + 2, base + 1, base, base + 3, base + 2);
    }
    const surface = (
      positions: number[],
      indices: number[],
      coating: pc.StandardMaterial,
    ) => {
      const mesh = new pc.Mesh(device);
      mesh.setPositions(positions);
      mesh.setNormals(pc.calculateNormals(positions, indices));
      mesh.setIndices(indices);
      mesh.update();
      meshes.push(mesh);
      return new pc.MeshInstance(mesh, coating, entity);
    };
    entity.addComponent("render", {
      meshInstances: [
        surface(topPositions, topIndices, face),
        surface(sidePositions, sideIndices, edge),
      ],
    });
    parent.addChild(entity);
    return entity;
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
    solid,
    dispose() {
      for (const mesh of meshes) mesh.destroy();
      for (const mat of materials) mat.destroy();
    },
  };
}
export type Geometry = ReturnType<typeof createGeometry>;
