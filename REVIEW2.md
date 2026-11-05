# REVIEW 2 — model sign-off corrections + Phase 2 (the game UI)

Claude, supervising. Overrides `SPEC.md` and `REVIEW1.md` where they conflict.
Do **PART A** first and get it green, then build **PART B**.

Review 1 outcome: the blocking bugs are fixed and the model now reproduces the wiki.
`B* = 0.1972 µM` (wiki 0.1972), `MIC(B0) = 163.23 µg/mL` (wiki 163.2), check 1a = 2.3e-14,
`Δlog10` with SUNRISE = −∞ vs +2.76 without. Six items remain; four of them are my specification
errors, not yours.

---

# PART A — model sign-off

## R10. `j_req` = 1 / 3 is CORRECT. My SPEC value of 3 / 6 was wrong.

I went back to the wiki. Its own table of `B*` versus required `N_tot` (Model → SUNRISE →
"Experiments and Results", the table with columns `Kan µg/mL | B* (µM) | required knockdown |
k_cat = 0.0338 | k_cat = 0.0778 | k_cat = 0.2516`) gives, at **Kan 100 µg/mL**:

| Kan µg/mL | `B*` (µM) | required knockdown | required `N_tot`, `k_cat`=0.0338 | 0.0778 | 0.2516 |
|---|---|---|---|---|---|
| 50 | 0.0975 | 70 % | 0.337 | 0.127 | 0.038 |
| 75 | 0.1473 | 54 % | 0.194 | 0.080 | 0.024 |
| 100 | 0.1972 | 39 % | 0.118 | 0.049 | 0.015 |
| 125 | 0.2470 | 24 % | 0.064 | 0.027 | 0.009 |
| 150 | 0.2969 | 8 % | 0.021 | 0.009 | 0.003 |

With `c₁ = 0.0579 µM` per injection: `ceil(0.049 / 0.0579) = 1` and `ceil(0.118 / 0.0579) = 3`.
**Your 1 / 3 matches the wiki's own table.** The "3 / 6" in the wiki's integrated parameter table
contradicts this table. Keep your computed values, change `params.j_req` provenance to `'derived'`
with a note recording the wiki's conflicting 3 / 6, and add this to the "再現できなかった点" section of
`docs/MODEL.md` as an **internal inconsistency in the source**, not a defect of our implementation.

Add a validation check over all 15 cells of the table above: for each `Kan` row compute `B*` and, for
each `k_cat`, the minimum `N_tot` whose steady-state KanR is `<= B*`. **Accept within 5 %** of the
tabulated `N_tot` (they are rounded to 3 decimals), and `B*` within 0.5 %.

## R11. Two more wiki tables are exact validation targets — add them as hard checks.

Both use `C_tot = C_tot_induced = 0.402 µM`. I verified several entries by hand and they match our
equations to 4 significant figures, so these are real tests, not approximations.

**(a) `N_tot` → steady-state KanR** (same wiki section, columns
`N_tot | steady-state B | knockdown | half-time`):

| `N_tot` (µM) | steady-state `B` (µM) | knockdown | half-time |
|---|---|---|---|
| 0.05 | 0.1960 | 39.4 % | 36 min |
| 0.10 | 0.1211 | 62.6 % | 28 min |
| 0.25 | 0.0502 | 84.5 % | 16 min |
| 0.50 | 0.0300 | 90.7 % | 10 min |
| 1.00 | 0.0244 | 92.4 % | 8 min |
| 4.00 | 0.0224 | 93.1 % | 8 min |

Assert `steadyStateKanR` reproduces column 2 within **1 %**, and the knockdown
`1 − B/B0` within 1 % absolute. Also compute the half-time (time for `B` to fall halfway from `B0` to
its steady state, starting from `B0`, with no antibiotic and `C_tot = 0.402`) and report it against
column 4 — **report-only**, 1 min rounding makes a tight assertion meaningless.

**(b) `k_cat` → `k_eff` limit and minimum attainable `B`** (columns
`k_cat | k_eff limit | minimum attainable B | maximum knockdown`):

