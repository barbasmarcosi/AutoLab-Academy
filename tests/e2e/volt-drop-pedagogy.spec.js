import AxeBuilder from '@axe-core/playwright';
import {readFile} from 'node:fs/promises';
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
 // Before measuring, freeze an explicit (possibly wrong) hypothesis and
 // a discriminating plan. A wrong initial guess is not graded as a failure.
 const transfer=page.locator("#volt-holdout-host");
 await expect(transfer.locator("#holdout-probe")).toHaveCount(0);
 await expect(transfer.locator("#holdout-locked")).toHaveCount(0);
 await transfer.locator("[data-holdout='freeze']").click();
 await expect(transfer.locator("#holdout-status")).toContainText("Revisá el compromiso");
 await transfer.locator("#holdout-initial").selectOption("return");
 await transfer.locator("#holdout-expected").selectOption("return");
 await transfer.locator("#holdout-first").selectOption("return");
 await transfer.locator("#holdout-confidence").selectOption("high");
 await transfer.locator("[data-holdout='freeze']").click();
 await expect(transfer.locator("#holdout-locked")).toContainText("retorno");
 await expect(transfer.locator("#holdout-probe")).toBeVisible();
 await transfer.locator("#holdout-probe").selectOption("positive");
 await transfer.locator("[data-holdout='probe']").click();
 await expect(transfer.locator("#holdout-measured")).toContainText("Primero medí el tramo");
 await expect(transfer.locator("#holdout-history")).not.toContainText("positive");
 await transfer.locator("#holdout-probe").selectOption("return");
 await transfer.locator("[data-holdout='probe']").click();
 await expect(transfer.locator("#holdout-measured")).toContainText("retorno");
 await transfer.locator("#holdout-probe").selectOption("positive");
 await transfer.locator("[data-holdout='probe']").click();
 await expect(transfer.locator("#holdout-history")).toContainText("retorno D–E: 0,60 V");
 await expect(transfer.locator("#holdout-history")).toContainText("positivo A–B: 0,64 V");
 // The novice can compare both readings without memorizing the first one.
 // This first blind case is deliberately unlike both worked examples:
 // neither conductor has a clearly dominant loss.
 await transfer.locator("#holdout-load").fill("10,76");
 // The falsifier must follow the diagnosis the student actually selects;
 // selecting another diagnosis invalidates the previous refutation choice.
 await transfer.locator("#holdout-cause").selectOption("positive");
 await expect(transfer.locator("#holdout-falsifier-field")).toContainText("poca caída en positivo");
 await transfer.locator("input[name='holdout-falsifier'][value='0']").check();
 await transfer.locator("#holdout-cause").selectOption("balanced");
 await expect(transfer.locator("#holdout-falsifier-field")).toContainText("una caída claramente dominante");
 await expect(transfer.locator("input[name='holdout-falsifier']:checked")).toHaveCount(0);
 await transfer.locator("input[name='holdout-falsifier'][value='2']").check();
 // No credit until the student records an independent explanation.
 await transfer.locator("[data-holdout='grade']").click();
 await expect(transfer.locator("#holdout-status")).toContainText("Escribí una justificación");
 await transfer.locator("#holdout-reasoning").fill("Las caídas medidas en ambos conductores son casi iguales, por lo que no hay un tramo dominante. Cambiaría de hipótesis si otra medición bajo la misma carga mostrara una diferencia sustancial.");
 await transfer.locator("[data-holdout='grade']").click();
 await expect(transfer.locator("#holdout-result")).toContainText("Resultado objetivo del intento 1");
 await expect(transfer.getByText("criterios cumplidos",{exact:false})).toBeVisible();
 await expect(transfer.getByText("El argumento está guardado y pendiente de revisión cualitativa humana",{exact:false})).toBeVisible();
 await expect(transfer.locator("#holdout-result")).toContainText("La evidencia contradijo la hipótesis inicial");
 await expect(transfer.locator("#holdout-result")).toContainText("después: sin tramo dominante");
 await expect(page.locator("#lesson-theory-practice-status")).toContainText("caso independiente completados");
 // Persist both commitments and their order, not just the automatically graded score.
 await page.locator('nav.nav button[data-id="data"]').click();
 const downloaded=page.waitForEvent("download");
 await page.locator('[data-action="export"]').click();
 const backup=JSON.parse(await readFile(await(await downloaded).path(),"utf8"));
 const saved=backup.payload.cases.filter(x=>x.id==="lab-volt-drop-holdout-v2").at(-1);
 expect(saved?.passed).toBe(true);
 const evidence=JSON.parse(saved.report);
 expect(evidence.initial).toMatchObject({caseId:"balanced",hypothesis:"return",prediction:"return",firstProbe:"return",confidence:"high"});
 expect(evidence.measuredInOrder).toEqual(["return","positive"]);
 expect(evidence.initial.frozenAt).toMatch(/^20\d{2}-\d{2}-\d{2}T/);
 expect(evidence.measurementTrail).toHaveLength(2);
 expect(evidence.measurementTrail.map(x=>x.probe)).toEqual(["return","positive"]);
 expect(evidence.measurementTrail.every(x=>typeof x.volts==="number"&&x.recordedAt>=evidence.initial.frozenAt)).toBe(true);
 expect(evidence.revision).toMatchObject({initial:"return",final:"balanced",changed:true,evidenceSupported:true});
 expect(evidence.qualitativeReview).toBe("pending");
 expect(saved.reasoning).toContain("Las caídas medidas");
 await page.reload();
 await page.locator('nav.nav button[data-id="learn"]').click();
 await page.locator('button[data-action="lesson"][data-id="volt-drop"]').click();
 await expect(page.locator("#lesson-theory-practice-status")).toContainText("caso independiente completados");
 await expect(page.locator("#volt-holdout-host")).toContainText("Un consumidor de 12 V funciona débilmente");
 await expect(page.locator("#volt-holdout-host").locator("#holdout-probe")).toHaveCount(0);
 // This is a fresh assessment, not a repeat of the solved balanced-loss case.
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

