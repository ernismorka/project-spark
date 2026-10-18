import { expect, test } from "@playwright/test";
test("records the comparable 3D view and rendering workload", async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    let draws = 0;
    const buffers = new Set<WebGLBuffer>();
    const createBuffer = WebGL2RenderingContext.prototype.createBuffer;
    const deleteBuffer = WebGL2RenderingContext.prototype.deleteBuffer;
    WebGL2RenderingContext.prototype.createBuffer = function () {
      const buffer = createBuffer.call(this);
      if (buffer) buffers.add(buffer);
      return buffer;
    };
    WebGL2RenderingContext.prototype.deleteBuffer = function (buffer) {
      if (buffer) buffers.delete(buffer);
      deleteBuffer.call(this, buffer);
    };
    Object.defineProperty(window, "__sparkBuffers", {
      get: () => buffers.size,
    });
    for (const name of [
      "drawElements",
      "drawArrays",
      "drawElementsInstanced",
      "drawArraysInstanced",
    ] as const) {
      const original = WebGL2RenderingContext.prototype[name];
      Object.defineProperty(WebGL2RenderingContext.prototype, name, {
        value: function (this: WebGL2RenderingContext, ...args: unknown[]) {
          draws++;
          return Reflect.apply(original, this, args);
        },
      });
    }
    Object.defineProperty(window, "__sparkDraws", { get: () => draws });
  });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  await expect(page.getByTestId("renderer-status")).toHaveAttribute(
    "data-status",
    "ready",
  );
  await page
    .getByRole("button", { name: "Begin exploration", exact: true })
    .click();
  const result = await page.evaluate(
    () =>
      new Promise<{ drawsPerFrame: number; renderer: string }>((resolve) => {
        const gl = document.querySelector("canvas")!.getContext("webgl2")!;
        const debug = gl.getExtension("WEBGL_debug_renderer_info");
        const renderer = debug
          ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL))
          : String(gl.getParameter(gl.RENDERER));
        let frames = 0;
        const start = Number(Reflect.get(window, "__sparkDraws"));
        const sample = () => {
          if (++frames < 20) requestAnimationFrame(sample);
          else
            resolve({
              drawsPerFrame:
                (Number(Reflect.get(window, "__sparkDraws")) - start) / frames,
              renderer,
            });
        };
        requestAnimationFrame(sample);
      }),
  );
  console.log("M6 render workload", JSON.stringify(result));
  await info.attach("render-workload", {
    body: JSON.stringify(result),
    contentType: "application/json",
  });
  await page.screenshot({ path: info.outputPath("m6-view.png") });
  expect(result.drawsPerFrame).toBeGreaterThan(0);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Resume exploration" }),
  ).toBeVisible();
  await page.waitForTimeout(300);
  const pausedDraws = await page.evaluate(() =>
    Reflect.get(window, "__sparkDraws"),
  );
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => Reflect.get(window, "__sparkDraws"))).toBe(
    pausedDraws,
  );
  await page.getByRole("button", { name: "Resume exploration" }).click();
  await expect
    .poll(() =>
      page.evaluate(() => Number(Reflect.get(window, "__sparkDraws"))),
    )
    .toBeGreaterThan(Number(pausedDraws));
  expect(
    await page.evaluate(() => Number(Reflect.get(window, "__sparkBuffers"))),
  ).toBeGreaterThan(0);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "End session" }).click();
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(() => Number(Reflect.get(window, "__sparkBuffers"))),
    )
    .toBe(0);
});

test("keeps orientation cues aligned and clears movement when keyboard focus leaves the board", async ({
  page,
}, info) => {
  test.setTimeout(90000);
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.requestPointerLock = () =>
      Promise.reject(new Error("Use drag fallback"));
  });
  await page.goto("/");
  await expect(page.getByTestId("renderer-status")).toHaveAttribute(
    "data-status",
    "ready",
  );
  await page
    .getByRole("button", { name: "Begin exploration", exact: true })
    .click();
  const canvas = page.locator("canvas");
  await expect(
    page.getByText("Approach a component for E", { exact: false }),
  ).toBeVisible();
  const position = () =>
    canvas.evaluate((c) => ({
      x: Number(c.dataset.playerX),
      z: Number(c.dataset.playerZ),
    }));
  await page.keyboard.down("KeyW");
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: "Pause", exact: true }).focus();
  await page.keyboard.up("KeyW");
  await page.waitForTimeout(500);
  const stopped = await position();
  await page.keyboard.down("KeyW");
  await page.waitForTimeout(300);
  await page.keyboard.up("KeyW");
  expect(await position()).toEqual(stopped);
  await canvas.focus();
  for (let i = 0; i < 180; i++) {
    const p = await position(),
      dx = -7 - p.x,
      dz = 23.5 - p.z;
    if (Math.hypot(dx, dz) < 0.8) break;
    const keys = [
      ...(Math.abs(dx) > 0.3 ? [dx > 0 ? "KeyD" : "KeyA"] : []),
      ...(Math.abs(dz) > 0.3 ? [dz > 0 ? "KeyS" : "KeyW"] : []),
    ];
    for (const key of keys) await page.keyboard.down(key);
    await page.waitForTimeout(100);
    for (const key of keys) await page.keyboard.up(key);
    if (i === 179) throw new Error("Could not reach R1");
  }
  await expect(page.locator(".interaction")).toContainText("R1 · Resistor");
  await expect(page.locator(".compass")).toContainText("R1");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Missing board");
  await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.55, {
    steps: 6,
  });
  await page.mouse.up();
  await expect
    .poll(async () => page.getByTestId("north-arrow").getAttribute("style"))
    .not.toBe("transform: rotate(0rad);");
  await expect
    .poll(async () => {
      const yaw = Number(await canvas.getAttribute("data-camera-yaw"));
      const style = await page.getByTestId("north-arrow").getAttribute("style");
      return Math.abs(
        yaw - Number(style?.match(/rotate\(([-\d.]+)rad\)/)?.[1]),
      );
    })
    .toBeLessThan(0.01);
  await page.screenshot({ path: info.outputPath("m6-navigation-en.png") });
  // Return to the initial heading using drag, approach the solid R1 face, then
  // orbit behind it at the lowest pitch. Exercise the actual close-wall view.
  const yaw = Number(await canvas.getAttribute("data-camera-yaw"));
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width * 0.6 + yaw / 0.003,
    box.y + box.height * 0.5,
    { steps: 8 },
  );
  await page.mouse.up();
  await canvas.focus();
  await page.keyboard.down("KeyW");
  await page.waitForTimeout(1200);
  await page.keyboard.up("KeyW");
  await page.mouse.move(box.x + 20, box.y + box.height * 0.6);
  await page.mouse.down();
  await page.mouse.move(box.x + 20 + Math.PI / 0.003, box.y + 5, { steps: 12 });
  await page.mouse.up();
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-camera-distance")))
    .toBeGreaterThan(0.5);
  await page.screenshot({ path: info.outputPath("m6-camera-close.png") });
  await page.keyboard.press("KeyE");
  await expect(page.getByRole("dialog")).toContainText("limits current");
  await page.getByRole("combobox").selectOption("lt");
  await page.getByRole("button", { name: "Tęsti tyrinėjimą" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".compass")).toContainText("C1");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: info.outputPath("m6-navigation-lt.png") });
});
