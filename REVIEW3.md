# REVIEW 3 — findings from my own full playthrough

Claude, supervising. I played stages 1→5 in a real browser at `http://localhost:5174` and read the
science modal. The model work is signed off: 48/48 tests, `validate` and `build` green, four wiki
tables reproduced, and the honesty copy in stages 1, 4 and 5 is good. What follows is what I saw
that still needs work. R16 is the most important — it currently teaches something false.

## R16 (blocking, educational). Stage 4 appears to say the antibiotic made the bacteria *more*
## resistant.

At t = +1080 min the 「SUNRISEなし」 panel displays:

* `KanR B = 1.1076 µM` — **3.4x the untreated level `B0 = 0.3233 µM`**
* `推定MIC = 556.54 µg/mL` — 3.4x the reference MIC of 163.2

A high-school player reads that as "抗生物質を使ったら耐性が3倍以上強くなった". That is not what the
science says. It is the stationary-phase extrapolation artifact we documented in REVIEW2 R12:
as `ΣN → K` the division rate goes to zero, dilution stops, and the wiki's constant `k_prod` lets
KanR pile up. The `B0` reference line is drawn, which is good, but nothing on screen explains the
rise. The modal mentions it in one line, buried.

Fix, in the stage itself, not only in the modal:

1. Whenever a panel's displayed `B > B0`, show an inline caption directly under that KanR chart:
   「増殖が混雑で止まると希釈も止まるため、モデル上はKanRが蓄積します。耐性が強くなったという意味では
   なく、元の式を定常期へ外挿したことによる表示上の性質です。」
2. Apply the same treatment to the 推定MIC readout when it exceeds the `B0` reference MIC: append
   「（同上の外挿による）」 rather than presenting 556.54 as a plain fact.
3. Mark the `B0` line in the legend as 「未処理のKanR量」 so the crossing is unmistakable.
4. Add a test asserting that whenever any displayed `B > B0`, the artifact caption is present in the
   rendered DOM.

## R17 (blocking, educational). Stage 2 gives away every answer before the player places anything.

On entry, all seven slots read 「配置先：RBPなし」 etc. **and already display their failure
explanation**. The player is shown a wall of seven negative explanations before touching anything, so
the puzzle has no puzzle in it, and the explanations lose the force they would have as feedback.

An empty slot must show a neutral prompt (e.g. 「ここに部品を置いてください」). A failure explanation
appears only **after** the player has placed something in that slot and it is wrong — which is what
SPEC §5 stage 2 asked for ("間違った部品を選ぶと、なぜ機能しないのかも説明する"). Deliberately
choosing a 「〜なし」 part counts as a placement and does show its explanation.

## R18. Stage 2 has no PVC to assemble.

SPEC §5 stage 2a asks for a PVC illustration whose parts appear as they are placed, and SPEC §1
lists `art/pvc.ts`, `adapter.ts`, `clpxp.ts`, `kanamycin.ts`. Only `art/bacterium.ts` exists, and the
picture above the slots is the same bacterium drawing throughout — it does not change as parts go in.

Add `src/ui/art/pvc.ts` drawing a structurally honest PVC — baseplate, tail fibers carrying the RBP,
contractile sheath, inner tube, and the cargo inside it — assembled incrementally from the current
`BuildConfig`: a slot that is empty or wrong renders that part greyed or absent. Use it in stage 2a
and reuse it in stage 3. Split the adapter (Binder / Linker / XB) into `art/adapter.ts` and build it
up the same way in stage 2b.

## R19. Stage 5's five cards all carry the same picture.

Every card renders the identical bacterium-with-ClpXP thumbnail, so five different ideas look like
one. SPEC §5 stage 5 asked for the thumbnail of the relevant stage-3 beat. Give each card its own:
KanR inactivating kanamycin; PVC attaching and contracting; Binder plus XB bridging; ClpXP degrading;
the restored-susceptibility frame. Reuse the stage-3 beat renderers rather than drawing new art.

## R20. The parameter provenance table does not give real wiki references.

Every row's source column reads the same generic string, `"Model / SUNRISE / Model Formulation,
Table 9.3.1 parameter list"` — including rows that come from the TPD module, from Results Exp 3/4,
or from the CPI geometry model. SPEC deliverable 5 is "各モデルのWiki上の参照箇所", so this needs to
be accurate per parameter. Give each one its true page and section, for example:

