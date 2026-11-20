import * as pc from "playcanvas";
import paperUrl from "../assets/journal-paper.jpg?url";

export async function buildJournalPaper(
  device: pc.GraphicsDevice,
  wings: readonly pc.Entity[],
  signal: AbortSignal,
) {
  const image = new Image();
  image.src = paperUrl;
  await image.decode();
  signal.throwIfAborted();
  const texture = new pc.Texture(device, {
    name: "notebook paper",
    width: image.naturalWidth,
    height: image.naturalHeight,
    mipmaps: true,
    minFilter: pc.FILTER_LINEAR_MIPMAP_LINEAR,
    addressU: pc.ADDRESS_CLAMP_TO_EDGE,
    addressV: pc.ADDRESS_CLAMP_TO_EDGE,
  });
  texture.setSource(image);
  const material = new pc.StandardMaterial();
  material.useLighting = false;
  material.diffuse.set(0, 0, 0);
  material.emissive.set(1, 1, 1);
  material.emissiveMap = texture;
  material.update();
  const mesh = pc.Mesh.fromGeometry(
    device,
    new pc.PlaneGeometry({
      halfExtents: new pc.Vec2(0.263, 0.357),
      widthSegments: 1,
      lengthSegments: 1,
    }),
  );
  wings.forEach((wing, index) => {
    const leaf = new pc.Entity("paper surface");
    leaf.setLocalPosition(index === 0 ? -0.315 : 0.315, 0.022, 0);
    leaf.addComponent("render", {
      meshInstances: [new pc.MeshInstance(mesh, material, leaf)],
    });
    wing.addChild(leaf);
  });
  return () => {
    material.destroy();
    texture.destroy();
  };
}

// Fit the one interactive HTML spread to the visible paper. At the end of
// the draw animation the book is perpendicular to the first-person camera.
export function projectJournal(
  canvas: HTMLCanvasElement,
  camera: pc.Entity,
  book: pc.Entity,
) {
  const layer = canvas.parentElement!;
  const point = new pc.Vec3();
  const view = new pc.Mat4();
  return () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    const lens =
      (0.5 * height) / Math.tan(camera.camera!.fov * pc.math.DEG_TO_RAD * 0.5);
    view.copy(camera.getWorldTransform()).invert();
    const transform = book.getWorldTransform();
    let left = width,
      right = 0,
      top = height,
      bottom = 0;
    for (const x of [-0.56, 0.56]) {
      for (const z of [-0.34, 0.34]) {
        view.transformPoint(
          transform.transformPoint(point.set(x, 0.026, z), point),
          point,
        );
        const px = width / 2 + (lens * point.x) / -point.z;
        const py = height / 2 - (lens * point.y) / -point.z;
        left = Math.min(left, px);
        right = Math.max(right, px);
        top = Math.min(top, py);
        bottom = Math.max(bottom, py);
      }
    }
    // A modest gutter keeps controls clear of the cover and paper edges.
    left = Math.max(6, left + 6);
    right = Math.min(width - 6, right - 6);
    top = Math.max(6, top + 4);
    bottom = Math.min(height - 6, bottom - 4);
    layer.style.setProperty("--journal-left", `${left}px`);
    layer.style.setProperty("--journal-top", `${top}px`);
    layer.style.setProperty("--journal-width", `${right - left}px`);
    layer.style.setProperty("--journal-height", `${bottom - top}px`);
  };
}
