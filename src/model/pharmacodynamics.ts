import { params } from './params';
export function detoxCapacity(B: number): number {
    return params.q_0.value * B / params.B0.value;
}
export function intracellularDrug(Ae: number, q: number, Km: number): number {
    if (Ae === 0) {
        return 0;
    }
    const a = Km + q - Ae, r = Math.hypot(a, 2 * Math.sqrt(Ae * Km));
    return a >= 0 ? 2 * Ae * Km / (a + r) : (r - a) / 2;
}
export function killFraction(Ai: number, K1: number, n1: number): number {
    return Ai <= 0 ? 0 : 1 / (1 + (K1 / Ai) ** n1);
}
export function micFromKanR(B: number): number {
    let lo = 0, hi = Math.max(1, detoxCapacity(B) * 2 + 10);
    const rate = (a: number) => params.r_kill.value * killFraction(intracellularDrug(a, detoxCapacity(B), params.K_m.value), params.K_1.value, params.n_1.value);
    while (rate(hi) < params.r_g.value) {
        hi *= 2;
    }
    for (let i = 0; i < 80; i++) {
        const m = (lo + hi) / 2;
        if (rate(m) < params.r_g.value) {
            lo = m;
        }
        else {
            hi = m;
        }
    }
    return (lo + hi) / 2;
}
export function kanrThreshold(Ae: number): number {
    let lo = 0, hi = params.B0.value * 100;
    for (let i = 0; i < 100; i++) {
        const m = (lo + hi) / 2;
        if (micFromKanR(m) > Ae) {
            hi = m;
        }
        else {
            lo = m;
        }
    }
    return (lo + hi) / 2;
}
