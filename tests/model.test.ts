import { describe, it, expect } from 'vitest';
import { params, defaultBuild, defaultTpd, defaultSimConfig, computeDelivery, evaluateBuild, freeClpXP, steadyStateKanR, kanrDerivative, poissonPmf, kEff, runSimulation, mulberry32, samplePoisson, framePresentation, fullKineticsDerivative, compareKinetics, algebraicReduction, kdFromDeltaG, langmuirAlphaFromDeltaG } from '../src/model';
describe('SPEC 4.4 analytic checks', () => {
    it('Eq17 residual <1e-12 and free C does not exceed Ctot', () => {
        for (const n of [0, .058, .174, .579, 1.737, 30]) {
            for (const ctot of [.134, .402]) {
                const c = freeClpXP(n, ctot, .065);
                expect(Math.abs(c + n * c / (.065 + c) - ctot)).toBeLessThan(1e-12);
                expect(c).toBeGreaterThanOrEqual(0);
                expect(c).toBeLessThanOrEqual(ctot + 1e-15);
            }
        }
    });
    it('steady state solves Eq21 and decreases with adapter', () => {
        let prev = Infinity;
        for (const n of [0, .058, .174, .579, 1.737]) {
            const b = steadyStateKanR(n, defaultTpd);
            expect(Math.abs(kanrDerivative(b, n, defaultTpd))).toBeLessThan(1e-10);
            expect(b).toBeLessThan(prev);
            prev = b;
        }
    });
    it.each([0, 1, 2, 3, 10, 30, 100])('Poisson normalisation lambda=%s', (lambda) => {
        let sum = 0;
        for (let j = 0; j < 500; j++) {
            sum += poissonPmf(j, lambda);
        }
        expect(Math.abs(sum - 1)).toBeLessThan(1e-9);
    });
});
describe('SPEC 3.1 build failure matrix', () => {
    it('wrong RBP eliminates accessible receptors, alpha and lambda', () => {
        const b = { ...defaultBuild, rbp: 'wrong-rbp' as const }, d = computeDelivery(b, 30);
        expect(evaluateBuild(b).modifiers.receptorAccessible).toBe(false);
        expect(d.alpha).toBe(0);
        expect(d.lambda).toBe(0);
        expect(d.pZero).toBe(1);
        expect(d.classes).toEqual([{ j: 0, p: 1, Ntot: 0 }]);
    });
    it('missing injector makes alpha zero', () => {
        expect(computeDelivery({ ...defaultBuild, injector: 'none' }, 30).alpha).toBe(0);
    });
    it('missing loading signal leaves injections empty', () => {
        const d = computeDelivery({ ...defaultBuild, loadingSignal: 'none' }, 30);
        expect(d.lambda).toBeGreaterThan(29);
        expect(d.classes.every(c => c.Ntot === 0)).toBe(true);
    });
    it('wrong cargo supplies no TPD adapter', () => {
        for (const cargo of ['inert-protein', 'none'] as const) {
            expect(computeDelivery({ ...defaultBuild, cargo }, 30).classes.every(c => c.Ntot === 0)).toBe(true);
        }
    });
    it('wrong binder uses KD2=1e9 and negligible degradation', () => {
        const m = evaluateBuild({ ...defaultBuild, binder: 'wrong-binder' }).modifiers, p = { ...defaultTpd, KD2: m.KD2 };
        expect(m.KD2).toBe(1e9);
        expect(kEff(1.737, .3233, freeClpXP(1.737, .402, p.KD1), p)).toBeLessThan(1e-9);
    });
    it('missing anchor makes ClpXP-bound fraction negligible', () => {
        const m = evaluateBuild({ ...defaultBuild, anchor: 'none' }).modifiers, p = { ...defaultTpd, KD1: m.KD1 }, c = freeClpXP(1.737, .402, p.KD1);
        expect(c / (p.KD1 + c)).toBeLessThan(1e-9);
        expect(kEff(1.737, .3233, c, p)).toBeLessThan(1e-9);
    });
    it('missing linker makes kcat effective zero', () => {
        const m = evaluateBuild({ ...defaultBuild, linker: 'none' }).modifiers, p = { ...defaultTpd, kcat: defaultTpd.kcat * m.kcatScale };
        expect(kEff(1.737, .3233, .1, p)).toBe(0);
    });
    it('SUNRISE without antibiotic lowers KanR but population grows', () => {
        const r = runSimulation({ ...defaultSimConfig, Ae: 0, durationMin: 30 });
        expect(r.frames.find(f => f.tMin === 0)!.meanKanR).toBeLessThan(params.B0.value);
        expect(r.frames.every(f => f.meanKill === 0)).toBe(true);
        expect(r.deltaLog10).toBeGreaterThan(0);
        expect(r.failures.some(f => f.code === 'no-antibiotic')).toBe(true);
    });
    it('every failure supplies deterministic Japanese explanation', () => {
        const b = { rbp: 'none', injector: 'none', loadingSignal: 'none', cargo: 'none', binder: 'none', linker: 'none', anchor: 'none' } as const;
        expect(evaluateBuild(b)).toEqual(evaluateBuild(b));
        expect(evaluateBuild(b).failures).toHaveLength(7);
        expect(evaluateBuild(b).failures.every(f => /[ぁ-んァ-ン一-龯]/.test(f.explanation))).toBe(true);
    });
});
describe('SPEC 4.4 sanity and timeline', () => {
    it('delta log10 is non-increasing in MOI', () => {
        let prev = Infinity;
        for (const moi of [0, 1, 2, 3, 5, 10, 20, 30]) {
            const d = runSimulation({ ...defaultSimConfig, moi }).deltaLog10;
            expect(d).toBeLessThanOrEqual(prev + 1e-9);
            prev = d;
        }
    }, 30000);
    it('delta log10 is non-increasing in external antibiotic', () => {
        let prev = Infinity;
        for (const Ae of [0, 10, 50, 100, 200]) {
            const d = runSimulation({ ...defaultSimConfig, Ae }).deltaLog10;
            expect(d).toBeLessThanOrEqual(prev + 1e-9);
            prev = d;
        }
    });
    it('no SUNRISE at Kan 100 still grows', () => {
        expect(runSimulation({ ...defaultSimConfig, useSunrise: false }).deltaLog10).toBeGreaterThan(0);
    });
    it('2160 RK4 steps after pretreatment; blockade affects first 120 min', () => {
        const r = runSimulation(defaultSimConfig), unblocked = runSimulation({ ...defaultSimConfig, blockade: false });
        expect(r.frames).toHaveLength(2221);
        expect(r.frames[0].tMin).toBe(-30);
        expect(r.frames[2220].tMin).toBe(1080);
        expect(r.frames[0].meanKanR).toBeLessThan(params.B0.value);
        expect(r.frames[300].meanKanR).toBeGreaterThan(unblocked.frames[300].meanKanR);
        expect(r.frames.every(f => f.perClass.every(n => n === 0 || n >= 1))).toBe(true);
    });
    it('seeded samples are reproducible and have the expected mean', () => {
        const a = mulberry32(42), b = mulberry32(42);
        const values = Array.from({ length: 10000 }, () => samplePoisson(3, a));
        expect(values).toEqual(Array.from({ length: 10000 }, () => samplePoisson(3, b)));
        expect(Math.abs(values.reduce((x, y) => x + y, 0) / values.length - 3)).toBeLessThan(.08);
    });
    it('chart and bacteria derive from the identical frame', () => {
        const r = runSimulation({ ...defaultSimConfig, moi: 2, durationMin: 1 });
        for (let i = 0; i < r.frames.length; i++) {
            const p = framePresentation(r, i, 1e6, 80);
            expect(p.frame).toBe(r.frames[i]);
            expect(p.chart.log10Cells).toBe(Math.log10(r.frames[i].totalCells));
            expect(p.bacteria.count).toBe(Math.round(r.frames[i].totalCells / 1e6 * 80));
            expect(p.bacteria.perClass.reduce((a, b) => a + b, 0)).toBe(p.bacteria.count);
            expect(p.bacteria.perClass.every((n, j) => r.frames[i].perClass[j] !== 0 || n === 0)).toBe(true);
        }
    });
});
describe('SPEC 4.4 full kinetics validation', () => {
    it('binding and catalysis conserve total adapter', () => {
        const y = [.2, .1, .03, .04, .01], d = fullKineticsDerivative(y, { ...defaultTpd, kon: 10 });
        expect(Math.abs(d[1] + d[2] + d[3] + d[4])).toBeLessThan(1e-12);
        expect(d[0] + d[3] + d[4]).toBeCloseTo(defaultTpd.kprod - (defaultTpd.mu + defaultTpd.kXB) * (y[0] + y[3] + y[4]) - defaultTpd.kcat * y[4], 12);
    });
    it.each([.058, .174, .579, 1.737])('QSS kon100 at Ntot=%s has <1% error', Ntot => {
        expect(compareKinetics(Ntot, 100).maxRelativeError).toBeLessThan(.01);
    }, 60000);
});
it('1a exact algebraic reduction', () => {
    for (const n of [.058, .174, .579, 1.737]) {
        const r = algebraicReduction(n);
        expect(r.error).toBeLessThan(1e-8);
        expect(r.conservation).toBeLessThan(1e-10);
    }
}, 60000);
it('Kd and alpha use molar units', () => {
    expect(Math.abs(kdFromDeltaG(-14.2) / 98.4e-12 - 1)).toBeLessThan(.02);
    expect(Math.abs(langmuirAlphaFromDeltaG(-14.2, .0277) - (1 - 3.6e-9))).toBeLessThan(1e-9);
});
it('one MOI30 18h simulation takes under400ms', () => {
    runSimulation(defaultSimConfig);
    const t = performance.now();
    runSimulation(defaultSimConfig);
    expect(performance.now() - t).toBeLessThan(400);
});
it('R1 every class and frame stays below synthesis ceiling in every scenario', () => {
    let maxB = 0;
    for (const cfg of [defaultSimConfig, { ...defaultSimConfig, useSunrise: false }, ...[0, 1, 2, 3, 5, 10, 20].map(moi => ({ ...defaultSimConfig, moi })), ...[0, 10, 50, 200].map(Ae => ({ ...defaultSimConfig, Ae }))]) {
        const r = runSimulation(cfg);
        for (const f of r.frames) {
            for (const b of f.perClassKanR) {
                maxB = Math.max(maxB, b);
            }
        }
    }
    expect(maxB).toBeLessThanOrEqual(defaultTpd.kprod / params.k_XB.value + 1e-9);
}, 30000);
it('pretreatment frames and dose are exact', () => {
    const r = runSimulation({ ...defaultSimConfig, dtMin: .7, durationMin: 1 });
    expect(r.frames.filter(f => f.tMin === 0)).toHaveLength(1);
    for (const f of r.frames.filter(f => f.tMin < 0)) {
        expect(f.meanAi).toBe(0);
        expect(f.meanKill).toBe(0);
        expect(f.totalCells).toBeCloseTo(r.frames[0].totalCells, 8);
    }
});
it.each([.058, .174, .579, 1.737])('1b at kon100 Ntot=%s', n => { expect(compareKinetics(n, 100).maxRelativeError).toBeLessThan(.01); }, 60000);
