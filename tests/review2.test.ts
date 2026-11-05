import { describe, it, expect } from 'vitest';
import { wikiReproductions, knownWikiDiscrepancy } from '../src/model/wiki';
import { divisionRate, growthRate, compareKinetics, defaultSimConfig, runSimulation, params } from '../src/model';
describe('R10/R11 published tables', () => {
    const { tables } = wikiReproductions();
    for (const [name, rows] of Object.entries(tables))
        it(name, () => { for (const row of rows)
            if (row.id === knownWikiDiscrepancy.id) {
                expect(row.pass).toBe(false);
                expect(knownWikiDiscrepancy.diagnosis).toContain("0.00841607");
            }
            else
                expect(row.pass, JSON.stringify(row)).toBe(true); });
});
it('R13 inverse association-rate convergence', () => {
    const errors = [1, 10, 100].map(k => Math.max(...[.058, .174, .579, 1.737].map(n => compareKinetics(n, k).maxRelativeError)));
    expect(errors[2]).toBeLessThan(.01);
    expect(errors[0] / errors[1]).toBeGreaterThanOrEqual(5);
    expect(errors[1] / errors[2]).toBeGreaterThanOrEqual(5);
}, 60000);
it('R12 killing-arm KanR is bounded by matched control; division independent of kill', () => {
    const a = runSimulation(defaultSimConfig), b = runSimulation({ ...defaultSimConfig, useSunrise: false });
    let maxExcess = -Infinity;
    for (let i = 0; i < a.frames.length; i++)
        for (const B of a.frames[i].perClassKanR)
            maxExcess = Math.max(maxExcess, B - b.frames[i].meanKanR);
    expect(maxExcess).toBeLessThanOrEqual(1e-9);
    for (const f of [...a.frames, ...b.frames]) {
        const division = divisionRate(f.totalCells);
        expect(division).toBeGreaterThanOrEqual(0);
        expect(growthRate(f.totalCells, 1)).toBeCloseTo(growthRate(f.totalCells, 0) - params.r_kill.value, 12);
        expect(division).toBeLessThanOrEqual(params.mu.value);
    }
}, 30000);
