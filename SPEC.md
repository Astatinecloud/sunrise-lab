# SUNRISE LAB — 薬剤耐性菌を攻略せよ！ / 実装仕様書 (v1)

Author: Claude (design & supervision). Implementer: Codex.
Source of all science: iGEM Waseda-Tokyo 2026 wiki (`https://2026.igem.wiki/waseda-tokyo/`).

---

## 0. Scope

* Educational 2D browser game, Japanese UI, PC browser, 3–5 min, "高校生モード" only.
* Static site, deployable to GitHub Pages.
* **Science model must be a UI-independent module** (`src/model/**`), with unit tests and a
  reduced-vs-full numerical validation.
* The game must never claim that integrated SUNRISE has been experimentally demonstrated.

## 1. Tech stack (fixed)

* **Vite + TypeScript**, no UI framework (vanilla DOM + inline SVG + minimal canvas).
* **Vitest** for model tests.
* Output: `dist/`, built with `base: './'` so it works from any GitHub Pages subpath.
* No external runtime dependencies, no external assets (all art is hand-written inline SVG).
  Fonts: system stack only (`system-ui, "Hiragino Sans", "Noto Sans JP", sans-serif`).
* Directory layout:

```
index.html
src/
  main.ts                 // bootstrap, stage router
  state/store.ts          // single source of truth (see §6)
  model/
    params.ts             // ALL parameters + provenance tags
    cpi.ts                // delivery model (§3.1)
    tpd.ts                // KanR degradation model (§3.2)
    pharmacodynamics.ts   // detox -> kill model (§3.3)
    population.ts         // logistic + kill population dynamics (§3.4)
    simulation.ts         // integrator + run orchestration (§3.5)
    fullKinetics.ts       // non-reduced mass-action ODE, validation only (§3.6)
    index.ts
  ui/
    stage1.ts ... stage5.ts
    components/           // button, dialog, progress, quiz, chart, bacteriaField
    art/                  // svg builders: bacterium.ts, pvc.ts, adapter.ts, clpxp.ts, kanamycin.ts
  styles/
tests/
  model.*.test.ts
docs/
  MODEL.md                // deliverables 4–7 (model list, wiki refs, provenance, simplifications)
  VALIDATION.md           // deliverable 8 (test & numeric validation results)
  PLAYGUIDE.md            // deliverable 3 (操作説明)
```

## 2. Scientific ground truth (verbatim from the wiki)

### 2.1 System

* **SUNRISE** = **TPD module** (degrade resistance protein) + **CPI module** (deliver protein into
  target bacteria). Goal: *restore* susceptibility to **existing** antibiotics. Not a new antibiotic,
  not primarily a bactericide.
* **CPI module** components (Design → CPI → "Components of the CPI Module"):
  | Component | Function | Design |
  |---|---|---|
  | Targeting system | recognises target bacterium, binds CPI to cell surface | bacteria-specific **RBP inserted into Pvc13** (C-terminal region of Pvc13 mediates target interaction); SUNRISE uses **gp17** (T7 phage tail fiber, binds *E. coli* LPS) |
  | Injection system | penetrates envelope, delivers payload | core **PVC** injection machinery (sheath contraction → inner tube + spike) |
  | Payload | protein delivered | **Pdp1_NTD** fused to the TPD adaptor (N-terminal region is the PVC loading signal) |
* **TPD module** components (Design → TPD → "Components of the TPD Module"):
  | Component | Function |
  |---|---|
  | **Binder** | recognises the target resistance protein (de novo, BindCraft) |
  | **Linker** | connects Binder and Anchor; flexible **GGS** repeats (CLIPPER design) |
  | **Anchor (XB)** | binds the **ClpX ZBD** to bring the target into proximity with **ClpXP** |
