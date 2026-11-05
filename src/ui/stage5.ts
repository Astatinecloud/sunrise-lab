import type { State } from '../state/store';
import { centralMessage, caveat } from '../model/education';
import { beatArt } from './art/beats';
import { fmt } from './components/charts';
export function stage5(s: State): string {
    const cards = [
        [
            '最初に効かなかった理由', 'KanRがカナマイシンを化学的に変化させ、無力化したから。'
        ],
        [
            'PVCは何をしたか', 'gp17で大腸菌のLPSを認識し、鞘の収縮と内管でアダプターを届ける役割。'
        ],
        [
            'BinderとXBは何をしたか', 'BinderがKanRをつかみ、XBがClpX ZBDへ結合して近づける役割。'
        ],
        [
            'ClpXPは何をしたか', '近づけられたKanRをほどき、分解する役割。'
        ],
        [
            'なぜ再び効く可能性があるのか', '耐性の原因が減ると既存の薬が働く可能性があるから。統合系の効果はモデル予測です。'
        ]
    ];
    return `<div class="eyebrow">05 / REFLECT</div>
<h1>結果とまとめ</h1>
<p>今回のモデル Δlog10：SUNRISEなし ${fmt(s.sim.withoutSunrise!.deltaLog10)} / あり ${fmt(s.sim.withSunrise!.deltaLog10)}</p>
<div class="summary-cards">${cards.map(([q, a], i) => `<section class="panel">
<div class="thumb">${beatArt([
        -1, 2, 4, 5, 6
    ][i], s.build)}</div>
<h2>${q}</h2>
<p>${a}</p>
</section>`).join('')}</div>
<blockquote>${centralMessage}</blockquote>
<p class="honesty">${caveat}</p>
<p>モデルは耐性の崩壊を再現しますが、Exp3の高発現域のプラトーは再現しません。</p>
<button data-action="reset">もう一度遊ぶ</button> <button data-action="science">科学的根拠を見る</button>`;
}
