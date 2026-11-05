import { activationReadouts } from '../model/activation';
import type { State } from '../state/store';
import { evaluateBuild, params } from '../model';
import { beats, failureBeat } from '../model/education';
import { beatArt } from './art/beats';
import { chart, fmt, progress } from './components/charts';
export const timelineSeconds = 22;
export function stage3(s: State): string {
    const evaluation = evaluateBuild(s.build);
    const beat = Math.min(beats.length - 1, Math.floor(s.timeline / timelineSeconds * beats.length));
    const fail = evaluation.failures.filter(f => failureBeat[f.code] <= beat).sort((a, b) => failureBeat[a.code] - failureBeat[b.code])[0];
    const fraction = Math.max(0, Math.min(1, (s.timeline / timelineSeconds - .4) / .6));
    const metrics = activationReadouts(s.build, s.moi, s.preview, fraction);
    const { delivery: d, B, Ntot: nt, C: c } = metrics;
    return `<div class="eyebrow">03 / ACTIVATE</div>
<h1>SUNRISEを起動！</h1>
<div class="split activation">
<section class="panel">
<h2>${beats[beat]}</h2>${beatArt(beat, s.build)}<p>${beat === 1 ? 'α = [R] / ([R] + K_d)' : beat === 3 ? `Binder–KanR K_D2=${params.K_D2.value} µM` : beat >= 4 ? `XB–ClpX K_D1=${params.K_D1.value} µM` : ''}</p>
<ol class="steps">${beats.map((b, i) => `<li class="${beat === i ? 'active' : ''}">${b}</li>`).join('')}</ol>
<label>連続タイムライン ${fmt(s.timeline, 1)} / ${timelineSeconds}秒<input id="timeline" type="range" min="0" max="${timelineSeconds}" step=".1" value="${s.timeline}">
</label>
<button data-action="activate">${s.timeline ? 'もう一度見る' : 'SUNRISEを起動'}</button>
<button data-action="pause">${s.playback.playing ? '一時停止' : '再生'}</button>${progress(s.timeline / timelineSeconds, `前処置モデル t = ${fmt(metrics.tMin, 1)} 分`)}${fail ? `<div class="failure" role="alert">
<strong>この段階で停止</strong>
<p>${fail.explanation}</p>
<button data-stage="2">組み立てに戻る</button>
</div>` : ''}</section>
<aside class="panel">
<h2>注入のばらつき</h2>
<label>MOI <output>${s.moi}</output>
<input id="moi" type="range" min="1" max="30" value="${s.moi}">
</label>
<dl>
<dt>λ</dt>
<dd>${fmt(d.lambda)}</dd>
<dt>P(j=0) / 未到達</dt>
<dd>${d.pZero.toExponential(3)}</dd>
<dt>代表注入回数 j（平均の丸め）</dt>
<dd>${metrics.representativeJ}</dd>
<dt>平均 N_tot</dt>
<dd>${fmt(nt)} µM</dd>
<dt>平均 KanR B</dt>
<dd>${fmt(B)} µM</dd>
<dt>遊離ClpXP [C]</dt>
<dd>${fmt(c)} µM</dd>
<dt>k_eff（平均量で評価）</dt>
<dd>${fmt(metrics.kEff)} min⁻¹</dd>
</dl>
<p>モデルではMOI ${s.moi}の到達率 ${(metrics.coveragePercent).toFixed(5)}%。低MOIでは届かない細胞が残ります。正しいCPIの構成では、MOI 30でほぼ全細胞に届く予測です。</p>
<div class="coverage">${Array.from({
        length: 20
    }, (_, i) => `<span class="${i < metrics.unreachedIcons ? 'unreached' : 'reached'}">▰</span>`).join('')}</div>
<p>灰色＝未到達（模式表示）</p>${s.preview ? chart(s.preview, 'kanR', metrics.index) : ''}<p>KanR ${params.B0.value} → ${fmt(B)} µM</p>
<p>感受性が回復する「可能性」が高まります（モデル予測）。</p>
</aside>
</div>
<button data-action="compare" >ステージ4：抗生物質で比較 →</button>`;
}
