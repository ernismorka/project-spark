import { expect, test } from "@playwright/test";

test("demo title gives visible start, controls and honest practice/server guidance in EN/LT", async ({
  page,
}, testInfo) => {
  const external: string[] = [];
  const errors: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).hostname !== "127.0.0.1")
      external.push(request.url());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  await expect(page.getByTestId("renderer-status")).toHaveAttribute(
    "data-status",
    "ready",
  );
  await expect(
    page.getByRole("region", { name: "Welcome, engineer.", exact: true }),
  ).toContainText("WASD");
  await expect(
    page.getByRole("button", { name: "Begin exploration", exact: true }),
  ).toBeInViewport();
  await expect(page.locator(".intro")).toContainText("No saved progress");
  await page.screenshot({
    path: testInfo.outputPath("m8-title-en.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Cooperative pilot", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "demo launcher does not start it",
  );
  await page
    .getByRole("button", { name: "Return to adventure", exact: true })
    .click();
  await page.getByRole("combobox").selectOption("lt");
  await page.setViewportSize({ width: 1366, height: 768 });
  await expect(
    page.getByRole("button", { name: "Pradėti tyrinėjimą", exact: true }),
  ).toBeInViewport();
  await expect(page.locator(".intro")).toContainText("Pažanga neišsaugoma");
  await page.screenshot({
    path: testInfo.outputPath("m8-title-lt.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Pradėti tyrinėjimą", exact: true })
    .click();
  await expect(page.locator("canvas")).toHaveAttribute("data-phase", "playing");
  await expect(page.locator("canvas")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator(".menu-controls").first()).toContainText("WASD");
  await page.screenshot({ path: testInfo.outputPath("m8-controls-lt.png") });
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
});
