import type { SimResult } from './simulation';
// Shared adapter consumed by the game charts and bacteria field.
export function framePresentation(result: SimResult, index: number, N0: number, initialIcons: number, cap = 500) {
    const frame = result.frames[index];
    if (!frame) {
        throw new RangeError('Frame index');
    }
    const iconCount = Math.min(cap, Math.round(frame.totalCells / N0 * initialIcons));
    const sum = frame.perClass.reduce((a, b) => a + b, 0);
    const quotas = frame.perClass.map(n => sum ? n / sum * iconCount : 0), counts = quotas.map(Math.floor);
    let left = iconCount - counts.reduce((a, b) => a + b, 0);
    const order = quotas.map((q, i) => ({ i, remainder: q - counts[i] })).sort((a, b) => b.remainder - a.remainder || a.i - b.i);
    for (const { i } of order) {
        if (left-- <= 0) {
            break;
        }
        counts[i]++;
    }
    return { frame, chart: { tMin: frame.tMin, log10Cells: Math.log10(frame.totalCells), kanR: frame.meanKanR }, bacteria: { count: iconCount, perClass: counts, capped: frame.totalCells / N0 * initialIcons > cap } };
}