| `k_cat` (min⁻¹) | `k_eff` limit (min⁻¹) | min attainable `B` (µM) | max knockdown |
|---|---|---|---|
| 9.82e-4 (XB, measured) | 0.0009 | 0.3056 | 5.5 % |
| 0.0338 (GroTAC min, literature) | 0.0774 | 0.0555 | 82.8 % |
| 0.0778 (GroTAC max, literature) | 0.2203 | 0.0219 | 93.2 % |
| 0.2516 (ssrA, measured) | 0.8005 | 0.0064 | 98.0 % |

The `N_tot → ∞` limit of Eq. (20) is `k_eff → k_cat · C_tot / (K_D2 + B)`, and the minimum attainable
`B` solves `k_prod = (µ + k_XB + k_eff_limit)·B`. Implement
`kEffLimit(kcat, Ctot, B)` and `minAttainableKanR(kcat, Ctot)` and assert both columns within **1 %**.
(I checked `k_cat = 0.0778`: `0.0778 × 0.402 / (0.120 + 0.0219) = 0.2204` vs tabulated 0.2203, and
`0.005189 / (0.01605 + 0.2203) = 0.02195` vs tabulated 0.0219.)

With R10 and R11 in place, `docs/VALIDATION.md` should carry **four independent reproductions of
published wiki numbers**. Say so explicitly in that document; it is the strongest evidence that the
reduced model is faithful.

## R12. Drop my `B <= B0` assertion — it was wrong. Document the real behaviour instead.

You are right that constant synthesis plus crowding-limited dilution lets `B` accumulate: as
`ΣN → K`, `µ_j → 0`, so KanR's only loss is `k_XB` and `B → k_prod / k_XB = 5.28 µM`. That is what
the wiki's published equation does, and the wiki never runs it into stationary phase, so it is an
extrapolation artifact of the source model, not a bug in your code. Replace the test with:

