import type { State } from '../state/store';
import { evaluateBuild, type BuildConfig } from '../model';
import { pvc } from './art/pvc';
import { adapter } from './art/adapter';
export const slots: {
    key: keyof BuildConfig;
    label: string;
    parts: [
        string,
        string
    ][];
}[] = [
    {
        key: 'rbp', label: '① 標的への付着 / Pvc13のRBP', parts: [
            [
                'gp17', 'gp17（大腸菌LPS）'
            ],
            [
                'wrong-rbp', '別の菌を狙うRBP'
            ],
            [
                'none', 'RBPなし'
            ]
        ]
    },
    {
        key: 'injector', label: '② 注入装置', parts: [
            [
                'pvc-core', 'PVCコア（鞘・内管）'
            ],
            [
                'none', '装置なし'
            ]
        ]
    },
    {
        key: 'cargo', label: '③ 運ぶタンパク質', parts: [
            [
                'tpd-adapter', 'TPDアダプター'
            ],
            [
                'inert-protein', '蛍光タンパク質'
            ],
            [
                'none', '荷物なし'
            ]
        ]
    },
    {
        key: 'loadingSignal', label: '④ 積み込みの荷札', parts: [
            [
                'pdp1-ntd', 'Pdp1 N末端'
            ],
            [
                'none', '荷札なし'
            ]
        ]
    },
    {
        key: 'binder', label: 'Binder / 標的をつかむ', parts: [
            [
                'kanr-binder', 'KanR用Binder'
            ],
            [
                'wrong-binder', 'GroEL用Binder'
            ],
            [
                'none', 'Binderなし'
            ]
        ]
    },
    {
        key: 'linker', label: 'Linker / つなぐ', parts: [
            [
                'ggs', '柔軟なGGS Linker'
            ],
            [
                'none', 'Linkerなし'
            ]
        ]
    },
    {
        key: 'anchor', label: 'Anchor / ClpXPを呼ぶ', parts: [
            [
                'xb', 'XB（ClpX ZBD結合）'
            ],
            [
                'none', 'XBなし'
            ]
        ]
    }
];
export function stage2(s: State): string {
    const evaluated = evaluateBuild(s.build);
    return `<div class="eyebrow">02 / ENGINEER</div>
<h1>SUNRISEを組み立てよう！</h1>
<p class="lead">部品をクリックして選択 → 対応するスロットをクリックして配置。間違った部品も試せます。</p>
<div class="assembly-preview">${pvc(s.build)}<p>Pdp1_NTDの荷札付きアダプターを、PVCの内管に積み込みます。</p>
</div>${[
        0, 1
    ].map(group => `<section class="panel">
<h2>${group === 0 ? '2a CPI / PVC：届けるしくみ' : '2b TPD：Binder → Linker → Anchor（XB）'}</h2>${group ? adapter(s.build) : ''}<div class="assembly ${group ? 'domains' : ''}">${slots.slice(group ? 4 : 0, group ? 7 : 4).map(slot => {
        const failure = evaluated.failures.find(f => f.code === slot.key);
        return `<article class="slot-card">
<h3>${slot.label}</h3>
<div class="tray">${slot.parts.map(([v, label]) => `<button data-select="${slot.key}:${v}" class="part ${s.selected?.slot === slot.key && s.selected.value === v ? 'chosen' : ''}">${label}</button>`).join('')}</div>
<button class="slot ${!s.placed[slot.key] ? '' : failure ? 'warning' : 'complete'}" data-place="${slot.key}">配置先：${s.placed[slot.key] ? slot.parts.find(([v]) => v === s.build[slot.key])![1] : '未配置'}</button>${!s.placed[slot.key] ? '<p class="note neutral">ここに部品を置いてください。</p>' : failure ? `<p class="note">${failure.explanation}</p>` : '<p class="note ok">この部品は役割に合っています。</p>'}</article>`;
    }).join('')}</div>
</section>`).join('')}<p role="status">${s.selected ? `選択中：${slots.find(x => x.key === s.selected!.slot)!.parts.find(x => x[0] === s.selected!.value)![1]}。対応する「配置先」をクリック。` : '部品を選んでください。'}</p>
<button data-action="try-build">ステージ3へ →</button>`;
}
