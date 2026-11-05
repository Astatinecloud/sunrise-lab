import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createStore } from '../src/state/store';
import { defaultBuild, defaultSimConfig, runSimulation, framePresentation } from '../src/model';
import { stage4 } from '../src/ui/stage4';
import { knownWikiDiscrepancy } from '../src/model/wiki';
it('reset clears build, quiz, simulation, glossary and playback', () => {
    const store = createStore();
    store.dispatch({ type: 'patch', value: { stage: 5, build: defaultBuild, quiz: 1, moi: 1, glossarySeen: new Set(['KanR']), playback: { tIndex: 100, playing: true, speed: 4 } } });
    store.dispatch({ type: 'reset' });
    const s = store.get();
    expect(s.stage).toBe(1);
    expect(s.quiz).toBe(null);
    expect(s.build.rbp).toBe('none');
    expect(s.sim.withSunrise).toBe(null);
    expect(s.glossarySeen.size).toBe(0);
    expect(s.moi).toBe(defaultSimConfig.moi);
    expect(s.playback).toEqual({ tIndex: 0, playing: false, speed: 1 });
});
it('actual Stage4 markup uses framePresentation for chart and bacteria', () => {
    const result = runSimulation({ ...defaultSimConfig, moi: 2, durationMin: 1 });
    const store = createStore();
    const index = result.frames.length - 1;
    store.dispatch({ type: 'patch', value: { stage: 4, sim: { withSunrise: result, withoutSunrise: result }, playback: { tIndex: index, playing: false, speed: 1 } } });
    const p = framePresentation(result, index, defaultSimConfig.N0, 32, 120);
    const html = stage4(store.get());
    expect(html).toContain(`aria-label="細菌のモデル表示 ${p.bacteria.count}個"`);
    expect(html).toContain('log10 N (cells/mL)');
    expect(html).toContain('B0=');
    expect(html).toContain(p.frame.totalCells.toLocaleString('en-US', { maximumFractionDigits: 0 }));
});
it('known source discrepancy stays in generated documentation', () => {
    const validation = readFileSync('docs/VALIDATION.md', 'utf8');
    expect(validation).toContain(knownWikiDiscrepancy.id);
    expect(validation).toContain('0.00841607');
    expect(validation).toContain('remains FAIL');
});
import { activationReadouts } from '../src/model/activation';
it('coverage icons round expected counts rather than exaggerating tiny Poisson tails',()=>{
    expect(activationReadouts(defaultBuild,30,null,0).unreachedIcons).toBe(0);
    expect(activationReadouts(defaultBuild,1,null,0).unreachedIcons).toBe(7);
});
