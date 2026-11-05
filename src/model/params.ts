export type Provenance = 'measured' | 'literature' | 'derived' | 'assumed' | 'design-variable';
export interface Parameter<T = number> {
    value: T;
    unit: string;
    provenance: Provenance;
    source: string;
    note?: string;
}
const p = (value: number, unit: string, provenance: Provenance, note?: string): Parameter => ({ value, unit, provenance, source: note?.startsWith('SPEC') ? 'Model / SUNRISE / Implementation convention from ' + note : 'Model / SUNRISE / Model Formulation, Table 9.3.1 parameter list', note });
export const params = {
    m: p(30, 'particles/cell', 'design-variable'),
    K_d_eng: p(98.4e-12, 'M (display: pM)', 'derived', 'Docking ΔG=−14.2 kcal/mol'),
    R_local: p(.0277, 'M (display: mM)', 'derived', '1e6 LPS/cell, 6 µm² × 10 nm'), alpha: p(1 - 3.6e-9, '1', 'derived'),
    N_delivery: p(34.895, 'molecules/injection', 'derived', '125 residues, d=0.4 nm, ψ=30°'), c1: p(0.0579, 'µM', 'derived', 'Rounded wiki value, 1 fL'),
    K_D1: p(.065, 'µM', 'literature', 'TPD–ClpX'),
    K_D2: p(.120, 'µM', 'literature', 'TPD–KanR, median of 94–154 nM'), k_cat: p(.0778, 'min⁻¹', 'assumed', 'Range .0338–.0796; extrapolated from GroTAC'),
    C_tot_basal: p(.134, 'µM', 'literature'), sigma32_fold: p(3, '1', 'assumed', 'Exact fold unmeasured'), C_tot_induced: p(.402, 'µM', 'derived', '0.134 × 3'), clpxp_blockade_min: p(120, 'min', 'assumed', 'Worst-case complete blockade'),
    k_XB: p(9.8185e-4, 'min⁻¹', 'measured', '2026-08-20 pBAD chase'), B0: p(.3233, 'µM', 'derived', 'Untreated KanR; Model / TPD module 1'), mu: p(Math.LN2 / 46, 'min⁻¹', 'measured', '46 min doubling'), r_g: p(Math.LN2 / 46, 'min⁻¹', 'measured', 'Alias of mu'), k_prod: p(5.189e-3, 'µM/min', 'derived', 'Rounded wiki value; use (mu+k_XB)B0'),
    r_kill: p(.02837, 'min⁻¹', 'literature', 'ψmax−ψmin'), K: p(6.29e8, 'cells/mL', 'measured', 'No-drug endpoint'),
    K_1: p(1.032, 'µg/mL', 'derived', 'Posterior with fixed r_kill'), n_1: p(1.722, '1', 'derived'),
    K_m: p(1.463, 'µg/mL (wiki labels it µM; see note)', 'literature', "The wiki parameter table gives K_m = 1.463 µM while Eq. (6) combines it with q and A_e, both in µg/mL. Converting it (×484.5/1000 -> 0.709 µg/mL) does not reproduce the wiki published values; using 1.463 as written does. We therefore use the wiki numeric value unchanged and record the unit label in the source as an inconsistency we did not resolve."), q_0: p(375.9, 'µg/mL', 'derived', 'Reference detox capacity'), B_star: p(.1972, 'µM', 'derived', 'Wiki threshold at Kan 100'), j_req: p(1, 'injections', 'derived', 'Computed default/upper 1, lower 3; source integrated table 3/6 contradicts its required Ntot table'), N_0: p(1e6, 'CFU/mL', 'design-variable', 'Wiki 5e5–1e8'), A_e: p(100, 'µg/mL', 'assumed', 'Conservative urinary assumption'), t_obs: p(18, 'h', 'literature', 'CLSI-based'),
    pretreatment_min: p(30, 'min', 'assumed', 'SPEC §4.1–4.2'), dt_min: p(.5, 'min', 'assumed', 'SPEC §4.1'), molecule_to_uM: p(1.6605e-3, 'µM/molecule/fL', 'assumed', 'SPEC Eq.3 physical conversion'), RT_310: p(.616, 'kcal/mol', 'assumed', 'SPEC §3 RT at 310 K; scales with T'), missing_binding_KD: p(1e9, 'µM', 'assumed', 'SPEC §3.1 effective infinity'), validation_kon: p(10, 'µM⁻¹ min⁻¹', 'assumed', 'SPEC §4.4 baseline; sensitivity 1,100')
} satisfies Record<string, Parameter>;
export const exp3: Parameter<readonly {
    promoter: string;
    rel: number;
    ic50: number;
    sd: number;
}[]> = { value: [{ promoter: 'J23100', rel: 100, ic50: 55, sd: 5 }, { promoter: 'J23110', rel: 15.7, ic50: 77, sd: 22 }, { promoter: 'J23114', rel: 1.11, ic50: .94, sd: .39 }], unit: 'rel: %; IC50, sd: µg/mL', provenance: 'measured', source: 'Results / TPD Experiment 3 / Expression and resistance' };
export const exp4: Parameter<readonly {
    tag: string;
    ic50: number;
    sd: number;
}[]> = { value: [{ tag: 'untagged', ic50: 77, sd: 22 }, { tag: 'XB', ic50: 1.1, sd: .4 }, { tag: 'ssrA', ic50: 1.4, sd: .1 }], unit: 'µg/mL', provenance: 'measured', source: 'Results / TPD Experiment 4 / Direct degron fusion' };
const tpdSource = 'Model / TPD / Model Formulation (CLIPPERs model), parameter table';
const deliverySource = 'Model / CPI / geometry model; Model / SUNRISE / Model Formulation, delivery (Eqs 1–3)';
const survivalSource = 'Model / SUNRISE / Model Formulation, survival (Eqs 6–8)';
for (const name of ['K_D1', 'K_D2', 'k_cat', 'C_tot_basal', 'C_tot_induced', 'k_XB', 'B0', 'k_prod'] as const) params[name].source = tpdSource;
for (const name of ['N_delivery', 'c1', 'K_d_eng', 'R_local', 'alpha', 'm'] as const) params[name].source = deliverySource;
for (const name of ['q_0', 'K_m', 'K_1', 'n_1', 'r_kill', 'K', 'B_star', 'mu', 'r_g', 'N_0', 'A_e', 't_obs'] as const) params[name].source = survivalSource;
for (const name of ['sigma32_fold', 'clpxp_blockade_min', 'j_req'] as const) params[name].source = 'Model / SUNRISE / Model Formulation, ClpXP assumptions and integrated parameter table';
export const computedC1 = params.N_delivery.value * params.molecule_to_uM.value;
export const computedKprod = (params.mu.value + params.k_XB.value) * params.B0.value;
