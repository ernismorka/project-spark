import { expect, test, type Page } from "@playwright/test";
async function position(page: Page) {
  return page.locator("canvas").evaluate((c) => ({
    x: Number(c.dataset.playerX),
    y: Number(c.dataset.playerY),
    z: Number(c.dataset.playerZ),
  }));
}
async function walkTo(page: Page, x: number, z: number) {
  await page.locator("canvas").focus();
  await page.keyboard.down("ShiftLeft");
  for (let i = 0; i < 300; i++) {
    const p = await position(page);
    const dx = x - p.x,
      dz = z - p.z;
    if (Math.hypot(dx, dz) < 0.95) break;
    if (Math.hypot(dx, dz) < 3) await page.keyboard.up("ShiftLeft");
    else await page.keyboard.down("ShiftLeft");
    const keys = [
      ...(Math.abs(dx) > 0.35 ? [dx > 0 ? "KeyD" : "KeyA"] : []),
      ...(Math.abs(dz) > 0.35 ? [dz > 0 ? "KeyS" : "KeyW"] : []),
    ];
    for (const key of keys) await page.keyboard.down(key);
    await page.waitForTimeout(
      Math.min(140, Math.max(35, (Math.hypot(dx, dz) / 7) * 250)),
    );
    for (const key of keys) await page.keyboard.up(key);
    if (i === 299)
      throw new Error(`Could not reach ${x},${z}; stopped at ${p.x},${p.z}`);
  }
  await page.keyboard.up("ShiftLeft");
  await page.waitForTimeout(250);
}
async function begin(page: Page) {
  await page.goto("/");
  await expect(page.getByTestId("renderer-status")).toHaveAttribute(
    "data-status",
    "ready",
  );
  await page
    .getByRole("button", { name: "Begin exploration", exact: true })
    .click();
  await expect(page.locator("canvas")).toHaveAttribute("data-phase", "playing");
}
test("plays First Contact using real movement and interaction inputs", async ({
  page,
}, testInfo) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await begin(page);
  await page.screenshot({ path: testInfo.outputPath("engineer.png") });
  await walkTo(page, -7, 23.5);
  await expect(page.locator("canvas")).toHaveAttribute(
    "data-mission-step",
    "1",
  );
  await page.keyboard.press("KeyE");
  await expect(page.getByRole("dialog")).toContainText("R1 · Resistor");
  await expect(page.getByRole("dialog")).toContainText("limits current");
  await page.getByRole("button", { name: "Continue exploring" }).click();
  await walkTo(page, 7, 24);
  await walkTo(page, 7, 8.5);
  await page.keyboard.press("KeyF");
  await expect(page.getByRole("dialog")).toContainText(
    "C1 · Electrolytic capacitor",
  );
  await page.getByRole("button", { name: "Continue exploring" }).click();
  await walkTo(page, 11, 9);
  await walkTo(page, 11, -14);
  await walkTo(page, 6, -21);
  await expect(page.locator("canvas")).toHaveAttribute(
    "data-mission-step",
    "4",
  );
  await walkTo(page, 3.5, -18);
  await page.screenshot({ path: testInfo.outputPath("gameplay.png") });
  await page.keyboard.press("KeyE");
  await expect(page.getByRole("dialog")).toContainText("First contact made.");
  await expect(page.getByRole("dialog")).toContainText("malfunctioning");
  await expect(page.locator("canvas")).toHaveAttribute(
    "data-mission-step",
    "5",
  );
  await page.getByRole("button", { name: "Open terminal diagnostics" }).click();
  await expect(page.getByRole("dialog")).toContainText("Follow the voltage");
  await expect(
    page.getByRole("button", { name: "R1 is open", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Measure VCC", exact: true }).click();
  await expect(page.getByLabel("VCC V", { exact: true })).toHaveText("5.00 V");
  await page
    .getByRole("button", { name: "Measure SENSE", exact: true })
    .click();
  await expect(page.getByLabel("SENSE V", { exact: true })).toHaveText(
    "0.00 V",
  );
  await page.getByRole("button", { name: "R2 is open", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "does not explain both readings",
  );
  await page.getByRole("combobox").selectOption("lt");
  await expect(page.getByRole("dialog")).toContainText("Sek įtampą");
  await expect(page.getByLabel("VCC V", { exact: true })).toHaveText("5,00 V");
  await page.getByRole("button", { name: "R1 nutrūkęs", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Gedimas nustatytas: R1 nutrūkęs.",
  );
  await page.screenshot({ path: testInfo.outputPath("m2-diagnosis-lt.png") });
  await page.getByRole("button", { name: "Grįžti į pirmąjį kontaktą" }).click();
  await page
    .getByRole("button", { name: "Atverti terminalo diagnostiką" })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "Gedimas nustatytas: R1 nutrūkęs.",
  );
  await expect(
    page.getByRole("button", { name: "Atkurti R1 jungtį" }),
  ).toBeFocused();
  await page.getByRole("combobox").selectOption("en");
  await page.setViewportSize({ width: 1280, height: 1200 });
  await page.screenshot({ path: testInfo.outputPath("m2-diagnosis-en.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("heading", { name: "Follow the voltage" }),
  ).toBeInViewport();
  await expect(
    page.getByRole("button", { name: "Back to First Contact" }),
  ).toBeInViewport();
  await expect(
    page.getByRole("button", { name: "Back to First Contact" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 1280, height: 1200 });
  await page
    .getByRole("button", { name: "Restore R1 connection", exact: true })
    .click();
  await expect(page.locator("canvas")).toHaveAttribute(
    "data-circuit-status",
    "restored",
  );
  await expect(
    page.getByRole("button", { name: "Verify repair", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Remeasure VCC", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Remeasure SENSE", exact: true })
    .click();
  await expect(page.getByLabel("SENSE after V", { exact: true })).toHaveText(
    "2.50 V",
  );
  await expect(page.getByLabel("SENSE V", { exact: true })).toHaveText(
    "0.00 V",
  );
  await page
    .getByRole("button", { name: "Verify repair", exact: true })
    .scrollIntoViewIfNeeded();
  await page.screenshot({
    path: testInfo.outputPath("m3-before-after-en.png"),
  });
  await page.getByRole("combobox").selectOption("lt");
  await expect(page.getByLabel("SENSE after V", { exact: true })).toHaveText(
    "2,50 V",
  );
  await expect(page.getByRole("dialog")).toContainText(
    "Vienodos varžos padalija",
  );
  await page
    .getByRole("button", { name: "Patvirtinti remontą", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "Tamsioji grandinė užbaigta",
  );
  await expect(page.locator("canvas")).toHaveAttribute(
    "data-circuit-status",
    "verified",
  );
  await page
    .getByRole("heading", { name: "Tamsioji grandinė užbaigta", exact: true })
    .scrollIntoViewIfNeeded();
  await page
    .locator(".diagnostic-content")
    .evaluate((el) => el.scrollTo(0, el.scrollHeight));
  await page.screenshot({ path: testInfo.outputPath("m3-complete-lt.png") });
  await expect(
    page.getByRole("heading", {
      name: "Tamsioji grandinė užbaigta",
      exact: true,
    }),
  ).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("heading", { name: "Sek įtampą", exact: true }),
  ).toBeInViewport();
  await expect(
    page.getByRole("button", { name: "Grįžti į pirmąjį kontaktą" }),
  ).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 1280, height: 1200 });
  await page.getByRole("button", { name: "Grįžti į pirmąjį kontaktą" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Tamsioji grandinė užbaigta",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("combobox").selectOption("en");
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.getByRole("button", { name: "View restored board" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("m3-world-verified.png") });
  await page.getByRole("button", { name: "Return to terminal report" }).click();
  await page.getByRole("button", { name: "Open terminal diagnostics" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "The Dark Circuit complete",
  );
  await expect(page.getByLabel("SENSE after V", { exact: true })).toHaveText(
    "2.50 V",
  );
  await page.getByRole("button", { name: "Back to First Contact" }).click();
  await page.getByRole("button", { name: "Open creative workbench" }).click();
  await page
    .getByRole("dialog", { name: "Creative programming" })
    .getByRole("button", { name: "Run controller", exact: true })
    .click();
  await expect(page.getByLabel("Workbench SENSE")).toHaveText("2.50 V");
  await page
    .getByRole("button", { name: "Return to adventure", exact: true })
    .click();
  await expect(page.locator("canvas")).toHaveAttribute(
    "data-circuit-status",
    "verified",
  );
  await page.getByRole("button", { name: "Replay The Dark Circuit" }).click();
  await expect(page.locator("canvas")).toHaveAttribute("data-phase", "playing");
  await expect(page.locator("canvas")).toHaveAttribute(
    "data-circuit-status",
    "open",
  );
  await expect(page.locator("canvas")).toHaveAttribute(
    "data-mission-step",
    "0",
  );
  expect(errors).toEqual([]);
});
test("walk/run/jump, solid collisions, pause, camera zoom and resume are functional", async ({
  page,
}) => {
  await begin(page);
  const start = await position(page);
  await page.keyboard.down("KeyW");
  await page.waitForTimeout(450);
  await page.keyboard.up("KeyW");
  const walked = await position(page);
  expect(start.z - walked.z).toBeGreaterThan(0.5);
  await page.keyboard.press("Space");
  await expect.poll(async () => (await position(page)).y).toBeGreaterThan(0.3);
  await expect.poll(async () => (await position(page)).y).toBe(0);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Resume exploration" }),
  ).toBeVisible();
  const paused = await position(page);
  await page.keyboard.down("KeyW");
  await page.waitForTimeout(250);
  await page.keyboard.up("KeyW");
  expect(await position(page)).toEqual(paused);
  await page.getByRole("button", { name: "Resume exploration" }).click();
  const canvas = page.locator("canvas");
  await canvas.hover();
  await page.mouse.wheel(0, 250);
  await expect(canvas).toHaveAttribute("data-camera-zoom", "10.50");
  await walkTo(page, -7, 23.5);
  await page.keyboard.down("KeyW");
  await page.waitForTimeout(1500);
  await page.keyboard.up("KeyW");
  expect((await position(page)).z).toBeGreaterThanOrEqual(21.38);
});
test("context loss/retry and session unmount/remount clean up input and preserve progress", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const listeners = new Map<
      string,
      Set<EventListenerOrEventListenerObject>
    >();
    const watched = (target: EventTarget, type: string) =>
      (target === window &&
        ["keydown", "keyup", "blur", "mousemove", "mouseup"].includes(type)) ||
      (target === document && type === "pointerlockchange");
    const add = EventTarget.prototype.addEventListener;
    const remove = EventTarget.prototype.removeEventListener;
    EventTarget.prototype.addEventListener = function (
      type,
      callback,
      options,
    ) {
      if (
        callback &&
        watched(this, type) &&
        !String(callback).includes("_hitTargetInterceptor")
      ) {
        if (!listeners.has(type)) listeners.set(type, new Set());
        listeners.get(type)!.add(callback);
      }
      add.call(this, type, callback, options);
    };
    EventTarget.prototype.removeEventListener = function (
      type,
      callback,
      options,
    ) {
      if (
        callback &&
        watched(this, type) &&
        !String(callback).includes("_hitTargetInterceptor")
      )
        listeners.get(type)?.delete(callback);
      remove.call(this, type, callback, options);
    };
    Object.defineProperty(window, "__sparkInputListeners", {
      get: () =>
        [...listeners.values()].reduce((sum, items) => sum + items.size, 0),
    });
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await begin(page);
  await walkTo(page, 0, 27);
  await page.locator("canvas").evaluate((c) => {
    c.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
  });
  await expect(page.getByTestId("renderer-status")).toHaveAttribute(
    "data-status",
    "error",
  );
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByTestId("renderer-status")).toHaveAttribute(
    "data-status",
    "ready",
  );
  await expect(page.locator("canvas")).toHaveAttribute(
    "data-mission-step",
    "1",
  );
  await page.getByRole("button", { name: "Resume exploration" }).click();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "End session" }).click();
  await expect(page.locator("canvas")).toHaveCount(0);
  expect(
    await page.evaluate(() => Reflect.get(window, "__sparkInputListeners")),
  ).toBe(0);
  await page
    .getByRole("button", { name: "Begin exploration", exact: true })
    .click();
  await expect(page.locator("canvas")).toHaveAttribute("data-phase", "playing");
  await expect(page.locator("canvas")).toHaveAttribute(
    "data-mission-step",
    "0",
  );
  const start = await position(page);
  await page.waitForTimeout(200);
  expect(await position(page)).toEqual(start);
  expect(errors).toEqual([]);
});

test("mouse orbit changes the follow camera and Escape releases capture", async ({
  page,
}) => {
  await begin(page);
  const box = await page.locator("canvas").boundingBox();
  if (!box) throw new Error("Missing canvas");
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.6);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.63, {
    steps: 8,
  });
  await page.mouse.up();
  await expect(page.locator("canvas")).not.toHaveAttribute(
    "data-camera-yaw",
    "0.000",
  );
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Resume exploration" }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.pointerLockElement === null)).toBe(
    true,
  );
});

