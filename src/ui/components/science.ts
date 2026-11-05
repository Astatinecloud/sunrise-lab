const kmNote = 'Wikiの表ではK_m=1.463 µMですが、式(6)ではµg/mLのq・A_eと加減算されます。単位換算すると公表値を再現できないため、数値1.463を維持し、出典の単位表記の不整合を未解決として記録しています。';
import { params, exp3, exp4 } from '../../model';
import { scienceClaims, simplifications } from '../../model/education';
export function scienceDialog(): string {
    return `<dialog id="science-dialog">
<div class="dialog-header">
<h2>科学的根拠 / モデルと実験の境界</h2>
<button data-action="close-dialog">閉じる</button>
</div>
<p>出典：iGEM Waseda-Tokyo 2026 Wiki（Model / SUNRISE・TPD、Results Exp3–7）。このページはオフラインで読めます。</p>
<table>
<thead>
<tr>
<th>主張</th>
<th>状態</th>
<th>根拠</th>
</tr>
</thead>
<tbody>${scienceClaims.map(row => `<tr>${row.map(x => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody>
</table>
<p>測定データ出典：${exp3.source} / ${exp4.source}</p>
<h3>簡略化と限界</h3>
<ul>${simplifications.map(t => t === params.K_m.note ? kmNote : t).map(t => `<li>${t}</li>`).join('')}</ul>
<h3>パラメーターと由来（params.tsから生成）</h3>
<div class="table-scroll">
<table>
<thead>
<tr>
<th>記号</th>
<th>値</th>
<th>単位</th>
<th>由来</th>
<th>出典・注記</th>
</tr>
</thead>
<tbody>${Object.entries(params).map(([n, p]) => `<tr>
<th>${n}</th>
<td>${Number(p.value.toPrecision(4)).toString()}</td>
<td>${p.unit}</td>
<td>${p.provenance}</td>
<td>${p.source}<br>${n === 'K_m' ? kmNote : p.note ?? ''}</td>
</tr>`).join('')}</tbody>
</table>
</div>
</dialog>`;
}
