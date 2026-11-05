import { it, expect } from 'vitest';
import { createStore } from '../src/state/store';
import { defaultSimConfig, runSimulation, params, evaluateBuild } from '../src/model';
import { stage2 } from '../src/ui/stage2';
import { stage3 } from '../src/ui/stage3';
import { stage4 } from '../src/ui/stage4';
import { chart, artifactCaption, hasMaterialArtifact } from '../src/ui/components/charts';
import { scienceDialog } from '../src/ui/components/science';

it('R26 comparison is available at every animation time', () => {
 const store = createStore();
 for (const timeline of [0, 11, 22]) {
  store.dispatch({type:'patch', value:{timeline}});
  expect(stage3(store.get())).toMatch(/<button data-action="compare"\s*>/);
 }
 expect(stage2(store.get())).toContain('<button data-action="try-build">');
});
it('R27/R28 caption and MIC suffix share the material artifact gate', () => {
 const result = runSimulation({...defaultSimConfig, useSunrise:false});
 const store = createStore();
 for (const t of [36, 1080]) {
  const index = result.frames.findIndex(f => Math.abs(f.tMin - t) < 1e-6);
  expect(index).toBeGreaterThanOrEqual(0);
  const expected = t === 1080;
  expect(chart(result, 'kanR', index).includes('</svg><p class="artifact" role="note">'+artifactCaption)).toBe(expected);
  store.dispatch({type:'patch',value:{sim:{withSunrise:result,withoutSunrise:result},playback:{tIndex:index,playing:false,speed:1}}});
  const html=stage4(store.get());
  expect(html.includes('（同上の外挿による）')).toBe(expected);
  expect(html).toContain('未処理のKanR量');
  expect(html).toMatch(t === 1080 ? /<button data-stage="5" >/ : /<button data-stage="5" disabled>/);
 }
 expect(artifactCaption).toContain('モデル上はKanRが蓄積します');
 const frame=result.frames[0], B=params.B0.value*1.05, N=params.K.value*0.5;
 expect(hasMaterialArtifact({...frame,meanKanR:B,totalCells:N+1})).toBe(false);
 expect(hasMaterialArtifact({...frame,meanKanR:B+0.01,totalCells:N})).toBe(false);
 expect(hasMaterialArtifact({...frame,meanKanR:B+0.01,totalCells:N+1})).toBe(true);
});
it('R17 untouched slots are neutral, including after reset; explicit none is feedback',()=>{
 const store=createStore();
 const failures=evaluateBuild(store.get().build).failures;
 let html=stage2(store.get());
 for(const f of failures) expect(html).not.toContain(f.explanation);
 expect(html.match(/ここに部品を置いてください/g)?.length).toBe(7);
 store.dispatch({type:'build',slot:'rbp',value:'none'});
 html=stage2(store.get());
 expect(html).toContain(failures.find(f=>f.code==='rbp')!.explanation);
 for(const f of failures.filter(f=>f.code!=='rbp')) expect(html).not.toContain(f.explanation);
 store.dispatch({type:'reset'});
 expect(store.get().placed).toEqual({});
});
it('R20 Japanese unit note and display precision do not change computation',()=>{
 const html=scienceDialog();
 expect(html).toContain('0.01507');
 expect(html).not.toContain('The wiki parameter table gives');
 expect(params.mu.value).toBe(Math.LN2/46);
 expect(html).toContain('Results / TPD Experiment 3');
});
