import { params, computedKprod } from './params';
export interface TpdParams {
    KD1: number;
    KD2: number;
    kcat: number;
    Ctot: number;
    mu: number;
    kXB: number;
    kprod: number;
}
export const defaultTpd: TpdParams = { KD1: params.K_D1.value, KD2: params.K_D2.value, kcat: params.k_cat.value, Ctot: params.C_tot_induced.value, mu: params.mu.value, kXB: params.k_XB.value, kprod: computedKprod };
export function freeClpXP(Ntot: number, Ctot: number, KD1: number): number {
    const a = KD1 + Ntot - Ctot, r = Math.hypot(a, 2 * Math.sqrt(Ctot * KD1));
    return a >= 0 ? 2 * Ctot * KD1 / (r + a) : (r - a) / 2;
}
export function ternaryComplex(Ntot: number, B: number, C: number, KD1: number, KD2: number): number {
    return Ntot * (C / (KD1 + C)) * (B / (KD2 + B));
}
export function kEff(Ntot: number, B: number, C: number, p: TpdParams): number {
    return p.kcat * Ntot * (C / (p.KD1 + C)) / (p.KD2 + B);
}
export function kanrDerivative(B: number, Ntot: number, p: TpdParams): number {
    return p.kprod - (p.mu + p.kXB + kEff(Ntot, B, freeClpXP(Ntot, p.Ctot, p.KD1), p)) * B;
}
export function steadyStateKanR(Ntot: number, p: TpdParams): number {
    let lo = 0, hi = p.kprod / (p.mu + p.kXB);
    for (let k = 0; k < 90; k++) {
        const m = (lo + hi) / 2;
        if (kanrDerivative(m, Ntot, p) > 0) {
            lo = m;
        }
        else {
            hi = m;
        }
    }
    return (lo + hi) / 2;
}
export function kEffLimit(kcat: number, Ctot: number, B: number): number {
    return kcat * Ctot / (params.K_D2.value + B);
}
export function minAttainableKanR(kcat: number, Ctot: number): number {
    let lo = 0, hi = params.B0.value;
    for (let i = 0; i < 100; i++) {
        const b = (lo + hi) / 2;
        if (computedKprod > (params.mu.value + params.k_XB.value + kEffLimit(kcat, Ctot, b)) * b)
            lo = b;
        else
            hi = b;
    }
    return (lo + hi) / 2;
}
export function requiredAdapter(B: number, kcat: number): number {
    let lo = 0, hi = 100;
    for (let i = 0; i < 100; i++) {
        const n = (lo + hi) / 2;
        if (steadyStateKanR(n, { ...defaultTpd, kcat }) > B)
            lo = n;
        else
            hi = n;
    }
    return (lo + hi) / 2;
}
