# E4 — Laboratorio de baterías y BMS (primer incremento)

## Objetivo y alcance

El laboratorio de la PWA enseña por qué la **integración de corriente** depende de calibración, capacidad efectiva y condiciones iniciales. Esto no es un simulador electroquímico ni un instrumento diagnóstico de alta tensión.

### Implementado en la PWA

- Generador determinista de **tres datasets sintéticos** (corriente nominal, sensor con sesgo +0,6 A, capacidad verdadera reducida de 60 a 48 Ah).
- Curvas de SOC estimado y referencia **solo en los datasets internos**, y curva de tensión algebraica ilustrativa claramente etiquetada como tal.
- Integración trapezoidal de corriente usando la convención **corriente positiva = descarga**; lectura de corriente negativa en carga.
- Entradas de capacidad asumida, SOC inicial y corrección de sesgo, con recálculo inmediato.
- CSV import/export local con columnas t_s,current_a,voltage_v y soc_reference_pct opcional, validación numérica y temporal, máximo 500 KB / 2000 muestras.
- Relación SOH basada en capacidad **solo mediante dos capacidades externas suministradas por el usuario** para un ensayo completo comparable. No se deriva SOH de curvas parciales ni tensiones aisladas.
- Tres desafíos sintéticos con corrección explicada y resultado guardado en historial IndexedDB.
- Gráficos SVG generados solo como visualización; no se implementa un modelo químico de baterías en JS.

### Caso de estudio nominal

Una descarga constante de 12 A durante 3600 s consume 12 Ah; con capacidad asumida de 60 Ah y SOC inicial 100%, la estimación final es 80%. Referencia y valores del dataset son **artificiales**.

- Sesgo +0,6 A ⇒ lectura 12,6 A ⇒ estimación final 79% frente a 80% de referencia (−1 punto porcentual).
- Capacidad real sintética 48 Ah manteniendo 60 Ah en el estimador ⇒ estimación 80% frente a referencia 75% (+5 puntos porcentuales).
- Estas observaciones sirven para practicar hipótesis, no para deducir degradación de vehículos reales.

## Componente científico PyBaMM

- Proyecto existente: https://pybamm.org/ y https://github.com/pybamm-team/PyBaMM
- Script complementario: tools/pybamm_export.py.
- Utiliza pybamm.Simulation(pybamm.lithium_ion.SPM() o DFN()) y extrae Time [s], Current [A] y Voltage [V].
- **El script no se ejecuta en el navegador.** Se instala PyBaMM en una computadora con Python; exporta CSV para importar luego a la PWA.
- Las curvas sintéticas incluidas en PWA **no son salidas de PyBaMM**.
- Las curvas importadas NO incluyen una referencia SOC validada automáticamente. El usuario debe configurar capacidad inicial y SOC estimado; los resultados no equivalen a validación electroquímica.
- Antes de atribuir valor de SOC/SOH a modelos PyBaMM se requerirá definir protocolo, parámetros, química, observabilidad y validación con datos experimentales.

### Ejecución local orientativa

    python -m venv .venv
    # Activar entorno
    python -m pip install pybamm
    python tools/pybamm_export.py --model spm --duration 1800 --output autolab-pybamm.csv

Importar autolab-pybamm.csv desde AutoLab Academy → Laboratorios → Baterías / BMS.

**Actualización (24/10/2026):** se creó un workflow científico independiente de Pages, con `pybamm==26.10.1.1`, Python 3.12 y pruebas automáticas de los modelos SPM y DFN. Estas pruebas resuelven las ecuaciones con PyBaMM real, exportan CSV, comparan el contrato del parser JS/estimador de AutoLab y guardan los resultados en artefactos de Actions. El archivo `.metadata.json` incorpora nombre de modelo, versión, conjunto de parámetros por defecto, observaciones y SHA-256. Se añade `python-environment.txt` para rastrear las dependencias transitivas reales. Consultar `.github/workflows/science-pybamm.yml`.

La CI verifica **ejecución y consistencia técnica de simulaciones**, no validez experimental frente a baterías reales. Los archivos descargables de Actions expiran a los 14 días, y los parámetros por defecto no son específicos de fabricantes. Las muestras algebraicas internas de la PWA continúan claramente diferenciadas de los modelos PyBaMM.

El workflow científico corre cuando cambian archivos científicos en un PR o se invoca manualmente; no añade dependencias pesadas al despliegue habitual de GitHub Pages.

## Seguridad

- Ningún procedimiento para abrir, puentear interlocks, medir o intervenir alta tensión física.
- No reemplaza formación profesional HV, instrumentación calibrada ni documentación OEM.
- Dataset CSV del usuario y ajustes del laboratorio permanecen en memoria del navegador; solo el resultado de ejercicios internos se guarda en IndexedDB.
- No cargar datos reales de clientes sin autorización.
- El CSV importado puede contener valores simulados o de origen desconocido; se marca explícitamente como no verificado.
- La diferencia entre una referencia sintética y una estimación no se presenta como capacidad diagnóstica de batería real.

## Calidad pendiente

1. Mantener un corpus versionado y permanente de resultados PyBaMM (los artefactos CI expiran) con hashes y parámetros detallados.
2. Datasets físicos externos con origen, química y parámetros trazables y golden vectors verificados.
3. Estimadores más robustos y filtros (p. ej. Kalman) utilizando bibliotecas existentes, antes de promover a análisis real.
4. Validación visual y táctil de gráficos e importaciones en Safari iPhone.
5. Laboratorio de análisis de envejecimiento por experimentos comparables, con evaluación supervisada.
