import { test, expect } from "@playwright/test";
test("two private-room players move, diagnose, repair and reconnect in EN/LT", async ({
  browser,
}, info) => {
  test.setTimeout(120000);
  const ca = await browser.newContext({ baseURL: "http://127.0.0.1:4173" }),
    cb = await browser.newContext({ baseURL: "http://127.0.0.1:4173" });
  const a = await ca.newPage(),
    b = await cb.newPage();
  const errors: string[] = [];
  a.on("pageerror", (e) => errors.push(e.message));
  b.on("pageerror", (e) => errors.push(e.message));
  try {
    await a.goto("/");
    await b.goto("/");
    await a
      .getByRole("button", { name: "Cooperative pilot", exact: true })
      .click();
    await b.getByRole("combobox").selectOption("lt");
    await b
      .getByRole("button", { name: "Bendradarbiavimo bandymas", exact: true })
      .click();
    const pa = a.getByRole("dialog", {
      name: "Cooperative pilot",
      exact: true,
    });
    const pb = b.getByRole("dialog", {
      name: "Bendradarbiavimo bandymas",
      exact: true,
    });
    await pa
      .getByRole("button", { name: "Create private room", exact: true })
      .click();
    const code = pa.getByLabel("Room code", { exact: true });
    await expect(code).toHaveText(/^[A-Za-z0-9_-]{6,32}$/);
    await pb
      .getByRole("textbox", { name: "Kambario kodas", exact: true })
      .fill(await code.innerText());
    await pb.getByRole("button", { name: "Prisijungti", exact: true }).click();
    await expect(pa).toContainText("Engineer");
    await expect(pb).toContainText("Analitikas");
    const before = await pb.getByLabel("analyst position").innerText();
    await pa.getByRole("img", { name: "Cooperative board" }).focus();
    await a.keyboard.down("KeyA");
    await a.waitForTimeout(350);
    await a.keyboard.up("KeyA");
    await expect(pb.getByLabel("analyst position")).not.toHaveText(before);
    await pa.getByRole("img", { name: "Cooperative board" }).focus();
    await a.keyboard.down("KeyD");
    await a.waitForTimeout(350);
    await a.keyboard.up("KeyD");
    await pa.getByRole("button", { name: "Measure VCC", exact: true }).click();
    await expect(pb.getByLabel("Shared VCC")).toHaveText("5,00 V");
    await pb
      .getByRole("button", { name: "Matuoti SENSE", exact: true })
      .click();
    await expect(pa.getByLabel("Shared SENSE")).toHaveText("0.00 V");
    await a.waitForTimeout(160);
    await pa
      .getByRole("button", { name: "Diagnose R1 open", exact: true })
      .click();
    await expect(pb).toContainText("R1 gedimas nustatytas");
    await pb
      .getByRole("button", { name: "Restore R1", exact: true })
      .count()
      .then((n) => expect(n).toBe(0));
    await b.waitForTimeout(160);
    await pb.getByRole("button", { name: "Atkurti R1", exact: true }).click();
    await expect(pa).toContainText("R1 restored");
    await pa
      .getByRole("button", { name: "Reconnect transport", exact: true })
      .click();
    await expect(
      pa.getByRole("status", { exact: false }).filter({ hasText: "Connected" }),
    ).toBeVisible();
    await a.waitForTimeout(350);
    await pa.getByRole("button", { name: "Measure VCC", exact: true }).click();
    await expect(pb.getByLabel("Shared VCC")).toHaveText("5,00 V");
    await pb
      .getByRole("button", { name: "Matuoti SENSE", exact: true })
      .click();
    await expect(pa.getByLabel("Shared SENSE")).toHaveText("2.50 V");
    await a.waitForTimeout(160);
    await pa
      .getByRole("button", { name: "Verify shared repair", exact: true })
      .click();
    await expect(pa).toContainText("Cooperative circuit restored");
    await expect(pb).toContainText("Bendra grandinė atkurta");
    await a.setViewportSize({ width: 1280, height: 1400 });
    await pa
      .getByRole("heading", {
        name: "Cooperative circuit restored",
        exact: true,
      })
      .scrollIntoViewIfNeeded();
    await a.screenshot({ path: info.outputPath("m5-coop-en.png") });
    await b.setViewportSize({ width: 390, height: 844 });
    await pb
      .getByRole("heading", { name: "Bendra grandinė atkurta", exact: true })
      .scrollIntoViewIfNeeded();
    expect(await pb.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
      true,
    );
    await b.screenshot({ path: info.outputPath("m5-coop-lt.png") });
    await pb
      .getByRole("button", { name: "Išeiti iš kambario", exact: true })
      .click();
    await expect(pa).toContainText("Waiting for partner");
    await expect(
      pa.getByRole("heading", { name: "R1 open", exact: true }),
    ).toBeVisible();
    expect(errors).toEqual([]);
  } finally {
    await ca.close();
    await cb.close();
  }
});
