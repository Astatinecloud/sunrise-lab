import { defaultTpd, type TpdParams, kanrDerivative, freeClpXP, kEff } from './tpd';
import { params } from './params';
import { rk4Step } from './numerics';
// Five independent species: free B, free N, NC, NB, NBC; C is recovered by conservation.
export type KineticState = [
    number,
    number,
    number,
    number,
    number
];
export interface FullKineticsParams extends TpdParams {
    kon: number;
}
export function fullKineticsDerivative(y: readonly number[], p: FullKineticsParams): KineticState {
    const [B, N, NC, NB, NBC] = y, C = p.Ctot - NC - NBC, k = p.kon;
    const v1 = k * N * C - p.KD1 * k * NC, v2 = k * N * B - p.KD2 * k * NB;
    const v3 = k * NB * C - p.KD1 * k * NBC, v4 = k * NC * B - p.KD2 * k * NBC, cat = p.kcat * NBC;
    // Basal substrate turnover/dilution releases binding partners; no adapter loss in fixed-N validation.
    const d = p.mu + p.kXB;
    return [p.kprod - d * B - v2 - v4, -v1 - v2 + d * NB, v1 - v4 + cat + d * NBC, v2 - v3 - d * NB, v3 + v4 - cat - d * NBC];
}
export interface KineticsComparison {
    kon: number;
    Ntot: number;
    maxRelativeError: number;
    convergenceError: number;
    trajectoryError: number;
}
function trajectory(Ntot: number, p: FullKineticsParams, dt: number): number[][] {
    let y: number[] = [params.B0.value, Ntot, 0, 0, 0];
    const result = [[...y]];
    for (let minute = 0; minute < 180; minute++) {
        const steps = Math.ceil(1 / dt), h = 1 / steps;
        for (let i = 0; i < steps; i++) {
            y = rk4Step(y, minute + i * h, h, (_t, s) => fullKineticsDerivative(s, p));
        }
        if (!y.every(Number.isFinite) || y.some(v => v < -1e-8)) {
            throw new Error('Unstable full kinetics integration');
        }
        result.push([...y]);
    }
    return result;
}
export function compareKinetics(Ntot: number, kon = 10): KineticsComparison {
    const p = { ...defaultTpd, kon };
    // Small steps resolve rapid binding. Repeat at half step to expose numerical error.
    const dt = Math.min(.02, .1 / (kon * (Ntot + p.Ctot + params.B0.value + 1)));
    const full = trajectory(Ntot, p, dt), fine = trajectory(Ntot, p, dt / 2);
    let B = params.B0.value, maxRelativeError = 0, convergenceError = 0, trajectoryError = 0;
    for (let minute = 1; minute <= 180; minute++) {
        for (let i = 0; i < 20; i++) {
            B = rk4Step([B], 0, .05, (_t, s) => [kanrDerivative(s[0], Ntot, p)])[0];
        }
        if (minute >= 5) {
            const y = fine[minute], flux = p.kcat * y[4];
            const qss = kEff(Ntot, y[0], freeClpXP(Ntot, p.Ctot, p.KD1), p) * y[0];
            maxRelativeError = Math.max(maxRelativeError, Math.abs(qss - flux) / flux);
            const total = y[0] + y[3] + y[4];
            trajectoryError = Math.max(trajectoryError, Math.abs(B - total) / total);
            convergenceError = Math.max(convergenceError, Math.abs(full[minute][0] - fine[minute][0]) / fine[minute][0]);
        }
    }
    return { kon, Ntot, maxRelativeError, convergenceError, trajectoryError };
}
/** 1a: integrate from unbound species, with all slow processes disabled. */
export function algebraicReduction(Ntot: number, kon = 10) {
    const p = { ...defaultTpd, kon, kcat: 0, kprod: 0, mu: 0, kXB: 0 };
    const Btotal = params.B0.value;
    const C = freeClpXP(Ntot, p.Ctot, p.KD1);
    let lo = 0, hi = Btotal;
    for (let i = 0; i < 100; i++) {
        const b = (lo + hi) / 2;
        if (b + Ntot * b / (p.KD2 + b) > Btotal) {
            hi = b;
        }
        else {
            lo = b;
        }
    }
    const B = (lo + hi) / 2, N = Ntot / ((1 + C / p.KD1) * (1 + B / p.KD2));
    const expected = [B, N, N * C / p.KD1, N * B / p.KD2, N * C * B / (p.KD1 * p.KD2)];
    let y: number[] = [Btotal, Ntot, 0, 0, 0];
    const dt = Math.min(.02, .1 / (kon * (Ntot + p.Ctot + Btotal + 1)));
    const steps = Math.ceil(1000 / dt), h = 1000 / steps;
    for (let i = 0; i < steps; i++) {
        y = rk4Step(y, 0, h, (_t, state) => fullKineticsDerivative(state, p));
    }
    const freeC = p.Ctot - y[2] - y[4];
    const error = Math.max(...expected.map((v, i) => Math.abs(v - y[i]) / v), Math.abs(C - freeC) / C);
    const conservation = Math.max(Math.abs(y[1] + y[2] + y[3] + y[4] - Ntot), Math.abs(freeC + y[2] + y[4] - p.Ctot));
    return { Ntot, error, conservation };
}
