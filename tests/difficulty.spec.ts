import { expect, test } from "@playwright/test";

test("switches localized guidance during play and persists the difficulty", async ({
  page,
}) => {
  await page.goto("/");
  const picker = page.locator(".difficulty-picker");
  const summary = picker.locator("summary");
  await expect(summary).toHaveText("Difficulty · Technician (Normal)");
  await expect(page.getByTestId("renderer-status")).toHaveAttribute(
    "data-status",
    "ready",
  );
  await page
    .getByRole("button", { name: "Begin exploration", exact: true })
    .click();
  const canvas = page.locator("canvas");
  await expect(canvas).toHaveAttribute("data-phase", "playing");
  await expect(page.locator(".compass")).toBeVisible();
  await summary.click();
  await picker
    .getByRole("radio", { name: "Engineer (Hard)", exact: true })
    .check();
  await expect(canvas).toHaveAttribute("data-guidance-beacon", "false");
  await expect(canvas).toHaveAttribute("data-phase", "playing");
  await expect(page.locator(".compass")).toHaveCount(0);
  await expect(page.getByLabel("Board position")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Leave the pad", exact: true }),
  ).toBeVisible();
  await picker
    .getByRole("radio", { name: "Apprentice (Easy)", exact: true })
    .check();
  await expect(canvas).toHaveAttribute("data-guidance-beacon", "true");
  await expect(page.locator(".compass")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Use WASD to move/ }),
  ).toBeVisible();
  await summary.click();
  await page.getByRole("combobox").focus();
  await page.getByRole("combobox").selectOption("lt");
  await expect(summary).toHaveText("Sudėtingumas · Mokinys (lengvas)");
  await page.reload();
  await expect(summary).toHaveText("Difficulty · Apprentice (Easy)");
  await page.evaluate(() =>
    localStorage.setItem("project-spark:difficulty", "invalid"),
  );
  await page.reload();
  await expect(summary).toHaveText("Difficulty · Technician (Normal)");
});
