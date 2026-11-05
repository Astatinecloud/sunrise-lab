import { params } from './params';
export interface BuildConfig {
    rbp: 'gp17' | 'wrong-rbp' | 'none';
    injector: 'pvc-core' | 'none';
    loadingSignal: 'pdp1-ntd' | 'none';
    cargo: 'tpd-adapter' | 'inert-protein' | 'none';
    binder: 'kanr-binder' | 'wrong-binder' | 'none';
    linker: 'ggs' | 'none';
    anchor: 'xb' | 'none';
}
export interface FailureReason {
    code: 'rbp' | 'injector' | 'loadingSignal' | 'cargo' | 'binder' | 'anchor' | 'linker' | 'no-antibiotic';
    explanation: string;
}
export interface Modifiers {
    receptorAccessible: boolean;
    injectionEnabled: boolean;
    payloadEnabled: boolean;
    KD1: number;
    KD2: number;
    kcatScale: number;
}
export const defaultBuild: BuildConfig = { rbp: 'gp17', injector: 'pvc-core', loadingSignal: 'pdp1-ntd', cargo: 'tpd-adapter', binder: 'kanr-binder', linker: 'ggs', anchor: 'xb' };
export const noAntibioticFailure: FailureReason = { code: 'no-antibiotic', explanation: 'KanRを減らしても、抗生物質がなければ増殖は止まりません。SUNRISEは薬を効かせるための準備です。' };
export function evaluateBuild(b: BuildConfig): {
    ok: boolean;
    failures: FailureReason[];
    modifiers: Modifiers;
} {
    const failures: FailureReason[] = [];
    const add = (yes: boolean, code: FailureReason['code'], explanation: string) => {
        if (yes) {
            failures.push({ code, explanation });
        }
    };
    add(b.rbp !== 'gp17', 'rbp', '標的に合わないRBPでは、PVCが大腸菌の表面に付着できません。付着しなければ注入は始まりません。');
    add(b.injector === 'none', 'injector', '収縮して内管を押し出す装置がなければ、細胞表面を貫通できません。');
    add(b.loadingSignal === 'none', 'loadingSignal', 'Pdp1のN末端は、PVCに荷物を積み込むための“荷札”です。これが無いとタンパク質は積まれず、注入しても中身は空です。');
    add(b.cargo !== 'tpd-adapter', 'cargo', '届けたタンパク質が目的のアダプターでなければ、KanRは分解されません。');
    add(b.binder !== 'kanr-binder', 'binder', 'BinderがKanRを認識できないと、アダプターはKanRをつかめません。分解は始まりません。');
    add(b.anchor === 'none', 'anchor', 'XBはClpXのZBDに結合する“取っ手”です。これが無いとClpXPを呼び込めません。');
    add(b.linker === 'none', 'linker', '柔らかいLinkerが無いと、KanRをClpXPの入口まで動かせません（モデル上の仮定）。');
    return { ok: !failures.length, failures, modifiers: { receptorAccessible: b.rbp === 'gp17', injectionEnabled: b.injector === 'pvc-core', payloadEnabled: b.loadingSignal === 'pdp1-ntd' && b.cargo === 'tpd-adapter', KD1: b.anchor === 'xb' ? params.K_D1.value : params.missing_binding_KD.value, KD2: b.binder === 'kanr-binder' ? params.K_D2.value : params.missing_binding_KD.value, kcatScale: b.linker === 'ggs' ? 1 : 0 } };
}