test("records an observational 1080p frame sample and responsive menu captures", async ({
  page,
}, testInfo) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1920, height: 1080 });
  const start = Date.now();
  await begin(page);
  const readyMs = Date.now() - start;
  const intervals = await page.evaluate(
    () =>
      new Promise<number[]>((resolve) => {
        const samples: number[] = [];
        let previous = performance.now();
        const sample = (time: number) => {
          samples.push(time - previous);
          previous = time;
          if (samples.length < 90) requestAnimationFrame(sample);
          else resolve(samples.slice(1));
        };
        requestAnimationFrame(sample);
      }),
  );
  intervals.sort((a, b) => a - b);
  const result = {
    environment:
      "Playwright browser on current host; not a representative gaming laptop benchmark",
    viewport: "1920x1080",
    readyIncludingStartMs: readyMs,
    medianFrameIntervalMs: intervals[Math.floor(intervals.length / 2)],
    p95FrameIntervalMs: intervals[Math.floor(intervals.length * 0.95)],
  };
  console.log("Frame sample", JSON.stringify(result));
  await testInfo.attach("frame-sample", {
    body: JSON.stringify(result, null, 2),
    contentType: "application/json",
  });
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.screenshot({ path: testInfo.outputPath("pause-720p.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("combobox").selectOption("lt");
  await expect(
    page.getByRole("button", { name: "Tęsti tyrinėjimą" }),
  ).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("menu-mobile-lt.png") });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("keyboard language selection pauses gameplay without stealing selector focus", async ({
  page,
}) => {
  await begin(page);
  await page.getByRole("combobox").focus();
  await expect(page.getByRole("combobox")).toBeFocused();
  await page.getByRole("combobox").selectOption("lt");
  await expect(page.locator("canvas")).toHaveAttribute("data-phase", "paused");
  await expect(
    page.getByRole("button", { name: "Tęsti tyrinėjimą" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Tęsti tyrinėjimą" }).click();
  await expect(page.locator("canvas")).toHaveAttribute("data-phase", "playing");
  await expect(page.getByLabel("Vieta plokštėje")).toContainText(
    /-?\d+,\d; -?\d+,\d/,
  );
});
