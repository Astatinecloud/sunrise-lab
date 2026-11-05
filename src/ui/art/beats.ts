import type { BuildConfig } from '../../model';
import { pvc } from './pvc';
import { adapter } from './adapter';
import { clpxp } from './clpxp';
import { kanamycin } from './kanamycin';
export function beatArt(beat: number, build: BuildConfig): string {
    if (beat < 0) {
        return kanamycin();
    }
    if (beat <= 2) {
        return pvc(build, beat === 2);
    }
    if (beat <= 4) {
        return adapter(build) + '<p>KanR ← Binder — GGS Linker — XB → ClpX ZBD / ClpXP</p>';
    }
    if (beat === 5) {
        return `<svg viewBox="0 0 600 270" role="img" aria-label="ClpXPがKanRをほどいて分解">${clpxp()}<text x="80" y="110">KanR →</text></svg>`;
    }
    return `<svg viewBox="0 0 600 270" role="img" aria-label="\u8010\u6027\u539F\u56E0\u304C\u6E1B\u308A\u85AC\u304C\u30EA\u30DC\u30BD\u30FC\u30E0\u306B\u7D50\u5408\u3059\u308B\u53EF\u80FD\u6027">
<rect x="40" y="30" width="520" height="220" rx="100" fill="#e4f2ef" stroke="#1a8e8a" stroke-width="6"/>
<circle cx="390" cy="130" r="45" fill="#1a8e8a"/>
<path d="M140 130H330" stroke="#6c5ce7" stroke-width="10"/>
<text x="80" y="90">\u6709\u52B9\u306A\u85AC</text>
<text x="340" y="210">\u30EA\u30DC\u30BD\u30FC\u30E0</text>
</svg>`;
}
