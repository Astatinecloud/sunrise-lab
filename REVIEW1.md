# REVIEW 1 — corrections (Claude, supervising)

These override `SPEC.md` where they conflict. `SPEC.md` has been updated since the Phase 1 run:
§2.3 now contains the five mass-action equations verbatim.

Phase 1 was implemented and self-reported honestly: `npm test` 25/29, `npm run validate` 3/6,
`Δlog10` with SUNRISE = **+2.789** — i.e. SUNRISE had no effect and the population simply saturated
at the carrying capacity, since `log10(6.29e8 / 1e6) = 2.799`. Diagnosis below. Fix all of R1–R9.

## R1 (blocking). KanR dilution uses the wrong rate — this is the root cause.

In `simulation.ts` the KanR equation uses `dilution = max(rate, 0)` where `rate` is the **net** growth
rate `λ_j = r_g(1 − ΣN/K) − r_kill·f_j`. That is wrong:

* Killing removes whole cells; it does not dilute the contents of the survivors. Dilution of an
  intracellular species is set by the **division** rate, not the net rate.
* Observed consequence: once `λ_j < 0` the dilution term vanishes, so KanR's only loss is `k_XB` and
  `B` converges to `k_prod / k_XB = 5.28 µM`. The diagnostic run shows `B = 1.41 µM` at
  t = 1080 min — **4.4x above the untreated level `B0 = 0.3233 µM`**, which is physically impossible.
  KanR recovering past `B0` restores resistance and lets the population escape.

The wiki writes two different symbols; implement them differently:

* **Eq. (4) / Eq. (21)** — KanR: the term is `µ_j`, the *growth-dilution* rate (module 2 defines
  `µ = ln2/46`). Implement `µ_j = max(r_g · (1 − Σ_k N_k / K), 0)` — the crowding-limited
  **division** rate, independent of killing. It must never exceed `ln2/46`.
* **Eq. (5)** — adapter: the term is `max(λ_j, 0)` with `λ_j` the **net** growth rate. Keep as is;
  this is the wiki's explicitly stated modelling convention ("a declining cell class does not
  concentrate its payload").

Add a regression test: `B(t) <= B0 + 1e-9` for every class and every frame in every scenario.
Add to `docs/VALIDATION.md` a one-line sensitivity: `Δlog10` with `µ_j = ln2/46` (constant) versus
`µ_j = max(r_g(1 − ΣN/K), 0)`.

Expected after the fix (my hand calculation — report your own numbers, do **not** tune anything to
match mine): after the 120 min ClpXP blockade, `N_tot ≈ 0.27 µM`, `[C] ≈ 0.196 µM`, `B` settles near
**0.046 µM**, `q ≈ 54 µg/mL`, `A_i ≈ 47 µg/mL`, `f ≈ 0.998`, `λ ≈ −0.0133 min⁻¹`, and `Δlog10` ends
clearly below −3.

## R2 (blocking). `K_m` — revert my unit harmonisation. SPEC §2.4 and §4.3 item 2 were wrong.

You were right to flag this. Set `K_m = 1.463` and use it directly alongside `q` and `A_e` in µg/mL.
Tag it `provenance: 'literature'`, `unit: 'µg/mL (wiki labels it µM; see note)'`, with this note:

> The wiki's parameter table gives `K_m = 1.463 µM` while Eq. (6) combines it with `q` and `A_e`,
> both in µg/mL. Converting it (x484.5/1000 -> 0.709 µg/mL) does **not** reproduce the wiki's own
> published values; using 1.463 as written does. We therefore use the wiki's numeric value unchanged
> and record the unit label in the source as an inconsistency we did not resolve.

Confirmation that 1.463 is the self-consistent choice: with `K_m = 1.463`, `B = B0`, and MIC defined
as the `A_e` at which `r_kill · f = r_g`, the model gives
`A_e = 1.110 · (1.110 + 1.463 + 375.9) / (1.110 + 1.463) = 163.3 µg/mL`, matching the wiki's stated
reference condition **MIC 163.2 µg/mL**. Add that as an explicit validation check
(`|computed − 163.2| / 163.2 < 1 %`). Remove the `unit-harmonised` provenance tag from the union type
if nothing else uses it.

## R3 (blocking). Rewrite the QSS-vs-full-kinetics validation; the current comparison is invalid.

Use the verbatim equations now in SPEC §2.3 and delete the "could not be retrieved" caveat from
`docs/MODEL.md`.

The 867 % error is **not** a QSS timescale failure; it is a definition mismatch. The full system's
`y[0]` is **free** KanR, whereas Eq. (21)'s `B` carries all of KanR's loss terms, so it behaves like
total KanR. With `K_D2 = 0.120 µM` and `N_tot = 1.737 µM` most KanR is sequestered in `NB`/`NBC`, so
the two quantities differ by a large factor by construction. Replace check 1 with three sub-checks:

* **1a — algebraic reduction (must be exact).** Set `k_cat = 0`, `k_prod = 0`, `µ = 0`, `k_XB = 0`
  and integrate the full system to equilibrium. Assert `[N]`, `[C]`, `[NC]`, `[NB]`, `[NBC]` match
  Eqs (10)–(14) and (18)–(19) to relative error **< 1e-8**, and that Eqs (6)–(7) hold to < 1e-10.
  This is the reduction the wiki actually derives, so it should be exact.
