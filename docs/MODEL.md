# Science model

REVIEW2 and subsequent user corrections override prior files. No fitting.

## Model list and wiki sources

Delivery: Model/SUNRISE Eqs1–3 (Poisson, Langmuir, fixed geometry). TPD: Model/TPD module2 Eqs18–21 (QSS independent sites). Pharmacodynamics: Model/SUNRISE Eqs6–7 (detox, intracellular drug, Hill killing). Population: Model/SUNRISE Eq8 (shared logistic capacity). Full mass action: Model/TPD module2 Eqs1–7, verbatim SPEC equations, validation only. RK4 .5min; pretreatment30min fixed population; dose at0; induced ClpXP and120min blockade.

## 再現できなかった点

Source internal inconsistency: integrated j_req3/6 contradicts required Ntot table; derived1/3 is retained. Required Ntot 0.00841607 versus printed 0.009; raw absolute difference 0.00058393 uM. Excess beyond output rounding is 0.00008393 uM, about 0.145% of c1. Likely wiki rounding or search resolution; no game-visible quantity is affected. Parameters unchanged.

Exp3 plateau is a source-model limitation, faithfully reproduced: measurements55±5 and77±22 show no resolvable resistance difference over6.4x expression, while the wiki target table gives KanR .0518µM (6.24x reduction) for MIC below attainable serum peak22. Linear detox mapping cannot reproduce this plateau. Collapse is reproduced; no saturating term added. Eq21 free/total ambiguity causes the report-only trajectory discrepancy.

## Synthesis and dilution

Default synthesis:'constant' is the wiki form. Crowding reduces division dilution toward0 while synthesis continues, giving stationary-phase KanR accumulation above B0 toward kprod/kXB≈5.28µM. This is a source-model extrapolation artifact. Optional synthesis:'division-coupled' multiplies synthesis by division/(ln2/46); off by default and never used in the game. KanR dilution depends on division only; adapter dilution follows nonnegative net growth.

## Simplifications and assumptions

QSS replaces binding transients; independent binding sites. Instantaneous independent Poisson injection. Single-site Langmuir binding (multivalency omitted). Classes share capacity only. External drug constant (PK and immunity omitted). CPI geometry collapsed to34.895 molecules; no length/angle controls. Accessibility/capsule omitted; wrong RBP sets receptor access0. Native KanR retains wiki kXB from tagged-substrate calibration. Below-one-cell classes absent. Induction3x and blockade120min assumed. Missing linker zeroes catalysis; absent binding domain uses effective infinite KD. Numerical and extra assumed constants are explicitly tagged below.

The wiki parameter table gives K_m = 1.463 µM while Eq. (6) combines it with q and A_e, both in µg/mL. Converting it (×484.5/1000 -> 0.709 µg/mL) does not reproduce the wiki published values; using 1.463 as written does. We therefore use the wiki numeric value unchanged and record the unit label in the source as an inconsistency we did not resolve.

## Demonstrated versus modelled

Results Exp4: direct KanR-XB/ssrA fusion lowers resistance (77±22 to1.1±.4 /1.4±.1). Exp3: expression and resistance not proportional. Exp5: designed KB1–KB10 adaptors showed no resolvable effect versus ΔBinder29.7±4.4. Exp7: expression/delivery unresolved; no KanR band, ~7x loading variation. Integrated CPI+TPD efficacy remains a model prediction.

## Calibration data provenance

Exp3: Results / TPD Experiment 3 / Expression and resistance; measured; [
  {
    "promoter": "J23100",
    "rel": 100,
    "ic50": 55,
    "sd": 5
  },
  {
    "promoter": "J23110",
    "rel": 15.7,
    "ic50": 77,
    "sd": 22
  },
  {
    "promoter": "J23114",
    "rel": 1.11,
    "ic50": 0.94,
    "sd": 0.39
  }
].
Exp4: Results / TPD Experiment 4 / Direct degron fusion; measured; [
  {
    "tag": "untagged",
    "ic50": 77,
    "sd": 22
  },
  {
    "tag": "XB",
    "ic50": 1.1,
    "sd": 0.4
  },
  {
    "tag": "ssrA",
    "ic50": 1.4,
    "sd": 0.1
  }
].

## Parameters and provenance / 仮定値

