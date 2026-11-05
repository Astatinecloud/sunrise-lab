import type { State } from '../state/store';
import { framePresentation, micFromKanR, params } from '../model';
import { bacteriaField } from './art/bacterium';
import { chart, fmt, progress, hasMaterialArtifact } from './components/charts';
export function stage4(s: State): string {
    const arms = [
        s.sim.withoutSunrise!, s.sim.withSunrise!
    ];
    const end = s.playback.tIndex === arms[0].frames.length - 1;
    return `<div class="eyebrow">04 / COMPARE</div>
<h1>もう一度、抗生物質を使ってみよう！</h1>
<p class="lead">両方にカナマイシン ${s.Ae} µg/mL。モデル予測を同じ時刻で比較します。</p>
<div class="controls">
<button data-action="pause">${s.playback.playing ? '一時停止' : '再生'}</button>
<button data-action="speed">速度 ×${s.playback.speed}（クリックで切替）</button>
<label>時刻<input id="comparison-time" type="range" min="${arms[0].frames.findIndex(f => f.tMin === 0)}" max="${arms[0].frames.length - 1}" value="${s.playback.tIndex}">
</label>
</div>${progress(s.playback.tIndex / (arms[0].frames.length - 1), `モデル再生 t = +${fmt(arms[0].frames[s.playback.tIndex].tMin, 1)} 分`)}<p class="lag">KanRが減ってもすぐ全滅はしません。薬が効き始め、増殖が止まり、やがて数が減ります。投薬後 ${params.clpxp_blockade_min.value}分まではClpXP完全阻害を仮定しています。</p>
<div class="split">${arms.map((r, i) => {
        const p = framePresentation(r, s.playback.tIndex, params.N_0.value, 32, 120);
        return `<section class="panel arm">
<h2>SUNRISE${i ? 'あり' : 'なし'}</h2>${bacteriaField(p.bacteria.count)}<p class="population">${fmt(p.frame.totalCells, 0)} cells/mL</p>
<p>図 ${p.bacteria.count}個 ${p.bacteria.capped ? '（上限表示・実数は上記）' : ''}</p>
<dl>
<dt>KanR B</dt>
<dd>${fmt(p.chart.kanR)} µM</dd>
<dt>推定MIC</dt>
<dd>${p.frame.totalCells ? fmt(micFromKanR(p.frame.meanKanR), 2) + ' µg/mL' + (hasMaterialArtifact(p.frame) ? '（同上の外挿による）' : '') : '—（生存クラスなし）'}</dd>
<dt>f（殺菌応答・細胞数の割合ではない）</dt>
<dd>${fmt(p.frame.meanKill)}</dd>
<dt>細胞内薬 Ai</dt>
<dd>${fmt(p.frame.meanAi)} µg/mL</dd>
</dl>${chart(r, 'log10Cells', s.playback.tIndex)}${chart(r, 'kanR', s.playback.tIndex)}${end ? `<div class="end-card">
<strong>Δlog10 = ${fmt(r.deltaLog10)}</strong>${r.success ? '<p class="badge">3-log（1000分の1）到達</p>' : '<p>3-log未到達</p>'}</div>` : ''}</section>`;
    }).join('')}</div>
<p>0 cells/mL / Δlog10=−∞ は、すべての注入クラスが1細胞/mL未満になった計算上の除外を意味します。滅菌の証明ではありません。</p>
<button data-stage="5" ${end ? '' : 'disabled'}>結果とまとめへ →</button>`;
}
