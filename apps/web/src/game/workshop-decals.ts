import * as pc from "playcanvas";
import { components, world } from "@spark/game-core";

export function buildWorkshopDecals(
  device: pc.GraphicsDevice,
  root: pc.Entity,
  batch: number,
) {
  const textures: pc.Texture[] = [];
  const materials: pc.StandardMaterial[] = [];
  const plane = pc.Mesh.fromGeometry(
    device,
    new pc.PlaneGeometry({
      widthSegments: 1,
      lengthSegments: 1,
    }),
  );
  const decal = (
    width: number,
    height: number,
    paint: (ctx: CanvasRenderingContext2D) => void,
  ) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    paint(canvas.getContext("2d")!);
    const texture = new pc.Texture(device, {
      width,
      height,
      mipmaps: true,
      addressU: pc.ADDRESS_CLAMP_TO_EDGE,
      addressV: pc.ADDRESS_CLAMP_TO_EDGE,
    });
    texture.setSource(canvas);
    const material = new pc.StandardMaterial();
    material.useLighting = false;
    material.blendType = pc.BLEND_NORMAL;
    material.depthWrite = false;
    material.diffuse.set(0, 0, 0);
    material.emissive.set(1, 1, 1);
    material.emissiveMap = texture;
    material.opacityMap = texture;
    material.opacityMapChannel = "a";
    material.update();
    textures.push(texture);
    materials.push(material);
    return material;
  };
  const place = (
    material: pc.StandardMaterial,
    x: number,
    z: number,
    width: number,
    depth: number,
    group: number,
  ) => {
    const entity = new pc.Entity("board print");
    entity.addComponent("render", {
      meshInstances: [new pc.MeshInstance(plane, material, entity)],
    });
    entity.setLocalPosition(x, 0.012, z);
    entity.setLocalScale(width, 1, depth);
    root.addChild(entity);
    entity.render!.batchGroupId = group;
    return entity;
  };
  const softShadow = decal(64, 64, (ctx) => {
    const gradient = ctx.createRadialGradient(32, 32, 2, 32, 32, 32);
    gradient.addColorStop(0, "#071828ab");
    gradient.addColorStop(0.39, "#0a1e2d8a");
    gradient.addColorStop(1, "#0c253000");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  });
  for (const { x, z, id } of components) {
    const width = id === "U1" ? 11 : id === "R1" ? 5.5 : 4.6;
    const depth = id === "U1" ? 10 : 4.5;
    place(softShadow, x + 0.36, z - 0.23, width, depth, batch);
    const stamp = decal(256, 128, (ctx) => {
      ctx.font = "bold 64px monospace";
      ctx.fillStyle = "#bde5cf";
      ctx.fillText(id, 34, 85);
      ctx.strokeStyle = "#aad1b7";
      ctx.lineWidth = 5;
      ctx.strokeRect(8, 9, 240, 110);
      ctx.fillRect(166, 43, 52, 5);
      ctx.fillRect(166, 58, 38, 5);
      ctx.fillRect(166, 73, 24, 5);
    });
    place(stamp, x, z + (id === "U1" ? 4.3 : 2.45), 2.25, 1.05, batch);
  }
  const launch = decal(512, 256, (ctx) => {
    ctx.fillStyle = "#bce5ce";
    ctx.font = "bold 95px monospace";
    ctx.fillText("SPARK", 61, 107);
    ctx.font = "bold 43px monospace";
    ctx.fillText("PCB - 01", 61, 183);
    ctx.fillRect(61, 207, 370, 6);
    ctx.fillRect(27, 24, 6, 190);
  });
  place(launch, -3.7, 33.4, 4.2, 2.15, batch);
  const shadow = place(softShadow, world.spawn.x, world.spawn.z, 1.8, 1.45, -1);
  return {
    follow(x: number, y: number, z: number) {
      shadow.setLocalPosition(x, 0.094, z);
      const scale = 1 + Math.min(Math.max(y, 0), 1.6) * 0.34;
      shadow.setLocalScale(1.8 * scale, 1, 1.45 * scale);
    },
    dispose() {
      for (const texture of textures) texture.destroy();
      for (const material of materials) material.destroy();
    },
  };
}
