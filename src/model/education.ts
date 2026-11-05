import { params, exp3, exp4 } from './params';
export const beats = ['PVCが近づく', 'gp17がLPSに付着', '鞘が収縮・アダプター注入', 'BinderがKanRを認識', 'XBがClpX ZBDへ結合', 'ClpXPがKanRを分解', '感受性回復の可能性'];
export const failureBeat: Record<string, number> = { rbp: 1, injector: 2, loadingSignal: 2, cargo: 2, binder: 3, anchor: 4, linker: 4 };
export const glossary: Record<string, string> = {
    KanR: 'カナマイシンを化学的に変化させて無力化する耐性酵素。',
    PVC: '収縮する鞘と内管でタンパク質を細胞へ運ぶ注入装置。',
    Binder: '標的タンパク質を認識する部分。',
    XB: 'ClpXのZBDに結合するアンカー。',
    ClpXP: 'タンパク質をほどいて分解する細胞内の装置。',
    MOI: '細胞あたりに与える粒子数。注入回数にはばらつきがあります。',
    MIC: '増殖を抑える最小薬剤濃度のモデル推定。測定IC50とは別の指標。'
};
export const scienceClaims = [
    ['直接融合タグ', '実証', 'Exp4: ' + exp4.value.map(p => `${p.tag} ${p.ic50}±${p.sd}`).join(' / ') + ' µg/mL'],
    ['発現量と耐性の非比例性', '実証', 'Exp3: ' + exp3.value.map(p => `${p.promoter} ${p.rel}% → ${p.ic50}±${p.sd}`).join(' / ')],
    ['設計KanRアダプター', '未実証', 'Exp5: KB1–KB10はΔBinder (29.7±4.4 µg/mL) と比べ耐性低下を確認できず。'],
    ['発現・送達', '未解決', 'Exp7: KanRバンドを分離できず、ロード量に約7倍の差。'],
    ['統合CPI+TPD', 'モデル予測', '統合SUNRISEの実験的成功は確立していません。']
];
export const simplifications = [
    'QSSと独立結合部位で結合の速い過渡応答を省略。Eq21の遊離／総KanRの区別には曖昧さがあります。',
    '瞬時で独立な注入をPoisson分布で近似。単一部位Langmuir結合（多価結合は省略）。',
    '注入クラスは収容力だけを共有し、1細胞/mL未満のクラスは除外します。0表示は滅菌の証明ではありません。',
    '薬の外部濃度は一定。免疫・薬物動態・莢膜・アクセス障壁を省略。誤ったRBPは標的へのアクセスなしとします。',
    `CPIの形状計算は${params.N_delivery.value}分子/注入に固定。長さ・角度は操作できません。`,
    `ClpXP誘導${params.sigma32_fold.value}倍、最初の${params.clpxp_blockade_min.value}分の完全阻害は仮定。`,
    '天然KanRにも、タグ付き基質の較正に由来するwikiのk_XBを保持します。',
    '合成を一定とするwiki式のため、混雑して分裂が遅くなるとKanRがB0を超えることがあります（定常期への外挿の限界）。',
    params.K_m.note!,
    'モデルは耐性の崩壊を再現しますが、Exp3の高発現域のプラトーを再現しません。MICとIC50は異なる指標です。'
];
export const centralMessage = 'SUNRISEの役割は、耐性の原因となるタンパク質を取り除き、既存の抗生物質の効果を取り戻すことを目指すものです。';
export const caveat = '※このゲームの成功例は、2026年Wikiの数理モデルによる予測に基づく教育シミュレーションです。分解タグを直接つないだ場合の耐性低下は実験で確認されていますが、設計したKanR標的アダプターによる耐性低下は未確認です。';