test("reserved case must start from a coherent frozen hypothesis, allow uncertainty and reset on retry",async({page})=>{
 await page.goto("./");
 await page.locator('nav.nav button[data-id="learn"]').click();
 await page.locator('article.lesson-card').filter({hasText:"La caída de tensión cuenta la historia"})
  .getByRole("button",{name:"Estudiar"}).click();
 const transfer=page.locator("#volt-holdout-host");
 await transfer.locator("#holdout-initial").selectOption("undetermined");
 await transfer.locator("#holdout-expected").selectOption("balanced");
 await transfer.locator("[data-holdout='freeze']").click();
 await expect(transfer.locator("#holdout-status")).toContainText("La predicción debe ser compatible");
 await expect(transfer.locator("#holdout-probe")).toHaveCount(0);
 await transfer.locator("#holdout-expected").selectOption("need-evidence");
 await transfer.locator("#holdout-first").selectOption("positive");
 await transfer.locator("[data-holdout='freeze']").click();
 await expect(transfer.locator("#holdout-locked")).toContainText("Información insuficiente");
 await transfer.locator("#holdout-probe").selectOption("positive");
 await transfer.locator("[data-holdout='probe']").click();
 await transfer.locator("#holdout-probe").selectOption("return");
 await transfer.locator("[data-holdout='probe']").click();
 await transfer.locator("#holdout-load").fill("10,76");
 await transfer.locator("#holdout-cause").selectOption("balanced");
 await transfer.locator("input[name='holdout-falsifier'][value='2']").check();
 await transfer.locator("#holdout-reasoning").fill("Antes no tenía evidencia suficiente. Ahora las dos caídas son próximas; si una lectura nueva contradijera esa igualdad cambiaría la conclusión.");
 await transfer.locator("[data-holdout='grade']").click();
 await expect(transfer.locator("#holdout-result")).toContainText("La evidencia permitió pasar de incertidumbre");
 await transfer.locator("[data-holdout='retry']").click();
 await expect(transfer.locator("#holdout-initial")).toBeVisible();
 await expect(transfer.locator("#holdout-probe")).toHaveCount(0);
 await expect(transfer.locator("#holdout-locked")).toHaveCount(0);
});