1. `B(t) <= k_prod / k_XB + 1e-9` in every scenario (the equation's true ceiling).
2. In a killing scenario, KanR per class never exceeds the matched `useSunrise:false` trajectory at
   the same time index — this is the invariant whose violation caused the original R1 bug, and it is
   the one worth guarding.
3. The KanR dilution rate is non-negative, independent of `r_kill`, and `<= ln2/46` at all times.

Then add a **documented, off-by-default** config flag
`synthesis: 'constant' | 'division-coupled'` (default `'constant'`, the wiki's form). Under
`'division-coupled'`, `k_prod` scales with `µ_j / (ln2/46)`, so a non-dividing cell also stops making
KanR. Report in `docs/VALIDATION.md` the `Δlog10` of both arms under both settings as a sensitivity,
and record in `docs/MODEL.md` that the default follows the wiki and why the artifact exists. Do not
make `'division-coupled'` the default and do not use it in the game.

For the game UI: draw a `B0` reference line on every KanR chart so a rise above the untreated level is
visible rather than hidden, and cover it in one sentence in the 「科学的根拠」 modal.

## R13. The 1b acceptance criterion was mine and it was badly chosen. Replace it.

Your numbers — 53.1 % at `k_on = 1`, 5.41 % at `k_on = 10`, 0.544 % at `k_on = 100` — are textbook
QSS behaviour: the error falls about 10x per decade of `k_on`, exactly as `O(1/k_on)` predicts. That is
a **successful** validation of the wiki's Assumption 1, not a failure. New criteria:

* `< 1 %` at `k_on = 100` µM⁻¹min⁻¹ (assert).
* The error ratios `err(1)/err(10)` and `err(10)/err(100)` are each `>= 5` (assert) — this is what
  demonstrates `O(1/k_on)` convergence.
* Report all three values and state the conclusion in `docs/VALIDATION.md`: *the wiki's QSS
  approximation requires `k_on` of order 100 µM⁻¹min⁻¹ or more for sub-1 % accuracy in the
  degradation flux; at the diffusion-limited association rates typical of protein–protein binding
  this is satisfied, but the wiki does not state `k_on`, so this is the assumption's boundary.*

Keep 1c report-only as specified in REVIEW1 R3.

## R14. Two requirements of mine to relax.

* **Timing:** 179 ms for one 18 h run is fine — the UI precomputes once and then animates from the
  cached frames. Change the asserted budget to **< 400 ms** and state the measured value.
* **Prettier:** `npm install` cannot fetch it (`EACCES`, no registry access). Drop the Prettier
  dependency and the `format` script entirely; keep the manual multi-line formatting you applied.
  Nothing in this project may require network access at install or run time.

## R15. Strengthen the Exp 3 finding — the wiki's own model behaves the same way.

The wiki contains a table (`target | target KanR | required fold reduction`) stating that reaching
"MIC below attainable serum peak (22 µg/mL)" needs KanR at **0.0518 µM**, a **6.24x** reduction. So
the wiki's own model predicts that a ~6x KanR reduction produces a large MIC drop — while Exp 3
measured **no resolvable resistance difference** across a 6.4x expression range
(J23100 vs J23110: IC50 55 ± 5 vs 77 ± 22 µg/mL). Write this in `docs/MODEL.md` as:
the plateau mismatch is a limitation **of the source model**, which our implementation faithfully
reproduces — not a defect introduced here. Cite both the 6.24x table and Exp 3.

---

# PART B — Phase 2: build the game

Implement SPEC §5 (stages 1–5), §6 (store) and §7 (acceptance), on top of the finished model.
Everything the UI shows must come from the model module; the UI must contain no biology constants and
no equations of its own. Points to get right:

1. **One simulation, two consumers.** Stage 4's charts and its drawn bacteria counts must both be
   derived from the same `SimResult.frames`. Keep the unit test that enforces this (SPEC §4.4 item 6).
2. **Click-to-place everywhere.** Drag and drop is optional; click-to-select then click-to-place must
   work for every slot in stage 2. Mouse only, no keyboard requirement.
3. **Wrong parts are a teaching path, not an error.** Placing a wrong part must be allowed, show the
   Japanese explanation from `evaluateBuild`'s `FailureReason`, and be swappable. Stage 3 must stop
   the animation at the failing beat with that explanation and a 「組み立てに戻る」 button.
4. **Stage 3 is one continuous timeline**, not seven separate clips: a single scrubber, about 22 s
   total, a step list highlighting the current beat, and 「もう一度見る」.
5. **MOI slider (1–30, default 30)** in stage 3 with live `λ`, `P(j=0)`, `N_tot`, `B`, `[C]` readouts,
   so the player can see that low MOI leaves cells unreached. Do not hide that at MOI 30 the model
   gives near-complete coverage — label it as a model result.
6. **Stage 1's KanR–resistance chart** plots the Exp 3 **measured** IC50 points as measured data, with
   the model's MIC curve drawn alongside and labelled as the model, per R15 and REVIEW1 R4.
7. **Stage 4 must show the lag.** KanR falling does not kill instantly; annotate the delay.
8. **Honesty copy.** Stage 5 carries the central message and the one-sentence caveat from SPEC §5.
   The 「科学的根拠」 modal carries SPEC §2.2 (demonstrated vs modelled), §4.3 (simplifications) and
   the parameter provenance table, generated from `params.ts` rather than retyped.
9. **Loading/progress panel** of SPEC §5 on every simulation run, with simulated elapsed time.
10. **Art** is hand-written inline SVG per SPEC §7: structurally honest, no cartoon faces, no external
    assets, no network requests.

Then: `npm test`, `npm run validate`, `npm run build` all green, and **play the game start to finish
in a browser yourself** — stage 1 through stage 5 and 「もう一度遊ぶ」 — using a headless or real
browser run, and report what you actually saw on each stage, including the numbers displayed in
stage 4. If you cannot drive a browser, say so plainly and list exactly what is therefore unverified.
Write `docs/PLAYGUIDE.md` (SPEC deliverable 3) last, describing the real UI you built.
