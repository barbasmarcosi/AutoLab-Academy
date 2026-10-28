import {test,expect} from "@playwright/test";

test("lesson 1 teaches before testing, explains wrong answers and records real virtual interaction",async({page})=>{
 await page.goto("./");
 await page.getByRole("button",{name:"Academia",exact:true}).click();
 await page.locator(".lesson-card").first().getByRole("button",{name:"Estudiar"}).click();
 const lesson=page.locator("#main-content");
 await expect(lesson.getByText("Ejemplo resuelto, paso a paso")).toBeVisible();
 await expect(lesson.getByText("Resistencia total:",{exact:false})).toBeVisible();
 const lab=page.locator("#lesson-practice-host");
 await expect(lab.locator("#volt-model")).toContainText("4,80 A");
 const first=lab.locator("[data-volt-feedback='units']");
 await lab.locator("input[name='volt-units'][value='0']").check();
 await lab.locator("[data-volt-check='units']").click();
 await expect(first).toContainText("Incorrecto");
 await expect(first).toContainText("Tu respuesta:");
 await expect(first).toContainText("Respuesta esperada:");
 await lab.locator("input[name='volt-units'][value='1']").check();
 await lab.locator("[data-volt-check='units']").click();
 await expect(first).toContainText("Correcto");
 await lab.locator("input[name='volt-load'][value='0']").check();
 await lab.locator("[data-volt-check='load']").click();
 await lab.locator("input[name='volt-probe'][value='0']").check();
 await lab.locator("[data-volt-check='probe']").click();
 await lab.locator("#volt-points").selectOption("return");
 await lab.locator("#volt-points").selectOption("positive");
 // One controlled intervention invalidates any previous diagnosis.
 await lab.locator("#volt-positive").focus();
 await page.keyboard.press("End");
 await expect(lab.locator("#volt-positive-value")).toContainText("1,00");
 await lab.locator("#volt-diagnosis").selectOption("positive");
 await lab.locator("#volt-diagnose").click();
 await expect(lab.locator("#volt-diagnosis-result")).toContainText("Correcto");
 await expect(lab.locator("#volt-save")).toBeEnabled();
 await lab.locator("#volt-save").click();
 await expect(lab.locator("#volt-save-status")).toContainText("guardada");
 await expect(page.locator("#lesson-theory-practice-status")).toContainText("Práctica aprobada");
});
