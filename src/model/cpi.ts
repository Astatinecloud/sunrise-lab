import { computedC1, params } from './params';
import { evaluateBuild, type BuildConfig } from './build';
export { evaluateBuild } from './build';
export type { BuildConfig, FailureReason, Modifiers } from './build';
export function langmuirAlpha(R: number, Kd: number): number {
    return R === 0 ? 0 : R / (R + Kd);
}
export function kdFromDeltaG(dG_kcal: number, T_K = 310): number {
    return Math.exp(dG_kcal / (params.RT_310.value * T_K / 310));
}
export function poissonPmf(j: number, lambda: number): number {
    if (lambda < 0 || !Number.isFinite(lambda)) {
        throw new RangeError('invalid lambda');
    }
    if (!Number.isInteger(j) || j < 0) {
        return 0;
    }
    if (lambda === 0) {
        return j === 0 ? 1 : 0;
    }
    let log = -lambda + j * Math.log(lambda);
    for (let k = 2; k <= j; k++) {
        log -= Math.log(k);
    }
    return Math.exp(log);
}
// Index is injection count; retain zero slots and do not renormalise lost tails.
export function poissonClasses(lambda: number, minCellsFrac: number): number[] {
    if (!(minCellsFrac > 0 && minCellsFrac <= 1)) {
        throw new RangeError('invalid threshold');
    }
    const v: number[] = [];
    for (let j = 0;; j++) {
        const p = poissonPmf(j, lambda);
        v.push(p >= minCellsFrac ? p : 0);
        if (j > lambda && p < minCellsFrac) {
            break;
        }
    }
    return v;
}
export interface DeliveryResult {
    lambda: number;
    alpha: number;
    classes: {
        j: number;
        p: number;
        Ntot: number;
    }[];
    pZero: number;
}
export function computeDelivery(build: BuildConfig, moi: number): DeliveryResult {
    if (!Number.isFinite(moi) || moi < 0) {
        throw new RangeError('invalid MOI');
    }
    const { modifiers: m } = evaluateBuild(build);
    const alpha = m.injectionEnabled ? langmuirAlpha(m.receptorAccessible ? params.R_local.value : 0, params.K_d_eng.value) : 0;
    const lambda = alpha * moi;
    return { alpha, lambda, pZero: poissonPmf(0, lambda), classes: poissonClasses(lambda, 1 / params.N_0.value).map((p, j) => ({ j, p, Ntot: m.payloadEnabled ? j * computedC1 : 0 })).filter(c => c.p > 0) };
}
export function mulberry32(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
export function samplePoisson(lambda: number, random: () => number): number {
    if (lambda < 0 || !Number.isFinite(lambda)) {
        throw new RangeError('invalid lambda');
    }
    let result = 0;
    for (let remaining = lambda; remaining > 0; remaining -= Math.min(remaining, 20)) {
        const limit = Math.exp(-Math.min(remaining, 20));
        let product = 1, k = 0;
        do {
            k++;
            product *= random();
        } while (product > limit);
        result += k - 1;
    }
    return result;
}
/** kdFromDeltaG returns molar; R_molar is molar. */
export function langmuirAlphaFromDeltaG(dG_kcal: number, R_molar: number): number {
    return langmuirAlpha(R_molar, kdFromDeltaG(dG_kcal));
}
