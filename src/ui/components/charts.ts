export const artifactCaption = '増殖が混雑で止まると希釈も止まるため、モデル上はKanRが蓄積します。耐性が強くなったという意味ではなく、元の式を定常期へ外挿したことによる表示上の性質です。';
import { calibrationSeries } from '../../model/calibration';
import { params, framePresentation, type SimFrame, type SimResult } from '../../model';
export function hasMaterialArtifact(frame: SimFrame): boolean {
    return frame.meanKanR > params.B0.value * 1.05 && frame.totalCells / params.K.value > 0.5;
}
export const fmt = (n: number, d = 4) => Number.isFinite(n) ? n.toLocaleString('en-US', {
    maximumFractionDigits: d
}) : n === -Infinity ? '−∞' : '—';
export function chart(result: SimResult, key: 'kanR' | 'log10Cells', endIndex = result.frames.length - 1): string {
    const data = result.frames.map((_, i) => framePresentation(result, i, params.N_0.value, 32, 120).chart);
    const values = data.map(f => f[key]).filter(Number.isFinite);
    const max = key === 'kanR' ? Math.max(params.B0.value, ...values) * 1.1 : Math.max(1, ...values) + .5;
    const min = 0;
    const x = (i: number) => 45 + i / (data.length - 1) * 500;
    const y = (v: number) => 180 - (Math.max(min, Number.isFinite(v) ? v : 0) - min) / (max - min) * 150;
    return `<svg class="chart" viewBox="0 0 580 220" role="img" aria-label="${key === 'kanR' ? 'KanR量（µM） B0基準線' : 'log10細胞数（0細胞は下端に表示）'}">
<path d="M45 20V180H550" fill="none" stroke="#bcc7ca"/>
    ${key === 'kanR' ? `<path d="M45 ${y(params.B0.value)}H550" stroke="#d9534f" stroke-dasharray="5 5"/>
<text x="46" y="${y(params.B0.value) - 5}">未処理のKanR量 B0=${params.B0.value}</text>` : ''}
    <polyline fill="none" stroke="#1a8e8a" stroke-width="3" points="${data.slice(0, endIndex + 1).map((v, i) => ({
        v, i
    })).filter(({ i }) => i % 5 === 0 || i === endIndex).map(({ v, i }) => `${x(i)},${y(v[key])}`).join(' ')}"/>
    <text x="5" y="25">${fmt(max, 2)}</text>
<text x="35" y="202">${result.frames[0].tMin}分</text>
<text x="475" y="202">${result.frames.at(-1)!.tMin}分</text>
<text x="190" y="218">${key === 'kanR' ? 'KanR (µM)' : 'log10 N (cells/mL)'}</text>
</svg>${key === 'kanR' && hasMaterialArtifact(result.frames[endIndex]) ? `<p class="artifact" role="note">${artifactCaption}</p>` : ''}`;
}
export function calibrationChart(): string {
    const series = calibrationSeries();
    return `<svg viewBox="0 0 640 300" class="calibration" role="img" aria-label="Exp3測定IC50とモデルMIC">
<path d="M50 20V260H620" fill="none" stroke="#bcc7ca"/>
<text x="230" y="295">KanR発現量（%）</text>
<text x="50" y="15">MIC / IC50 (µg/mL)</text>
<polyline fill="none" stroke="#1a8e8a" stroke-width="3" points="${series.model.map(p => `${50 + p.rel * 5.5},${260 - p.mic * 1.3}`).join(' ')}"/>${series.measured.map(p => {
        const x = 50 + p.rel * 5.5, y = 260 - p.ic50 * 1.3;
        return `<path d="M${x} ${y - p.sd * 1.3}V${y + p.sd * 1.3}" stroke="#d9534f"/>
<circle cx="${x}" cy="${y}" r="5" fill="#d9534f"/>
<text x="${Math.min(550, x - 30)}" y="${y - 13}">${p.promoter}</text>`;
    }).join('')}</svg>
<p>● 赤：Exp3 測定IC50 ± SD　— 緑：モデルMIC（異なる指標）</p>`;
}
export function progress(value: number, label = 'シミュレーション計算中…'): string {
    return `<aside class="progress" aria-live="polite">
<strong>${label}</strong>
<progress max="1" value="${value}">
</progress>
</aside>`;
}
