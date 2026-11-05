import './styles/main.css';
import { createStore, type State } from './state/store';
import { defaultSimConfig, runSimulation, evaluateBuild, type BuildConfig } from './model';
import { glossary, failureBeat, beats } from './model/education';
import { stage1 } from './ui/stage1';
import { stage2 } from './ui/stage2';
import { stage3, timelineSeconds } from './ui/stage3';
import { stage4 } from './ui/stage4';
import { stage5 } from './ui/stage5';
import { scienceDialog } from './ui/components/science';
import { progress } from './ui/components/charts';
import { reconcile } from './ui/reconcile';
const store = createStore();
let mountedStage = 0;
const scienceMarkup = scienceDialog();
const main = document.querySelector('main')!;
let timer: ReturnType<typeof setInterval> | undefined;
const patch = (value: Partial<State>) => store.dispatch({
    type: 'patch', value
});
function stop() {
    if (timer) {
        clearInterval(timer);
    }
    timer = undefined;
}
function navigate(stage: number) {
    stop();
    patch({
        stage, playback: {
            tIndex: 0, playing: false, speed: 1
        }
    });
    window.scrollTo(0, 0);
}
function render(s: State) {
    const markup = `<header>
<a class="brand" href="./">SUNRISE <b>LAB</b>
</a>
<span>高校生モード / 教育シミュレーション</span>
<button data-action="science">科学的根拠</button>
</header>
<nav aria-label="進行状況">${[
        '観察', '組み立て', '起動', '比較', 'まとめ'
    ].map((label, i) => `<span class="${s.stage === i + 1 ? 'current' : ''}">
<b>${i + 1}</b> ${label}</span>`).join('')}</nav>
<div class="glossary">用語 ${Object.entries(glossary).map(([k, v]) => `<button data-glossary="${k}" title="${v}">${k}</button>`).join('')}</div>
<div id="glossary-note" role="status">
</div>${s.busy ? progress(s.progress) : ''}<div class="stage">${[
        stage1, stage2, stage3, stage4, stage5
    ][s.stage - 1](s)}</div>${scienceMarkup}<dialog id="build-dialog">
<h2>この構成で試す？</h2>
<p>この構成では送達できない可能性があります。そのまま試しますか？</p>
<button data-action="confirm-build">試してみる</button>
<button data-action="close-dialog">直す</button>
</dialog>`;
    if (mountedStage === s.stage) {
        const template = document.createElement('main');
        template.innerHTML = markup;
        reconcile(main, template);
    }
    else {
        main.innerHTML = markup;
        mountedStage = s.stage;
        window.scrollTo(0, 0);
    }
    bind();
    if (s.busy) {
        document.querySelectorAll<HTMLButtonElement | HTMLInputElement>('.stage button, .stage input').forEach(control => control.disabled = true);
    }
}
async function compute(task: () => Partial<State>) {
    stop();
    patch({
        busy: true, progress: .1, playback: {
            ...store.get().playback, playing: false
        }
    });
    await new Promise(resolve => setTimeout(resolve, 80));
    patch({
        progress: .5
    });
    await new Promise(resolve => setTimeout(resolve, 40));
    const result = task();
    patch({
        ...result, progress: 1
    });
    await new Promise(resolve => setTimeout(resolve, 200));
    patch({
        busy: false
    });
}
function cfg() {
    const s = store.get();
    return {
        ...defaultSimConfig, build: s.build, moi: s.moi, Ae: s.Ae
    };
}
async function enterActivation() {
    navigate(3);
    patch({
        timeline: 0
    });
    await compute(() => ({
        preview: runSimulation({
            ...cfg(), durationMin: 0
        })
    }));
}
function play() {
    stop();
    patch({
        playback: {
            ...store.get().playback, playing: true
        }
    });
    timer = setInterval(() => {
        const s = store.get();
        if (!s.playback.playing) {
            stop();
            return;
        }
        if (s.stage === 3) {
            let timeline = Math.min(timelineSeconds, s.timeline + .1);
            const failure = evaluateBuild(s.build).failures.sort((a, b) => failureBeat[a.code] - failureBeat[b.code])[0];
            const limit = failure ? failureBeat[failure.code] / beats.length * timelineSeconds : timelineSeconds;
            timeline = Math.min(timeline, limit);
            const finished = timeline >= limit;
            patch({
                timeline, playback: {
                    ...s.playback, playing: !finished
                }
            });
            if (finished) {
                stop();
            }
        }
        else if (s.stage === 1 || s.stage === 4) {
            const result = s.sim.withoutSunrise!;
            const tIndex = Math.min(result.frames.length - 1, s.playback.tIndex + 6 * s.playback.speed);
            const finished = tIndex === result.frames.length - 1;
            patch({
                playback: {
                    ...s.playback, tIndex, playing: !finished
                }
            });
            if (finished) {
                stop();
            }
        }
        else {
            stop();
        }
    }, 100);
}
function bind() {
    document.querySelectorAll<HTMLButtonElement>('[data-stage]').forEach(b => b.onclick = () => navigate(Number(b.dataset.stage)));
    document.querySelectorAll<HTMLButtonElement>('[data-quiz]').forEach(b => b.onclick = () => patch({
        quiz: Number(b.dataset.quiz)
    }));
    document.querySelectorAll<HTMLButtonElement>('[data-select]').forEach(b => b.onclick = () => {
        const [slot, value] = b.dataset.select!.split(':');
        patch({
            selected: {
                slot: slot as keyof BuildConfig, value
            }
        });
    });
    document.querySelectorAll<HTMLButtonElement>('[data-place]').forEach(b => b.onclick = () => {
        const selected = store.get().selected;
        if (selected && selected.slot === b.dataset.place) {
            store.dispatch({
                type: 'build', slot: selected.slot, value: selected.value
            });
        }
    });
    document.querySelectorAll<HTMLButtonElement>('[data-glossary]').forEach(b => b.onclick = () => {
        const key = b.dataset.glossary!;
        store.get().glossarySeen.add(key);
        document.querySelector('#glossary-note')!.textContent = `${key}：${glossary[key]}`;
    });
    document.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(b => b.onclick = async () => {
        const s = store.get();
        switch (b.dataset.action) {
            case 'science':
                stop();
                patch({
                    playback: {
                        ...s.playback, playing: false
                    }
                });
                document.querySelector<HTMLDialogElement>('#science-dialog')!.showModal();
                break;
            case 'close-dialog':
                b.closest('dialog')!.close();
                break;
            case 'dose':
                await compute(() => ({
                    sim: {
                        ...store.get().sim, withoutSunrise: runSimulation({
                            ...cfg(), useSunrise: false
                        })
                    }, playback: {
                        tIndex: 0, playing: false, speed: 1
                    }
                }));
                play();
                break;
            case 'try-build':
                if (evaluateBuild(s.build).ok) {
                    await enterActivation();
                }
                else {
                    document.querySelector<HTMLDialogElement>('#build-dialog')!.showModal();
                }
                break;
            case 'confirm-build':
                await enterActivation();
                break;
            case 'activate':
                patch({
                    timeline: 0
                });
                play();
                break;
            case 'pause':
                if (s.playback.playing) {
                    stop();
                    patch({
                        playback: {
                            ...s.playback, playing: false
                        }
                    });
                }
                else {
                    play();
                }
                break;
            case 'speed':
                patch({
                    playback: {
                        ...s.playback, speed: s.playback.speed === 1 ? 4 : 1
                    }
                });
                break;
            case 'compare':
                await compute(() => {
                    const withSunrise = runSimulation(cfg());
                    const withoutSunrise = runSimulation({
                        ...cfg(), useSunrise: false
                    });
                    return {
                        sim: {
                            withSunrise, withoutSunrise
                        }
                    };
                });
                navigate(4);
                patch({
                    playback: {
                        tIndex: store.get().sim.withSunrise!.frames.findIndex(f => f.tMin === 0), playing: false, speed: 1
                    }
                });
                play();
                break;
            case 'reset':
                stop();
                store.dispatch({
                    type: 'reset'
                });
                window.scrollTo(0, 0);
                break;
        }
    });
    const moi = document.querySelector<HTMLInputElement>('#moi');
    if (moi) {
        moi.oninput = async () => {
            const value = Number(moi.value);
            patch({
                moi: value, timeline: 0
            });
            await compute(() => ({
                preview: runSimulation({
                    ...cfg(), durationMin: 0
                })
            }));
        };
    }
    const timeline = document.querySelector<HTMLInputElement>('#timeline');
    if (timeline) {
        timeline.oninput = () => {
            stop();
            let value = Number(timeline.value);
            const fail = evaluateBuild(store.get().build).failures.sort((a, b) => failureBeat[a.code] - failureBeat[b.code])[0];
            if (fail) {
                value = Math.min(value, failureBeat[fail.code] / beats.length * timelineSeconds);
            }
            patch({
                timeline: value, playback: {
                    ...store.get().playback, playing: false
                }
            });
        };
    }
    const comparison = document.querySelector<HTMLInputElement>('#comparison-time');
    if (comparison) {
        comparison.oninput = () => {
            stop();
            patch({
                playback: {
                    ...store.get().playback, tIndex: Number(comparison.value), playing: false
                }
            });
        };
    }
}
store.subscribe(render);
render(store.get());
