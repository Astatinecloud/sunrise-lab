import { params, computedC1 } from './params';
import { computeDelivery, poissonClasses, type DeliveryResult } from './cpi';
import { evaluateBuild, defaultBuild, noAntibioticFailure, type BuildConfig, type FailureReason } from './build';
import { defaultTpd } from './tpd';
import { deltaLog10, divisionRate } from './population';
export interface SimConfig {
    build: BuildConfig;
    moi: number;
    Ae: number;
    useSunrise: boolean;
    N0: number;
    durationMin: number;
    dtMin: number;
    kcat: number;
    sigma32: boolean;
    blockade: boolean;
    constantDivision?: boolean;
    synthesis?: 'constant' | 'division-coupled';
}
export interface SimFrame {
    tMin: number;
    totalCells: number;
    perClass: number[];
    perClassKanR: number[];
    meanKanR: number;
    minKanR: number;
    meanNtot: number;
    freeClpXP: number;
    meanAi: number;
    meanKill: number;
    reachedCells: number;
    unreachedCells: number;
}
export interface SimResult {
    frames: SimFrame[];
    deltaLog10: number;
    success: boolean;
    delivery: DeliveryResult;
    failures: FailureReason[];
}
export const defaultSimConfig: SimConfig = {
    build: defaultBuild, moi: params.m.value, Ae: params.A_e.value, useSunrise: true,
    N0: params.N_0.value, durationMin: params.t_obs.value * 60, dtMin: params.dt_min.value,
    kcat: params.k_cat.value, sigma32: true, blockade: true,
};
export function runSimulation(cfg: SimConfig): SimResult {
    if (![cfg.moi, cfg.Ae, cfg.N0, cfg.durationMin, cfg.dtMin, cfg.kcat].every(Number.isFinite) || cfg.N0 < 1 || cfg.dtMin <= 0 || cfg.moi < 0 || cfg.Ae < 0 || cfg.durationMin < 0 || cfg.kcat < 0) {
        throw new RangeError('Invalid simulation configuration');
    }
    const evaluated = evaluateBuild(cfg.build), mod = evaluated.modifiers;
    const delivery = computeDelivery(cfg.build, cfg.useSunrise ? cfg.moi : 0);
    delivery.classes = poissonClasses(delivery.lambda, 1 / cfg.N0)
        .map((p, j) => ({ j, p, Ntot: mod.payloadEnabled ? j * computedC1 : 0 })).filter(c => c.p > 0);
    const count = delivery.classes.length;
    const rg = params.r_g.value, rkill = params.r_kill.value, capacity = params.K.value;
    const B0 = params.B0.value, Km = params.K_m.value, K1 = params.K_1.value, n1 = params.n_1.value;
    const qPerB = params.q_0.value / B0, kprod = defaultTpd.kprod, kXB = params.k_XB.value;
    const KD1 = mod.KD1, KD2 = mod.KD2, kcat = cfg.kcat * mod.kcatScale;
    const basal = params.C_tot_basal.value;
    const induced = cfg.Ae > 0 && cfg.sigma32 ? params.C_tot_induced.value : basal;
    const blockadeEnd = params.clpxp_blockade_min.value;
    const { sqrt, max, min, pow } = Math;
    const freeC = (nt: number, ct: number) => {
        const a = KD1 + nt - ct, r = sqrt(a * a + 4 * ct * KD1);
        return a >= 0 ? 2 * ct * KD1 / (r + a) : (r - a) / 2;
    };
    const drug = (B: number, Ae: number) => {
        if (Ae === 0) {
            return 0;
        }
        const a = Km + qPerB * B - Ae, r = sqrt(a * a + 4 * Ae * Km);
        return a >= 0 ? 2 * Ae * Km / (a + r) : (r - a) / 2;
    };
    const kill = (ai: number) => ai <= 0 ? 0 : 1 / (1 + pow(K1 / ai, n1));
    // Scratch arrays belong to this call only. Reuse them to avoid per-step allocations.
    const y = delivery.classes.flatMap(c => [cfg.N0 * c.p, B0, c.Ntot]);
    const length = y.length, scratch = new Array<number>(length);
    const ks = Array.from({ length: 4 }, () => new Array<number>(length));
    const derivative = (state: readonly number[], out: number[], pre: boolean, ct: number, blocked: boolean) => {
        let total = 0;
        for (let j = 0; j < count; j++) {
            total += max(0, state[3 * j]);
        }
        const sharedGrowth = rg * (1 - total / capacity);
        for (let j = 0; j < count; j++) {
            const i = 3 * j, n = max(0, state[i]), B = max(0, state[i + 1]), nt = max(0, state[i + 2]);
            const rate = pre ? rg : sharedGrowth - rkill * kill(drug(B, cfg.Ae));
            const dilution = max(rate, 0), C = freeC(nt, ct);
            const eff = blocked ? 0 : kcat * nt * (C / (KD1 + C)) / (KD2 + B);
            out[i] = pre ? 0 : rate * n;
            const division = pre || cfg.constantDivision ? rg : divisionRate(total);
            out[i + 1] = kprod * (cfg.synthesis === 'division-coupled' ? division / rg : 1) - (division + kXB + eff) * B;
            out[i + 2] = -dilution * nt;
        }
    };
    const step = (h: number, pre: boolean, ct: number, blocked: boolean) => {
        derivative(y, ks[0], pre, ct, blocked);
        for (let i = 0; i < length; i++) {
            scratch[i] = y[i] + h * ks[0][i] / 2;
        }
        derivative(scratch, ks[1], pre, ct, blocked);
        for (let i = 0; i < length; i++) {
            scratch[i] = y[i] + h * ks[1][i] / 2;
        }
        derivative(scratch, ks[2], pre, ct, blocked);
        for (let i = 0; i < length; i++) {
            scratch[i] = y[i] + h * ks[2][i];
        }
        derivative(scratch, ks[3], pre, ct, blocked);
        for (let i = 0; i < length; i++) {
            y[i] = max(0, y[i] + h * (ks[0][i] + 2 * ks[1][i] + 2 * ks[2][i] + ks[3][i]) / 6);
        }
        if (!pre) {
            for (let j = 0; j < count; j++) {
                if (y[3 * j] < 1) {
                    y[3 * j] = 0;
                }
            }
        }
    };
    const frame = (t: number): SimFrame => {
        const perClass = delivery.classes.map((_, j) => y[3 * j]), total = perClass.reduce((a, b) => a + b, 0);
        let b = 0, nt = 0, c = 0, ai = 0, f = 0, minimum = Infinity, unreached = 0;
        for (let j = 0; j < count; j++) {
            const weight = total ? perClass[j] / total : 0, B = y[3 * j + 1], N = y[3 * j + 2], a = drug(B, t < 0 ? 0 : cfg.Ae);
            b += weight * B;
            nt += weight * N;
            c += weight * freeC(N, t < 0 ? basal : induced);
            ai += weight * a;
            f += weight * kill(a);
            if (perClass[j] > 0) {
                minimum = min(minimum, B);
            }
            if (delivery.classes[j].j === 0) {
                unreached += perClass[j];
            }
        }
        return { tMin: t, totalCells: total, perClass, perClassKanR: delivery.classes.map((_, j) => y[3 * j + 1]), meanKanR: b, minKanR: minimum === Infinity ? 0 : minimum, meanNtot: nt, freeClpXP: c, meanAi: ai, meanKill: f, reachedCells: total - unreached, unreachedCells: unreached };
    };
    const frames = [frame(-params.pretreatment_min.value)];
    for (let preTime = -params.pretreatment_min.value; preTime < 0;) {
        const h = min(cfg.dtMin, -preTime);
        step(h, true, basal, false);
        preTime += h;
        frames.push(frame(preTime));
    }
    let t = 0;
    while (t < cfg.durationMin) {
        const blocked = cfg.Ae > 0 && cfg.blockade && t < blockadeEnd;
        let h = min(cfg.dtMin, cfg.durationMin - t);
        if (blocked) {
            h = min(h, blockadeEnd - t);
        }
        step(h, false, induced, blocked);
        t += h;
        frames.push(frame(t));
    }
    const delta = deltaLog10(frames[frames.length - 1].totalCells, cfg.N0);
    const failures = cfg.useSunrise ? [...evaluated.failures, ...(cfg.Ae === 0 ? [noAntibioticFailure] : [])] : [];
    return { frames, deltaLog10: delta, success: delta <= -3, delivery, failures };
}