* `K_D1`, `K_D2`, `k_cat`, `C_tot_basal`, `k_XB`, `B0`, `k_prod` → `Model / TPD / Model Formulation (CLIPPERs model), parameter table`
* `N_delivery`, `c1`, `K_d_eng`, `R_local`, `alpha` → `Model / CPI` geometry and `Model / SUNRISE / Model Formulation, delivery (Eqs 1–3)`
* `q_0`, `K_m`, `K_1`, `n_1`, `r_kill`, `K`, `B_star` → `Model / SUNRISE / Model Formulation, survival (Eqs 6–8)`
* `exp3`, `exp4` → `Results / TPD Experiment 3` and `Results / TPD Experiment 4`

Two more things in the same table:

* The `K_m` note is **in English** in a Japanese UI. Translate it; keep the English text in
  `docs/MODEL.md` if you want it there.
* `mu` and `r_g` print as `0.015068416968694463`. Format displayed numbers to about 4 significant
  figures (keep full precision in the computation).

## R21 (bug). The first page load never finishes.

Loading `http://localhost:5174/` fresh leaves 「教育シミュレーションを読み込み中…」 on screen
indefinitely; a manual reload renders the game correctly. I hit this on the very first load.
Find the real cause — most likely the bootstrap waits for an event that has already fired by the time
the module executes (`DOMContentLoaded` on an already-interactive document, or similar) — and fix it
so a cold load works. Add a test or a headless check for a cold load.

## R22. Every tick rebuilds the whole stage's DOM.

While stage 1's playback was running I could not click a quiz option: each animation frame replaced
the DOM, so the element I aimed at had been destroyed. Any element reference goes stale after any
interaction too. For a mouse user this mostly shows up as lost focus, scroll jumps and missed clicks
during playback.

Re-render only what changes on a tick — the chart, the counters, the bacteria field — and leave the
quiz, the slider, the part trays and the navigation buttons mounted. Also scroll to the top of the
content when the stage changes; moving from stage 1 to stage 2 left me looking at the previous
stage's quiz.

## R23. Stage 1's quiz is weaker than specified.

* 「次へ」 is enabled before the player answers. Enable it only after an answer is chosen.
* A wrong answer should show the explanation written for it in SPEC §5 stage 1 (the efflux option and
  the "kanamycin never works on E. coli" option each have one). I did not see per-option feedback.
* The correct-answer text, 「正解。耐性の原因のタンパク質を取り除く方法を考えましょう。」, does not
  explain anything. Replace it with a short explanation of the mechanism the player just watched:
  KanR phosphorylates kanamycin, the modified drug no longer binds the ribosome, so the cell keeps
  growing even at 100 µg/mL — and the model's own number for it, `A_i ≈ 0.12–0.53 µg/mL` against an
  external 100 µg/mL.

## R24. R7 (readable formatting) was not applied to the UI or the stylesheet.

`src/ui/stage1.ts` is 10 lines holding 2673 characters; `src/styles/main.css` is 2 lines. Finish the
reformatting across `src/ui/**`, `src/state/**`, `src/main.ts` and the CSS, to the same conventional
multi-line style you applied to `src/model/**`. Behaviour and all reported numbers must be unchanged.

## R25. Finish the deliverables.

* Add `.github/workflows/pages.yml` building with Node 22 and deploying `dist/` to GitHub Pages
  (`actions/checkout`, `actions/setup-node`, `npm ci`, `npm run build`, `actions/upload-pages-artifact`,
  `actions/deploy-pages`), with `permissions: contents: read, pages: write, id-token: write`.
  Confirm `.nojekyll` lands in `dist/`. Do not create a repository or push anything.
* `docs/PLAYGUIDE.md` must describe the UI as it is after these fixes.
* Add `README.md` pointing to `docs/MODEL.md`, `docs/VALIDATION.md` and `docs/PLAYGUIDE.md`, with the
  local run instructions and a short statement of what is experimentally demonstrated versus modelled.

## Not required

Do not change any model parameter, equation or validation number. R16–R25 are UI, documentation and
packaging only. If any fix would change a reported number, stop and say so instead.

When done, re-run `npm test`, `npm run validate`, `npm run build`, and play stages 1→5 again
including a **cold first load**, a deliberately wrong build in stage 2, and 「もう一度遊ぶ」.
Report what you actually saw, and list anything still not done.
