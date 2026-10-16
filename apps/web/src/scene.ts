import * as pc from "playcanvas";
export async function mountScene(
  canvas: HTMLCanvasElement,
  signal: AbortSignal,
): Promise<() => void> {
  const device = await pc.createGraphicsDevice(canvas, {
    deviceTypes: [pc.DEVICETYPE_WEBGL2],
    antialias: true,
    alpha: false,
  });
  if (signal.aborted) {
    device.destroy();
    return () => {};
  }
  let app: pc.AppBase | undefined;
  const materials: pc.StandardMaterial[] = [];
  let observer: ResizeObserver | undefined;
  const dispose = () => {
    observer?.disconnect();
    app?.destroy();
    materials.forEach((material) => material.destroy());
  };
  try {
    const options = new pc.AppOptions();
    options.graphicsDevice = device;
    options.componentSystems = [
      pc.RenderComponentSystem,
      pc.CameraComponentSystem,
      pc.LightComponentSystem,
    ];
    app = new pc.AppBase(canvas);
    app.init(options);
    app.graphicsDevice.maxPixelRatio = Math.min(window.devicePixelRatio, 1.5);
    app.scene.ambientLight = new pc.Color(0.65, 0.73, 0.8);
    const material = (hex: string) => {
      const m = new pc.StandardMaterial();
      m.diffuse = new pc.Color().fromString(hex);
      m.shininess = 35;
      m.update();
      materials.push(m);
      return m;
    };
    const green = material("#217868"),
      gold = material("#f8c66b"),
      dark = material("#243346"),
      blue = material("#77b9cb"),
      pink = material("#ed9279");
    const shape = (
      type: "box" | "cylinder" | "sphere",
      position: number[],
      scale: number[],
      mat: pc.StandardMaterial,
    ) => {
      const entity = new pc.Entity();
      entity.addComponent("render", { type, material: mat });
      entity.setPosition(...(position as [number, number, number]));
      entity.setLocalScale(...(scale as [number, number, number]));
      app!.root.addChild(entity);
      return entity;
    };
    shape("box", [0, -0.3, 0], [11, 0.5, 8], green);
    for (let i = 0; i < 6; i++) {
      shape("box", [-4 + i * 1.5, -0.035, 0], [0.055, 0.035, 6.7], gold);
      shape("box", [0, -0.03, -3 + i * 1.15], [9.5, 0.035, 0.055], gold);
    }
    shape("box", [0, 0.38, 0], [2.8, 0.85, 2.5], dark);
    for (let i = 0; i < 7; i++)
      for (const side of [-1, 1]) {
        shape(
          "box",
          [-1.12 + i * 0.37, 0.12, side * 1.5],
          [0.16, 0.2, 0.65],
          gold,
        );
      }
    for (const [x, z] of [
      [-3, -2],
      [3, 1.8],
      [-3, 2],
    ]) {
      shape("cylinder", [x, 0.7, z], [0.95, 1.4, 0.95], blue);
      shape("cylinder", [x, 1.42, z], [0.85, 0.06, 0.85], dark);
    }
    shape("box", [2.8, 0.3, -2], [1.7, 0.6, 0.7], pink);
    shape("sphere", [0, 0.94, 0], [0.35, 0.35, 0.35], gold);
    const camera = new pc.Entity();
    camera.addComponent("camera", {
      clearColor: new pc.Color().fromString("#152b35"),
      fov: 42,
    });
    camera.setPosition(11, 12, 14);
    camera.lookAt(0, 0, 0);
    app.root.addChild(camera);
    const light = new pc.Entity();
    light.addComponent("light", {
      type: "directional",
      color: new pc.Color(1, 0.92, 0.8),
      intensity: 1.7,
    });
    light.setEulerAngles(45, 30, 0);
    app.root.addChild(light);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      app!.resizeCanvas(Math.max(1, rect.width), Math.max(1, rect.height));
    };
    app.setCanvasResolution(pc.RESOLUTION_AUTO);
    observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    app.start();
    return dispose;
  } catch (error) {
    dispose();
    if (!app) device.destroy();
    throw error;
  }
}