|Name|Value|Unit|Provenance|Wiki source|Note|
|---|---|---|---|---|---|
| m | 30 | particles/cell | design-variable | Model / CPI / geometry model; Model / SUNRISE / Model Formulation, delivery (Eqs 1–3) |  |
| K_d_eng | 9.84e-11 | M (display: pM) | derived | Model / CPI / geometry model; Model / SUNRISE / Model Formulation, delivery (Eqs 1–3) | Docking ΔG=−14.2 kcal/mol |
| R_local | 0.0277 | M (display: mM) | derived | Model / CPI / geometry model; Model / SUNRISE / Model Formulation, delivery (Eqs 1–3) | 1e6 LPS/cell, 6 µm² × 10 nm |
| alpha | 0.9999999964 | 1 | derived | Model / CPI / geometry model; Model / SUNRISE / Model Formulation, delivery (Eqs 1–3) |  |
| N_delivery | 34.895 | molecules/injection | derived | Model / CPI / geometry model; Model / SUNRISE / Model Formulation, delivery (Eqs 1–3) | 125 residues, d=0.4 nm, ψ=30° |
| c1 | 0.0579 | µM | derived | Model / CPI / geometry model; Model / SUNRISE / Model Formulation, delivery (Eqs 1–3) | Rounded wiki value, 1 fL |
| K_D1 | 0.065 | µM | literature | Model / TPD / Model Formulation (CLIPPERs model), parameter table | TPD–ClpX |
| K_D2 | 0.12 | µM | literature | Model / TPD / Model Formulation (CLIPPERs model), parameter table | TPD–KanR, median of 94–154 nM |
| k_cat | 0.0778 | min⁻¹ | assumed | Model / TPD / Model Formulation (CLIPPERs model), parameter table | Range .0338–.0796; extrapolated from GroTAC |
| C_tot_basal | 0.134 | µM | literature | Model / TPD / Model Formulation (CLIPPERs model), parameter table |  |
| sigma32_fold | 3 | 1 | assumed | Model / SUNRISE / Model Formulation, ClpXP assumptions and integrated parameter table | Exact fold unmeasured |
| C_tot_induced | 0.402 | µM | derived | Model / TPD / Model Formulation (CLIPPERs model), parameter table | 0.134 × 3 |
| clpxp_blockade_min | 120 | min | assumed | Model / SUNRISE / Model Formulation, ClpXP assumptions and integrated parameter table | Worst-case complete blockade |
| k_XB | 0.00098185 | min⁻¹ | measured | Model / TPD / Model Formulation (CLIPPERs model), parameter table | 2026-08-20 pBAD chase |
| B0 | 0.3233 | µM | derived | Model / TPD / Model Formulation (CLIPPERs model), parameter table | Untreated KanR; Model / TPD module 1 |
| mu | 0.015068416968694463 | min⁻¹ | measured | Model / SUNRISE / Model Formulation, survival (Eqs 6–8) | 46 min doubling |
| r_g | 0.015068416968694463 | min⁻¹ | measured | Model / SUNRISE / Model Formulation, survival (Eqs 6–8) | Alias of mu |
| k_prod | 0.005189 | µM/min | derived | Model / TPD / Model Formulation (CLIPPERs model), parameter table | Rounded wiki value; use (mu+k_XB)B0 |
| r_kill | 0.02837 | min⁻¹ | literature | Model / SUNRISE / Model Formulation, survival (Eqs 6–8) | ψmax−ψmin |
| K | 629000000 | cells/mL | measured | Model / SUNRISE / Model Formulation, survival (Eqs 6–8) | No-drug endpoint |
| K_1 | 1.032 | µg/mL | derived | Model / SUNRISE / Model Formulation, survival (Eqs 6–8) | Posterior with fixed r_kill |
| n_1 | 1.722 | 1 | derived | Model / SUNRISE / Model Formulation, survival (Eqs 6–8) |  |
| K_m | 1.463 | µg/mL (wiki labels it µM; see note) | literature | Model / SUNRISE / Model Formulation, survival (Eqs 6–8) | The wiki parameter table gives K_m = 1.463 µM while Eq. (6) combines it with q and A_e, both in µg/mL. Converting it (×484.5/1000 -> 0.709 µg/mL) does not reproduce the wiki published values; using 1.463 as written does. We therefore use the wiki numeric value unchanged and record the unit label in the source as an inconsistency we did not resolve. |
| q_0 | 375.9 | µg/mL | derived | Model / SUNRISE / Model Formulation, survival (Eqs 6–8) | Reference detox capacity |
| B_star | 0.1972 | µM | derived | Model / SUNRISE / Model Formulation, survival (Eqs 6–8) | Wiki threshold at Kan 100 |
| j_req | 1 | injections | derived | Model / SUNRISE / Model Formulation, ClpXP assumptions and integrated parameter table | Computed default/upper 1, lower 3; source integrated table 3/6 contradicts its required Ntot table |
| N_0 | 1000000 | CFU/mL | design-variable | Model / SUNRISE / Model Formulation, survival (Eqs 6–8) | Wiki 5e5–1e8 |
| A_e | 100 | µg/mL | assumed | Model / SUNRISE / Model Formulation, survival (Eqs 6–8) | Conservative urinary assumption |
| t_obs | 18 | h | literature | Model / SUNRISE / Model Formulation, survival (Eqs 6–8) | CLSI-based |
| pretreatment_min | 30 | min | assumed | Model / SUNRISE / Implementation convention from SPEC §4.1–4.2 | SPEC §4.1–4.2 |
| dt_min | 0.5 | min | assumed | Model / SUNRISE / Implementation convention from SPEC §4.1 | SPEC §4.1 |
| molecule_to_uM | 0.0016605 | µM/molecule/fL | assumed | Model / SUNRISE / Implementation convention from SPEC Eq.3 physical conversion | SPEC Eq.3 physical conversion |
| RT_310 | 0.616 | kcal/mol | assumed | Model / SUNRISE / Implementation convention from SPEC §3 RT at 310 K; scales with T | SPEC §3 RT at 310 K; scales with T |
| missing_binding_KD | 1000000000 | µM | assumed | Model / SUNRISE / Implementation convention from SPEC §3.1 effective infinity | SPEC §3.1 effective infinity |
| validation_kon | 10 | µM⁻¹ min⁻¹ | assumed | Model / SUNRISE / Implementation convention from SPEC §4.4 baseline; sensitivity 1,100 | SPEC §4.4 baseline; sensitivity 1,100 |
