import { defaultBuild, defaultSimConfig, type BuildConfig, type SimResult } from '../model';
export interface State {
    stage: number;
    placed: Partial<Record<keyof BuildConfig, boolean>>;
    build: BuildConfig;
    moi: number;
    Ae: number;
    seed: number;
    sim: {
        withSunrise: SimResult | null;
        withoutSunrise: SimResult | null;
    };
    preview: SimResult | null;
    quiz: number | null;
    glossarySeen: Set<string>;
    playback: {
        tIndex: number;
        playing: boolean;
        speed: number;
    };
    selected: {
        slot: keyof BuildConfig;
        value: string;
    } | null;
    timeline: number;
    busy: boolean;
    progress: number;
}
const initial = (): State => ({
    stage: 1, placed: {}, build: {
        ...defaultBuild, rbp: 'none', injector: 'none', loadingSignal: 'none', cargo: 'none', binder: 'none', linker: 'none', anchor: 'none'
    },
    moi: defaultSimConfig.moi, Ae: defaultSimConfig.Ae, seed: 42, sim: {
        withSunrise: null, withoutSunrise: null
    }, preview: null,
    quiz: null, glossarySeen: new Set(), playback: {
        tIndex: 0, playing: false, speed: 1
    }, selected: null, timeline: 0, busy: false, progress: 0
});
export type Action = {
    type: 'patch';
    value: Partial<State>;
} | {
    type: 'reset';
} | {
    type: 'build';
    slot: keyof BuildConfig;
    value: string;
};
export function createStore() {
    let state = initial();
    const listeners = new Set<(s: State) => void>();
    return {
        get: () => state,
        subscribe(fn: (s: State) => void) {
            listeners.add(fn);
            return () => listeners.delete(fn);
        },
        dispatch(action: Action) {
            if (action.type === 'reset') {
                state = initial();
            }
            else if (action.type === 'build') {
                state = {
                    ...state, placed: {
                        ...state.placed, [action.slot]: true
                    }, build: {
                        ...state.build, [action.slot]: action.value
                    }, preview: null, sim: {
                        withSunrise: null, withoutSunrise: null
                    }
                };
            }
            else {
                state = {
                    ...state, ...action.value
                };
            }
            listeners.forEach(fn => fn(state));
        }
    };
}
