import { expect, test } from "@playwright/test";
test("opens, initializes or explains WebGL failure, and switches language", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const status = page.getByTestId("renderer-status");
  await expect(status).toHaveAttribute("data-status", /ready|error/);
  if ((await status.getAttribute("data-status")) === "error")
    await expect(page.getByText(/This scene requires WebGL 2/)).toBeVisible();
  else await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("combobox").selectOption("lt");
  await expect(page.locator("html")).toHaveAttribute("lang", "lt");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "kibirkšties",
  );
  await page.getByRole("combobox").selectOption("en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("spark");
  expect(errors).toEqual([]);
});
test("explains a deliberately unavailable WebGL context", async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = (() =>
      null) as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto("/");
  await expect(page.getByTestId("renderer-status")).toHaveAttribute(
    "data-status",
    "error",
  );
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
});

test("renders a real WebGL scene", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByTestId("renderer-status")).toHaveAttribute(
    "data-status",
    "ready",
  );
  await page.screenshot({
    path: testInfo.outputPath("foundation.png"),
    fullPage: true,
  });
});
