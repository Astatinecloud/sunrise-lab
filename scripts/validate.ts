import { writeFileSync } from 'node:fs';
import { params, exp3, exp4, computedC1, computedKprod, defaultBuild, computeDelivery, defaultTpd, steadyStateKanR, kanrThreshold, micFromKanR, defaultSimConfig, runSimulation, compareKinetics, algebraicReduction, divisionRate } from '../src/model';
import { wikiReproductions, knownWikiDiscrepancy } from '../src/model/wiki';
const checks: {
    name: string;
    pass: boolean;
    detail: string;
}[] = [];
const check = (name: string, pass: boolean, detail: string) => checks.push({ name, pass, detail });
const table = (rows: unknown[][]) => rows.map(r => '| ' + r.join(' | ') + ' |').join('\n');
const equilibrium = [.058, .174, .579, 1.737].map(n => algebraicReduction(n));
const kinetics = [1, 10, 100].flatMap(k => [.058, .174, .579, 1.737].map(n => compareKinetics(n, k)));
const eqError = Math.max(...equilibrium.map(x => x.error));
const conservation = Math.max(...equilibrium.map(x => x.conservation));
const fluxErrors = [1, 10, 100].map(k => Math.max(...kinetics.filter(x => x.kon === k).map(x => x.maxRelativeError)));
check('1a exact algebraic reduction', eqError < 1e-8 && conservation < 1e-10, `${eqError}; conservation ${conservation}`);
check('1b QSS convergence', fluxErrors[2] < .01 && fluxErrors[0] / fluxErrors[1] >= 5 && fluxErrors[1] / fluxErrors[2] >= 5, JSON.stringify(fluxErrors));
const required = (kcat: number) => {
    for (let j = 0; j < 10000; j++)
        if (steadyStateKanR(j * computedC1, { ...defaultTpd, kcat }) <= kanrThreshold(params.A_e.value))
            return j;
    return Infinity;
};
runSimulation(defaultSimConfig);
const start = performance.now();
const withSunrise = runSimulation(defaultSimConfig);
const runtime = performance.now() - start;
const without = runSimulation({ ...defaultSimConfig, useSunrise: false });
const constant = runSimulation({ ...defaultSimConfig, constantDivision: true });
const coupled = [true, false].map(useSunrise => runSimulation({ ...defaultSimConfig, useSunrise, synthesis: 'division-coupled' }).deltaLog10);
const wiki = wikiReproductions();
for (const [name, rows] of Object.entries(wiki.tables)) {
    check(name, rows.every(r => r.pass || r.id === knownWikiDiscrepancy.id), rows.some(r => !r.pass) ? 'Known source discrepancy retained explicitly; other cells pass.' : 'All cells pass.');
}
check('Known discrepancy documented', wiki.tables.r10.some(r => r.id === knownWikiDiscrepancy.id && !r.pass), knownWikiDiscrepancy.diagnosis);
check('single 18h run <400ms', runtime < 400, `${runtime} ms`);
check('3-log kill', withSunrise.deltaLog10 <= -3, String(withSunrise.deltaLog10));
const scenarios = [withSunrise, without, ...[0, 1, 2, 3, 5, 10, 20].map(moi => runSimulation({ ...defaultSimConfig, moi })), ...[0, 10, 50, 200].map(Ae => runSimulation({ ...defaultSimConfig, Ae }))];
let maxB = 0, maxExcess = -Infinity;
for (const r of scenarios)
    for (const f of r.frames)
        for (const b of f.perClassKanR)
            maxB = Math.max(maxB, b);
for (let i = 0; i < withSunrise.frames.length; i++)
    for (const b of withSunrise.frames[i].perClassKanR)
        maxExcess = Math.max(maxExcess, b - without.frames[i].meanKanR);
check('R12 ceiling', maxB <= computedKprod / params.k_XB.value + 1e-9, `max B ${maxB}; ceiling ${computedKprod / params.k_XB.value}`);
check('R12 matched control', maxExcess <= 1e-9, `max excess ${maxExcess}`);
check('R12 division bounds', scenarios.every(r => r.frames.every(f => divisionRate(f.totalCells) >= 0 && divisionRate(f.totalCells) <= params.mu.value)), 'Division rate independent of killing.');
const summary = { alpha: computeDelivery(defaultBuild, params.m.value).alpha, c1: computedC1, k_prod: computedKprod,
    Bstar: kanrThreshold(params.A_e.value), j_req: { default: required(params.k_cat.value), upper: required(.0796), lower: required(.0338) },
    MIC: micFromKanR(params.B0.value), deltaWith: withSunrise.deltaLog10, deltaWithout: without.deltaLog10,
    error1a: eqError, conservation, error1b: fluxErrors, error1c: Math.max(...kinetics.map(x => x.trajectoryError)), runtimeMs: runtime };
