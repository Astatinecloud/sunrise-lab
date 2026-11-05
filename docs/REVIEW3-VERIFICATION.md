# REVIEW3 verification — 2026-11-05

Implemented R16–R20 and R22–R25 in UI, metadata, documentation and packaging. No model parameter value or equation changed. At the time of REVIEW3, R21 was partial: an explicit, readyState-aware bootstrap now reports import/render failures with a retry button. The original cold-load root cause was not reproduced or identified; this is not a confirmed fix.

Checks after changes:
- npm test: 51/51 passed (four files).
- npm run validate: passed, including the explicitly retained source discrepancy. Science outputs unchanged: MIC(B0) 163.2337940517893, B* 0.19720237909149047, deltaWithout 2.761321404618107, deltaWith -Infinity. Single-run timing about 180 ms.
- npm run build: passed; dist/.nojekyll exists.

Browser attempts: Chromium launch through both shell and Node REPL failed with `spawn UNKNOWN`. Browser provider inventory reported `The browser access host is unavailable`. Selecting the existing Edge window returned `Computer Use was not approved to use Microsoft Edge`.

No new stages 1–5 browser observations were made. Those checks were unverified by the implementing agent; see the separately attributed REVIEW4 observations below. scripts/playthrough.mjs now asserts cold rendering without reload, mounted quiz identity during playback, neutral slots, and the stage-4 rendered-DOM artifact warning, in addition to its existing full playthrough and wrong-build branches. Run it in an environment that permits Chromium; SUNRISE_URL can select the local URL. Old docs/playthrough files belong to the earlier review and are not evidence for this revision.

No repository was created, no push or deployment was performed. GitHub Actions deployment itself remains untested.

## REVIEW4 follow-up

The browser playthrough below was performed by the reviewer (Claude, supervising), as recorded in REVIEW4.md, not by the implementing agent. These are reviewer observations before the R26-R28 fixes.

## Verified working (no action needed)

* **R21 cold load** — a fresh tab at `http://localhost:5174/` now renders stage 1 directly, no
  reload needed, no console errors. Not reproducible any more. Keep the bootstrap error handling.
* **R17** — empty slots now read 「配置先：未配置」 with 「ここに部品を置いてください。」, and placing
  「別の菌を狙うRBP」 produced its explanation only after placement. Correct.
* **R18** — the PVC art now shows 基盤 / Pvc13の尾繊維・gp17 RBP / 収縮鞘・内管 / 内部：アダプター /
  Pdp1_NTD：積み込み信号, and the adapter shows Binder / GGS Linker / XB → ClpX ZBD. Good.
* **R19** — stage 5 now renders five structurally distinct SVGs. Correct.
* **R16 partly** — the artifact caption and the 「未処理のKanR量 B0=0.3233」 legend both appear, and
  the MIC readout carries 「（同上の外挿による）」. See R27 for the part that is wrong.
* **Reset** — 「もう一度遊ぶ」 returns to stage 1 with 1,000,000 cells/mL and a fresh dose button.
* **Stage 4 end state** — SUNRISEなし 577,193,464 cells/mL, Δlog10 = 2.7613, 3-log未到達;
  SUNRISEあり 0 cells/mL, Δlog10 = −∞, 3-log到達, with the 「滅菌の証明ではありません」 note.

## Findings and fixes (R26-R29)

- R26: The reviewer found stage 3 comparison inert until the 22-second animation finished. Removed the animation/failure gate from the comparison button in src/ui/stage3.ts; comparison now works independently of timeline progress. src/main.ts already computes both arms directly and stops playback. tests/review3.test.ts asserts the enabled comparison action at 0, 11 and 22 seconds (including the initial incomplete build). Stage 2 uses an enabled try-build action that either enters activation or opens its confirmation dialog. Stage 4 explicitly disables its summary button until the final frame; regression assertions cover early and final states.
- R27: The reviewer observed the artifact warning at +36 minutes despite only a 0.09% KanR excess. Added a shared display-only predicate in src/ui/components/charts.ts requiring both B > B0 * 1.05 and totalCells / K > 0.5. The chart caption and src/ui/stage4.ts MIC suffix use the same predicate. Tests assert both absent at +36 minutes and present at +1080 minutes in the no-SUNRISE arm, and check both strict threshold boundaries.
- R28: Corrected the caption particle as requested in REVIEW4; the regression test asserts the corrected text.
- R29: This document attributes the browser observations to the reviewer and records the fixes and actual verification limits.

Checks after R26-R28 (2026-11-05):
- npm test (invoked through npm.cmd because PowerShell blocks npm.ps1): PASS, 52/52 tests across four files.
- npm run validate (npm.cmd): PASS. MIC(B0) 163.2337940517893, B* 0.19720237909149047, deltaWithout 2.761321404618107, deltaWith -Infinity. Known source discrepancy retained. Runtime 180.2855 ms.
- npm run build (npm.cmd): PASS, TypeScript and Vite; 35 modules transformed.
- node scripts/playthrough.mjs: FAILED before browser launch: Cannot find module 'playwright-core'. No browser was started and no post-fix browser behavior was observed by the implementing agent. R26-R28 still require a reviewer browser recheck.

No model parameter, equation, or validation expectation was changed. Bootstrap error handling was retained; no further R21 investigation was performed.
