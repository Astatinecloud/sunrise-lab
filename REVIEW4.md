# REVIEW 4 — final items from my second playthrough

Claude, supervising. I played the game again in a real browser after your REVIEW 3 changes, since you
could not drive one. Results of my verification first, then four items to fix. These are the last
ones; nothing here touches the model.

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

## R26 (blocking). Stage 3's 「ステージ4：抗生物質で比較 →」 silently does nothing.

On arriving at stage 3 I clicked that button — by mouse and programmatically — and the page stayed on
stage 3, with no message and no console error. After I played the 22-second animation to the end, the
same button worked immediately. So the transition is gated on the animation having completed, but the
button looks fully enabled and gives no feedback when it is refused.

A button that is clickable but does nothing is the worst of both options. Either:

* allow the transition at any time (preferred — the stage 4 simulation does not depend on the
  animation having been watched), or
* disable it until the timeline finishes, styled as disabled, with a short note
  「アニメーションの再生が終わると進めます」.

Pick one and add a test for it. Check stage 2 → stage 3 and stage 4 → stage 5 for the same pattern.

## R27 (blocking). The stationary-phase warning fires when nothing is accumulating.

At **t = +36 min**, while the culture is still growing exponentially, the 「SUNRISEなし」 panel showed
`KanR B = 0.3236 µM` against `B0 = 0.3233 µM` — higher by 0.0003 µM, **0.09 %** — and already
displayed the full artifact caption, with 「推定MIC 163.36 µg/mL（同上の外挿による）」. At that moment
163.36 is essentially the correct reference MIC of 163.2, so the suffix is telling the player that a
right answer is an artifact. Because the caption is then on for practically the whole run, it stops
being a warning and becomes background noise, which defeats R16.

Gate it on the artifact actually being material. Require **both**:

* `B > B0 * 1.05` (a 5 % excess, well above integration noise), **and**
* crowding is actually limiting growth, `ΣN / K > 0.5`.

Apply the same gate to the MIC suffix. Update the R16 test accordingly: assert the caption is absent
at `t = +36 min` and present at `t = +1080 min` in the no-SUNRISE arm.

## R28. Typo in that caption.

「モデル上のKanRが蓄積します」 → 「モデル上はKanRが蓄積します」.

## R29. Finish the verification document honestly.

`docs/REVIEW3-VERIFICATION.md` should record that the browser playthrough was done by me, not by you,
and carry the observations listed above under "Verified working" together with the R26/R27/R28
findings and their fixes. Do not describe anything as verified in a browser that you did not see
yourself; attribute my observations to this review.

After fixing, re-run `npm test`, `npm run validate` and `npm run build`. If you still cannot start a
browser, say so plainly and I will verify again.
