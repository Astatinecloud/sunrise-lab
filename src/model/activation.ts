import { params } from './params';
import { computeDelivery } from './cpi';
import { evaluateBuild, type BuildConfig } from './build';
import { freeClpXP, kEff, defaultTpd } from './tpd';
import type { SimResult } from './simulation';
export function activationReadouts(build: BuildConfig, moi: number, preview: SimResult | null, fraction: number) {
    const delivery = computeDelivery(build, moi);
    const modifiers = evaluateBuild(build).modifiers;
    const index = preview ? Math.round(Math.max(0, Math.min(1, fraction)) * (preview.frames.length - 1)) : 0;
    const frame = preview?.frames[index];
    const B = frame?.meanKanR ?? params.B0.value;
    const Ntot = frame?.meanNtot ?? delivery.classes.reduce((a, c) => a + c.p * c.Ntot, 0);
    const C = frame?.freeClpXP ?? freeClpXP(Ntot, params.C_tot_basal.value, modifiers.KD1);
    return { delivery, index, B, Ntot, C, tMin: frame?.tMin ?? -params.pretreatment_min.value,
        unreachedIcons: Math.round(delivery.pZero * 20), representativeJ: Math.round(delivery.lambda), coveragePercent: 100 * (1 - delivery.pZero),
        kanrDots: Math.round(B / params.B0.value * 24),
        kEff: kEff(Ntot, B, C, { ...defaultTpd, Ctot: params.C_tot_basal.value, kcat: params.k_cat.value * modifiers.kcatScale, KD1: modifiers.KD1, KD2: modifiers.KD2 }) };
}
