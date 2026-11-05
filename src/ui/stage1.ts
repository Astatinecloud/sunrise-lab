import type { State } from '../state/store';
import { bacteriaField } from './art/bacterium';
import { beatArt } from './art/beats';
import { calibrationChart, chart, fmt, progress } from './components/charts';
import { framePresentation, params } from '../model';
export function stage1(s: State): string {
    const r = s.sim.withoutSunrise;
    const p = r ? framePresentation(r, s.playback.tIndex, params.N_0.value, 32, 120) : null;
    return `<div class="eyebrow">01 / OBSERVE</div>
<h1>どうして薬が効かないの？</h1>
<p class="lead">耐性菌の中では、薬に何が起こっているのでしょう。</p>
<div class="split">
<section class="panel">
<h2>カナマイシンと大腸菌</h2>${bacteriaField(p?.bacteria.count ?? 32)}<p>${fmt(p?.frame.totalCells ?? params.N_0.value, 0)} cells/mL ${p?.bacteria.capped ? '（図は上限表示）' : ''}</p>
<button data-action="dose">抗生物質を投与する</button>${p ? `<p>細胞内の有効な薬 Ai=${fmt(p.frame.meanAi)} µg/mL。細胞の中の有効な薬はごくわずか。</p>${chart(r!, 'log10Cells', s.playback.tIndex)}${progress(s.playback.tIndex / (r!.frames.length - 1), `モデル再生 t = ${fmt(p.frame.tMin, 1)} 分`)}<p>薬を加えても細菌は増殖します。最終 Δlog10=${fmt(r!.deltaLog10)}</p>` : ''}</section>
<section class="panel">
<h2>KanRが薬を無力化する</h2>
<div class="detox">${beatArt(-1, s.build)}<span>カナマイシン → KanRによるリン酸化 → 不活化</span>
</div>
<p>KanR量を減らせば耐性も同じ割合で下がる？</p>${calibrationChart()}<p>測定では高発現域にプラトーがあります。モデルは崩壊を再現しますが、このプラトーは再現しません。</p>
</section>
</div>
    ${r ? `<section class="panel quiz">
<h2>なぜ今回、薬が効かなかった？</h2>${[
        '細菌が薬を体の外に押し出しているから', '細菌がKanRという酵素を作り、カナマイシンを化学的に変化させて無力化しているから', 'カナマイシンがもともと大腸菌に効かない薬だから'
    ].map((t, i) => `<button data-quiz="${i}" class="choice ${s.quiz === i ? 'chosen' : ''}">${t}</button>`).join('')}${s.quiz !== null ? `<p role="status">${s.quiz === 1 ? '正解。KanRがカナマイシンをリン酸化すると、薬はリボソームに結合できなくなります。外部100 µg/mLに対し、モデルの細胞内有効薬はAi ≈ 0.12–0.53 µg/mLなので、細胞は増殖を続けます。' : s.quiz === 0 ? 'それも耐性の仕組みの一つですが、今回の細菌は別の方法を使っています。' : 'カナマイシンは本来この細菌に効きます。効かなくしているのはKanRです。'}</p>` : ''}<button data-stage="2" ${s.quiz !== null ? '' : 'disabled'}>次へ：SUNRISEを組み立てる →</button>
</section>` : ''}`;
}
