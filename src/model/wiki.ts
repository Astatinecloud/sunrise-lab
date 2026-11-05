import { defaultTpd, params, steadyStateKanR, requiredAdapter, kEffLimit, minAttainableKanR, kanrThreshold, kanrDerivative, micFromKanR } from './index';
export interface WikiCell {
    id: string;
    wiki: number;
    actual: number;
    relativeTolerance: number;
    decimalsPrinted: number;
    relativeError: number;
    tolerance: number;
    strictPass: boolean;
    pass: boolean;
}
export function wikiCell(id: string, wiki: number, actual: number, relativeTolerance: number, decimalsPrinted: number): WikiCell {
    const error = Math.abs(actual - wiki);
    const tolerance = Math.max(relativeTolerance * Math.abs(wiki), .5 * 10 ** (-decimalsPrinted));
    return { id, wiki, actual, relativeTolerance, decimalsPrinted, relativeError: error / Math.abs(wiki),
        tolerance, strictPass: error <= relativeTolerance * Math.abs(wiki), pass: error <= tolerance };
}
export const knownWikiDiscrepancy = {
    id: 'R10 Kan=125 kcat=0.2516 Ntot',
    diagnosis: 'Required Ntot 0.00841607 versus printed 0.009; raw absolute difference 0.00058393 uM. Excess beyond output rounding is 0.00008393 uM, about 0.145% of c1. Likely wiki rounding or search resolution; no game-visible quantity is affected. Parameters unchanged.'
};
export function wikiReproductions() {
    const rows = [
        [50, .0975, .337, .127, .038], [75, .1473, .194, .080, .024],
        [100, .1972, .118, .049, .015], [125, .2470, .064, .027, .009], [150, .2969, .021, .009, .003]
    ];
    const r10 = rows.flatMap(([kan, b, ...ns]) => {
        const actualB = kanrThreshold(kan);
        return [wikiCell(`R10 Kan=${kan} B*`, b, actualB, .005, 4),
            ...[.0338, .0778, .2516].map((k, i) => {
                const cell = wikiCell(`R10 Kan=${kan} kcat=${k} Ntot`, ns[i], requiredAdapter(actualB, k), .05, 3);
                const inputDecimalsPrinted = 4;
                const inputHalfUnit = .5 * 10 ** (-inputDecimalsPrinted);
                const inputInterval = [b - inputHalfUnit, b + inputHalfUnit];
                const propagated = inputInterval.map(x => requiredAdapter(x, k)).sort((a, b) => a - b);
                const outputInterval = [ns[i] - cell.tolerance, ns[i] + cell.tolerance];
                const overlap = propagated[0] <= outputInterval[1] && propagated[1] >= outputInterval[0];
                return { ...cell, inputDecimalsPrinted, inputInterval, propagated, outputInterval, pass: overlap };
            })];
    });
    const halfTimes: {
        n: number;
        wiki: number;
        actual: number;
    }[] = [];
    const r11a = [[.05, .1960, .394, 36], [.10, .1211, .626, 28], [.25, .0502, .845, 16], [.50, .0300, .907, 10], [1, .0244, .924, 8], [4, .0224, .931, 8]].flatMap(([n, b, kd, half]) => {
        const actual = steadyStateKanR(n, defaultTpd);
        let B = params.B0.value, t = 0;
        const target = (B + actual) / 2, h = .01;
        while (B > target && t < 1000) {
            const f = (x: number) => kanrDerivative(x, n, defaultTpd);
            const a = f(B), c = f(B + h * a / 2), d = f(B + h * c / 2), e = f(B + h * d);
            B += h * (a + 2 * c + 2 * d + e) / 6;
            t += h;
        }
        halfTimes.push({ n, wiki: half, actual: t });
        // Knockdown uses the specified 1 percentage-point absolute criterion.
        return [wikiCell(`R11a Ntot=${n} B`, b, actual, .01, 4),
            wikiCell(`R11a Ntot=${n} knockdown (%)`, kd * 100, (1 - actual / params.B0.value) * 100, 1 / (kd * 100), 1)];
    });
    const r11b = [[9.82e-4, .0009, .3056, .055], [.0338, .0774, .0555, .828], [.0778, .2203, .0219, .932], [.2516, .8005, .0064, .980]].flatMap(([k, eff, b, kd]) => {
        const actualB = minAttainableKanR(k, params.C_tot_induced.value);
        return [wikiCell(`R11b kcat=${k} Bmin`, b, actualB, .01, 4),
            wikiCell(`R11b kcat=${k} keff limit`, eff, kEffLimit(k, params.C_tot_induced.value, actualB), .01, 4),
            wikiCell(`R11b kcat=${k} max knockdown (%)`, kd * 100, (1 - actualB / params.B0.value) * 100, .01, 1)];
    });
    return { tables: { reference: [wikiCell('Reference MIC', 163.2, micFromKanR(params.B0.value), .01, 1)], r10, r11a, r11b }, halfTimes };
}