const json = (x: unknown) => JSON.stringify(x, (_k, v) => typeof v === 'number' && !Number.isFinite(v) ? String(v) : v, 2);
const cellRows = Object.values(wiki.tables).flat().map(c => [c.id, c.wiki, c.actual, `${(c.relativeError * 100).toFixed(6)}%`, c.strictPass ? 'PASS' : 'FAIL', c.decimalsPrinted, c.tolerance, c.pass ? 'PASS' : 'FAIL']);
const plateau = exp3.value.map(p => [p.promoter, p.rel, `${p.ic50} ± ${p.sd}`, micFromKanR(params.B0.value * p.rel / 100)]);
writeFileSync('docs/VALIDATION.md', `# Numerical validation

Authority: REVIEW2 and subsequent user corrections. No parameters or equations tuned.
Four independent reproductions of published wiki numbers are checked: reference MIC, R10 adapter table, R11a steady states, R11b infinite-adapter limits. One R10 cell remains a documented source discrepancy; it is not claimed as reproduced.

${checks.map(c => `- **${c.pass ? 'PASS' : 'FAIL'} ${c.name}**: ${c.detail}`).join('\n')}

## Computed results

\`\`\`json
${json(summary)}
\`\`\`

## Every published cell: strict and precision-aware checks

Tolerance=max(relative tolerance × |wiki|, 0.5 × 10^(-decimals printed)). Decimals are encoded per column. Knockdown R11a retains the specified 1 percentage-point absolute criterion (expressed as an equivalent relative tolerance).

|Cell|Wiki|Computed|Strict relative error|Strict verdict|Decimals printed|Tolerance|Precision-aware verdict|
|---|---|---|---|---|---|---|---|
${table(cellRows)}

R10 also propagates each four-decimal B* input interval through the monotone requiredAdapter root solver; the resulting Ntot range must overlap the output interval widened by the tolerance above. All interval endpoints follow below.

\`\`\`json
${json(wiki.tables.r10)}
\`\`\`

### Weak evidence and remaining discrepancy

Three cells fail the original relative criterion. Only two pass the corrected rounding rule:
- R10 Kan150, kcat .2516: .0027483968 versus .003; relative error8.3868%. Three decimals permit [.0025,.0035], ±16.67%. This is weak evidence.
- R11b kcat .000982 keff: .0009274626 versus .0009; relative error3.0514%. Four decimals permit [.00085,.00095], ±5.56%. This is weak evidence.
- R10 Kan125, kcat .2516 remains FAIL, even after input rounding propagation. ${knownWikiDiscrepancy.diagnosis} The raw difference is .0005839281µM (6.4881%, about1.008% of c1); the excess beyond output rounding is .0000839281µM (about0.145% of c1). These must not be confused. B* input interval [.24695,.24705] does not bridge the gap. Likely wiki rounding or coarse search; no parameter adjustment. This exception is explicitly tested and authorized by the user. The remaining cells are the stronger reproduction evidence.

## R11a half-times (report-only)

|Ntot|Wiki min|Computed min|
|---|---|---|
${table(wiki.halfTimes.map(x => [x.n, x.wiki, x.actual]))}

Start at B0, no antibiotic, induced Ctot .402 fixed; RK4 .01min, time to halfway to steady state.

## 1a / 1b / 1c

Full kinetics uses the verbatim five mass-action equations. Loss -(mu+kXB) applies to B/NB/NBC, returning adapter to N/NC; adapter-only species have no loss. Full adapter and ClpXP totals are conserved. 1a has all slow processes off.

|kon|Ntot|Flux relative error|Total trajectory error (report only)|Half-step error|
|---|---|---|---|---|
${table(kinetics.map(x => [x.kon, x.Ntot, x.maxRelativeError, x.trajectoryError, x.convergenceError]))}

1b maxima at kon1/10/100: ${fluxErrors.join(', ')}. Ratios ${fluxErrors[0] / fluxErrors[1]} and ${fluxErrors[1] / fluxErrors[2]}. This demonstrates O(1/kon) convergence. The wiki QSS approximation requires kon of order100 µM⁻¹min⁻¹ or more for sub-1% degradation-flux accuracy; diffusion-limited protein association satisfies this, but the wiki does not state kon, so this is the assumption boundary. 1c remains report-only: Eq21 does not distinguish free and total KanR; we read B as free, required by its Langmuir factor. The total/free discrepancy remains unchanged.

## Source inconsistencies and sensitivities

${params.K_m.note}

Integrated j_req3/6 conflicts with the source's required-Ntot table; derived1/3 agrees with it. c1=.0579 and kprod=.005189 are rounded wiki entries; computed values above use the original definitions. No published deltaLog10 endpoint was supplied. -Infinity means all injection classes fell below the model's1-cell/mL cutoff; it is a numerical extinction convention, not proof of sterilisation.

Constant synthesis (default): Δlog10 with/without=${withSunrise.deltaLog10}, ${without.deltaLog10}. Division-coupled synthesis (off by default): ${coupled.join(', ')}. Constant-division with-SUNRISE sensitivity=${constant.deltaLog10}. Constant synthesis plus vanishing crowding dilution can accumulate KanR up to kprod/kXB; the source extrapolation artifact is retained.

## Exp3 report-only comparison

|Promoter|Expression %|Measured IC50 ±SD|Predicted MIC|
|---|---|---|---|
${table(plateau)}

MIC at B0/6.4=${micFromKanR(params.B0.value / 6.4)}. The wiki's target table gives .0518µM,6.24-fold reduction, for MIC below serum peak22. The same source model therefore predicts a large drop where Exp3 (55±5 versus77±22) found no resolvable difference: collapse reproduced, plateau not reproduced. MIC and IC50 differ. No fitting.

Additional R15 source discrepancy (report-only): at the cited serum-target B=.0518µM the implemented equations give MIC=${micFromKanR(.0518)}µg/mL, rather than below22. The computed threshold at22 is B*=${kanrThreshold(22)}µM. Thus the source table’s exact serum-target pair is not reproduced either; the qualitative conclusion of a large MIC drop over ~6x KanR reduction still holds. Likely source calibration/rounding or an unstated parameter context; no parameters changed.

Single warmed18h run=${runtime}ms; budget400ms. Prettier dependency and format script removed. Runtime is offline.
`);
writeFileSync('docs/MODEL.md', `# Science model

REVIEW2 and subsequent user corrections override prior files. No fitting.

## Model list and wiki sources

Delivery: Model/SUNRISE Eqs1–3 (Poisson, Langmuir, fixed geometry). TPD: Model/TPD module2 Eqs18–21 (QSS independent sites). Pharmacodynamics: Model/SUNRISE Eqs6–7 (detox, intracellular drug, Hill killing). Population: Model/SUNRISE Eq8 (shared logistic capacity). Full mass action: Model/TPD module2 Eqs1–7, verbatim SPEC equations, validation only. RK4 .5min; pretreatment30min fixed population; dose at0; induced ClpXP and120min blockade.

## 再現できなかった点

Source internal inconsistency: integrated j_req3/6 contradicts required Ntot table; derived1/3 is retained. ${knownWikiDiscrepancy.diagnosis}

Exp3 plateau is a source-model limitation, faithfully reproduced: measurements55±5 and77±22 show no resolvable resistance difference over6.4x expression, while the wiki target table gives KanR .0518µM (6.24x reduction) for MIC below attainable serum peak22. Linear detox mapping cannot reproduce this plateau. Collapse is reproduced; no saturating term added. Eq21 free/total ambiguity causes the report-only trajectory discrepancy.

## Synthesis and dilution

Default synthesis:'constant' is the wiki form. Crowding reduces division dilution toward0 while synthesis continues, giving stationary-phase KanR accumulation above B0 toward kprod/kXB≈5.28µM. This is a source-model extrapolation artifact. Optional synthesis:'division-coupled' multiplies synthesis by division/(ln2/46); off by default and never used in the game. KanR dilution depends on division only; adapter dilution follows nonnegative net growth.

## Simplifications and assumptions

QSS replaces binding transients; independent binding sites. Instantaneous independent Poisson injection. Single-site Langmuir binding (multivalency omitted). Classes share capacity only. External drug constant (PK and immunity omitted). CPI geometry collapsed to34.895 molecules; no length/angle controls. Accessibility/capsule omitted; wrong RBP sets receptor access0. Native KanR retains wiki kXB from tagged-substrate calibration. Below-one-cell classes absent. Induction3x and blockade120min assumed. Missing linker zeroes catalysis; absent binding domain uses effective infinite KD. Numerical and extra assumed constants are explicitly tagged below.

${params.K_m.note}

## Demonstrated versus modelled

Results Exp4: direct KanR-XB/ssrA fusion lowers resistance (77±22 to1.1±.4 /1.4±.1). Exp3: expression and resistance not proportional. Exp5: designed KB1–KB10 adaptors showed no resolvable effect versus ΔBinder29.7±4.4. Exp7: expression/delivery unresolved; no KanR band, ~7x loading variation. Integrated CPI+TPD efficacy remains a model prediction.

## Calibration data provenance

Exp3: ${exp3.source}; ${exp3.provenance}; ${json(exp3.value)}.
Exp4: ${exp4.source}; ${exp4.provenance}; ${json(exp4.value)}.

## Parameters and provenance / 仮定値

|Name|Value|Unit|Provenance|Wiki source|Note|
|---|---|---|---|---|---|
${table(Object.entries(params).map(([n, p]) => [n, p.value, p.unit, p.provenance, p.source, p.note ?? '']))}
`);
console.log(json(summary));
for (const c of checks)
    console.log(`${c.pass ? 'PASS' : 'FAIL'} ${c.name}: ${c.detail}`);
if (checks.some(c => !c.pass))
    process.exitCode = 1;