* Target resistance protein in game: **KanR** (APH(3')-IIa), inactivates **kanamycin**.

### 2.2 What is demonstrated vs modelled (Results page — MUST be respected)

| Claim | Status |
|---|---|
| XB / ssrA degron **fused directly** to KanR removes essentially all resistance | **Demonstrated.** Exp 4: untagged KanR IC50 77 ± 22 µg/mL; KanR-XB 1.1 ± 0.4; KanR-ssrA 1.4 ± 0.1 µg/mL (73× / 54× reduction; both indistinguishable from no KanR) |
| Resistance is **not proportional** to KanR amount | **Demonstrated.** Exp 3: expression J23100:J23110:J23114 = 100 : 15.7 ± 1.7 : 1.11 ± 0.07 %; IC50 = 55 ± 5 / 77 ± 22 / 0.94 ± 0.39 µg/mL → plateau then cliff. Transition between 200–3000 RFU/OD600 **not measured** |
| Designed **KanR-targeting adaptor** lowers resistance | **NOT demonstrated.** Exp 5: KB1–KB10 showed no resolvable IC50 change vs ΔBinder (29.7 ± 4.4 µg/mL) |
| Adaptor is expressed / fails at delivery step | **Unresolved.** Exp 7: no KanR band resolvable, ~7× loading variation |
| Integrated CPI+TPD SUNRISE works | **Not experimentally established.** Model-based prediction only |

### 2.3 Equation set (Model page)

**Delivery (Integrated SUNRISE, Eqs 1–3)**

```
P(j) = λ^j e^-λ / j!                                   (1)   λ = α·m
α = [R] / ([R] + K_d,eng),   K_d,eng = exp(ΔG / RT)    (2)
N̄_delivery(ψ) = Σ_L p_L · Φ((ΔL(L) − g(ψ) − µ_H)/σ_H) · Ñ_max(L)
c₁ = N̄_delivery · v⁻¹,   v⁻¹ = 1.6605e-3 µM/molecule/fL (3)
N_tot^(j) = j · c₁
```

**Full (non-reduced) mass-action system — TPD module 2 Eqs 1–7, verbatim.**
Species: `N` = free adapter (CLIPPERs), `C` = free ClpXP, `B` = free KanR,
`NC` / `NB` / `NBC` = complexes. Degradation occurs only in the ternary complex `NBC`.

```
d[N]/dt   = −k_on1[N][C] + k_off1[NC] − k_on2[N][B] + k_off2[NB]                         (1)
d[B]/dt   =  k_prod − k_on2[N][B] + k_off2[NB] − k_on3[NC][B] + k_off3[NBC]              (2)
d[NC]/dt  =  k_on1[N][C] − k_off1[NC] − k_on3[NC][B] + k_off3[NBC] + k_cat[NBC]          (3)
d[NB]/dt  =  k_on2[N][B] − k_off2[NB] − k_on4[NB][C] + k_off4[NBC]                       (4)
d[NBC]/dt =  k_on3[NC][B] − k_off3[NBC] + k_on4[NB][C] − k_off4[NBC] − k_cat[NBC]        (5)

N_tot = [N] + [NC] + [NB] + [NBC] = const                                                (6)
C_tot = [C] + [NC] + [NBC]        = const                                                (7)
```

Reduction to the QSS form below uses the wiki's two assumptions:
**Assumption 1 (QSS)** `k_on, k_off ≫ k_cat, k_prod`, so binding is at equilibrium and only
`K_Di = k_offi / k_oni` matters (Eq. 8). **Assumption 2 (independent sites)** `K_D3 = K_D2`,
`K_D4 = K_D1` (Eq. 9), justified by the long flexible linker separating the adapter's two termini.
For `fullKinetics.ts`, set `k_on1 = k_on4`, `k_on2 = k_on3` to the sweep value and derive each
`k_off = K_D · k_on` so that the two systems share identical dissociation constants. Also apply the
growth-dilution/`k_XB` loss `−(µ + k_XB)·X` to every adapter- and KanR-containing species so the two
systems are comparable; note this in `docs/VALIDATION.md` as a choice made for the comparison.

**Degradation (Eqs 4–5, from TPD module 2 QSS reduction Eqs 8–21)**

```
[C] = ( −(K_D1 + N_tot − C_tot) + sqrt((K_D1 + N_tot − C_tot)² + 4·C_tot·K_D1) ) / 2    (18)
[NBC] = N_tot·B·[C] / ((K_D1+[C])(K_D2+B))                                              (19)
k_eff(B) = k_cat·N_tot·[C] / ((K_D1+[C])(K_D2+B))                                       (20)
dB_j/dt = k_prod − (µ_j + k_XB + k_eff^(j)(B_j))·B_j                                    (21)/(4)
dN_tot^(j)/dt = −max(λ_j, 0)·N_tot^(j)                                                  (5)
```

**Population / pharmacodynamics (Eqs 6–8)**

```
q_j = q₀ · B_j / B₀                                                                     (6)
A_i^(j) = ( −(K_m + q_j − A_e) + sqrt((K_m + q_j − A_e)² + 4·A_e·K_m) ) / 2             (6)
f_j = (A_i^(j))^n1 / (K₁^n1 + (A_i^(j))^n1)                                             (7)
λ_j = r_g (1 − Σ_k N_k / K) − r_kill · f_j                                              (7)
dN_j/dt = λ_j N_j ,   N(t) = Σ_j N_j(t)                                                 (8)
```

Metric: `Δlog10 = log10( N(18h) / N(0) )`; success target `≤ −3` (3-log kill).

**Wiki assumptions carried over (state them in-game "もっと知る"):**
1. Injection instantaneous, independent across cells → Poisson.
2. Single-site Langmuir binding (real particles are multivalent → α may be underestimated).
3. Injection classes interact only through shared carrying capacity.
4. External drug concentration prescribed (constant `A_e`).
5. Kanamycin has two opposing effects on ClpXP: σ32 induction of *clpPX* (**×3.0, assumed**) and
   ssrA-tagging competition (**complete blockade for the first 120 min, worst case**).
6. Injection classes with < 1 cell are absent.

### 2.4 Parameters (`src/model/params.ts`) — value + provenance tag

`provenance` ∈ `'measured' | 'literature' | 'derived' | 'assumed' | 'design-variable' | 'unit-harmonised'`

| symbol | value | unit | provenance | note |
|---|---|---|---|---|
| `m` (MOI) | 30 (default) | particles/cell | design-variable | Model/SUNRISE param table |
| `K_d_eng` | 98.4 | pM | derived | from ΔG = −14.2 kcal/mol (project docking) |
| `R_local` | 27.7 | mM | derived | 1e6 LPS/cell within 6 µm² × 10 nm shell |
| `alpha` | 1 − 3.6e-9 | – | derived | Eq. (2) with above |
| `N_delivery` | 34.895 | molecules/injection | derived | CPI geometry model (125 residues, d = 0.4 nm, ψ = 30°) |
| `c1` | 0.0579 | µM | derived | 34.895 molecules in 1 fL cytoplasm |
| `K_D1` | 0.065 | µM | literature | TPD–ClpX |
| `K_D2` | 0.120 | µM | literature | TPD–KanR (median of 94–154 nM) |
| `k_cat` | 0.0778 (range 0.0338–0.0796) | min⁻¹ | assumed | unmeasured; extrapolated from GroTAC |
| `C_tot_basal` | 0.134 | µM | literature | ClpXP before σ32 induction |
| `sigma32_fold` | 3.0 | – | assumed | exact fold unmeasured |
| `C_tot_induced` | 0.402 | µM | derived | 0.134 × 3.0 |
| `clpxp_blockade_min` | 120 | min | assumed | worst-case complete blockade after dosing |
| `k_XB` | 9.8185e-4 | min⁻¹ | measured | 2026-08-20 pBAD chase |
| `B0` | 0.3233 | µM | derived | untreated-strain KanR, TPD module 1 |
| `mu` / `r_g` | ln2/46 = 0.01507 | min⁻¹ | measured | 46 min doubling |
| `k_prod` | 5.189e-3 | µM/min | derived | (µ + k_XB)·B0 |
| `r_kill` | 0.02837 | min⁻¹ | literature | ψmax − ψmin |
| `K` (capacity) | 6.29e8 | cells/mL | measured | no-drug endpoint |
| `K_1` | 1.032 | µg/mL | derived | posterior with r_kill fixed |
| `n_1` | 1.722 | – | derived | posterior |
| `K_m` | 1.463 µM → **0.709 µg/mL** | µg/mL | unit-harmonised | see §4.3 |
| `q_0` | 375.9 | µg/mL | derived | reference-strain detox capacity |
| `B_star` | 0.1972 | µM | derived | KanR threshold for sustained killing at Kan 100 µg/mL |
| `j_req` | 3 (k_cat upper) / 6 (lower) | injections | derived | Eq. (11) |
| `N_0` | 1e6 (game default; wiki 5e5–1e8) | CFU/mL | design-variable | |
| `A_e` | 100 | µg/mL | assumed | conservative urinary assumption |
| `t_obs` | 18 | h | literature | CLSI-based |

Also store the **Exp 3 measured calibration points** for the教育 chart:
`[{promoter:'J23100', rel:100, ic50:55, sd:5}, {promoter:'J23110', rel:15.7, ic50:77, sd:22}, {promoter:'J23114', rel:1.11, ic50:0.94, sd:0.39}]`
and the **Exp 4** points `untagged 77±22, XB 1.1±0.4, ssrA 1.4±0.1 µg/mL`.

Every entry is an object `{ value, unit, provenance, source }` where `source` is a wiki page + section
string, e.g. `'Model / SUNRISE / Model Formulation, Table 9.3.1 parameter list'`.
**Do not invent any parameter not in this table.** If a value is needed and absent, add it with
`provenance:'assumed'` and a note, and list it in `docs/MODEL.md` §仮定値.

## 3. Model module API

```ts
// cpi.ts
export function langmuirAlpha(R: number, Kd: number): number
export function kdFromDeltaG(dG_kcal: number, T_K?: number): number      // exp(ΔG/RT), RT=0.616 kcal/mol @310K
export function poissonPmf(j: number, lambda: number): number
export function poissonClasses(lambda: number, minCellsFrac: number): number[]  // truncation per Assumption 6
export interface DeliveryResult { lambda:number; alpha:number; classes:{j:number;p:number;Ntot:number}[]; pZero:number }
export function computeDelivery(build: BuildConfig, moi: number): DeliveryResult

// tpd.ts
export function freeClpXP(Ntot:number, Ctot:number, KD1:number): number        // Eq.18
export function ternaryComplex(Ntot:number,B:number,C:number,KD1:number,KD2:number): number // Eq.19
export function kEff(Ntot:number,B:number,C:number,p:TpdParams): number        // Eq.20
export function steadyStateKanR(Ntot:number, p:TpdParams): number              // root of Eq.21

// pharmacodynamics.ts
export function detoxCapacity(B:number): number                                 // Eq.6 q
export function intracellularDrug(Ae:number,q:number,Km:number): number         // Eq.6 A_i
export function killFraction(Ai:number,K1:number,n1:number): number             // Eq.7 f
export function micFromKanR(B:number): number     // numeric: A_e at which f·r_kill = r_g  (教育用)

// simulation.ts
export interface SimConfig { build:BuildConfig; moi:number; Ae:number; useSunrise:boolean;
  N0:number; durationMin:number; dtMin:number; kcat:number; sigma32:boolean; blockade:boolean }
export interface SimFrame { tMin:number; totalCells:number; perClass:number[];
  meanKanR:number; minKanR:number; meanNtot:number; freeClpXP:number;
  meanAi:number; meanKill:number; reachedCells:number; unreachedCells:number }
export interface SimResult { frames:SimFrame[]; deltaLog10:number; success:boolean;
  delivery:DeliveryResult; failures:FailureReason[] }
export function runSimulation(cfg:SimConfig): SimResult
```

`BuildConfig` is what the player assembled in stage 2:

```ts
export interface BuildConfig {
  rbp: 'gp17' | 'wrong-rbp' | 'none';        // targeting system in Pvc13
  injector: 'pvc-core' | 'none';             // injection machinery
  loadingSignal: 'pdp1-ntd' | 'none';        // payload packaging signal
  cargo: 'tpd-adapter' | 'inert-protein' | 'none';
  binder: 'kanr-binder' | 'wrong-binder' | 'none';
  linker: 'ggs' | 'none';
  anchor: 'xb' | 'none';
}
```

### 3.1 Failure semantics (deterministic, each with a short Japanese explanation)

Implement as `evaluateBuild(build): {ok:boolean; failures:FailureReason[]; modifiers:Modifiers}`.

| condition | effect on model | 日本語説明（UI文言） |
|---|---|---|
| `rbp !== 'gp17'` | accessible receptor `[R]_eff = 0` → `α = 0` → `λ = 0` | 「標的に合わないRBPでは、PVCが大腸菌の表面に付着できません。付着しなければ注入は始まりません。」 |
| `injector === 'none'` | `α = 0` | 「収縮して内管を押し出す装置がなければ、細胞表面を貫通できません。」 |
| `loadingSignal === 'none'` | `N̄_delivery = 0` → `c₁ = 0` | 「Pdp1のN末端は、PVCに荷物を積み込むための“荷札”です。これが無いとタンパク質は積まれず、注入しても中身は空です。」 |
| `cargo !== 'tpd-adapter'` | `N_tot = 0` for TPD purposes | 「届けたタンパク質が目的のアダプターでなければ、KanRは分解されません。」 |
| `binder !== 'kanr-binder'` | `K_D2 → ∞` (use 1e9 µM) → `k_eff ≈ 0` | 「BinderがKanRを認識できないと、アダプターはKanRをつかめません。分解は始まりません。」 |
| `anchor === 'none'` | `K_D1 → ∞` → `[C]`-bound fraction ≈ 0 → `k_eff ≈ 0` | 「XBはClpXのZBDに結合する“取っ手”です。これが無いとClpXPを呼び込めません。」 |
| `linker === 'none'` | `k_cat_eff = 0` (model assumption) | 「柔らかいLinkerが無いと、KanRをClpXPの入口まで動かせません（モデル上の仮定）。」 |
| `useSunrise === true` but `Ae === 0` | KanR falls but `f = 0` → population still grows logistically | 「KanRを減らしても、抗生物質がなければ増殖は止まりません。SUNRISEは薬を効かせるための準備です。」 |

Note: `λ = 0` ⇒ `P(j=0)=1` ⇒ all cells unreached. Stage 3 must then show the mechanistic stall and
let the player go back and fix the build. **No randomness in the build-failure path.**

### 3.2 Stochastic vs deterministic

* Population dynamics: **deterministic** (class-weighted ODE). Reproducible.
* Stage 3 **visual** injection of individual bacteria: sample `j ~ Poisson(λ)` per drawn bacterium
  with a **seeded PRNG** (`mulberry32`, seed in store) so the picture matches the class weights in
  expectation, and re-runs are reproducible. Drawn-bacteria counts must be derived from
  `SimFrame.perClass`, never invented.
* Do **not** set injection success to 100% "because the game needs it": with the wiki's own α≈1 and
  m=30, `P(j=0)=e^-30≈1e-13`, so near-complete coverage is a *model result*, which the UI must state
  as such ("このモデルの条件ではほぼ全ての細菌に届きます"). Add a **MOI slider in stage 3
  (1–30, default 30)** so the player can *see* `P(j=0)` and `j_req` matter: at m = 2–3 a visible
  fraction stays unreached and survives. This is where "注入は確率的" is taught honestly.

## 4. Numerics

### 4.1 Integrator
RK4, fixed step `dt = 0.5 min`, horizon 18 h (2160 steps) for stage 4; stage 3 TPD-only phase uses
the same integrator over the pre-treatment interval (default **30 min**).
Clamp `B ≥ 0`, `N_j ≥ 0`; drop classes with `N_j < 1` cell/mL (Assumption 6).
Target: a full 18 h run must complete in **< 150 ms**; precompute and cache, then animate from frames.

### 4.2 Timeline the game simulates

```
t = -30 min : SUNRISE administered (CPI injection, instantaneous) — stage 3
t = -30..0  : TPD degrades KanR, no antibiotic (A_e = 0)         — stage 3
t = 0       : kanamycin dosed, A_e = 100 µg/mL                   — stage 4
              C_tot: 0.134 → 0.402 µM (σ32, ×3)
              ClpXP competition: complete blockade for 0..120 min (k_eff = 0)
t = 0..18 h : population dynamics                                 — stage 4
```
The "SUNRISEなし" comparison arm runs the identical code with `useSunrise=false` (λ=0).

### 4.3 Documented simplifications (must appear in `docs/MODEL.md` and in-game 「科学的根拠」)

1. **QSS reduction.** The full 5-species mass-action system (Eqs 1–5) is replaced by the wiki's own
   QSS + independent-sites reduction (Eqs 8–21). Dropped: explicit `k_on*/k_off*` transients.
   Validated numerically in §3.6 / `docs/VALIDATION.md`.
2. **Unit harmonisation of `K_m`.** The wiki lists `K_m = 1.463 µM` while Eq. (6) mixes it with
   `q` and `A_e` in µg/mL. We convert with kanamycin MW 484.5 g/mol → `K_m = 0.709 µg/mL` and tag it
   `unit-harmonised`. Keep `K_m` as a single named constant so it can be changed in one place.
3. **CPI geometry collapsed to a constant.** `N̄_delivery = 34.895 molecules` and `c₁ = 0.0579 µM`
   are taken as the wiki's computed values for (125 residues, d = 0.4 nm, ψ = 30°) rather than
   re-deriving the WLC / penetration integral in the browser. Dropped: `p_L`, `Φ(·)`,
   `Ñ_max(L)` per-length sum. The angle/length dependence is therefore **not** interactive.
4. **Accessibility / capsule models not simulated.** Wrong-RBP failure is implemented as
   `[R]_eff = 0` rather than via `ΔG‡ = C∫φ^p dV` or `P_success = Σ f(z)S(z)`. Rationale: those
   models answer "which strains can be targeted", not "did this particle inject".
5. **Multivalency (`P_fire` binomial) not simulated** — folded into the single α (wiki Assumption 2).
6. **Innate-immune and pharmacokinetic compartment models are out of scope.** `A_e` is prescribed
   constant (wiki Assumption 4 / Experiments 1–5), not the q8h PK schedule of Experiments 6–7.
7. **`k_XB` retained on native KanR.** Native KanR carries no XB tag; the wiki keeps this term
   because the calibration measurements used XB-tagged substrates. We follow the wiki and say so.

### 4.4 Validation to produce (`docs/VALIDATION.md`, generated by `npm run validate`)

1. **QSS vs full kinetics.** Implement `fullKinetics.ts`: Eqs 1–5 with
   `k_on1 = k_on2 = k_on3 = k_on4 = 10 µM⁻¹min⁻¹` and `k_off = K_D · k_on` (so the `K_D` match), plus
   `k_cat`, `k_prod`. Integrate both for `N_tot ∈ {0.058, 0.174, 0.579, 1.737 µM}` over 180 min.
   Report max relative error in `B(t)` after a 5 min burn-in. **Accept if < 2 %.** Also report the
   error at `k_on = 1` and `k_on = 100` to show the QSS assumption's validity boundary.
2. **Analytic checks.** `freeClpXP` satisfies Eq. (17) residual < 1e-12; `[C] ≤ C_tot`;
   `steadyStateKanR` is the root of Eq. (21) (residual < 1e-10) and is monotonically decreasing in
   `N_tot`; `Σ_j poissonPmf(j,λ) → 1` within 1e-9.
3. **Reproduction of wiki numbers.** Report computed vs wiki for: `α`, `c₁`, `k_prod`, `B*` at
   Kan 100 µg/mL, `j_req`, and `Δlog10` at (m = 30, k_cat = 0.0778, A_e = 100, 18 h). State any
   mismatch openly in the doc — **do not tune parameters to force agreement**; if a number cannot be
   reproduced, record the discrepancy and the likely reason.
4. **Qualitative check against Exp 3 (not used to fit).** Sweep `B` from `B0` down to 0 and show the
   implied MIC curve saturates: a 6.4× drop from `B0` must leave MIC within the measured plateau
   region, and resistance must collapse only near the low end. Report the KanR fold-reduction needed
   to bring MIC below 100 µg/mL and compare with `B*`.
5. **Monotonicity/sanity:** `Δlog10` non-increasing in `m`; non-increasing in `A_e`; `useSunrise=false`
   must give `Δlog10 > 0` at `A_e = 100` (growth), reproducing stage 1.
6. **Energy of the UI contract:** assert the stage-4 chart series and the drawn bacteria counts are
   both computed from the same `SimResult.frames` (unit test on the adapter function).

## 5. Game flow & UI

Global: header with 5-step progress indicator (ステージ1〜5), a 「科学的根拠」 button (opens a modal
with §2.2 table, §4.3 simplifications, parameter provenance table), and a 「用語」 glossary chip row.
Jargon gets a one-line tooltip on first appearance. Large buttons (min 48 px tall, ≥18 px text).
Mouse only. Drag & drop **must** have a click-to-select → click-to-place equivalent.
Palette: bright lab — off-white `#F7F9FB`, ink `#1F2933`, teal `#1A8E8A`, amber `#E8A33D`,
coral `#D9534F` for danger, violet `#6C5CE7` for PVC. Keep illustrations structurally honest
(rod-shaped *E. coli* with envelope layers; PVC with baseplate / tail fibers / sheath / inner tube;
adapter as three linked domains). No cartoon faces.

**Loading/progress:** every simulation run shows a full-width progress panel ≥ 64 px tall with a
label (「シミュレーション計算中…」) and a determinate bar; even if compute is instant, animate the
*playback* and show elapsed simulated time (`t = +3:30`).

### Stage 1 — どうして薬が効かないの？
1. Petri-dish view, `N0` bacteria icons, 「抗生物質を投与する」 button.
2. On click: `A_e = 100 µg/mL`, run `useSunrise=false`. Bacteria keep dividing; chart of
   `log10 N` rises. Caption shows `A_i ≈ 0.0x µg/mL`,「細胞の中の有効な薬はほぼ0」.
3. Zoom into one cell: animated KanR molecules phosphorylating kanamycin → inactive form.
4. Quiz (3 options, one correct):
   - 「細菌が薬を体の外に押し出しているから」(×: それも耐性の仕組みの一つですが、今回の細菌は別の方法を使っています)
   - 「細菌がKanRという酵素を作り、カナマイシンを化学的に変化させて無力化しているから」(○)
   - 「カナマイシンがもともと大腸菌に効かない薬だから」(×: カナマイシンは本来この細菌に効きます。効かなくしているのはKanRです)
5. Explanation panel + 「次へ」.

### Stage 2 — SUNRISEを組み立てよう！
Two sub-puzzles, each a parts tray → labelled slots board.

**2a CPI / PVC.** Slots: ①標的への付着（Pvc13に入れるRBP） ②注入装置（PVCコア） ③運ぶタンパク質
④積み込みの荷札（Pdp1 N末端）. Parts tray includes correct parts **and** decoys
(`wrong-rbp` = 別の菌を狙うRBP, `inert-protein` = 蛍光タンパク質, `none`-style red herrings).
Placing a wrong part is allowed: the slot turns amber, an inline note explains why it will not work
(§3.1 text), and the player can swap. Assembled PVC animates together (sheath + fibers).

**2b TPD adapter.** Slots: Binder / Linker / Anchor(XB) in that spatial order. Decoys:
`wrong-binder` (GroEL用Binder), missing linker, missing XB. Each shows its §3.1 note.
Then a short animation: 「PVCがアダプターを運ぶ」 — adapter (with Pdp1_NTD tag) slides into the PVC
inner tube.

Gate: 「ステージ3へ」 is enabled always, but if the build is wrong a confirm dialog says
「この構成では送達できない可能性があります。そのまま試しますか？」 (buttons: 「試してみる」/「直す」).
Trying a broken build and seeing it stall in stage 3 is an intended learning path.

### Stage 3 — SUNRISEを起動！
Large single bacterium (≈60 % of viewport), semi-transparent envelope showing cytoplasm with KanR
dots and ClpXP hexamers. Right rail: MOI slider (1–30), live readouts
`λ`, `P(j=0)`, `注入回数 j`, `アダプター量 N_tot (µM)`, `KanR量 B (µM)`, `遊離ClpXP [C] (µM)`.
「SUNRISEを起動」 runs the 7-beat sequence as **one continuous timeline** (single scrubber,
total ≈ 22 s, with 「もう一度見る」 and a step list that highlights the current beat):
1. PVC particles approach (several, from the medium).
2. Tail fibers (gp17) engage LPS → attachment; label 「α = [R]/([R]+K_d)」.
3. Sheath contracts, inner tube punctures the envelope, adapter released into cytoplasm.
4. Adapter's Binder docks onto a KanR molecule (`K_D2 = 0.120 µM`).
5. Adapter's XB docks onto ClpX ZBD → ternary complex, KanR held at the ClpXP pore
   (`K_D1 = 0.065 µM`).
6. ClpXP unfolds and degrades KanR; KanR dot count visibly drops; `k_eff` readout.
7. Counter: 「KanR 0.3233 → B(t) µM」 and a note 「KanRが減ると、カナマイシンへの感受性が回復する
   “可能性”が高まります（モデルによる予測）」.
If the build fails, the animation **stops at the failing beat** with the §3.1 explanation and a
「組み立てに戻る」 button. If `λ` is low, show some bacteria that no particle reached.

### Stage 4 — もう一度、抗生物質を使ってみよう！
Split screen: left 「SUNRISEなし」, right 「SUNRISEあり」, both dosed with kanamycin at `t=0`.
* Bacteria field (icon count = `round(frames[i].totalCells / N0 * initialIcons)`, capped, with a
  numeric label when capped) **driven by the same `SimResult.frames`** as the chart.
* Auxiliary charts (smaller than the fields): `log10 N(t)`, `B(t)` (KanR), and a susceptibility
  readout (`推定MIC` from `micFromKanR`, plus `f` = killed fraction).
* Playback 1 s ≈ 30 min simulated, with pause / speed ×1 ×4, and the progress panel of §5.
* Crucially: KanR dropping does **not** instantly kill. The right panel must visibly show a lag
  (the 0–120 min ClpXP blockade and the Hill/logistic dynamics give one naturally); annotate it
  「KanRが減ってもすぐ全滅はしません。薬が効き始め、増殖が止まり、やがて数が減ります。」
* End card: `Δlog10` for both arms, and 「3-log（1000分の1）到達」 badge if `≤ −3`.

### Stage 5 — 結果とまとめ
Five short cards answering exactly the five questions in the brief
(最初に効かなかった理由 / PVCは何をしたか / BinderとXBは何をしたか / ClpXPは何をしたか /
なぜ再び効く可能性があるのか), each with a thumbnail of the relevant stage-3 beat.
Then the central message, visually dominant:

> **SUNRISEの役割は、耐性の原因となるタンパク質を取り除き、既存の抗生物質の効果を取り戻すことを目指すものです。**

Below it, a single compact honesty line + link to 「科学的根拠」:
「※このゲームの成功例は、2026年Wikiの数理モデルによる予測に基づく教育シミュレーションです。
分解タグを直接つないだ場合の耐性低下は実験で確認されていますが、設計したKanR標的アダプターによる
耐性低下は未確認です。」
Buttons: 「もう一度遊ぶ」 (reset store, keep nothing) and 「科学的根拠を見る」.

## 6. State management

Single `createStore()` in `src/state/store.ts` holding
`{ stage, build, moi, Ae, seed, sim: { withSunrise: SimResult|null, withoutSunrise: SimResult|null },
   quiz, glossarySeen: Set<string>, playback: {tIndex, playing, speed} }`
with `subscribe(fn)` / `dispatch(action)`. UI reads only from the store; models are pure functions
with no store access. No `Math.random()` outside the seeded PRNG.

## 7. Acceptance criteria

* `npm ci && npm run build` succeeds; `npm test` green; `npm run validate` writes
  `docs/VALIDATION.md` with real numbers.
* A full playthrough stages 1→5 works by mouse only, and 「もう一度遊ぶ」 returns to stage 1 clean.
* Click-to-place works for every drag target.
* Stage 4 chart values and drawn bacteria counts come from one `SimResult` (enforced by a test).
* `docs/MODEL.md` lists every model, its wiki section, and every parameter with provenance.
* Nothing in the UI states that integrated SUNRISE has been experimentally demonstrated.
* No network requests at runtime.
* Vite `base: './'`, plus a `.nojekyll` file in `dist/`.
