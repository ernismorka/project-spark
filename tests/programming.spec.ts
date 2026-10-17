import { expect, test } from "@playwright/test";
test("builds and programs the controller through blocks and text in EN/LT", async ({
  page,
}, info) => {
  test.setTimeout(180000);
  await page.goto("/");
  await expect(page.getByTestId("renderer-status")).toHaveAttribute(
    "data-status",
    "ready",
  );
  await page.getByRole("button", { name: "Open creative workbench" }).click();
  const panel = page.getByRole("dialog", { name: "Creative programming" });
  await panel
    .getByRole("button", { name: "Run controller", exact: true })
    .click();
  await expect(panel.getByLabel("Workbench SENSE")).toHaveText("2.50 V");
  await expect(panel.locator("[data-output]")).toHaveAttribute(
    "data-output",
    "true",
  );
  await panel
    .getByRole("button", { name: "Connect resistor", exact: true })
    .click();
  await panel
    .getByRole("button", { name: "Run controller", exact: true })
    .click();
  await expect(panel.getByLabel("Workbench SENSE")).toHaveText("1.67 V");
  await expect(panel).toContainText("Challenge complete");
  await page.screenshot({ path: info.outputPath("m4-built-en.png") });
  await panel.getByRole("button", { name: "Text", exact: true }).click();
  await panel
    .getByLabel("Text", { exact: true })
    .fill("READ SENSE\nABOVE 1\nWRITE OUT");
  await panel.getByRole("button", { name: "Apply text", exact: true }).click();
  await panel
    .getByRole("button", { name: "Run controller", exact: true })
    .click();
  await expect(panel.locator("[data-output]")).toHaveAttribute(
    "data-output",
    "true",
  );
  await panel.getByRole("button", { name: "Blocks", exact: true }).click();
  await expect(panel.getByLabel("Parameter 2")).toHaveValue("1");
  await panel.getByLabel("Parameter 2").fill("2");
  await panel
    .getByRole("button", { name: "Run controller", exact: true })
    .click();
  await expect(panel.locator("[data-output]")).toHaveAttribute(
    "data-output",
    "false",
  );
  await panel.getByRole("button", { name: "Text", exact: true }).click();
  await expect(panel.getByLabel("Text", { exact: true })).toHaveValue(
    "READ SENSE\nABOVE 2\nWRITE OUT",
  );
  await panel.getByLabel("Text", { exact: true }).fill("while(true) {}");
  await panel.getByRole("button", { name: "Apply text", exact: true }).click();
  await expect(panel.getByRole("alert")).toContainText("Invalid program");
  await panel
    .getByRole("button", { name: "Reset workbench", exact: true })
    .click();
  await panel
    .getByLabel("Text", { exact: true })
    .fill("READ SENSE\nWRITE OUT\nREPEAT 128");
  await panel.getByRole("button", { name: "Apply text", exact: true }).click();
  await panel
    .getByRole("button", { name: "Run controller", exact: true })
    .click();
  await expect(panel.getByRole("alert")).toContainText("budget exhausted");
  await panel
    .getByRole("button", { name: "Reset workbench", exact: true })
    .click();
  await panel.getByRole("button", { name: "Remove R1", exact: true }).click();
  await panel.getByRole("button", { name: "Remove R2", exact: true }).click();
  await panel
    .getByRole("button", { name: "Run controller", exact: true })
    .click();
  await expect(panel.getByRole("alert")).toContainText("cannot be solved");
  await panel
    .getByRole("button", { name: "Return to adventure", exact: true })
    .click();
  await page.getByRole("combobox").selectOption("lt");
  await page.getByRole("button", { name: "Atverti kūrybinę dirbtuvę" }).click();
  const lt = page.getByRole("dialog", { name: "Kūrybinis programavimas" });
  await lt
    .getByRole("button", { name: "Vykdyti valdiklį", exact: true })
    .click();
  await expect(lt.getByLabel("Workbench SENSE")).toHaveText("2,50 V");
  await page.setViewportSize({ width: 390, height: 844 });
  await lt.getByLabel("Workbench SENSE").scrollIntoViewIfNeeded();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: info.outputPath("m4-controller-lt.png") });
  await lt
    .getByRole("button", { name: "Grįžti į nuotykį", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Pradėti tyrinėjimą", exact: true }),
  ).toBeVisible();
});
