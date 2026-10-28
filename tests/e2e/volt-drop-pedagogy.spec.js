import AxeBuilder from '@axe-core/playwright';
import {test,expect} from "@playwright/test";
test("lesson 1: learn, predict, place probes, correct mistakes, save guided and independent evidence",async({page})=>{
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
 await expect(lab.locator("#volt-save")).toBeDisabled();
 // Changing parameters must invalidate measurements. A correct hypothesis
 // is impossible without actual probe operations on both cables.
 await lab.locator("#volt-points").selectOption("positive");
 await lab.locator("#volt-prediction").fill("0,48");
 await lab.locator("#volt-measure").click();
 await expect(lab.locator("#volt-reading")).toContainText("0,48 V");
 await lab.locator("#volt-points").selectOption("return");
 await lab.locator("#volt-prediction").fill("1,92");
 await lab.locator("#volt-measure").click();
 await expect(lab.locator("#volt-reading")).toContainText("1,92 V");
 await lab.locator("#volt-positive").focus();
 await page.keyboard.press("End");
 await expect(lab.locator("#volt-positive-value")).toContainText("1,00");
 await expect(lab.locator("#volt-measurements")).toContainText("Todavía no realizaste");
 await lab.locator("#volt-points").selectOption("positive");
 await lab.locator("#volt-prediction").fill("0,00");
 await lab.locator("#volt-measure").click();
 await lab.locator("#volt-points").selectOption("return");
 await lab.locator("#volt-prediction").fill("1,41");
 await lab.locator("#volt-measure").click();
 await lab.locator("#volt-diagnosis").selectOption("positive");
 await lab.locator("#volt-diagnose").click();
 await expect(lab.locator("#volt-save")).toBeDisabled();
 await lab.locator("#volt-points").selectOption("positive");
 await lab.locator("#volt-prediction").fill("3,53");
 await lab.locator("#volt-measure").click();
 await lab.locator("#volt-points").selectOption("return");
 await lab.locator("#volt-prediction").fill("1,41");
 await lab.locator("#volt-measure").click();
 await lab.locator("#volt-diagnosis").selectOption("positive");
 await lab.locator("#volt-diagnose").click();
 await expect(lab.locator("#volt-diagnosis-result")).toContainText("Correcto");
 await expect(lab.locator("#volt-save")).toBeEnabled();
 await lab.locator("#volt-save").click();
 await expect(lab.locator("#volt-save-status")).toContainText("guardada");
 await expect(page.locator("#lesson-theory-practice-status")).toContainText("Banco guiado completado");
 // Separate unseen case, without showing its hidden resistances.
 const transfer=page.locator("#volt-holdout-host");
 await transfer.locator("#holdout-probe").selectOption("positive");
 await transfer.locator("[data-holdout='probe']").click();
 await transfer.locator("#holdout-probe").selectOption("return");
 await transfer.locator("[data-holdout='probe']").click();
 // This first blind case is deliberately unlike both worked examples:
 // neither conductor has a clearly dominant loss.
 await transfer.locator("#holdout-load").fill("10,76");
 await transfer.locator("#holdout-cause").selectOption("balanced");
 await transfer.locator("input[name='holdout-falsifier'][value='0']").check();
 // No credit until the student records an independent explanation.
 await transfer.locator("[data-holdout='grade']").click();
 await expect(transfer.locator("#holdout-status")).toContainText("Escribí una justificación");
 await transfer.locator("#holdout-reasoning").fill("Las caídas medidas en ambos conductores son casi iguales, por lo que no hay un tramo dominante. Cambiaría de hipótesis si otra medición bajo la misma carga mostrara una diferencia sustancial.");
 await transfer.locator("[data-holdout='grade']").click();
 await expect(transfer.locator("#holdout-result")).toContainText("Resultado objetivo del intento 1");
 await expect(transfer.getByText("criterios cumplidos",{exact:false})).toBeVisible();
 await expect(transfer.getByText("El texto fue guardado pero sigue pendiente de revisión cualitativa humana",{exact:false})).toBeVisible();
 await expect(page.locator("#lesson-theory-practice-status")).toContainText("caso independiente completados");
 await page.reload();
 await page.locator('nav.nav button[data-id="learn"]').click();
 await page.locator('button[data-action="lesson"][data-id="volt-drop"]').click();
 await expect(page.locator("#lesson-theory-practice-status")).toContainText("caso independiente completados");
});

test("first lesson remains navigable at mobile width and exposes labelled instruments",async({page})=>{
 await page.setViewportSize({width:375,height:812});
 await page.goto("./");
 await page.locator('nav.nav button[data-id="learn"]').click();
 await page.locator('article.lesson-card').filter({hasText:"La caída de tensión cuenta la historia"}).getByRole("button",{name:"Estudiar"}).click();
 const lab=page.locator("#lesson-practice-host");
 await expect(lab.locator("#volt-prediction")).toBeVisible();
 await expect(lab.locator("#volt-measure")).toBeVisible();
 await lab.locator("#volt-points").selectOption("return");
 await expect(lab.locator("#volt-probe-location")).toContainText("D–E");
 await lab.locator("#volt-prediction").fill("1,92");
 await lab.locator("#volt-measure").click();
 await expect(lab.locator("#volt-reading")).toContainText("Predicción compatible");
 await expect(lab.locator("#volt-measurements")).toContainText("D–E");
});

test("first lesson WCAG 2.1 A and AA audit on desktop and narrow mobile viewport",async({page})=>{
 await page.setViewportSize({width:375,height:812});
 await page.goto("./");
 await page.locator('nav.nav button[data-id="learn"]').click();
 await page.locator('article.lesson-card').filter({hasText:"La caída de tensión cuenta la historia"}).getByRole("button",{name:"Estudiar"}).click();
 await expect(page.locator("#volt-holdout-host")).toBeVisible();
 const report=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"]).analyze();
 expect(report.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
});