* **1b — QSS timescale (the real test).** With `k_cat`, `k_prod`, `µ`, `k_XB` on, compare the
  **degradation flux**: `k_cat · [NBC]` from the full system against `k_eff(B_free) · B_free` from
  Eq. (20), evaluated at the full system's own instantaneous free `B`. Report the max relative error
  after a 5 min burn-in for `k_on ∈ {1, 10, 100}` µM⁻¹min⁻¹ and
  `N_tot ∈ {0.058, 0.174, 0.579, 1.737}` µM. **Accept if < 2 % at `k_on >= 10`**; report `k_on = 1`
  as the assumption's boundary.
* **1c — trajectory comparison, reported not asserted.** Compare total KanR `B + [NB] + [NBC]` from
  the full system against Eq. (21)'s `B`. Report the error and state plainly in
  `docs/VALIDATION.md` that Eq. (21) as published does not distinguish free from total KanR, that we
  read its `B` as free KanR (required by the Langmuir factor `B/(K_D2 + B)` in Eqs 12 and 19–20),
  and what the resulting discrepancy is. **Do not** change the game model to fix 1c.

In `fullKinetics.ts`, apply `−(µ + k_XB)` to every KanR-containing species (`B`, `NB`, `NBC`),
returning the adapter to its free pool, and apply no loss to adapter-only species so `N_tot` stays
constant as Eq. (21) assumes. State this choice in `docs/VALIDATION.md`.

## R4 (blocking). The Exp 3 plateau is NOT reproducible — document it, do not fit to it.

With the corrected parameters the model predicts MIC = 163.3 µg/mL at `B0` and about 26 µg/mL at
`B0/6.4`, a 6.2-fold drop. The measurement (Exp 3) saw **no** resolvable difference across that same
6.4-fold expression range (IC50 55 ± 5 vs 77 ± 22 µg/mL). So the wiki's linear `q ∝ B` mapping plus
Michaelis detox reproduces the *collapse* at low KanR but **not the plateau at high KanR**.

Required handling:

1. Keep SPEC §4.4 check 4 but make its verdict **report-only**. Record the predicted MIC at the three
   Exp 3 expression levels next to the measured IC50 values, and state the mismatch.
2. Add a "再現できなかった点" section to `docs/MODEL.md` naming this as the model's main limitation.
3. **Do not** add a saturating term, and do not change `q_0`, `K_m`, `K_1` or `n_1`, or otherwise fit.
4. The game must teach the non-proportionality from the **measured** Exp 3 data, shown as measured
   points, with the model curve drawn alongside and clearly labelled as the model. Stage 5 and the
   「科学的根拠」 modal must say the model reproduces the collapse but not the plateau.

## R5. Unit bug in `kdFromDeltaG`.

It returns molar, while `params.K_d_eng` is in pM, and `computeDelivery` separately multiplies
`R_local` (mM) by `1e9`. Make the units explicit: have `kdFromDeltaG` return **molar**, add
`langmuirAlphaFromDeltaG(dG_kcal, R_molar)`, hold `R_local` and `K_d_eng` in **M** internally (keep
display units in the parameter metadata), and assert in a test that `kdFromDeltaG(-14.2)` is
`98.4 pM ± 2 %` and that the resulting `α` matches `1 − 3.6e-9` to 1e-9.

## R6. Frames must cover the pretreatment, and `frame()` must be exact at `t = 0`.

Emit frames from `t = −pretreatment_min` so stage 3 can animate the TPD-only phase from the same
`SimResult`. Keep the population fixed during the pretreatment, but set `meanAi` / `meanKill` to the
`A_e = 0` values for `t < 0` rather than to the dose-time values.

## R7. Readability — the code must be editable later (SPEC §0).

The generated model files are dense, mostly one line per function. Reformat `src/**` to conventional
multi-line TypeScript (one statement per line, braces on blocks, about 100 columns). Add Prettier as
a dev dependency with a checked-in config and an `npm run format` script, and run it. Behaviour must
not change: `npm test` and `npm run validate` must give identical numbers before and after.

## R8. Relax the performance target.

SPEC §4.1's 150 ms was for a single 18 h run, not for the whole validation suite. Requirement: one
`runSimulation` call over 18 h at MOI 30 completes in **< 150 ms**; assert that in a test.
`npm run validate` has no time limit.

## R9. Re-report honestly.

Re-run `npm install`, `npm test`, `npm run validate`, `npm run build`. In your final answer give the
real numbers for `α`, `c₁`, `k_prod`, `B*` at Kan 100, `j_req` (default / upper / lower `k_cat`),
MIC at `B0`, `Δlog10` with and without SUNRISE, the 1a / 1b / 1c errors, and the single-run timing.
State every remaining failure. Do not tune any parameter to make a check pass; if a wiki number
cannot be reproduced, record the discrepancy and your diagnosis in `docs/VALIDATION.md`.
